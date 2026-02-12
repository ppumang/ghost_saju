"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { track } from "@/lib/mixpanel";
import type { GhostTypeDef } from "@/lib/saju/types";

interface GhostRevealProps {
  ghostType: GhostTypeDef;
}

export default function GhostReveal({ ghostType }: GhostRevealProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      track("ghost_reveal_viewed", { ghost_type: ghostType.id, ghost_reading: ghostType.reading });
    }
  }, [ghostType.id, ghostType.reading]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      style={{
        width: "100%",
        padding: "3rem 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.2rem",
      }}
    >
      {/* 한자 이름 */}
      <motion.p
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
        style={{
          fontSize: "clamp(2.5rem, 8vw, 3.5rem)",
          color: ghostType.colors.primary,
          fontWeight: "bold",
          letterSpacing: "0.3em",
          textShadow: `0 0 30px ${ghostType.colors.primary}60`,
        }}
      >
        {ghostType.hanja}
      </motion.p>

      {/* 음독 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        style={{
          fontFamily: "var(--font-primary)",
          fontSize: "0.9rem",
          color: "#888",
          letterSpacing: "0.15em",
        }}
      >
        {ghostType.reading}
      </motion.p>

      {/* 의미 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        style={{
          fontFamily: "var(--font-primary)",
          fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
          color: "#d4c5a9",
          letterSpacing: "0.05em",
          fontWeight: 600,
        }}
      >
        {ghostType.meaning}
      </motion.p>

      {/* 태그라인 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        style={{
          fontFamily: "var(--font-primary)",
          fontSize: "0.85rem",
          color: "#666",
          fontStyle: "italic",
        }}
      >
        {ghostType.tagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        style={{
          width: "80px",
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${ghostType.colors.primary}, transparent)`,
          margin: "1rem 0",
        }}
      />

      {/* 김귀자 인용 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        style={{
          fontFamily: "var(--font-primary)",
          fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
          color: "#c4b896",
          lineHeight: 2.2,
          textAlign: "center",
          maxWidth: "500px",
          wordBreak: "keep-all",
        }}
      >
        {ghostType.kimQuote}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 0.8 }}
        style={{
          width: "60px",
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${ghostType.colors.primary}, transparent)`,
          margin: "0.5rem 0",
        }}
      />

      {/* 욕망 공개: 겉의 욕 */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.5, duration: 0.8 }}
        style={{
          width: "100%",
          padding: "1.5rem",
          border: "1px solid rgba(139, 0, 0, 0.2)",
          background: "rgba(139, 0, 0, 0.03)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "0.75rem",
            color: "#8b0000",
            letterSpacing: "0.1em",
            marginBottom: "0.5rem",
            fontWeight: 700,
          }}
        >
          겉의 욕 — {ghostType.desire.surfaceLabel}
        </p>
        <p
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
            color: "#c4b896",
            lineHeight: 2,
            wordBreak: "keep-all",
          }}
        >
          {ghostType.desire.surface}
        </p>
      </motion.div>

      {/* 욕망 공개: 속의 욕 */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 4.2, duration: 0.8 }}
        style={{
          width: "100%",
          padding: "1.5rem",
          border: "1px solid rgba(139, 0, 0, 0.4)",
          background: "rgba(139, 0, 0, 0.06)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "0.75rem",
            color: "#8b0000",
            letterSpacing: "0.1em",
            marginBottom: "0.5rem",
            fontWeight: 700,
          }}
        >
          속의 욕 — {ghostType.desire.truthLabel}
        </p>
        <p
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
            color: "#c4b896",
            lineHeight: 2,
            wordBreak: "keep-all",
          }}
        >
          {ghostType.desire.truth}
        </p>
      </motion.div>

      {/* 귀신의 메시지 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 5, duration: 1.5 }}
        style={{
          fontFamily: "var(--font-primary)",
          fontSize: "0.8rem",
          color: "#555",
          fontStyle: "italic",
          textAlign: "center",
          marginTop: "1rem",
        }}
      >
        &ldquo;{ghostType.ghostMessage}&rdquo;
      </motion.p>
    </motion.div>
  );
}
