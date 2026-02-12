"use client";

import { motion } from "framer-motion";
import styles from "./SkipButton.module.css";

interface SkipButtonProps {
  onClick: () => void;
}

export default function SkipButton({ onClick }: SkipButtonProps) {
  return (
    <motion.button
      className={styles.skipButton}
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 3, duration: 1 }}
      aria-label="인트로 건너뛰기"
    >
      건너뛰기
    </motion.button>
  );
}
