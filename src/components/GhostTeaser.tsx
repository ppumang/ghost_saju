"use client";

import { motion } from "framer-motion";
import type { GhostClassification, GhostTypeDef } from "@/lib/saju/types";

interface GhostTeaserProps {
  ghostClassification: GhostClassification;
  ghostType: GhostTypeDef;
}

export default function GhostTeaser({
  ghostClassification,
  ghostType,
}: GhostTeaserProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      style={{
        width: "100%",
        padding: "2rem 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      {/* 강조 문구 */}
      <p
        style={{
          fontFamily: "var(--font-primary)",
          fontSize: "clamp(1.05rem, 3vw, 1.2rem)",
          fontWeight: 700,
          color: "#8b0000",
          textAlign: "center",
          lineHeight: 2,
          letterSpacing: "0.03em",
          textShadow: "0 0 16px rgba(139, 0, 0, 0.4)",
          marginBottom: "1rem",
        }}
      >
        너한테 붙어있으면 안 되는 귀신이 하나 붙어있거든.
      </p>

      {/* 블러 처리된 귀신 한자 */}
      <p
        style={{
          fontSize: "clamp(3.5rem, 12vw, 5rem)",
          color: "#8b0000",
          fontWeight: "bold",
          letterSpacing: "0.3em",
          filter: "blur(7px)",
          textShadow:
            "0 0 40px rgba(139, 0, 0, 0.6), 0 0 80px rgba(139, 0, 0, 0.2)",
          userSelect: "none",
          animation: "ghostPulse 3s ease-in-out infinite",
        }}
      >
        {ghostType.hanja}
      </p>

      {/* 친화성 설명 */}
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
          transition={{ delay: 0.5 + i * 0.5, duration: 0.8 }}
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

      <style>{`
        @keyframes ghostPulse {
          0%, 100% { opacity: 0.7; filter: blur(7px); }
          50% { opacity: 1; filter: blur(5px); }
        }
      `}</style>
    </motion.div>
  );
}
