import type { Metadata } from 'next';
import { getReading } from '@/lib/supabase/queries';
import ClassicResultScene from '@/components/ClassicResultScene';
import ResultPolling from '@/components/ResultPolling';
import type { SajuDataV2 } from '@/lib/saju/types';

export const metadata: Metadata = {
  title: '귀신사주 - 사주 풀이 결과',
  description: '귀신사주로 본 당신의 운명',
  robots: 'noindex, nofollow',
};

export default async function ResultPage({
  params,
}: {
  params: Promise<{ readingId: string }>;
}) {
  const { readingId } = await params;
  const reading = await getReading(readingId);

  if (!reading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          gap: '1.5rem',
          fontFamily: 'var(--font-primary)',
        }}
      >
        <p style={{ color: '#8b0000', fontSize: '1.5rem', letterSpacing: '0.2em', fontWeight: 'bold' }}>
          空
        </p>
        <p style={{ color: '#d4c5a9', fontSize: '1rem', letterSpacing: '0.1em', fontFamily: 'var(--font-primary)' }}>
          이 사주는 찾을 수 없습니다.
        </p>
        <p style={{ color: '#666', fontSize: '0.8rem', fontFamily: 'var(--font-primary)' }}>
          링크가 맞는지 다시 확인해 보세요.
        </p>
        <a
          href="/"
          style={{
            marginTop: '1.5rem',
            padding: '0.7rem 2rem',
            border: '1px solid #8b0000',
            color: '#d4c5a9',
            textDecoration: 'none',
            fontSize: '0.9rem',
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-primary)',
          }}
        >
          귀신사주 보러가기
        </a>
      </div>
    );
  }

  // reading_text: 클래식(plain text string) 또는 v2(JSON sections array)
  let classicText: string | null = null;

  const rt = reading.reading_text;
  if (typeof rt === 'string') {
    // DB에서 string으로 올 때: JSON array인지 plain text인지 구분
    try {
      const parsed = JSON.parse(rt);
      if (Array.isArray(parsed)) {
        // v2 sections — 나중을 위해 보존, 현재는 미사용
        classicText = null;
      } else {
        classicText = rt;
      }
    } catch {
      // JSON 파싱 실패 = plain text (클래식)
      classicText = rt;
    }
  } else if (typeof rt === 'object' && rt !== null && !Array.isArray(rt)) {
    // jsonb object로 올 때 — 혹시 { text: "..." } 형태인 경우
    classicText = (rt as Record<string, unknown>).text as string ?? null;
  }

  const sajuData = reading.saju_data as SajuDataV2 | undefined;

  // 텍스트가 아직 없으면 (AI 생성 중) polling으로 대기
  if (!classicText) {
    return <ResultPolling readingId={readingId} sajuData={sajuData} />;
  }

  return (
    <ClassicResultScene
      text={classicText}
      readingId={readingId}
      sajuData={sajuData}
      isStaticPage
    />
  );
}
