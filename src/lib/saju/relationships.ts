import type { SaJu, JiJi, CheonGan, RelationshipResult, RelationshipItem } from './types';
import { CHUNG_PAIRS, WONJIN_PAIRS, CHUNGAN_HAP } from './constants';

interface PillarInfo {
  label: string;
  gan: CheonGan;
  ji: JiJi;
}

/**
 * 4기둥 간 합/충/원진 관계를 분석한다.
 */
export function analyzeRelationships(saju: SaJu): RelationshipResult {
  const pillars: PillarInfo[] = [
    { label: '년주', gan: saju.yearJu.ganJi.gan, ji: saju.yearJu.ganJi.ji },
    { label: '월주', gan: saju.monthJu.ganJi.gan, ji: saju.monthJu.ganJi.ji },
    { label: '일주', gan: saju.dayJu.ganJi.gan, ji: saju.dayJu.ganJi.ji },
  ];
  if (saju.timeJu) {
    pillars.push({ label: '시주', gan: saju.timeJu.ganJi.gan, ji: saju.timeJu.ganJi.ji });
  }

  const hapList: RelationshipItem[] = [];
  const chungList: RelationshipItem[] = [];
  const wonjinList: RelationshipItem[] = [];

  // 인접 기둥 쌍 검사
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const a = pillars[i];
      const b = pillars[j];

      // 천간합 검사
      for (const [g1, g2, resultOh] of CHUNGAN_HAP) {
        if ((a.gan === g1 && b.gan === g2) || (a.gan === g2 && b.gan === g1)) {
          hapList.push({
            type: '천간합',
            elements: `${a.gan}${b.gan}`,
            description: `${a.label}-${b.label} 천간합(${a.gan}${b.gan}합${resultOh})`,
          });
        }
      }

      // 지지 충 검사
      for (const [j1, j2] of CHUNG_PAIRS) {
        if ((a.ji === j1 && b.ji === j2) || (a.ji === j2 && b.ji === j1)) {
          chungList.push({
            type: '충',
            elements: `${a.ji}${b.ji}`,
            description: `${a.label}-${b.label} 충(${a.ji}↔${b.ji})`,
          });
        }
      }

      // 지지 원진 검사
      for (const [j1, j2] of WONJIN_PAIRS) {
        if ((a.ji === j1 && b.ji === j2) || (a.ji === j2 && b.ji === j1)) {
          wonjinList.push({
            type: '원진',
            elements: `${a.ji}${b.ji}`,
            description: `${a.label}-${b.label} 원진(${a.ji}↔${b.ji})`,
          });
        }
      }
    }
  }

  return { hapList, chungList, wonjinList };
}
