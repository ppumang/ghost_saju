"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "./ResultScene.module.css";

interface ResultSceneProps {
  text: string;
  onRestart: () => void;
}

function renderBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className={styles.bold}>
        {part}
      </strong>
    ) : (
      part
    )
  );
}

export default function ResultScene({ text, onRestart }: ResultSceneProps) {
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleReviewSubmit = async () => {
    if (!review.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review: review.trim(), timestamp: new Date().toISOString() }),
      });
      setSubmitted(true);
    } catch {
      // 실패해도 조용히 처리
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <div className={styles.content}>
        <h1 className={styles.title}>귀신사주</h1>
        <hr className={styles.divider} />
        <p className={styles.text}>{renderBold(text)}</p>

        <div className={styles.reviewSection}>
          <hr className={styles.reviewDivider} />
          <h3 className={styles.reviewTitle}>리얼 리뷰를 남겨주세요</h3>
          <p className={styles.reviewSub}>
            사주 풀이를 받으신 소감을 자유롭게 남겨주세요
          </p>

          {!submitted ? (
            <>
              <textarea
                className={styles.reviewInput}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="사주 풀이 후기를 남겨주세요..."
                rows={4}
                maxLength={500}
              />
              <button
                className={styles.reviewSubmitButton}
                onClick={handleReviewSubmit}
                disabled={!review.trim() || submitting}
              >
                {submitting ? "제출 중..." : "리뷰 남기기"}
              </button>
            </>
          ) : (
            <p className={styles.reviewThanks}>
              소중한 리뷰 감사합니다.
            </p>
          )}
        </div>

        <button className={styles.restartButton} onClick={onRestart}>
          다시 보기
        </button>
      </div>
    </motion.div>
  );
}
