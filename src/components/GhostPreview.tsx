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
      <strong key={i} style={{ color: "#d4c5a9", fontWeight: 700 }}>
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
        padding: "2rem 0",
        display: "flex",
        flexDirection: "column",
        gap: "1.2rem",
      }}
    >
      {/* 구분선 */}
      <div
        style={{
          width: "60px",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, #8b0000, transparent)",
          margin: "0 auto 1rem",
        }}
      />

      {/* 단락별 페이드인 */}
      <AnimatePresence>
        {paragraphs.slice(0, visibleCount).map((paragraph, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
              color: i === paragraphs.length - 1 ? "#888" : "#c4b896",
              lineHeight: 2.2,
              wordBreak: "keep-all",
              textAlign: "left",
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
            gap: "0.5rem",
            padding: "0.5rem 0",
          }}
        >
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: dot * 0.3,
                ease: "easeInOut",
              }}
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: "#8b0000",
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
