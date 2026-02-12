import Link from "next/link";

export default function NotFound() {
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
      <h1 style={{ fontSize: "4rem", marginBottom: "0.5rem", color: "#c8a96e" }}>
        404
      </h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "2rem", opacity: 0.7 }}>
        길을 잃으셨군요. 이곳에는 아무것도 없습니다.
      </p>
      <Link
        href="/"
        style={{
          padding: "0.8rem 2rem",
          border: "1px solid #c8a96e",
          color: "#c8a96e",
          textDecoration: "none",
          fontSize: "1rem",
          transition: "all 0.3s",
        }}
      >
        처음으로 돌아가기
      </Link>
    </div>
  );
}
