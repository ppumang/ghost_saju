import { Solar, Lunar } from 'lunar-javascript';
import type {
  BirthInput, SajuData, SajuDataV2, SaJu, Ju, GanJi,
  CheonGan, JiJi, DaeUnInfo, DaeUnItem, SeUnItem, SpecialPalaces,
} from './types';
import {
  CN_GAN_TO_KR, CN_JI_TO_KR, GAN_TO_OHAENG, JI_TO_OHAENG,
  GAN_TO_EUMYANG, JI_TO_EUMYANG, CN_SIPSHIN_TO_KR, CN_DISHI_TO_KR,
  CN_NAYIN_TO_KR, JI_TO_ZODIAC, DAY_MASTER_DESC,
} from './constants';
import { resolveTime } from './time-resolver';
import { analyzeOhHaeng } from './ohaeng-analyzer';
import { analyzeStrength, determineYongShin } from './strength-analyzer';
import { analyzeExpandedSinSal } from './sinsal-expanded';
import { analyzeGuiin } from './guiin-analyzer';
import { analyzeRelationships } from './relationships';

const ENGINE_VERSION = '2.0.0';

// 중국어 간지 문자열("甲子")을 한국어 GanJi로 변환
function convertGanJi(cnGanJi: string): GanJi {
  const cnGan = cnGanJi[0];
  const cnJi = cnGanJi[1];
  const gan = CN_GAN_TO_KR[cnGan] || cnGan as CheonGan;
  const ji = CN_JI_TO_KR[cnJi] || cnJi as JiJi;

  return {
    gan,
    ji,
    ganOhHaeng: GAN_TO_OHAENG[gan],
    jiOhHaeng: JI_TO_OHAENG[ji],
    ganEumYang: GAN_TO_EUMYANG[gan],
    jiEumYang: JI_TO_EUMYANG[ji],
    raw: `${gan}${ji}`,
  };
}

// 중국어 십신을 한국어로 변환
function convertSipShin(cn: string): string {
  return CN_SIPSHIN_TO_KR[cn] || cn;
}

// 중국어 십이운성을 한국어로 변환
function convertDiShi(cn: string): string {
  return CN_DISHI_TO_KR[cn] || cn;
}

// 중국어 납음을 한국어로 변환
function convertNaYin(cn: string): string {
  return CN_NAYIN_TO_KR[cn] || cn;
}

// 중국어 천간(지장간)을 한국어로 변환
function convertHideGan(cnGan: string): string {
  return CN_GAN_TO_KR[cnGan] || cnGan;
}

/**
 * 음력 날짜 생성 — 윤달이 존재하지 않으면 일반 달로 fallback.
 */
function createLunarSafe(
  year: number, month: number, day: number,
  hour: number, minute: number, isLeapMonth: boolean,
): InstanceType<typeof Lunar> {
  if (isLeapMonth) {
    try {
      return Lunar.fromYmdHms(year, -month, day, hour, minute, 0);
    } catch {
      // 해당 연도에 윤달이 없으면 일반 달로 fallback
      return Lunar.fromYmdHms(year, month, day, hour, minute, 0);
    }
  }
  return Lunar.fromYmdHms(year, month, day, hour, minute, 0);
}

/**
 * 메인 사주 계산 엔진
 */
