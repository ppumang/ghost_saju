"use client";

import {
  ANONYMOUS,
  loadTossPayments,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/mixpanel";
import { notifySlack } from "@/lib/slack";
import { trackAddToCart } from "@/lib/meta-pixel";
import { PRODUCTS } from "@/lib/payment/constants";
import type { SajuDataV2, GhostClassification } from "@/lib/saju/types";
import styles from "./PaymentModal.module.css";

const clientKey = process.env.NEXT_PUBLIC_TOSSPAY_CLIENT_KEY!;
const product = PRODUCTS.saju_reading;

const generateOrderId = () =>
  window.btoa(`${Math.random()}`).slice(0, 20);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sajuData: SajuDataV2;
  ghostClassification: GhostClassification;
  email: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  sajuData,
  ghostClassification,
  email,
}: PaymentModalProps) {
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetsRenderedRef = useRef(false);
  const paymentRequestedRef = useRef(false);

  // TossPayments SDK 초기화
  useEffect(() => {
    if (!isOpen) return;

    async function init() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const w = tossPayments.widgets({ customerKey: ANONYMOUS });
        setWidgets(w);
      } catch (err) {
        console.error("TossPayments init error:", err);
        setError("결제 모듈을 불러오지 못했습니다.");
      }
    }
    init();
  }, [isOpen]);

  // 위젯 렌더링 (이중 렌더링 방지)
  useEffect(() => {
    if (!widgets || !isOpen || widgetsRenderedRef.current) return;

    async function render() {
      try {
        await widgets!.setAmount({ currency: "KRW", value: product.price });

        await Promise.all([
          widgets!.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: "DEFAULT",
          }),
          widgets!.renderAgreement({
            selector: "#agreement",
            variantKey: "AGREEMENT",
          }),
        ]);

        widgetsRenderedRef.current = true;
        setReady(true);
      } catch (err) {
        console.error("Widget render error:", err);
        setError("결제 위젯 로드에 실패했습니다.");
      }
    }
    render();
  }, [widgets, isOpen]);

  // 모달 닫힐 때 상태 리셋
  useEffect(() => {
    if (!isOpen) {
      widgetsRenderedRef.current = false;
      paymentRequestedRef.current = false;
      setReady(false);
      setWidgets(null);
      setError(null);
      setRequesting(false);
    }
  }, [isOpen]);

  // 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handlePayment = async () => {
    if (requesting || !widgets || paymentRequestedRef.current) return;
    paymentRequestedRef.current = true;
    setRequesting(true);
    setError(null);

    try {
      track("payment_started", { email });
      notifySlack(`💰 [결제 시작] ${email}`);
      trackAddToCart();

      // 1. PENDING 구매 레코드 생성 (sajuData를 DB에 저장)
      const orderId = generateOrderId();
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          productId: product.id,
          email,
          payload: { sajuData, ghostClassification },
        }),
      });

      if (!res.ok) {
        throw new Error("구매 레코드 생성에 실패했습니다.");
      }

      const { data } = await res.json();
      const purchaseId = data.id;

      // 3. TossPayments 결제 요청 → 토스 페이지로 리다이렉트
      await widgets.requestPayment({
        orderId,
        orderName: product.name,
        successUrl: `${window.location.origin}/payment/success?purchaseId=${purchaseId}`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err) {
      console.error("Payment request error:", err);
      setError(
        err instanceof Error ? err.message : "결제 요청에 실패했습니다."
      );
      paymentRequestedRef.current = false;
      setRequesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      {/* 헤더 */}
      <div className={styles.header}>
        <span className={styles.headerTitle}>결제</span>
        <button
          className={styles.closeButton}
          onClick={() => {
            track("payment_modal_closed", { email });
            onClose();
          }}
          aria-label="닫기"
        >
          &times;
        </button>
      </div>

      {/* 본문 */}
      <div className={styles.body}>
        {/* 상품 정보 */}
        <div className={styles.productInfo}>
          <span className={styles.productName}>{product.name}</span>
          <span className={styles.productPrice}>
            {product.price.toLocaleString()}원
          </span>
        </div>

        {/* TossPayments 위젯 */}
        <div className={styles.widgetContainer}>
          <div id="payment-method" />
          <div id="agreement" />
        </div>

        {error && <p className={styles.errorText}>{error}</p>}
      </div>

      {/* 하단 고정 결제 버튼 */}
      <div className={styles.footer}>
        <button
          className={styles.payButton}
          onClick={handlePayment}
          disabled={!ready || requesting}
        >
          {requesting
            ? "처리 중..."
            : `${product.price.toLocaleString()}원 결제하기`}
        </button>
        {/* DEV: 결제 건너뛰기 */}
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={async () => {
              const orderId = generateOrderId();
              const res = await fetch("/api/payment/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId,
                  productId: product.id,
                  email,
                  payload: { sajuData, ghostClassification },
                }),
              });
              const { data } = await res.json();
              window.location.href = `/payment/success?paymentKey=test&orderId=${orderId}&amount=${product.price}&purchaseId=${data.id}`;
            }}
            style={{
              width: "100%",
              maxWidth: "540px",
              margin: "0.5rem auto 0",
              display: "block",
              padding: "0.7rem",
              background: "transparent",
              border: "1px dashed #555",
              color: "#888",
              fontFamily: "var(--font-primary)",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            [DEV] 결제 건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}
