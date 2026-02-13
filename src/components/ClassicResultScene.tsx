"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/mixpanel";
import { notifySlack } from "@/lib/slack";
import type { SajuDataV2 } from "@/lib/saju/types";
import SajuChart from "./SajuChart";
import OhHaengChart from "./OhHaengChart";
import DaeUnTimeline from "./DaeUnTimeline";

interface ClassicResultSceneProps {
  text: string;
  readingId?: string | null;
  sajuData?: SajuDataV2;
  onRestart?: () => void;
  isStaticPage?: boolean;
}

function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const match = part.match(/^\*\*(.+)\*\*$/);
    if (match) {
      return (
        <strong key={i} style={{ fontWeight: 800, color: "#8b0000" }}>
          {match[1]}
        </strong>
      );
    }
    return part;
  });
}

export default function ClassicResultScene({
  text,
  readingId,
  sajuData,
  onRestart,
  isStaticPage = false,
}: ClassicResultSceneProps) {
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [chartOpen, setChartOpen] = useState(true);
  const hasTracked = useRef(false);

  useEffect(() => {
    document.body.className = "scene-scroll";
    document.body.style.background = "#0a0a0a";
    if (!hasTracked.current) {
      hasTracked.current = true;
      track("classic_result_viewed", { readingId, is_static: isStaticPage });
    }
    return () => {
      document.body.className = "scene-locked";
    };
  }, [readingId, isStaticPage]);

  const handleReviewSubmit = async () => {
    if (!review.trim() || submitting) return;
    setSubmitting(true);
    track("review_submitted", { readingId });
    notifySlack(`📝 [리뷰] ${review.trim()}`);
    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review: review.trim(), readingId }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "#0a0a0a",
        zIndex: 10,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <div
        style={{
          maxWidth: "min(90vw, 600px)",
          width: "100%",
          padding: "3rem 1.5rem 4rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* 제목 */}
        <h1
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
            fontWeight: 800,
            color: "#d4c5a9",
            letterSpacing: "0.15em",
            marginBottom: "1rem",
          }}
        >
          귀신사주
        </h1>

        {/* 구분선 */}
        <div
          style={{
            width: "60px",
            height: "2px",
            background: "#8b0000",
            marginBottom: "2rem",
            boxShadow: "0 0 10px rgba(139, 0, 0, 0.3)",
          }}
        />

        {/* 사주 시각화 토글 */}
        {sajuData && (
          <>
            <button
              onClick={() => setChartOpen((v) => !v)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.7rem 0",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(212, 197, 169, 0.15)",
                cursor: "pointer",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-primary)",
                  fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                  color: "rgba(212, 197, 169, 0.7)",
                  letterSpacing: "0.03em",
                }}
              >
                {sajuData.input.year}년 {sajuData.input.month}월{" "}
                {sajuData.input.day}일
                <span style={{ margin: "0 0.3em", opacity: 0.4 }}>·</span>
                {sajuData.input.calendarType === "solar" ? "양력" : "음력"}
                <span style={{ margin: "0 0.3em", opacity: 0.4 }}>·</span>
                {sajuData.input.gender === "male" ? "남" : "여"}성
                <span style={{ margin: "0 0.3em", opacity: 0.4 }}>·</span>
                {sajuData.zodiac}띠
              </span>
              <span
                style={{
                  color: "rgba(212, 197, 169, 0.5)",
                  fontSize: "0.8rem",
                  transition: "transform 0.3s",
                  transform: chartOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                ▾
              </span>
            </button>
            <AnimatePresence>
              {chartOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{ overflow: "hidden", width: "100%", marginBottom: "1.5rem" }}
                >
                  <SajuChart sajuData={sajuData} />
                  <OhHaengChart sajuData={sajuData} />
                  <DaeUnTimeline sajuData={sajuData} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* 본문 */}
        <p
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)",
            fontWeight: 400,
            color: "#d4c5a9",
            lineHeight: 2,
            textAlign: "left",
            width: "100%",
            whiteSpace: "pre-wrap",
            wordBreak: "keep-all",
          }}
        >
          {renderBold(text)}
        </p>

        {/* 리뷰 섹션 */}
        <div
          style={{
            width: "100%",
            marginTop: "3rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "1px",
              background: "linear-gradient(90deg, transparent, #333, transparent)",
              marginBottom: "0.5rem",
            }}
          />

          <h3
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "clamp(1rem, 3vw, 1.2rem)",
              fontWeight: 700,
              color: "#d4c5a9",
            }}
          >
            리얼 리뷰를 남겨주세요
          </h3>
          <p
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "0.8rem",
              fontWeight: 400,
              color: "#888",
            }}
          >
            사주 풀이를 받으신 소감을 자유롭게 남겨주세요
          </p>

          {!submitted ? (
            <>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="사주 풀이 후기를 남겨주세요..."
                rows={4}
                maxLength={500}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  border: "1px solid #333",
                  background: "#111",
                  color: "#d4c5a9",
                  fontFamily: "var(--font-primary)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  resize: "vertical",
                  outline: "none",
                }}
              />
              <button
                onClick={handleReviewSubmit}
                disabled={!review.trim() || submitting}
                style={{
                  padding: "0.7rem 2rem",
                  border: "1px solid #8b0000",
                  background: "transparent",
                  color: "#d4c5a9",
                  fontFamily: "var(--font-primary)",
                  fontSize: "0.85rem",
                  cursor: !review.trim() || submitting ? "not-allowed" : "pointer",
                  opacity: !review.trim() || submitting ? 0.4 : 1,
                  transition: "opacity 0.3s",
                }}
              >
                {submitting ? "제출 중..." : "리뷰 남기기"}
              </button>
            </>
          ) : (
            <p
              style={{
                fontFamily: "var(--font-primary)",
                fontSize: "0.9rem",
                color: "#888",
                marginTop: "0.5rem",
              }}
            >
              소중한 리뷰 감사합니다.
            </p>
          )}
        </div>

        {/* 다시 보기 / CTA */}
        {!isStaticPage ? (
          <button
            onClick={onRestart}
            style={{
              marginTop: "2rem",
              padding: "0.7rem 2rem",
              border: "1px solid #333",
              background: "transparent",
              color: "#888",
              fontFamily: "var(--font-primary)",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            다시 보기
          </button>
        ) : (
          <a
            href="/"
            style={{
              marginTop: "2rem",
              padding: "0.7rem 2rem",
              border: "1px solid #8b0000",
              color: "#d4c5a9",
              fontFamily: "var(--font-primary)",
              fontSize: "0.85rem",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            나도 귀신사주 보기
          </a>
        )}
      </div>
    </motion.div>
  );
}