export function calculateSaju(input: BirthInput): SajuData {
  const resolved = resolveTime(input.hour);

  // 1. Solar/Lunar 객체 생성
  let lunar: InstanceType<typeof Lunar>;

  if (resolved.isUnknown) {
    // 시간 모름: 12:00으로 기본값 (시주 미사용)
    if (input.calendarType === 'solar') {
      const solar = Solar.fromYmdHms(input.year, input.month, input.day, 12, 0, 0);
      lunar = solar.getLunar();
    } else {
      lunar = createLunarSafe(input.year, input.month, input.day, 12, 0, input.isLeapMonth);
    }
  } else {
    if (input.calendarType === 'solar') {
      const solar = Solar.fromYmdHms(
        input.year, input.month, input.day,
        resolved.hour, resolved.minute, 0
      );
      lunar = solar.getLunar();
    } else {
      lunar = createLunarSafe(input.year, input.month, input.day, resolved.hour, resolved.minute, input.isLeapMonth);
    }
  }

  // 2. EightChar 객체
  const eightChar = lunar.getEightChar();

  // 야자시 처리: sect=2면 야자시(23시) 다음날 간지 사용
  if (resolved.isYajaси) {
    eightChar.setSect(2);
  } else {
    eightChar.setSect(1);
  }

  // 3. 4주 간지 추출
  const yearGanJi = convertGanJi(eightChar.getYear());
  const monthGanJi = convertGanJi(eightChar.getMonth());
  const dayGanJi = convertGanJi(eightChar.getDay());

  // 4. 각 주의 십신 (일간 기준)
  const yearSipShinGan = convertSipShin(eightChar.getYearShiShenGan());
  const yearSipShinJi = (eightChar.getYearShiShenZhi() as string[]).map(convertSipShin);
  const monthSipShinGan = convertSipShin(eightChar.getMonthShiShenGan());
  const monthSipShinJi = (eightChar.getMonthShiShenZhi() as string[]).map(convertSipShin);
  const daySipShinGan = convertSipShin(eightChar.getDayShiShenGan());
  const daySipShinJi = (eightChar.getDayShiShenZhi() as string[]).map(convertSipShin);

  // 5. 지장간
  const yearHideGan = (eightChar.getYearHideGan() as string[]).map(convertHideGan);
  const monthHideGan = (eightChar.getMonthHideGan() as string[]).map(convertHideGan);
  const dayHideGan = (eightChar.getDayHideGan() as string[]).map(convertHideGan);

  // 6. 십이운성
  const yearDiShi = convertDiShi(eightChar.getYearDiShi());
  const monthDiShi = convertDiShi(eightChar.getMonthDiShi());
  const dayDiShi = convertDiShi(eightChar.getDayDiShi());

  // 7. 납음
  const yearNaYin = convertNaYin(eightChar.getYearNaYin());
  const monthNaYin = convertNaYin(eightChar.getMonthNaYin());
  const dayNaYin = convertNaYin(eightChar.getDayNaYin());

  // 년주
  const yearJu: Ju = {
    ganJi: yearGanJi,
    sipShinGan: yearSipShinGan,
    sipShinJi: yearSipShinJi,
    hideGan: yearHideGan,
    diShi: yearDiShi,
    naYin: yearNaYin,
  };

  // 월주
  const monthJu: Ju = {
    ganJi: monthGanJi,
    sipShinGan: monthSipShinGan,
    sipShinJi: monthSipShinJi,
    hideGan: monthHideGan,
    diShi: monthDiShi,
    naYin: monthNaYin,
  };

  // 일주
  const dayJu: Ju = {
    ganJi: dayGanJi,
    sipShinGan: daySipShinGan,
    sipShinJi: daySipShinJi,
    hideGan: dayHideGan,
    diShi: dayDiShi,
    naYin: dayNaYin,
  };

  // 시주 (모름이면 null)
  let timeJu: Ju | null = null;
  if (!resolved.isUnknown) {
    const timeGanJi = convertGanJi(eightChar.getTime());
    const timeSipShinGan = convertSipShin(eightChar.getTimeShiShenGan());
    const timeSipShinJi = (eightChar.getTimeShiShenZhi() as string[]).map(convertSipShin);
    const timeHideGan = (eightChar.getTimeHideGan() as string[]).map(convertHideGan);
    const timeDiShi = convertDiShi(eightChar.getTimeDiShi());
    const timeNaYin = convertNaYin(eightChar.getTimeNaYin());

    timeJu = {
      ganJi: timeGanJi,
      sipShinGan: timeSipShinGan,
      sipShinJi: timeSipShinJi,
      hideGan: timeHideGan,
      diShi: timeDiShi,
      naYin: timeNaYin,
    };
  }

  const saju: SaJu = { yearJu, monthJu, dayJu, timeJu };

  // 8. 오행 분석
  const ohHaeng = analyzeOhHaeng(saju);

  // 9. 신살 분석 (확장 신살에서 레거시 필드 파생)
  const expandedSinSalResult = analyzeExpandedSinSal(saju);
  const sinSal = {
    doHwa: expandedSinSalResult.doHwa,
    yeokMa: expandedSinSalResult.yeokMa,
    hwaGae: expandedSinSalResult.hwaGae,
    details: expandedSinSalResult.details,
  };

  // 10. 대운 계산
  const genderCode = input.gender === 'male' ? 1 : 0;
  const yun = eightChar.getYun(genderCode, 2);
  const daYunList = yun.getDaYun(10);

  const daeUnItems: DaeUnItem[] = [];
  const seUnItems: SeUnItem[] = [];

  for (let i = 1; i < daYunList.length; i++) {
    const dy = daYunList[i];
    const ganJiStr = dy.getGanZhi();
    const krGanJi = ganJiStr ? convertGanJiStr(ganJiStr) : '';

    daeUnItems.push({
      startAge: dy.getStartAge(),
      endAge: dy.getEndAge(),
      ganJi: krGanJi,
      startYear: dy.getStartYear(),
      endYear: dy.getEndYear(),
    });

    // 각 대운의 세운(유년)
    const liuNianList = dy.getLiuNian();
    for (const ln of liuNianList) {
      const lnGanJi = ln.getGanZhi();
      seUnItems.push({
        year: ln.getYear(),
        age: ln.getAge(),
        ganJi: lnGanJi ? convertGanJiStr(lnGanJi) : '',
      });
    }
  }

  const daeUn: DaeUnInfo = {
    startAge: yun.getStartYear(),
    isForward: yun.isForward(),
    items: daeUnItems,
  };

  // 11. 특수 궁위
  const specialPalaces: SpecialPalaces = {
    taeWon: convertGanJiStr(eightChar.getTaiYuan()),
    taeWonNaYin: convertNaYin(eightChar.getTaiYuanNaYin()),
    mingGong: convertGanJiStr(eightChar.getMingGong()),
    mingGongNaYin: convertNaYin(eightChar.getMingGongNaYin()),
    shenGong: convertGanJiStr(eightChar.getShenGong()),
    shenGongNaYin: convertNaYin(eightChar.getShenGongNaYin()),
  };

  // 12. 띠 (년지 기준)
  const zodiac = JI_TO_ZODIAC[yearGanJi.ji] || '';

  // 13. 일간 정보
  const dayMaster = {
    gan: dayGanJi.gan,
    ohHaeng: dayGanJi.ganOhHaeng,
    eumYang: dayGanJi.ganEumYang,
    description: DAY_MASTER_DESC[dayGanJi.gan],
  };

  // 14. 음력 날짜 정보
  const lunarDate = {
    year: lunar.getYear(),
    month: Math.abs(lunar.getMonth()),
    day: lunar.getDay(),
    isLeapMonth: lunar.getMonth() < 0,
    lunarDateStr: `음력 ${lunar.getYear()}년 ${lunar.getMonth() < 0 ? '윤' : ''}${Math.abs(lunar.getMonth())}월 ${lunar.getDay()}일`,
  };

  // 15. 강약 판정
  const strength = analyzeStrength(saju);

  // 16. 용신/희신/기신
  const yongShin = determineYongShin(dayGanJi.ganOhHaeng, strength.strength);

  // 17. 확장 신살 (8종 + 기둥별) — step 9에서 이미 계산
  const expandedSinSal = expandedSinSalResult;

  // 18. 귀인 분석 (3종 + 시기별)
  const guiin = analyzeGuiin(saju);

  // 19. 합/충/원진 관계
  const relationships = analyzeRelationships(saju);

  return {
    input,
    lunarDate,
    saju,
    dayMaster,
    ohHaeng,
    sinSal,
    daeUn,
    seUn: seUnItems,
    specialPalaces,
    zodiac,
    engineVersion: ENGINE_VERSION,
    // v2 확장 필드
    strength,
    yongShin,
    expandedSinSal,
    guiin,
    relationships,
  } as SajuDataV2;
}

// 간지 문자열 변환 헬퍼 (2글자 중국어 → 한국어)
function convertGanJiStr(cnGanJi: string): string {
  if (!cnGanJi || cnGanJi.length < 2) return cnGanJi;
  const gan = CN_GAN_TO_KR[cnGanJi[0]] || cnGanJi[0];
  const ji = CN_JI_TO_KR[cnGanJi[1]] || cnGanJi[1];
  return `${gan}${ji}`;
}
