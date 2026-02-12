import type { SaJu, SinSal, JiJi } from './types';
import { DOHWA_TABLE, YEOKMA_TABLE, HWAGAE_TABLE } from './constants';

/**
 * 일지 기준으로 도화살/역마살/화개살을 판정한다.
 * 4주(또는 3주)의 지지에서 해당 살이 있는지 검사.
 */
export function analyzeSinSal(saju: SaJu): SinSal {
  const dayJi = saju.dayJu.ganJi.ji;
  const details: string[] = [];

  // 검사할 지지 목록 (년지, 월지, 시지 — 일지 자체는 기준이므로 제외)
  const positions: { label: string; ji: JiJi }[] = [
    { label: '년지', ji: saju.yearJu.ganJi.ji },
    { label: '월지', ji: saju.monthJu.ganJi.ji },
  ];
  if (saju.timeJu) {
    positions.push({ label: '시지', ji: saju.timeJu.ganJi.ji });
  }

  // 도화살
  const dohwaTarget = DOHWA_TABLE[dayJi];
  let hasDohwa = false;
  for (const pos of positions) {
    if (pos.ji === dohwaTarget) {
      hasDohwa = true;
      details.push(`${pos.label} 도화살(${dohwaTarget})`);
    }
  }

  // 역마살
  const yeokmaTarget = YEOKMA_TABLE[dayJi];
  let hasYeokma = false;
  for (const pos of positions) {
    if (pos.ji === yeokmaTarget) {
      hasYeokma = true;
      details.push(`${pos.label} 역마살(${yeokmaTarget})`);
    }
  }

  // 화개살
  const hwagaeTarget = HWAGAE_TABLE[dayJi];
  let hasHwagae = false;
  for (const pos of positions) {
    if (pos.ji === hwagaeTarget) {
      hasHwagae = true;
      details.push(`${pos.label} 화개살(${hwagaeTarget})`);
    }
  }

  return {
    doHwa: hasDohwa,
    yeokMa: hasYeokma,
    hwaGae: hasHwagae,
    details,
  };
}
