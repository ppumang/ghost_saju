"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        color: "#d4c5a0",
        fontFamily: "var(--font-primary)",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "#c8a96e" }}>
        기운이 흐트러졌습니다
      </h1>
      <p style={{ fontSize: "1rem", marginBottom: "2rem", opacity: 0.7 }}>
        잠시 후 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        style={{
          padding: "0.8rem 2rem",
          border: "1px solid #c8a96e",
          background: "transparent",
          color: "#c8a96e",
          cursor: "pointer",
          fontSize: "1rem",
          fontFamily: "inherit",
          transition: "all 0.3s",
        }}
      >
        다시 시도
      </button>
    </div>
  );
}
