import type { SaJu, OhHaeng, StrengthResult, YongShinResult } from './types';
import {
  GAN_TO_OHAENG,
  SEASONAL_STRENGTH,
  SIPSHIN_CATEGORY,
  PRODUCING,
  CONTROLLING,
  PRODUCED_BY,
  CONTROLLED_BY,
} from './constants';

/**
 * 사주 강약을 분석한다.
 * - 득령: 일간 오행이 월지 계절에서 왕성한지
 * - 비겁/인성 비율로 강약 판정
 */
export function analyzeStrength(saju: SaJu): StrengthResult {
  const dayGan = saju.dayJu.ganJi.gan;
  const dayOhHaeng = GAN_TO_OHAENG[dayGan];
  const monthJi = saju.monthJu.ganJi.ji;

  // 득령 판정: 월지의 왕성 오행이 일간을 생하거나 같은 오행인지
  const seasonOhHaeng = SEASONAL_STRENGTH[monthJi];
  const deukRyeong = seasonOhHaeng === dayOhHaeng || PRODUCING[seasonOhHaeng] === dayOhHaeng;

  // 비겁/인성 비율 계산
  let helpCount = 0;
  let totalCount = 0;

  const jus = [saju.yearJu, saju.monthJu, saju.dayJu];
  if (saju.timeJu) jus.push(saju.timeJu);

  for (const ju of jus) {
    // 천간 십신
    const ganCat = SIPSHIN_CATEGORY[ju.sipShinGan];
    if (ganCat) {
      totalCount++;
      if (ganCat === 'help') helpCount++;
    }

    // 지지 십신 (지장간별)
    for (const ss of ju.sipShinJi) {
      const jiCat = SIPSHIN_CATEGORY[ss];
      if (jiCat) {
        totalCount++;
        if (jiCat === 'help') helpCount++;
      }
    }
  }

  // 득령 보너스: 득령이면 help에 가산점
  const deukRyeongBonus = deukRyeong ? 10 : 0;
  const score = totalCount > 0
    ? Math.min(100, Math.round((helpCount / totalCount) * 100) + deukRyeongBonus)
    : 50;

  let strength: StrengthResult['strength'];
  if (score >= 70) strength = '태강';
  else if (score >= 55) strength = '강';
  else if (score >= 45) strength = '중화';
  else if (score >= 30) strength = '약';
  else strength = '태약';

  return { strength, score, deukRyeong };
}

/**
 * 억부법으로 용신/희신/기신을 결정한다.
 * - 강하면: 설기(식상)/극(관성) 필요 → 용신
 * - 약하면: 생(인성)/비(비겁) 필요 → 용신
 */
export function determineYongShin(
  dayOhHaeng: OhHaeng,
  strength: StrengthResult['strength']
): YongShinResult {
  const isStrong = strength === '태강' || strength === '강';

  let yongShin: OhHaeng;
  let huiShin: OhHaeng;
  let giShin: OhHaeng;

  if (isStrong) {
    // 강하면: 설기(식상) = 일간이 생하는 오행이 용신
    yongShin = PRODUCING[dayOhHaeng];
    // 희신: 용신을 생하는 오행 또는 일간을 극하는 오행(관성)
    huiShin = CONTROLLING[dayOhHaeng]; // 관성
    // 기신: 일간을 돕는 오행 (비겁 = 같은 오행)
    giShin = PRODUCED_BY[dayOhHaeng]; // 인성
  } else {
    // 약하면: 생(인성) = 일간을 생하는 오행이 용신
    yongShin = PRODUCED_BY[dayOhHaeng];
    // 희신: 비겁 (같은 오행)
    huiShin = dayOhHaeng;
    // 기신: 일간을 극하는 오행 (관성)
    giShin = CONTROLLED_BY[dayOhHaeng];
  }

  return { yongShin, huiShin, giShin };
}
