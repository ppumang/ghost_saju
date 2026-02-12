'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import { track } from '@/lib/mixpanel';
import { notifySlack } from '@/lib/slack';

type Stage = 'confirming' | 'complete' | 'error';

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const purchaseId = searchParams.get('purchaseId');

  const [stage, setStage] = useState<Stage>('confirming');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    if (!paymentKey || !orderId || !amount || !purchaseId) {
      setStage('error');
      setErrorMessage('결제 정보가 올바르지 않습니다.');
      return;
    }

    processPayment();

    async function processPayment() {
      try {
        // Step 1: 결제 승인 (DEV: paymentKey=test면 건너뛰기)
        if (paymentKey !== 'test') {
          const confirmRes = await fetch('/api/payment/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentKey,
              orderId,
              amount: Number(amount),
              purchaseId,
            }),
          });

          if (!confirmRes.ok) {
            const data = await confirmRes.json();
            throw new Error(data.error || '결제 승인에 실패했습니다.');
          }
        }

        // Step 2: DB에서 purchase 정보 가져오기
        const purchaseRes = await fetch('/api/payment/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ purchaseId }),
        });

        if (!purchaseRes.ok) {
          throw new Error('구매 정보를 찾을 수 없습니다.');
        }

        const { data: purchase } = await purchaseRes.json();
        const { sajuData, ghostClassification } = purchase.payload ?? {};
        const email = purchase.email;

        setSentEmail(email);

        // 이벤트: 결제 완료
        track('payment_completed', { email, purchaseId });
        notifySlack(`✅ [결제 완료] ${email} / 주문: ${orderId}`);

        // Step 3: 빈 reading 생성 + 이메일 즉시 발송
        if (sajuData) {
          const prepareRes = await fetch('/api/reading/prepare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sajuData, ghostClassification, email, purchaseId }),
          });

          const { readingId } = await prepareRes.json();

          setStage('complete');

          // Step 4: AI 생성 (fire-and-forget, readingId로 기존 레코드 업데이트)
          if (readingId) {
            fetch('/api/fortune', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sajuData, ghostClassification, readingId }),
            }).catch(console.error);
          }
        } else {
          setStage('complete');
        }
      } catch (err) {
        setStage('error');
        setErrorMessage(
          err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.'
        );
      }
    }
  }, [paymentKey, orderId, amount, purchaseId]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: '#0a0a0a',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.2rem',
        }}
      >
        {/* Stage: 결제 확인 중 */}
        {stage === 'confirming' && (
          <>
            <p style={headingStyle}>결제를 확인하고 있습니다...</p>
            <p style={subStyle}>잠시만 기다려주세요.</p>
          </>
        )}

        {/* Stage: 완료 */}
        {stage === 'complete' && (
          <>
            <p
              style={{
                fontSize: '2rem',
                marginBottom: '0.5rem',
              }}
            >
              &#x2709;&#xFE0F;
            </p>
            <p style={headingStyle}>이메일로 전송되었습니다</p>
            {sentEmail && (
              <p
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '0.95rem',
                  color: '#d4c5a9',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  wordBreak: 'break-all',
                }}
              >
                {sentEmail}
              </p>
            )}
            <p style={subStyle}>
              위 이메일로 사주 풀이 결과 링크를 보내드렸습니다.
              <br />
              메일함을 확인해주세요.
              <br />
              <span style={{ color: '#666', fontSize: '0.75rem' }}>
                메일이 보이지 않으면 스팸함을 확인해주세요.
              </span>
            </p>
            <a href="/" style={linkButtonStyle}>
              홈으로
            </a>
          </>
        )}

        {/* Stage: 에러 */}
        {stage === 'error' && (
          <>
            <p
              style={{
                ...headingStyle,
                color: '#8b0000',
              }}
            >
              오류가 발생했습니다
            </p>
            <p style={subStyle}>{errorMessage}</p>
            <a href="/" style={linkButtonStyle}>
              다시 시도하기
            </a>
          </>
        )}
      </div>
    </div>
  );
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-primary)',
  fontSize: 'clamp(1rem, 3vw, 1.2rem)',
  color: '#c4b896',
  letterSpacing: '0.08em',
};

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-primary)',
  fontSize: '0.8rem',
  color: '#888',
  lineHeight: 1.8,
};

const linkButtonStyle: React.CSSProperties = {
  marginTop: '1rem',
  padding: '0.7rem 2rem',
  border: '1px solid #8b0000',
  color: '#d4c5a9',
  fontFamily: 'var(--font-primary)',
  fontSize: '0.9rem',
  letterSpacing: '0.05em',
  textDecoration: 'none',
};

export default function PaymentSuccessPage() {
  return (
    <>
      <Suspense
        fallback={
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0a0a0a',
              color: '#666',
              fontFamily: 'var(--font-primary)',
            }}
          >
            확인 중...
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </>
  );
}
