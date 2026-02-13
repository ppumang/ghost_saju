import type { SaJu, JiJi, CheonGan, GongMangResult } from './types';

// 천간 순서 인덱스 (0~9)
const GAN_INDEX: Record<CheonGan, number> = {
  '갑': 0, '을': 1, '병': 2, '정': 3, '무': 4,
  '기': 5, '경': 6, '신': 7, '임': 8, '계': 9,
};

// 지지 순서 인덱스 (0~11)
const JI_INDEX: Record<JiJi, number> = {
  '자': 0, '축': 1, '인': 2, '묘': 3, '진': 4, '사': 5,
  '오': 6, '미': 7, '신': 8, '유': 9, '술': 10, '해': 11,
};

// 인덱스 → 지지
const INDEX_TO_JI: JiJi[] = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

/**
 * 공망(空亡) 계산
 *
 * 알고리즘:
 * 60갑자는 6개 순(旬)으로 나뉨. 각 순은 10개 간지.
 * 일주의 간지가 속한 순(旬)을 찾으면, 그 순에 포함되지 않는 2개 지지 = 공망.
 *
 * 공식:
 * 순의 시작 지지 인덱스 = (일지인덱스 - 일간인덱스 + 12) % 12
 * 순에 포함된 지지 = 시작부터 연속 10개
 * 공망 = 나머지 2개
 */
export function analyzeGongMang(saju: SaJu): GongMangResult {
  const dayGan = saju.dayJu.ganJi.gan;
  const dayJi = saju.dayJu.ganJi.ji;

  const ganIdx = GAN_INDEX[dayGan];
  const jiIdx = JI_INDEX[dayJi];

  // 이 순(旬)의 시작 지지 인덱스
  const startJiIdx = ((jiIdx - ganIdx) % 12 + 12) % 12;

  // 순에 포함된 10개 지지 인덱스
  const includedSet = new Set<number>();
  for (let i = 0; i < 10; i++) {
    includedSet.add((startJiIdx + i) % 12);
  }

  // 포함되지 않은 2개 = 공망
  const gongMangIndices: number[] = [];
  for (let i = 0; i < 12; i++) {
    if (!includedSet.has(i)) {
      gongMangIndices.push(i);
    }
  }

  const gongMangJi: [JiJi, JiJi] = [
    INDEX_TO_JI[gongMangIndices[0]],
    INDEX_TO_JI[gongMangIndices[1]],
  ];

  // 4기둥 중 공망에 해당하는 기둥 찾기
  const affectedPillars: string[] = [];
  const details: string[] = [];

  const pillars = [
    { label: '년주', ji: saju.yearJu.ganJi.ji },
    { label: '월주', ji: saju.monthJu.ganJi.ji },
    // 일주는 공망 기준이므로 제외
  ];
  if (saju.timeJu) {
    pillars.push({ label: '시주', ji: saju.timeJu.ganJi.ji });
  }

  for (const p of pillars) {
    if (gongMangJi.includes(p.ji)) {
      affectedPillars.push(p.label);
      details.push(`${p.label}(${p.ji}) 공망`);
    }
  }

  if (details.length === 0) {
    details.push(`공망 지지: ${gongMangJi[0]}, ${gongMangJi[1]} (4기둥에 해당 없음)`);
  }

  return { gongMangJi, affectedPillars, details };
}
