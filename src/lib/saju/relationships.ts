import type { SaJu, JiJi, CheonGan, RelationshipResult, RelationshipItem } from './types';
import {
  CHUNG_PAIRS, WONJIN_PAIRS, CHUNGAN_HAP,
  SAMHAP_GROUPS, YUKHAP_PAIRS, BANGHAP_GROUPS,
  HYEONG_MUEUN, HYEONG_JISE, HYEONG_MURYE, HYEONG_JA,
  PA_PAIRS,
} from './constants';

interface PillarInfo {
  label: string;
  gan: CheonGan;
  ji: JiJi;
}

/**
 * 4기둥 간 합/충/원진/삼합/육합/방합/형/파 관계를 분석한다.
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
  const samhapList: RelationshipItem[] = [];
  const yukhapList: RelationshipItem[] = [];
  const banghapList: RelationshipItem[] = [];
  const hyeongList: RelationshipItem[] = [];
  const paList: RelationshipItem[] = [];

  const jiList = pillars.map(p => p.ji);

  // === 쌍(pair) 기반 검사 ===
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const a = pillars[i];
      const b = pillars[j];

      // 천간합
      for (const [g1, g2, resultOh] of CHUNGAN_HAP) {
        if ((a.gan === g1 && b.gan === g2) || (a.gan === g2 && b.gan === g1)) {
          hapList.push({
            type: '천간합',
            elements: `${a.gan}${b.gan}`,
            description: `${a.label}-${b.label} 천간합(${a.gan}${b.gan}합${resultOh})`,
          });
        }
      }

      // 지지 충
      for (const [j1, j2] of CHUNG_PAIRS) {
        if ((a.ji === j1 && b.ji === j2) || (a.ji === j2 && b.ji === j1)) {
          chungList.push({
            type: '충',
            elements: `${a.ji}${b.ji}`,
            description: `${a.label}-${b.label} 충(${a.ji}↔${b.ji})`,
          });
        }
      }

      // 지지 원진
      for (const [j1, j2] of WONJIN_PAIRS) {
        if ((a.ji === j1 && b.ji === j2) || (a.ji === j2 && b.ji === j1)) {
          wonjinList.push({
            type: '원진',
            elements: `${a.ji}${b.ji}`,
            description: `${a.label}-${b.label} 원진(${a.ji}↔${b.ji})`,
          });
        }
      }

      // 육합
      for (const [j1, j2, resultOh] of YUKHAP_PAIRS) {
        if ((a.ji === j1 && b.ji === j2) || (a.ji === j2 && b.ji === j1)) {
          yukhapList.push({
            type: '육합',
            elements: `${a.ji}${b.ji}`,
            description: `${a.label}-${b.label} 육합(${a.ji}${b.ji}합${resultOh})`,
          });
        }
      }

      // 형 — 무은지형
      for (const [j1, j2] of HYEONG_MUEUN) {
        if (a.ji === j1 && b.ji === j2) {
          hyeongList.push({
            type: '형',
            elements: `${a.ji}${b.ji}`,
            description: `${a.label}-${b.label} 무은지형(${a.ji}→${b.ji})`,
          });
        } else if (a.ji === j2 && b.ji === j1) {
          hyeongList.push({
            type: '형',
            elements: `${b.ji}${a.ji}`,
            description: `${b.label}-${a.label} 무은지형(${b.ji}→${a.ji})`,
          });
        }
      }

      // 형 — 지세지형
      for (const [j1, j2] of HYEONG_JISE) {
        if (a.ji === j1 && b.ji === j2) {
          hyeongList.push({
            type: '형',
            elements: `${a.ji}${b.ji}`,
            description: `${a.label}-${b.label} 지세지형(${a.ji}→${b.ji})`,
          });
        } else if (a.ji === j2 && b.ji === j1) {
          hyeongList.push({
            type: '형',
            elements: `${b.ji}${a.ji}`,
            description: `${b.label}-${a.label} 지세지형(${b.ji}→${a.ji})`,
          });
        }
      }

      // 형 — 무례지형
      for (const [j1, j2] of HYEONG_MURYE) {
        if (a.ji === j1 && b.ji === j2) {
          hyeongList.push({
            type: '형',
            elements: `${a.ji}${b.ji}`,
            description: `${a.label}-${b.label} 무례지형(${a.ji}↔${b.ji})`,
          });
        }
      }

      // 파
      for (const [j1, j2] of PA_PAIRS) {
        if ((a.ji === j1 && b.ji === j2) || (a.ji === j2 && b.ji === j1)) {
          paList.push({
            type: '파',
            elements: `${a.ji}${b.ji}`,
            description: `${a.label}-${b.label} 파(${a.ji}↔${b.ji})`,
          });
        }
      }
    }
  }

  // === 자형 (自刑): 같은 지지가 2개 이상 ===
  for (const targetJi of HYEONG_JA) {
    const matching = pillars.filter(p => p.ji === targetJi);
    if (matching.length >= 2) {
      hyeongList.push({
        type: '형',
        elements: `${targetJi}${targetJi}`,
        description: `${matching.map(m => m.label).join('-')} 자형(${targetJi}↔${targetJi})`,
      });
    }
  }

  // === 삼합 / 반삼합 검사 (3개 조합) ===
  for (const [j1, j2, j3, resultOh] of SAMHAP_GROUPS) {
    const group = [j1, j2, j3];
    const matches = group.filter(g => jiList.includes(g));

    if (matches.length === 3) {
      // 완전 삼합
      const labels = matches.map(m => {
        const p = pillars.find(p => p.ji === m);
        return p ? `${p.label}(${m})` : m;
      });
      samhapList.push({
        type: '삼합',
        elements: matches.join(''),
        description: `${labels.join('-')} 삼합${resultOh}`,
      });
    } else if (matches.length === 2) {
      // 반삼합: 2개만 있을 때
      const labels = matches.map(m => {
        const p = pillars.find(p => p.ji === m);
        return p ? `${p.label}(${m})` : m;
      });
      samhapList.push({
        type: '반삼합',
        elements: matches.join(''),
        description: `${labels.join('-')} 반삼합${resultOh}(${group.find(g => !matches.includes(g))} 부재)`,
      });
    }
  }

  // === 방합 검사 (3개 모두 필요) ===
  for (const [j1, j2, j3, resultOh] of BANGHAP_GROUPS) {
    const group = [j1, j2, j3];
    const matches = group.filter(g => jiList.includes(g));

    if (matches.length === 3) {
      const labels = matches.map(m => {
        const p = pillars.find(p => p.ji === m);
        return p ? `${p.label}(${m})` : m;
      });
      banghapList.push({
        type: '방합',
        elements: matches.join(''),
        description: `${labels.join('-')} 방합${resultOh}`,
      });
    }
  }

  return {
    hapList, chungList, wonjinList,
    samhapList, yukhapList, banghapList,
    hyeongList, paList,
  };
}
