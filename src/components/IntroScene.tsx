"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { introLines } from "@/data/introText";
import { track } from "@/lib/mixpanel";
import styles from "./IntroScene.module.css";

interface IntroSceneProps {
  onComplete: () => void;
}

const INITIAL_DELAY = 0.5;
const STAGGER_DELAY = 0.25;
const EMPTY_LINE_EXTRA_DELAY = 0.15;
const LINE_FADE_DURATION = 0.5;
const FADEOUT_DURATION = 1.2;
const IMAGE_FADE_DELAY = 0.3;

export default function IntroScene({ onComplete }: IntroSceneProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    track("intro_viewed");
  }, []);

  const delays: number[] = [];
  let cumulativeDelay = INITIAL_DELAY;
  for (let i = 0; i < introLines.length; i++) {
    delays.push(cumulativeDelay);
    cumulativeDelay += STAGGER_DELAY;
    if (introLines[i] === "") {
      cumulativeDelay += EMPTY_LINE_EXTRA_DELAY;
    }
  }

  return (
    <motion.div
      className={styles.container}
      exit={{ opacity: 0 }}
      transition={{ duration: FADEOUT_DURATION, ease: "easeInOut" }}
    >
      <div className={styles.vignette} />
      <div className={styles.fog1} />
      <div className={styles.fog2} />

      <div className={styles.textContainer}>
        <motion.div
          className={styles.imageWrapper}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: IMAGE_FADE_DELAY,
            duration: 1.2,
            ease: "easeOut",
          }}
        >
          <img
            src="/images/grandmother.jpg"
            alt="고 김귀자 할머니"
            className={styles.portrait}
          />
        </motion.div>

        {introLines.map((line, index) => {
          if (line === "") {
            return <div key={index} className={styles.emptyLine} />;
          }

          return (
            <motion.p
              key={index}
              className={styles.line}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: delays[index],
                duration: LINE_FADE_DURATION,
                ease: "easeOut",
              }}
            >
              {line}
            </motion.p>
          );
        })}
      </div>

      {/* 하단 고정 버튼 */}
      <motion.button
        className={styles.watchButton}
        onClick={onCompleteRef.current}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
      >
        생전 영상 보기
      </motion.button>
    </motion.div>
  );
}
