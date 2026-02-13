"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/mixpanel";
import { reviews } from "@/data/reviews";
import type { SajuDataV2 } from "@/lib/saju/types";
import ClassicResultScene from "./ClassicResultScene";
import styles from "./LoadingScene.module.css";

const messages = [
  "귀신이 니 사주를 풀고 있다...",
  "운명의 실타래를 잡고 있다...",
  "과거와 미래를 이어보는 중이다...",
  "이기 좀 시간이 걸린다...",
];

interface ResultPollingProps {
  readingId: string;
  sajuData?: SajuDataV2;
}

/**
 * AI 생성이 아직 완료되지 않은 reading을 polling하여
 * 텍스트가 준비되면 ClassicResultScene을 렌더한다.
 */
export default function ResultPolling({ readingId, sajuData }: ResultPollingProps) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Loading screen state
  const [msgIndex, setMsgIndex] = useState(0);
  const [visibleReviews, setVisibleReviews] = useState<number[]>([0, 1, 2]);
  const reviewRef = useRef(3);

  useEffect(() => {
    track("result_page_polling_started", { readingId });
    let attempts = 0;
    const maxAttempts = 60; // 5초 간격 × 60 = 5분

    async function poll() {
      try {
        const res = await fetch("/api/reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readingId }),
        });

        if (!res.ok) {
          attempts++;
          if (attempts >= maxAttempts) {
            setError(true);
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
          return;
        }

        const { data } = await res.json();
        const rt = data?.reading_text;

        // 텍스트가 비어있지 않으면 완료
        if (rt && typeof rt === "string" && rt.trim().length > 0) {
          setText(rt);
          track("result_ready", { readingId, attempts });
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        attempts++;
        if (attempts >= maxAttempts) {
          setError(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }
    }

    // 즉시 1회 + 5초 간격
    poll();
    intervalRef.current = setInterval(poll, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [readingId]);

  // Message rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Review carousel
  useEffect(() => {
    const interval = setInterval(() => {
      const next = reviewRef.current % reviews.length;
      reviewRef.current += 1;
      setVisibleReviews((prev) => [...prev.slice(1), next]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  if (text) {
    return (
      <ClassicResultScene
        text={text}
        readingId={readingId}
        sajuData={sajuData}
        isStaticPage
      />
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          gap: "1rem",
          fontFamily: "var(--font-primary)",
        }}
      >
        <p style={{ color: "#8b0000", fontSize: "1rem" }}>
          풀이 생성에 시간이 걸리고 있습니다.
        </p>
        <p style={{ color: "#666", fontSize: "0.8rem" }}>
          잠시 후 다시 접속해주세요.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "1rem",
            padding: "0.7rem 2rem",
            border: "1px solid #8b0000",
            background: "transparent",
            color: "#d4c5a9",
            fontFamily: "var(--font-primary)",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          새로고침
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <video
        className={styles.bgVideo}
        src="/videos/ghost_dance.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className={styles.overlay} />

      <div className={styles.inner}>
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              className={styles.message}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {messages[msgIndex]}
            </motion.p>
          </AnimatePresence>

          <p
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "0.75rem",
              color: "rgba(212, 197, 169, 0.4)",
              marginTop: "0.8rem",
            }}
          >
            약 1~2분 소요됩니다
          </p>
        </div>

        <div className={styles.reviewSection}>
          <div className={styles.reviewHeader}>
            <span className={styles.reviewTab}>실시간 리뷰보기</span>
            <span className={styles.reviewSub}>
              사주 풀이 후 누구나 남길 수 있는 내돈내산 리얼 리뷰 입니다
            </span>
            <span className={styles.reviewNotice}>
              사주 파일은 pdf로 제공됩니다
            </span>
          </div>

          <div className={styles.reviewList}>
            <AnimatePresence mode="popLayout">
              {visibleReviews.map((ri, i) => (
                <motion.div
                  key={`${ri}-${i}-${reviewRef.current}`}
                  className={styles.reviewItem}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className={styles.reviewMeta}>
                    <span className={styles.reviewName}>
                      {reviews[ri].name}
                    </span>
                    <span className={styles.reviewDate}>
                      {reviews[ri].date}
                    </span>
                  </div>
                  <p className={styles.reviewText}>{reviews[ri].text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
