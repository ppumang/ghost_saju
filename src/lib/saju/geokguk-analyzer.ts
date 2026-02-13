import type { SaJu, GeokGukResult, GeokGukType, OhHaeng } from './types';
import { GAN_TO_OHAENG, GAN_TO_EUMYANG, SIPSHIN_CATEGORY } from './constants';

/**
 * 월지 지장간 중기 테이블
 * 월지의 지장간은 초기/중기/정기로 나뉘는데, 격국 판정은 정기(본기)를 기본으로 사용.
 * 여기서는 월지 정기(본기) 천간을 사용.
 *
 * 지장간 정기:
 * 자→계, 축→기, 인→갑, 묘→을, 진→무, 사→병,
 * 오→정, 미→기, 신→경, 유→신, 술→무, 해→임
 */
const MONTH_JI_JEONGI: Record<string, string> = {
  '자': '계', '축': '기', '인': '갑', '묘': '을', '진': '무', '사': '병',
  '오': '정', '미': '기', '신': '경', '유': '신', '술': '무', '해': '임',
};

/**
 * 십신 → 격국 이름 매핑
 */
const SIPSHIN_TO_GEOKGUK: Record<string, GeokGukType> = {
  '식신': '식신격',
  '상관': '상관격',
  '편재': '편재격',
  '정재': '정재격',
  '편관': '편관격',
  '정관': '정관격',
  '편인': '편인격',
  '정인': '정인격',
};

/**
 * 일간과 특정 천간의 십신 관계를 구한다.
 * (engine.ts의 lunar-javascript이 이미 계산하지만, 여기서는 독립적으로 판정)
 */
function getSipShin(dayGanOh: OhHaeng, dayEumYang: string, targetGanOh: OhHaeng, targetEumYang: string): string {
  const same = dayGanOh === targetGanOh;
  const samePolarity = dayEumYang === targetEumYang;

  if (same) return samePolarity ? '비견' : '겁재';

  // 상생 관계 판정
  const producing: Record<string, string> = { '목': '화', '화': '토', '토': '금', '금': '수', '수': '목' };
  const producedBy: Record<string, string> = { '목': '수', '화': '목', '토': '화', '금': '토', '수': '금' };
  const controlling: Record<string, string> = { '목': '토', '화': '금', '토': '수', '금': '목', '수': '화' };
  const controlledBy: Record<string, string> = { '목': '금', '화': '수', '토': '목', '금': '화', '수': '토' };

  if (producing[dayGanOh] === targetGanOh) return samePolarity ? '식신' : '상관';
  if (producedBy[dayGanOh] === targetGanOh) return samePolarity ? '편인' : '정인';
  if (controlling[dayGanOh] === targetGanOh) return samePolarity ? '편재' : '정재';
  if (controlledBy[dayGanOh] === targetGanOh) return samePolarity ? '편관' : '정관';

  return '비견'; // fallback
}

/**
 * 일간 통근(通根) 검사: 4기둥 지장간에 일간과 같은 오행이 있는지 확인.
 * 종격(약종) 판정의 필수 조건 — 통근이 있으면 종격 불가.
 */
function hasDayMasterRoot(saju: SaJu): boolean {
  const dayOhHaeng = GAN_TO_OHAENG[saju.dayJu.ganJi.gan];

  const jus = [saju.yearJu, saju.monthJu, saju.dayJu];
  if (saju.timeJu) jus.push(saju.timeJu);

  for (const ju of jus) {
    for (const hg of ju.hideGan) {
      const hgOhHaeng = GAN_TO_OHAENG[hg as keyof typeof GAN_TO_OHAENG];
      if (hgOhHaeng === dayOhHaeng) return true;
    }
  }
  return false;
}

/**
 * 격국 판정 알고리즘 (정통 순서)
 *
 * 1차: 월지 정기의 십신 → 내격 8격 / 건록격 / 양인격 (기본)
 * 2차: 극단적 편중 + 일간 무근 시에만 종격이 내격을 override
 */
