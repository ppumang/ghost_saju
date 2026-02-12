'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { track } from '@/lib/mixpanel';
import { notifySlack } from '@/lib/slack';

function FailContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      track('payment_failed', { error_code: errorCode, error_message: errorMessage });
      notifySlack(`❌ [결제 실패] 코드: ${errorCode ?? '없음'} / ${errorMessage ?? '메시지 없음'}`);
    }
  }, [errorCode, errorMessage]);

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
        <p
          style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            color: '#8b0000',
            letterSpacing: '0.08em',
          }}
        >
          결제가 중단되었습니다.
        </p>
        {errorCode && (
          <p
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: '0.75rem',
              color: '#555',
            }}
          >
            ({errorCode})
          </p>
        )}
        {errorMessage && (
          <p
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: '0.85rem',
              color: '#888',
            }}
          >
            {errorMessage}
          </p>
        )}
        <a
          href="/"
          style={{
            marginTop: '1rem',
            padding: '0.7rem 2rem',
            border: '1px solid #8b0000',
            color: '#d4c5a9',
            fontFamily: 'var(--font-primary)',
            fontSize: '0.9rem',
            letterSpacing: '0.05em',
            textDecoration: 'none',
          }}
        >
          다시 시도하기
        </a>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
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
      <FailContent />
    </Suspense>
  );
}
