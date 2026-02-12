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
        padding: "2rem 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      {/* 감지 대사 (하나씩 등장) */}
      <AnimatePresence>
        {ghostClassification.detectionLines
          .slice(0, visibleLines)
          .map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                fontFamily: "var(--font-primary)",
                fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)",
                color: i === 0 ? "#8b0000" : "#c4b896",
                lineHeight: 2,
                textAlign: "center",
                wordBreak: "keep-all",
              }}
            >
              {line}
            </motion.p>
          ))}
      </AnimatePresence>

      {/* 블러 처리된 귀신 한자 (티저) */}
      {visibleLines >= ghostClassification.detectionLines.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.2 }}
          style={{
            marginTop: "1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          <p
            style={{
              fontSize: "3rem",
              color: "#8b0000",
              fontWeight: "bold",
              letterSpacing: "0.3em",
              filter: "blur(6px)",
              textShadow: "0 0 30px rgba(139, 0, 0, 0.5)",
              userSelect: "none",
            }}
          >
            {ghostType.hanja}
          </p>

          <p
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "0.85rem",
              color: "#666",
              textAlign: "center",
              lineHeight: 1.8,
              maxWidth: "320px",
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
              transition={{ delay: 0.8 + i * 0.4, duration: 0.6 }}
              style={{
                fontFamily: "var(--font-primary)",
                fontSize: "0.9rem",
                color: "#888",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              {line}
            </motion.p>
          ))}
        </motion.div>
      )}
    </div>
  );
}
