"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/mixpanel";
import styles from "./VideoScene.module.css";

interface VideoSceneProps {
  onProceed: () => void;
}

export default function VideoScene({ onProceed }: VideoSceneProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showProceed, setShowProceed] = useState(false);

  useEffect(() => {
    track("video_viewed");
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay failed — expected on some browsers
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowProceed(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      track("video_mute_toggled", { muted: videoRef.current.muted });
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

      {/* 하단 그라데이션 오버레이 */}
      <div className={styles.bottomOverlay} />

      {/* 뮤트 버튼 */}
      <button
        className={styles.muteButton}
        onClick={toggleMute}
        aria-label={isMuted ? "소리 켜기" : "소리 끄기"}
      >
        {isMuted ? "소리 켜기" : "소리 끄기"}
      </button>

      {/* 하단 설명 + 버튼 */}
      <div className={styles.bottomContent}>
        <AnimatePresence>
          {showProceed && (
            <motion.div
              className={styles.bottomInner}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <p className={styles.description}>
                故 김귀자 — 1920년 출생. 청송의 귀신 할매로 유명했으며
                사주 명리학과 자신만의 &ldquo;귀신 풀이&rdquo;를 기반으로 한
                사주 풀이로 1990년대 지역에 줄을 설 정도로 유명한
                역술가였다 한다.
              </p>
              <button
                className={styles.proceedButton}
                onClick={onProceed}
              >
                귀신 사주 풀이 시작하기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
