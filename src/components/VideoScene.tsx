"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./VideoScene.module.css";

interface VideoSceneProps {
  onProceed: () => void;
}

export default function VideoScene({ onProceed }: VideoSceneProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showProceed, setShowProceed] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay failed — expected on some browsers
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowProceed(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      <video
        ref={videoRef}
        className={styles.video}
        src="/videos/restored-video.mp4"
        autoPlay
        loop
        playsInline
        preload="auto"
      />
      <button
        className={styles.muteButton}
        onClick={toggleMute}
        aria-label={isMuted ? "소리 켜기" : "소리 끄기"}
      >
        {isMuted ? "🔇 소리 켜기" : "🔊 소리 끄기"}
      </button>

      <AnimatePresence>
        {showProceed && (
          <motion.button
            className={styles.proceedButton}
            onClick={onProceed}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            귀신 사주 풀이 시작하기
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
