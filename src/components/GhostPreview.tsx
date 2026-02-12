"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/mixpanel";

interface GhostPreviewProps {
  previewText: string;
}

function renderBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ color: "#8b0000", fontWeight: 800, textShadow: "0 0 6px rgba(139, 0, 0, 0.3)" }}>
        {part}
      </strong>
    ) : (
      part
    )
  );
}

export default function GhostPreview({ previewText }: GhostPreviewProps) {
  const paragraphs = previewText
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const [visibleCount, setVisibleCount] = useState(0);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      track("ghost_preview_viewed");
    }
  }, []);

  useEffect(() => {
    if (visibleCount >= paragraphs.length) return;

    const timer = setTimeout(
      () => setVisibleCount((c) => c + 1),
      visibleCount === 0 ? 800 : 1500
    );
    return () => clearTimeout(timer);
  }, [visibleCount, paragraphs.length]);

  if (!previewText.trim()) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        width: "100%",
        padding: "2.5rem 0",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      {/* 구분선 */}
      <div
        style={{
          width: "80px",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, #8b0000, transparent)",
          margin: "0 auto 1.5rem",
          boxShadow: "0 0 12px rgba(139, 0, 0, 0.3)",
        }}
      />

      {/* 단락별 페이드인 — 큰 폰트 */}
      <AnimatePresence>
        {paragraphs.slice(0, visibleCount).map((paragraph, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "clamp(1.05rem, 3vw, 1.25rem)",
              color: i === paragraphs.length - 1 ? "#777" : "#c4b896",
              lineHeight: 2.4,
              wordBreak: "keep-all",
              textAlign: "left",
              letterSpacing: "0.02em",
            }}
          >
            {renderBold(paragraph)}
          </motion.p>
        ))}
      </AnimatePresence>

      {/* 마지막 단락 후 점 세 개 애니메이션 */}
      {visibleCount >= paragraphs.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.6rem",
            padding: "1rem 0",
          }}
        >
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              animate={{ opacity: [0.2, 0.9, 0.2] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: dot * 0.4,
                ease: "easeInOut",
              }}
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#8b0000",
                boxShadow: "0 0 8px rgba(139, 0, 0, 0.5)",
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
