"use client";

import { useState, useEffect, useRef } from "react";
import { track } from "@/lib/mixpanel";
import ClassicResultScene from "./ClassicResultScene";

interface ResultPollingProps {
  readingId: string;
}

/**
 * AI 생성이 아직 완료되지 않은 reading을 polling하여
 * 텍스트가 준비되면 ClassicResultScene을 렌더한다.
 */
export default function ResultPolling({ readingId }: ResultPollingProps) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    track("result_page_polling_started", { readingId });
    let attempts = 0;
    const maxAttempts = 60; // 5초 간격 × 60 = 5분

    async function poll() {
      try {
        const res = await fetch("/api/reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readingId }),
        });

        if (!res.ok) {
          attempts++;
          if (attempts >= maxAttempts) {
            setError(true);
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
          return;
        }

        const { data } = await res.json();
        const rt = data?.reading_text;

        // 텍스트가 비어있지 않으면 완료
        if (rt && typeof rt === "string" && rt.trim().length > 0) {
          setText(rt);
          track("result_ready", { readingId, attempts });
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        attempts++;
        if (attempts >= maxAttempts) {
          setError(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }
    }

    // 즉시 1회 + 5초 간격
    poll();
    intervalRef.current = setInterval(poll, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [readingId]);

  if (text) {
    return (
      <ClassicResultScene text={text} readingId={readingId} isStaticPage />
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          gap: "1rem",
          fontFamily: "var(--font-primary)",
        }}
      >
        <p style={{ color: "#8b0000", fontSize: "1rem" }}>
          풀이 생성에 시간이 걸리고 있습니다.
        </p>
        <p style={{ color: "#666", fontSize: "0.8rem" }}>
          잠시 후 다시 접속해주세요.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "1rem",
            padding: "0.7rem 2rem",
            border: "1px solid #8b0000",
            background: "transparent",
            color: "#d4c5a9",
            fontFamily: "var(--font-primary)",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          새로고침
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        gap: "1.5rem",
        fontFamily: "var(--font-primary)",
      }}
    >
      <p
        style={{
          color: "#8b0000",
          fontSize: "1.8rem",
          letterSpacing: "0.2em",
          fontWeight: "bold",
          animation: "pulse 2s ease-in-out infinite",
        }}
      >
        鬼
      </p>
      <p
        style={{
          color: "#d4c5a9",
          fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
          letterSpacing: "0.08em",
        }}
      >
        사주 풀이를 준비하고 있습니다...
      </p>
      <p style={{ color: "#666", fontSize: "0.75rem", lineHeight: 1.8 }}>
        잠시만 기다려주세요. 자동으로 표시됩니다.
      </p>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
