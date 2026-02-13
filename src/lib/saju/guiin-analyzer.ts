import type { SaJu, JiJi, CheonGan, GuiinResult } from './types';
import {
  CHEONUL_GUIIN, TAEGEUK_GUIIN, WOLDEOK_GUIIN,
  CHEONDEOK_GUIIN, MUNCHANG_GUIIN, HAKDANG_GUIIN,
  CHEONGWAN_GUIIN, GEUMYEO_GUIIN,
} from './constants';

/**
 * 귀인 분석: 기존 3종 + 추가 5종 = 8종 + 시기별 매핑
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

  // === 기존 3종 ===

  // 천을귀인: 일간 기준 → 4기둥 지지
  const cheonUlTargets = CHEONUL_GUIIN[dayGan];
  const cheonUlPositions: string[] = [];
  for (const p of pillars) {
    if (cheonUlTargets.includes(p.ji)) {
      cheonUlPositions.push(`${p.label}(${p.ji})`);
    }
  }

  // 태극귀인: 일간 기준 → 4기둥 지지
  const taeGeukTargets = TAEGEUK_GUIIN[dayGan];
  const taeGeukPositions: string[] = [];
  for (const p of pillars) {
    if (taeGeukTargets.includes(p.ji)) {
      taeGeukPositions.push(`${p.label}(${p.ji})`);
    }
  }

  // 월덕귀인: 월지 기준 → 4기둥 천간
  const wolDeokTarget = WOLDEOK_GUIIN[monthJi];
  const wolDeokPositions: string[] = [];
  for (const p of pillars) {
    if (p.gan === wolDeokTarget) {
      wolDeokPositions.push(`${p.label}(${p.gan})`);
    }
  }

  // === 추가 5종 (v3) ===

  // 천덕귀인: 월지 기준 → 4기둥 천간
  const cheonDeokTarget = CHEONDEOK_GUIIN[monthJi];
  const cheonDeokPositions: string[] = [];
  for (const p of pillars) {
    if (p.gan === cheonDeokTarget) {
      cheonDeokPositions.push(`${p.label}(${p.gan})`);
    }
  }

  // 문창귀인: 일간 기준 → 4기둥 지지
  const munChangTarget = MUNCHANG_GUIIN[dayGan];
  const munChangPositions: string[] = [];
  for (const p of pillars) {
    if (p.ji === munChangTarget) {
      munChangPositions.push(`${p.label}(${p.ji})`);
    }
  }

  // 학당귀인: 일간 기준 → 4기둥 지지
  const hakDangTarget = HAKDANG_GUIIN[dayGan];
  const hakDangPositions: string[] = [];
  for (const p of pillars) {
    if (p.ji === hakDangTarget) {
      hakDangPositions.push(`${p.label}(${p.ji})`);
    }
  }

  // 천관귀인: 일간 기준 → 4기둥 지지
  const cheongWanTarget = CHEONGWAN_GUIIN[dayGan];
  const cheongWanPositions: string[] = [];
  for (const p of pillars) {
    if (p.ji === cheongWanTarget) {
      cheongWanPositions.push(`${p.label}(${p.ji})`);
    }
  }

  // 금여귀인: 일간 기준 → 4기둥 지지
  const geumYeoTarget = GEUMYEO_GUIIN[dayGan];
  const geumYeoPositions: string[] = [];
  for (const p of pillars) {
    if (p.ji === geumYeoTarget) {
      geumYeoPositions.push(`${p.label}(${p.ji})`);
    }
  }

  // === 시기별 귀인 매핑 ===
  const byPeriod: GuiinResult['byPeriod'] = {
    choNyeon: [],
    cheongNyeon: [],
    jungNyeon: [],
    malNyeon: [],
  };

  for (const p of pillars) {
    const periodGuiins: string[] = [];
    // 기존 3종
    if (cheonUlTargets.includes(p.ji)) periodGuiins.push('천을귀인');
    if (taeGeukTargets.includes(p.ji)) periodGuiins.push('태극귀인');
    if (p.gan === wolDeokTarget) periodGuiins.push('월덕귀인');
    // 추가 5종
    if (p.gan === cheonDeokTarget) periodGuiins.push('천덕귀인');
    if (p.ji === munChangTarget) periodGuiins.push('문창귀인');
    if (p.ji === hakDangTarget) periodGuiins.push('학당귀인');
    if (p.ji === cheongWanTarget) periodGuiins.push('천관귀인');
    if (p.ji === geumYeoTarget) periodGuiins.push('금여귀인');
    byPeriod[p.period] = periodGuiins;
  }

  return {
    cheonUl: { present: cheonUlPositions.length > 0, positions: cheonUlPositions },
    taeGeuk: { present: taeGeukPositions.length > 0, positions: taeGeukPositions },
    wolDeok: { present: wolDeokPositions.length > 0, positions: wolDeokPositions },
    cheonDeok: { present: cheonDeokPositions.length > 0, positions: cheonDeokPositions },
    munChang: { present: munChangPositions.length > 0, positions: munChangPositions },
    hakDang: { present: hakDangPositions.length > 0, positions: hakDangPositions },
    cheongWan: { present: cheongWanPositions.length > 0, positions: cheongWanPositions },
    geumYeo: { present: geumYeoPositions.length > 0, positions: geumYeoPositions },
    byPeriod,
  };
}
