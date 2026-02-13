import type { SaJu, JiJi, CheonGan, ExpandedSinSal, GongMangResult } from './types';
import {
  DOHWA_TABLE, YEOKMA_TABLE, HWAGAE_TABLE,
  BANAN_TABLE, YUKHAE_PAIRS, HYEONCHIM_BRANCHES,
  GWIMUNGWAN_TABLE, JISAL_TABLE,
  YANGIN_TABLE, GOEGANG_ILJU, BAEKHO_TABLE,
  GEOBSAL_TABLE, MANGSHIN_TABLE, JANGSEONG_TABLE,
  HONGYEOM_TABLE,
} from './constants';

interface PillarPosition {
  label: string;
  pillarKey: 'year' | 'month' | 'day' | 'time';
  ji: JiJi;
  gan: CheonGan;
}

/**
 * 확장 신살 분석: 기존 8종 + 추가 8종 = 16종 + 기둥별 매핑
 */
export function analyzeExpandedSinSal(saju: SaJu, gongMang?: GongMangResult): ExpandedSinSal {
  const dayJi = saju.dayJu.ganJi.ji;
  const dayGan = saju.dayJu.ganJi.gan;
  const yearJi = saju.yearJu.ganJi.ji;
  const details: string[] = [];
  const byPillar: ExpandedSinSal['byPillar'] = {
    year: [], month: [], day: [], time: [],
  };

  // 검사 대상 지지들
  const positions: PillarPosition[] = [
    { label: '년지', pillarKey: 'year', ji: saju.yearJu.ganJi.ji, gan: saju.yearJu.ganJi.gan },
    { label: '월지', pillarKey: 'month', ji: saju.monthJu.ganJi.ji, gan: saju.monthJu.ganJi.gan },
    { label: '일지', pillarKey: 'day', ji: saju.dayJu.ganJi.ji, gan: saju.dayJu.ganJi.gan },
  ];
  if (saju.timeJu) {
    positions.push({ label: '시지', pillarKey: 'time', ji: saju.timeJu.ganJi.ji, gan: saju.timeJu.ganJi.gan });
  }

  // 일지 제외한 검사 대상
  const nonDayPositions = positions.filter(p => p.pillarKey !== 'day');

  // === 기존 8종 ===

  // 1. 도화살
  let hasDohwa = false;
  const dohwaTarget = DOHWA_TABLE[dayJi];
  for (const pos of nonDayPositions) {
    if (pos.ji === dohwaTarget) {
      hasDohwa = true;
      details.push(`${pos.label} 도화살(${dohwaTarget})`);
      byPillar[pos.pillarKey].push('도화살');
    }
  }

  // 2. 역마살
  let hasYeokma = false;
  const yeokmaTarget = YEOKMA_TABLE[dayJi];
  for (const pos of nonDayPositions) {
    if (pos.ji === yeokmaTarget) {
      hasYeokma = true;
      details.push(`${pos.label} 역마살(${yeokmaTarget})`);
      byPillar[pos.pillarKey].push('역마살');
    }
  }

  // 3. 화개살
  let hasHwagae = false;
  const hwagaeTarget = HWAGAE_TABLE[dayJi];
  for (const pos of nonDayPositions) {
    if (pos.ji === hwagaeTarget) {
      hasHwagae = true;
      details.push(`${pos.label} 화개살(${hwagaeTarget})`);
      byPillar[pos.pillarKey].push('화개살');
    }
  }

  // 4. 반안살
  let hasBanan = false;
  const bananTarget = BANAN_TABLE[dayJi];
  for (const pos of nonDayPositions) {
    if (pos.ji === bananTarget) {
      hasBanan = true;
      details.push(`${pos.label} 반안살(${bananTarget})`);
      byPillar[pos.pillarKey].push('반안살');
    }
  }

  // 5. 육해
  let hasYukhae = false;
  const allJi = positions.map(p => ({ ...p }));
  for (let i = 0; i < allJi.length; i++) {
    for (let j = i + 1; j < allJi.length; j++) {
      for (const [a, b] of YUKHAE_PAIRS) {
        if ((allJi[i].ji === a && allJi[j].ji === b) ||
            (allJi[i].ji === b && allJi[j].ji === a)) {
          hasYukhae = true;
          details.push(`${allJi[i].label}-${allJi[j].label} 육해(${allJi[i].ji}↔${allJi[j].ji})`);
          byPillar[allJi[i].pillarKey].push('육해');
          byPillar[allJi[j].pillarKey].push('육해');
        }
      }
    }
  }

  // 6. 현침살
  let hasHyeonchim = false;
  for (const pos of positions) {
    if (HYEONCHIM_BRANCHES.includes(pos.ji)) {
      hasHyeonchim = true;
      details.push(`${pos.label} 현침살(${pos.ji})`);
      byPillar[pos.pillarKey].push('현침살');
    }
  }

  // 7. 귀문관살
  let hasGwimungwan = false;
  const gwimungwanTarget = GWIMUNGWAN_TABLE[dayJi];
  for (const pos of nonDayPositions) {
    if (pos.ji === gwimungwanTarget) {
      hasGwimungwan = true;
      details.push(`${pos.label} 귀문관살(${gwimungwanTarget})`);
      byPillar[pos.pillarKey].push('귀문관살');
    }
  }

  // 8. 지살
  let hasJisal = false;
  const jisalTarget = JISAL_TABLE[yearJi];
  for (const pos of positions) {
    if (pos.pillarKey !== 'year' && pos.ji === jisalTarget) {
      hasJisal = true;
      details.push(`${pos.label} 지살(${jisalTarget})`);
      byPillar[pos.pillarKey].push('지살');
    }
  }

  // === 추가 8종 (v3) ===

  // 9. 양인살: 일간(양간) 기준 → 4기둥 지지에서 해당 지지가 있는지
  let hasYangIn = false;
  const yangInTarget = YANGIN_TABLE[dayGan];
  if (yangInTarget) {
    for (const pos of positions) {
      if (pos.ji === yangInTarget) {
        hasYangIn = true;
        details.push(`${pos.label} 양인살(${yangInTarget})`);
        byPillar[pos.pillarKey].push('양인살');
      }
    }
  }

  // 10. 괴강살: 일주(일간+일지) 조합이 특정 4가지에 해당
  const dayGanJiRaw = `${dayGan}${dayJi}`;
  const hasGoeGang = GOEGANG_ILJU.includes(dayGanJiRaw);
  if (hasGoeGang) {
    details.push(`일주 괴강살(${dayGanJiRaw})`);
    byPillar.day.push('괴강살');
  }

  // 11. 백호살: 일지 기준 → 다른 기둥 지지에서 해당 지지
  let hasBaekHo = false;
  const baekhoTarget = BAEKHO_TABLE[dayJi];
  for (const pos of nonDayPositions) {
    if (pos.ji === baekhoTarget) {
      hasBaekHo = true;
      details.push(`${pos.label} 백호살(${baekhoTarget})`);
      byPillar[pos.pillarKey].push('백호살');
    }
  }

  // 12. 겁살: 년지(삼합그룹) 기준 → 다른 기둥 지지
  let hasGeobSal = false;
  const geobsalTarget = GEOBSAL_TABLE[yearJi];
  for (const pos of positions) {
    if (pos.pillarKey !== 'year' && pos.ji === geobsalTarget) {
      hasGeobSal = true;
      details.push(`${pos.label} 겁살(${geobsalTarget})`);
      byPillar[pos.pillarKey].push('겁살');
    }
  }

  // 13. 천라지망: 4기둥 지지 중 진+술 동시(천라) 또는 사+해 동시(지망)
  const jiSet = new Set(positions.map(p => p.ji));
  const hasCheonRa = jiSet.has('진') && jiSet.has('술');
  const hasJiMang = jiSet.has('사') && jiSet.has('해');
  const hasCheonRaJiMang = hasCheonRa || hasJiMang;
  if (hasCheonRa) {
    details.push('천라(진+술 동시 존재)');
    for (const pos of positions) {
      if (pos.ji === '진' || pos.ji === '술') {
        byPillar[pos.pillarKey].push('천라지망');
      }
    }
  }
  if (hasJiMang) {
    details.push('지망(사+해 동시 존재)');
    for (const pos of positions) {
      if (pos.ji === '사' || pos.ji === '해') {
        byPillar[pos.pillarKey].push('천라지망');
      }
    }
  }

  // 14. 망신살: 년지(삼합그룹) 기준
  let hasMangShin = false;
  const mangshinTarget = MANGSHIN_TABLE[yearJi];
  for (const pos of positions) {
    if (pos.pillarKey !== 'year' && pos.ji === mangshinTarget) {
      hasMangShin = true;
      details.push(`${pos.label} 망신살(${mangshinTarget})`);
      byPillar[pos.pillarKey].push('망신살');
    }
  }

  // 15. 장성살: 년지(삼합그룹) 기준
  let hasJangSeong = false;
  const jangseongTarget = JANGSEONG_TABLE[yearJi];
  for (const pos of positions) {
    if (pos.pillarKey !== 'year' && pos.ji === jangseongTarget) {
      hasJangSeong = true;
      details.push(`${pos.label} 장성살(${jangseongTarget})`);
      byPillar[pos.pillarKey].push('장성살');
    }
  }

  // 16. 공망살: 공망 결과와 연동 (외부에서 주입)
  let hasGongMangSal = false;
  if (gongMang && gongMang.affectedPillars.length > 0) {
    hasGongMangSal = true;
    for (const pillarLabel of gongMang.affectedPillars) {
      details.push(`${pillarLabel} 공망살`);
      const key = pillarLabel === '년주' ? 'year' : pillarLabel === '월주' ? 'month' : pillarLabel === '시주' ? 'time' : 'day';
      byPillar[key].push('공망살');
    }
  }

  // 17. 홍염살: 일간 기준 → 4기둥 지지에서 해당 지지가 있는지
  let hasHongYeom = false;
  const hongyeomTarget = HONGYEOM_TABLE[dayGan];
  for (const pos of positions) {
    if (pos.ji === hongyeomTarget) {
      hasHongYeom = true;
      details.push(`${pos.label} 홍염살(${hongyeomTarget})`);
      byPillar[pos.pillarKey].push('홍염살');
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
    // v3 추가
    yangIn: hasYangIn,
    goeGang: hasGoeGang,
    baekHo: hasBaekHo,
    geobSal: hasGeobSal,
    cheonRaJiMang: hasCheonRaJiMang,
    mangShin: hasMangShin,
    jangSeong: hasJangSeong,
    gongMangSal: hasGongMangSal,
    hongYeom: hasHongYeom,
    details,
    byPillar,
  };
}