export function analyzeGeokGuk(saju: SaJu): GeokGukResult {
  const dayGan = saju.dayJu.ganJi.gan;
  const dayOhHaeng = GAN_TO_OHAENG[dayGan];
  const dayEumYang = GAN_TO_EUMYANG[dayGan];
  const monthJi = saju.monthJu.ganJi.ji;

  // 월지 정기 천간
  const monthJeongiGan = MONTH_JI_JEONGI[monthJi];
  const monthJeongiOh = GAN_TO_OHAENG[monthJeongiGan as keyof typeof GAN_TO_OHAENG];
  const monthJeongiEumYang = GAN_TO_EUMYANG[monthJeongiGan as keyof typeof GAN_TO_EUMYANG];

  // 월지 정기의 십신 (일간 기준)
  const monthJiSipShin = getSipShin(dayOhHaeng, dayEumYang, monthJeongiOh, monthJeongiEumYang);

  // ── 1차: 내격/특수격 판정 (기본) ──
  let normalResult: GeokGukResult;

  if (monthJiSipShin === '비견') {
    normalResult = {
      geokGuk: '건록격',
      category: '특수격',
      monthJiJangGan: monthJeongiGan,
      monthJiSipShin,
      description: `월지 정기(${monthJeongiGan})가 비견 → 건록격. 자수성가의 격.`,
    };
  } else if (monthJiSipShin === '겁재') {
    normalResult = {
      geokGuk: '양인격',
      category: '특수격',
      monthJiJangGan: monthJeongiGan,
      monthJiSipShin,
      description: `월지 정기(${monthJeongiGan})가 겁재 → 양인격. 강인하지만 극단적인 격.`,
    };
  } else {
    const geokGuk = SIPSHIN_TO_GEOKGUK[monthJiSipShin];
    if (geokGuk) {
      normalResult = {
        geokGuk,
        category: '내격',
        monthJiJangGan: monthJeongiGan,
        monthJiSipShin,
        description: `월지 정기(${monthJeongiGan})의 십신이 ${monthJiSipShin} → ${geokGuk}.`,
      };
    } else {
      normalResult = {
        geokGuk: '판정불가',
        category: '기타',
        monthJiJangGan: monthJeongiGan,
        monthJiSipShin,
        description: '격국 판정 불가.',
      };
    }
  }

  // ── 2차: 종격 판정 (극단적 편중 + 무근 조건 시 내격 override) ──
  const jongGeokResult = checkJongGeok(saju);
  if (jongGeokResult) {
    return {
      geokGuk: jongGeokResult.geokGuk,
      category: '종격',
      monthJiJangGan: monthJeongiGan,
      monthJiSipShin,
      description: jongGeokResult.description,
    };
  }

  return normalResult;
}

/**
 * 종격 판정: 사주 전체의 십신 분포 편중도 + 일간 무근(통근 없음) 검증.
 *
 * - 종강격: 비겁+인성 80%+ & 재성 0 & 관성 0 (일간이 강하므로 무근 불필요)
 * - 종아격: 식상 60%+ & 인성 0 & 일간 무근
 * - 종재격: 재성 60%+ & 비겁 0 & 일간 무근
 * - 종관격: 관성 60%+ & 식상 0 & 일간 무근
 * - 종세격: 식상+재성+관성 80%+ & 비겁 0 & 일간 무근
 */
function checkJongGeok(saju: SaJu): { geokGuk: GeokGukType; description: string } | null {
  let helpCount = 0;
  let drainCount = 0;
  let bigyeop = 0;
  let insung = 0;
  let siksang = 0;
  let jaesung = 0;
  let gwansung = 0;

  const jus = [saju.yearJu, saju.monthJu, saju.dayJu];
  if (saju.timeJu) jus.push(saju.timeJu);

  for (const ju of jus) {
    const allSs = [ju.sipShinGan, ...ju.sipShinJi];
    for (const ss of allSs) {
      if (!ss || ss === '일주') continue;
      const cat = SIPSHIN_CATEGORY[ss];
      if (cat === 'help') helpCount++;
      if (cat === 'drain') drainCount++;

      if (ss === '비견' || ss === '겁재') bigyeop++;
      else if (ss === '편인' || ss === '정인') insung++;
      else if (ss === '식신' || ss === '상관') siksang++;
      else if (ss === '편재' || ss === '정재') jaesung++;
      else if (ss === '편관' || ss === '정관') gwansung++;
    }
  }

  const total = helpCount + drainCount;
  if (total === 0) return null;

  const helpRatio = helpCount / total;
  const siksangRatio = siksang / total;
  const jaesungRatio = jaesung / total;
  const gwansungRatio = gwansung / total;
  const drainRatio = drainCount / total;

  // 종강격: 비겁+인성 80%+ & 재성 0 & 관성 0
  // (일간이 극강하여 종하는 격이므로 무근 체크 불필요)
  if (helpRatio >= 0.8 && jaesung === 0 && gwansung === 0) {
    return { geokGuk: '종강격', description: '비겁/인성이 압도적. 자기 오행에 종(從)하는 격.' };
  }

  // 이하 약종격(종아/종재/종관/종세)은 일간 무근이 필수 조건
  // 일간이 지장간에 통근(같은 오행)이 있으면 종격 불가
  const hasRoot = hasDayMasterRoot(saju);
  if (hasRoot) return null;

  // 종아격: 식상 60%+ & 인성 0 & 일간 무근
  if (siksangRatio >= 0.6 && insung === 0) {
    return { geokGuk: '종아격', description: '식상이 압도적이고 일간 무근. 표현/재능에 종하는 격.' };
  }

  // 종재격: 재성 60%+ & 비겁 0 & 일간 무근
  if (jaesungRatio >= 0.6 && bigyeop === 0) {
    return { geokGuk: '종재격', description: '재성이 압도적이고 일간 무근. 재물에 종하는 격.' };
  }

  // 종관격: 관성 60%+ & 식상 0 & 일간 무근
  if (gwansungRatio >= 0.6 && siksang === 0) {
    return { geokGuk: '종관격', description: '관성이 압도적이고 일간 무근. 권위/규율에 종하는 격.' };
  }

  // 종세격: 식상+재성+관성 80%+ & 비겁 0 & 일간 무근
  if (drainRatio >= 0.8 && bigyeop === 0) {
    return { geokGuk: '종세격', description: '설기 세력이 압도적이고 일간 무근. 시세에 따르는 격.' };
  }

  return null;
}
