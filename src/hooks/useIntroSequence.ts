"use client";

import { useState, useCallback } from "react";
import type { SajuDataV2, GhostClassification } from "@/lib/saju/types";
import { track } from "@/lib/mixpanel";
import { notifySlack } from "@/lib/slack";
import { trackInitiateCheckout } from "@/lib/meta-pixel";

export type SceneState =
  | "intro"
  | "video"
  | "birthForm"
  | "loading"
  | "result";

export type ResultPhase = "free" | "paid";

export interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: string;
  calendarType: "solar" | "lunar";
  isLeapMonth: boolean;
  gender: "male" | "female";
}

export interface FortuneSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface FortuneResult {
  sections: FortuneSection[];
  sajuData?: SajuDataV2;
  ghostClassification?: GhostClassification;
  previewText?: string;
  readingId?: string | null;
}

export function useIntroSequence() {
  const [scene, setScene] = useState<SceneState>("intro");
  const [resultPhase, setResultPhase] = useState<ResultPhase>("free");
  const [fortuneResult, setFortuneResult] = useState<FortuneResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onIntroComplete = useCallback(() => {
    track("intro_completed");
    setScene("video");
  }, []);

  const skip = useCallback(() => {
    track("intro_skipped");
    setScene("video");
  }, []);

  const startBirthForm = useCallback(() => {
    track("video_completed");
    setScene("birthForm");
  }, []);

  /**
   * Phase 1: 생년월일 제출 → /api/saju (엔진 전용, AI 없음)
   * 사주 계산 + 귀신 분류만 수행. 빠르고 무료.
   */
  const submitBirthData = useCallback(async (data: BirthData) => {
    setScene("loading");
    setError(null);

    // 이벤트: 생년월일 입력
    track("birth_data_submitted", {
      year: data.year,
      gender: data.gender,
      calendar_type: data.calendarType,
    });
    notifySlack(`🔮 [생년월일 입력] ${data.gender === "male" ? "남" : "여"} ${data.year}년 ${data.month}월 ${data.day}일 ${data.hour}`);
    trackInitiateCheckout();

    try {
      const res = await fetch("/api/saju", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("사주 계산에 실패했습니다. 다시 시도해주세요.");
      }

      const { sajuData, ghostClassification, previewText } = await res.json();

      // 이벤트: 프리뷰 생성 완료
      track("preview_generated", {
        ghost_type: ghostClassification?.typeId,
        affinity_score: ghostClassification?.affinityScore,
      });
      notifySlack(`👻 [프리뷰 생성] ${data.gender === "male" ? "남" : "여"} ${data.year}년생 → 귀신: ${ghostClassification?.typeId ?? "없음"}`);

      setFortuneResult({
        sections: [],
        sajuData,
        ghostClassification,
        previewText,
      });
      setResultPhase("free");
      setScene("result");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "사주 계산에 실패했습니다. 다시 시도해주세요."
      );
      setScene("birthForm");
    }
  }, []);

  const restart = useCallback(() => {
    track("restart_clicked");
    setFortuneResult(null);
    setResultPhase("free");
    setError(null);
    setScene("birthForm");
  }, []);

  return {
    scene,
    resultPhase,
    fortuneResult,
    error,
    onIntroComplete,
    skip,
    startBirthForm,
    submitBirthData,
    restart,
  };
}
