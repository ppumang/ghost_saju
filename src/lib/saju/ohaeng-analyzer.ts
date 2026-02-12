import type { SaJu, OhHaeng, OhHaengDistribution } from './types';

/**
 * 사주 4주(또는 3주)의 오행 분포를 분석한다.
 * - 천간/지지 오행: 각 1점
 * - 지장간 오행: 각 0.5점
 */
export function analyzeOhHaeng(saju: SaJu): OhHaengDistribution {
  const counts: Record<OhHaeng, number> = {
    '목': 0, '화': 0, '토': 0, '금': 0, '수': 0,
  };

  const jus = [saju.yearJu, saju.monthJu, saju.dayJu];
  if (saju.timeJu) {
    jus.push(saju.timeJu);
  }

  for (const ju of jus) {
    // 천간 오행 +1
    counts[ju.ganJi.ganOhHaeng] += 1;
    // 지지 오행 +1
    counts[ju.ganJi.jiOhHaeng] += 1;

    // 지장간 오행 +0.5 each
    // 지장간 한글 천간에서 오행 가져오기
    for (const hg of ju.hideGan) {
      const oh = ganToOhHaeng(hg);
      if (oh) counts[oh] += 0.5;
    }
  }

  const entries = Object.entries(counts) as [OhHaeng, number][];
  const maxVal = Math.max(...entries.map(([, v]) => v));
  const minVal = Math.min(...entries.map(([, v]) => v));

  const dominant = entries.filter(([, v]) => v === maxVal && v > 0).map(([k]) => k);
  const weak = entries.filter(([, v]) => v === minVal && v > 0 && v < maxVal).map(([k]) => k);
  const missing = entries.filter(([, v]) => v === 0).map(([k]) => k);

  return { counts, dominant, weak, missing };
}

// 한국어 천간 → 오행
function ganToOhHaeng(gan: string): OhHaeng | null {
  const map: Record<string, OhHaeng> = {
    '갑': '목', '을': '목',
    '병': '화', '정': '화',
    '무': '토', '기': '토',
    '경': '금', '신': '금',
    '임': '수', '계': '수',
  };
  return map[gan] ?? null;
}
