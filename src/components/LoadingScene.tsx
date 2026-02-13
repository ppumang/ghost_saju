"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/mixpanel";
import styles from "./LoadingScene.module.css";
import { reviews } from "@/data/reviews";

const messages = [
  "사주를 풀고 있습니다...",
  "운명의 흐름을 읽는 중...",
  "귀신 사주가 말하고 있습니다...",
];

export default function LoadingScene() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visibleReviews, setVisibleReviews] = useState<number[]>([0, 1, 2]);
  const reviewRef = useRef(3);

  useEffect(() => {
    track("loading_viewed");
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = reviewRef.current % reviews.length;
      reviewRef.current += 1;
      setVisibleReviews((prev) => [...prev.slice(1), next]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
