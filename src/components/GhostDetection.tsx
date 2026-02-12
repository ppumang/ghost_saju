"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/mixpanel";
import type { GhostClassification, GhostTypeDef } from "@/lib/saju/types";

interface GhostDetectionProps {
  ghostClassification: GhostClassification;
  ghostType: GhostTypeDef;
}

export default function GhostDetection({
  ghostClassification,
  ghostType,
}: GhostDetectionProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      track("ghost_detection_viewed", { ghost_type: ghostClassification.typeId });
    }
  }, [ghostClassification.typeId]);

  useEffect(() => {
    const lines = ghostClassification.detectionLines;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= lines.length) clearInterval(timer);
    }, 1200);
    return () => clearInterval(timer);
  }, [ghostClassification.detectionLines]);

  return (
    <div
      style={{
        width: "100%",
        padding: "3rem 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
      }}
    >
      {/* 감지 대사 (하나씩 등장) — 큰 폰트, 음산한 느낌 */}
      <AnimatePresence>
        {ghostClassification.detectionLines
          .slice(0, visibleLines)
          .map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                fontFamily: "var(--font-primary)",
                fontSize: i === 0
                  ? "clamp(1.2rem, 4vw, 1.5rem)"
                  : "clamp(1.05rem, 3vw, 1.25rem)",
                fontWeight: i === 0 ? 700 : 400,
                color: i === 0 ? "#8b0000" : "#c4b896",
                lineHeight: 2.2,
                textAlign: "center",
                wordBreak: "keep-all",
                textShadow: i === 0
                  ? "0 0 20px rgba(139, 0, 0, 0.4)"
                  : "0 0 8px rgba(196, 184, 150, 0.1)",
                letterSpacing: "0.03em",
              }}
            >
              {line}
            </motion.p>
          ))}
      </AnimatePresence>

      {/* 블러 처리된 귀신 한자 (티저) */}
      {visibleLines >= ghostClassification.detectionLines.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1.5, ease: "easeOut" }}
          style={{
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <p
            style={{
              fontSize: "clamp(3.5rem, 12vw, 5rem)",
              color: "#8b0000",
              fontWeight: "bold",
              letterSpacing: "0.3em",
              filter: "blur(7px)",
              textShadow: "0 0 40px rgba(139, 0, 0, 0.6), 0 0 80px rgba(139, 0, 0, 0.2)",
              userSelect: "none",
              animation: "ghostPulse 3s ease-in-out infinite",
            }}
          >
            {ghostType.hanja}
          </p>

          <p
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
              color: "#888",
              textAlign: "center",
              lineHeight: 2,
              maxWidth: "360px",
              letterSpacing: "0.02em",
            }}
          >
            {ghostClassification.affinityDescription}
          </p>

          {/* 티저 라인 */}
          {ghostType.teaserLines.map((line, i) => (
            <motion.p
              key={`teaser-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.5, duration: 0.8 }}
              style={{
                fontFamily: "var(--font-primary)",
                fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
                color: "#999",
                textAlign: "center",
                fontStyle: "italic",
                letterSpacing: "0.02em",
              }}
            >
              {line}
            </motion.p>
          ))}
        </motion.div>
      )}

      <style>{`
        @keyframes ghostPulse {
          0%, 100% { opacity: 0.7; filter: blur(7px); }
          50% { opacity: 1; filter: blur(5px); }
        }
      `}</style>
    </div>
  );
}
