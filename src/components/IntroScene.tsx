"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { introLines } from "@/data/introText";
import { track } from "@/lib/mixpanel";
import styles from "./IntroScene.module.css";

interface IntroSceneProps {
  onComplete: () => void;
}

const PARAGRAPH_STAGGER = 1.8;
const PARAGRAPH_FADE = 1.2;
const IMAGE_FADE_DELAY = 0.3;
const FADEOUT_DURATION = 1.5;

/** introLines를 빈 줄("")로 나눠 문단 그룹으로 분리 */
function splitParagraphs(lines: string[]): string[][] {
  const paragraphs: string[][] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (line === "") {
      if (current.length > 0) {
        paragraphs.push(current);
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) paragraphs.push(current);
  return paragraphs;
}

export default function IntroScene({ onComplete }: IntroSceneProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    track("intro_viewed");
  }, []);

  const paragraphs = splitParagraphs(introLines);

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
            alt="故 김귀자 할머니"
            className={styles.portrait}
          />
        </motion.div>

        {paragraphs.map((lines, pIndex) => (
          <motion.div
            key={pIndex}
            className={styles.paragraph}
            initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: 1.0 + pIndex * PARAGRAPH_STAGGER,
              duration: PARAGRAPH_FADE,
              ease: "easeOut",
            }}
          >
            {lines.map((line, lIndex) => (
              <p key={lIndex} className={styles.line}>
                {line}
              </p>
            ))}
          </motion.div>
        ))}
      </div>

      {/* 하단 고정 버튼 */}
      <motion.button
        className={styles.watchButton}
        onClick={() => onCompleteRef.current()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.8, ease: "easeOut" }}
      >
        생전 영상 보기
      </motion.button>
    </motion.div>
  );
}
