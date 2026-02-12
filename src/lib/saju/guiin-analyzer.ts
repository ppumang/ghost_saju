import type { SaJu, JiJi, CheonGan, GuiinResult } from './types';
import { CHEONUL_GUIIN, TAEGEUK_GUIIN, WOLDEOK_GUIIN } from './constants';

/**
 * 귀인 분석: 천을귀인, 태극귀인, 월덕귀인 + 시기별 매핑
 */
export function analyzeGuiin(saju: SaJu): GuiinResult {
  const dayGan: CheonGan = saju.dayJu.ganJi.gan;
  const monthJi: JiJi = saju.monthJu.ganJi.ji;

  // 4기둥 지지
  const pillars: { label: string; period: keyof GuiinResult['byPeriod']; ji: JiJi; gan: CheonGan }[] = [
    { label: '년주', period: 'choNyeon', ji: saju.yearJu.ganJi.ji, gan: saju.yearJu.ganJi.gan },
    { label: '월주', period: 'cheongNyeon', ji: saju.monthJu.ganJi.ji, gan: saju.monthJu.ganJi.gan },
    { label: '일주', period: 'jungNyeon', ji: saju.dayJu.ganJi.ji, gan: saju.dayJu.ganJi.gan },
  ];
  if (saju.timeJu) {
    pillars.push({ label: '시주', period: 'malNyeon', ji: saju.timeJu.ganJi.ji, gan: saju.timeJu.ganJi.gan });
  }

  // 천을귀인: 일간 기준 → 4기둥 지지에서 확인
  const cheonUlTargets = CHEONUL_GUIIN[dayGan];
  const cheonUlPositions: string[] = [];
  for (const p of pillars) {
    if (cheonUlTargets.includes(p.ji)) {
      cheonUlPositions.push(`${p.label}(${p.ji})`);
    }
  }

  // 태극귀인: 일간 기준 → 4기둥 지지에서 확인
  const taeGeukTargets = TAEGEUK_GUIIN[dayGan];
  const taeGeukPositions: string[] = [];
  for (const p of pillars) {
    if (taeGeukTargets.includes(p.ji)) {
      taeGeukPositions.push(`${p.label}(${p.ji})`);
    }
  }

  // 월덕귀인: 월지 기준 → 4기둥 천간에서 확인
  const wolDeokTarget = WOLDEOK_GUIIN[monthJi];
  const wolDeokPositions: string[] = [];
  for (const p of pillars) {
    if (p.gan === wolDeokTarget) {
      wolDeokPositions.push(`${p.label}(${p.gan})`);
    }
  }

  // 시기별 귀인 매핑
  const byPeriod: GuiinResult['byPeriod'] = {
    choNyeon: [],
    cheongNyeon: [],
    jungNyeon: [],
    malNyeon: [],
  };

  for (const p of pillars) {
    const periodGuiins: string[] = [];
    if (cheonUlTargets.includes(p.ji)) periodGuiins.push('천을귀인');
    if (taeGeukTargets.includes(p.ji)) periodGuiins.push('태극귀인');
    if (p.gan === wolDeokTarget) periodGuiins.push('월덕귀인');
    byPeriod[p.period] = periodGuiins;
  }

  return {
    cheonUl: { present: cheonUlPositions.length > 0, positions: cheonUlPositions },
    taeGeuk: { present: taeGeukPositions.length > 0, positions: taeGeukPositions },
    wolDeok: { present: wolDeokPositions.length > 0, positions: wolDeokPositions },
    byPeriod,
  };
}
