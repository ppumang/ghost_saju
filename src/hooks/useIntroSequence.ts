"use client";

import { useState, useCallback } from "react";

export type SceneState =
  | "intro"
  | "video"
  | "birthForm"
  | "loading"
  | "result";

export interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: string;
  calendarType: "solar" | "lunar";
  isLeapMonth: boolean;
  gender: "male" | "female";
}

export interface FortuneResult {
  text: string;
}

export function useIntroSequence() {
  const [scene, setScene] = useState<SceneState>("intro");
  const [fortuneResult, setFortuneResult] = useState<FortuneResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const onIntroComplete = useCallback(() => {
    setScene("video");
  }, []);

  const skip = useCallback(() => {
    setScene("video");
  }, []);

  const startBirthForm = useCallback(() => {
    setScene("birthForm");
  }, []);

  const submitBirthData = useCallback(async (data: BirthData) => {
    setScene("loading");
    setError(null);

    try {
      const res = await fetch("/api/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("사주 풀이에 실패했습니다. 다시 시도해주세요.");
      }

      const result = await res.json();
      setFortuneResult({ text: result.text });
      setScene("result");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "사주 풀이에 실패했습니다. 다시 시도해주세요."
      );
      setScene("birthForm");
    }
  }, []);

  const restart = useCallback(() => {
    setFortuneResult(null);
    setError(null);
    setScene("birthForm");
  }, []);

  return {
    scene,
    fortuneResult,
    error,
    onIntroComplete,
    skip,
    startBirthForm,
    submitBirthData,
    restart,
  };
}
