"use client";

import { motion } from "framer-motion";
import styles from "./WatchPrompt.module.css";

interface WatchPromptProps {
  onStart: () => void;
}

export default function WatchPrompt({ onStart }: WatchPromptProps) {
  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <div className={styles.vignette} />
      <div className={styles.fog1} />
      <div className={styles.fog2} />

      <motion.button
        className={styles.watchButton}
        onClick={onStart}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
      >
        생전 영상 보기
      </motion.button>
    </motion.div>
  );
}
