"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { reviews } from "@/data/reviews";

const messages = [
  "귀신이 니 사주를 풀고 있다...",
  "운명의 실타래를 잡고 있다...",
  "과거와 미래를 이어보는 중이다...",
  "이기 좀 시간이 걸린다...",
];

export default function GeneratingView() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visibleReviews, setVisibleReviews] = useState<number[]>([0, 1, 2]);
  const reviewRef = useRef(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = reviewRef.current % reviews.length;
      reviewRef.current += 1;
      setVisibleReviews((prev) => [...prev.slice(1), next]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        padding: "2rem 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
      }}
    >
      {/* 로딩 메시지 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            width: "36px",
            height: "36px",
            border: "2px solid transparent",
            borderTop: "2px solid #8b0000",
            borderRadius: "50%",
          }}
        />

        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
              color: "#c4b896",
              textAlign: "center",
              letterSpacing: "0.03em",
            }}
          >
            {messages[msgIndex]}
          </motion.p>
        </AnimatePresence>

        <p
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "0.75rem",
            color: "#555",
          }}
        >
          약 1~2분 소요됩니다
        </p>
      </div>

      {/* 구분선 */}
      <div
        style={{
          width: "40px",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, #333, transparent)",
        }}
      />

      {/* 리뷰 섹션 */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
            marginBottom: "0.5rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "0.85rem",
              color: "#d4c5a9",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            실시간 리뷰보기
          </span>
          <span
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "0.7rem",
              color: "#666",
            }}
          >
            사주 풀이 후 누구나 남길 수 있는 내돈내산 리얼 리뷰 입니다
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
            minHeight: "200px",
          }}
        >
          <AnimatePresence mode="sync">
            {visibleReviews.map((ri, i) => (
              <motion.div
                key={`${ri}-${i}-${reviewRef.current}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  padding: "0.8rem 1rem",
                  border: "1px solid #222",
                  background: "rgba(20, 20, 20, 0.8)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.4rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-primary)",
                      fontSize: "0.75rem",
                      color: "#888",
                      fontWeight: 600,
                    }}
                  >
                    {reviews[ri].name}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-primary)",
                      fontSize: "0.7rem",
                      color: "#555",
                    }}
                  >
                    {reviews[ri].date}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-primary)",
                    fontSize: "0.8rem",
                    color: "#aaa",
                    lineHeight: 1.6,
                    wordBreak: "keep-all",
                  }}
                >
                  {reviews[ri].text}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
