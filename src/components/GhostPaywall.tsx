"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { GhostTypeDef, SajuDataV2, GhostClassification } from "@/lib/saju/types";
import PaymentModal from "./PaymentModal";
import { track } from "@/lib/mixpanel";
import { notifySlack } from "@/lib/slack";
import { trackViewContent, trackInitiateCheckout } from "@/lib/meta-pixel";

interface GhostPaywallProps {
  ghostType: GhostTypeDef;
  sajuData: SajuDataV2;
  ghostClassification: GhostClassification;
}

export default function GhostPaywall({
  ghostType,
  sajuData,
  ghostClassification,
}: GhostPaywallProps) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const hasTracked = useRef(false);
  const emailTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      track("paywall_viewed", { ghost_type: ghostType.id });
      trackViewContent("귀신사주 프리뷰");
    }
  }, [ghostType.id]);

  const handleSubmit = () => {
    if (!email.trim()) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    setEmailError("");
    track("payment_modal_opened", { email, ghost_type: ghostType.id });
    notifySlack(`💳 [결제 모달 오픈] ${email} / 귀신: ${ghostType.reading}`);
    trackInitiateCheckout();
    setShowPayment(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          width: "100%",
          padding: "2.5rem 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.2rem",
        }}
      >
        {/* 경고 메시지 */}
        <div
          style={{
            width: "100%",
            padding: "1.5rem",
            border: "1px solid rgba(139, 0, 0, 0.3)",
            background: "rgba(139, 0, 0, 0.05)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
              color: "#d4c5a9",
              lineHeight: 2,
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            여기서부터는 함부로 볼 기 아이다.
          </p>
          <p
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "0.85rem",
              color: "#888",
              lineHeight: 1.8,
              marginTop: "0.5rem",
            }}
          >
            니 곁에 붙어있는 것의 정체, 겉의 욕과 속의 욕,
            <br />
            그기 다 풀어놓은 상세 사주 풀이가 기다리고 있다.
          </p>
        </div>

        {/* 블러 프리뷰 */}
        <div
          style={{
            width: "100%",
            padding: "2rem 1rem",
            background: "rgba(10, 10, 10, 0.8)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              filter: "blur(8px)",
              opacity: 0.4,
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            <p
              style={{
                fontSize: "2.4rem",
                color: "#8b0000",
                textAlign: "center",
                fontWeight: "bold",
                letterSpacing: "0.3em",
                marginBottom: "0.5rem",
              }}
            >
              {ghostType.hanja}
            </p>
            <p
              style={{
                fontFamily: "var(--font-primary)",
                fontSize: "0.95rem",
                color: "#c4b896",
                textAlign: "center",
                lineHeight: 2,
              }}
            >
              {ghostType.desire.surface.slice(0, 60)}...
            </p>
          </div>

          {/* 잠금 오버레이 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "radial-gradient(circle, transparent 30%, rgba(10,10,10,0.9) 70%)",
            }}
          >
            <span
              style={{
                fontSize: "2rem",
                color: "#8b0000",
                textShadow: "0 0 20px rgba(139, 0, 0, 0.5)",
              }}
            >
              封
            </span>
          </div>
        </div>

        {/* 이메일 입력 */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "0.8rem",
              color: "#888",
            }}
          >
            풀이 결과를 다시 볼 수 있도록 링크를 보내드립니다.
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
              if (!emailTracked.current && e.target.value.length > 3) {
                emailTracked.current = true;
                track("email_input_started");
              }
            }}
            placeholder="이메일 주소를 입력해주세요"
            style={{
              width: "100%",
              padding: "0.8rem 1rem",
              border: `1px solid ${emailError ? "#8b0000" : "#333"}`,
              background: "#111",
              color: "#d4c5a9",
              fontFamily: "var(--font-primary)",
              fontSize: "0.95rem",
              outline: "none",
              transition: "border-color 0.3s",
            }}
          />
          {emailError && (
            <p
              style={{
                fontFamily: "var(--font-primary)",
                fontSize: "0.75rem",
                color: "#8b0000",
              }}
            >
              {emailError}
            </p>
          )}
        </div>

        {/* 결제 버튼 */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "1rem",
            background: "#8b0000",
            border: "none",
            color: "#d4c5a9",
            fontFamily: "var(--font-primary)",
            fontSize: "1rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: "pointer",
            transition: "all 0.3s",
            minHeight: "48px",
          }}
        >
          귀신사주 전체 풀이 보기 · ₩9,900
        </button>

        <p
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "0.7rem",
            color: "#555",
            textAlign: "center",
          }}
        >
          결제 후 이메일로 결과 링크가 발송됩니다.
        </p>
      </motion.div>

      {/* 결제 모달 */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        sajuData={sajuData}
        ghostClassification={ghostClassification}
        email={email.trim()}
      />
    </>
  );
}
