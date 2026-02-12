"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/mixpanel";
import type { GhostClassification } from "@/lib/saju/types";

interface GhostDetectionProps {
  ghostClassification: GhostClassification;
  onComplete?: () => void;
}

export default function GhostDetection({
  ghostClassification,
  onComplete,
}: GhostDetectionProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const hasTracked = useRef(false);
  const hasCalledComplete = useRef(false);

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

  useEffect(() => {
    if (
      visibleLines >= ghostClassification.detectionLines.length &&
      !hasCalledComplete.current
    ) {
      hasCalledComplete.current = true;
      onComplete?.();
    }
  }, [visibleLines, ghostClassification.detectionLines.length, onComplete]);

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
                  ? "clamp(1rem, 3.2vw, 1.3rem)"
                  : "clamp(0.95rem, 2.8vw, 1.15rem)",
                fontWeight: i === 0 ? 700 : 400,
                color: i === 0 ? "#8b0000" : "#c4b896",
                lineHeight: 2.2,
                textAlign: "center",
                wordBreak: "keep-all",
                whiteSpace: "pre-line",
                textShadow: i === 0
                  ? "0 0 20px rgba(139, 0, 0, 0.4)"
                  : "0 0 8px rgba(196, 184, 150, 0.1)",
                letterSpacing: "0.02em",
              }}
            >
              {line}
            </motion.p>
          ))}
      </AnimatePresence>
    </div>
  );
}
