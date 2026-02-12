import type { SaJu, JiJi, ExpandedSinSal } from './types';
import {
  DOHWA_TABLE, YEOKMA_TABLE, HWAGAE_TABLE,
  BANAN_TABLE, YUKHAE_PAIRS, HYEONCHIM_BRANCHES,
  GWIMUNGWAN_TABLE, JISAL_TABLE,
} from './constants';

interface PillarPosition {
  label: string;
  pillarKey: 'year' | 'month' | 'day' | 'time';
  ji: JiJi;
}

/**
 * 확장 신살 분석: 8종 신살 + 기둥별 매핑
 */
export function analyzeExpandedSinSal(saju: SaJu): ExpandedSinSal {
  const dayJi = saju.dayJu.ganJi.ji;
  const yearJi = saju.yearJu.ganJi.ji;
  const details: string[] = [];
  const byPillar: ExpandedSinSal['byPillar'] = {
    year: [], month: [], day: [], time: [],
  };

  // 검사 대상 지지들
  const positions: PillarPosition[] = [
    { label: '년지', pillarKey: 'year', ji: saju.yearJu.ganJi.ji },
    { label: '월지', pillarKey: 'month', ji: saju.monthJu.ganJi.ji },
    { label: '일지', pillarKey: 'day', ji: saju.dayJu.ganJi.ji },
  ];
  if (saju.timeJu) {
    positions.push({ label: '시지', pillarKey: 'time', ji: saju.timeJu.ganJi.ji });
  }

  // 일지 제외한 검사 대상 (도화/역마/화개/반안/귀문관은 일지 기준으로 다른 기둥 검사)
  const nonDayPositions = positions.filter(p => p.pillarKey !== 'day');

  // 1. 도화살
  let hasDohwa = false;
  const dohwaTarget = DOHWA_TABLE[dayJi];
  for (const pos of nonDayPositions) {
    if (pos.ji === dohwaTarget) {
      hasDohwa = true;
      const msg = `${pos.label} 도화살(${dohwaTarget})`;
      details.push(msg);
      byPillar[pos.pillarKey].push('도화살');
    }
  }

  // 2. 역마살
  let hasYeokma = false;
  const yeokmaTarget = YEOKMA_TABLE[dayJi];
  for (const pos of nonDayPositions) {
    if (pos.ji === yeokmaTarget) {
      hasYeokma = true;
      const msg = `${pos.label} 역마살(${yeokmaTarget})`;
      details.push(msg);
      byPillar[pos.pillarKey].push('역마살');
    }
  }

  // 3. 화개살
  let hasHwagae = false;
  const hwagaeTarget = HWAGAE_TABLE[dayJi];
  for (const pos of nonDayPositions) {
    if (pos.ji === hwagaeTarget) {
      hasHwagae = true;
      const msg = `${pos.label} 화개살(${hwagaeTarget})`;
      details.push(msg);
      byPillar[pos.pillarKey].push('화개살');
    }
  }

  // 4. 반안살: 일지 기준
  let hasBanan = false;
  const bananTarget = BANAN_TABLE[dayJi];
  for (const pos of nonDayPositions) {
    if (pos.ji === bananTarget) {
      hasBanan = true;
      const msg = `${pos.label} 반안살(${bananTarget})`;
      details.push(msg);
      byPillar[pos.pillarKey].push('반안살');
    }
  }

  // 5. 육해: 지지 쌍 검사 (4기둥 중 육해 쌍이 있는지)
  let hasYukhae = false;
  const allJi = positions.map(p => ({ ...p }));
  for (let i = 0; i < allJi.length; i++) {
    for (let j = i + 1; j < allJi.length; j++) {
      for (const [a, b] of YUKHAE_PAIRS) {
        if ((allJi[i].ji === a && allJi[j].ji === b) ||
            (allJi[i].ji === b && allJi[j].ji === a)) {
          hasYukhae = true;
          const msg = `${allJi[i].label}-${allJi[j].label} 육해(${allJi[i].ji}↔${allJi[j].ji})`;
          details.push(msg);
          byPillar[allJi[i].pillarKey].push('육해');
          byPillar[allJi[j].pillarKey].push('육해');
        }
      }
    }
  }

  // 6. 현침살: 4기둥 지지 중 자/오/묘/유 존재
  let hasHyeonchim = false;
  for (const pos of positions) {
    if (HYEONCHIM_BRANCHES.includes(pos.ji)) {
      hasHyeonchim = true;
      const msg = `${pos.label} 현침살(${pos.ji})`;
      details.push(msg);
      byPillar[pos.pillarKey].push('현침살');
    }
  }

  // 7. 귀문관살: 일지 기준
  let hasGwimungwan = false;
  const gwimungwanTarget = GWIMUNGWAN_TABLE[dayJi];
  for (const pos of nonDayPositions) {
    if (pos.ji === gwimungwanTarget) {
      hasGwimungwan = true;
      const msg = `${pos.label} 귀문관살(${gwimungwanTarget})`;
      details.push(msg);
      byPillar[pos.pillarKey].push('귀문관살');
    }
  }

  // 8. 지살: 년지 기준
  let hasJisal = false;
  const jisalTarget = JISAL_TABLE[yearJi];
  for (const pos of positions) {
    if (pos.pillarKey !== 'year' && pos.ji === jisalTarget) {
      hasJisal = true;
      const msg = `${pos.label} 지살(${jisalTarget})`;
      details.push(msg);
      byPillar[pos.pillarKey].push('지살');
    }
  }

  return {
    doHwa: hasDohwa,
    yeokMa: hasYeokma,
    hwaGae: hasHwagae,
    banAn: hasBanan,
    yukHae: hasYukhae,
    hyeonChim: hasHyeonchim,
    gwiMunGwan: hasGwimungwan,
    jiSal: hasJisal,
    details,
    byPillar,
  };
}
