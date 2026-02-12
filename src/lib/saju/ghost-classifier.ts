import type { SajuDataV2, GhostTypeId, GhostClassification } from './types';
import { GHOST_TYPES } from './ghost-types';

/**
 * 사주 데이터를 기반으로 귀신 유형을 분류한다.
 * 결정론적 알고리즘: 같은 사주 → 항상 같은 귀신 유형.
 *
 * 워터폴 우선순위:
 * Phase 1: 귀문관살 트리거 → 鬼門
 * Phase 2: 도화살 + 수 과다 → 溺鬼
 * Phase 3: 일간 오행 + 강약 + 십신 분포 → 다양한 유형
 * Phase 4: 복합 폴백 (신살 + 합충)
 * Phase 5: 오행 디폴트
 */
export function classifyGhost(sajuData: SajuDataV2): GhostClassification {
  const counts = countSipShinCategories(sajuData);
  const dayOhHaeng = sajuData.dayMaster.ohHaeng;
  const strength = sajuData.strength.strength;
  const sinSal = sajuData.expandedSinSal;
  const ohHaeng = sajuData.ohHaeng;
  const relationships = sajuData.relationships;

  let typeId: GhostTypeId;
  let matchReason: string;

  // ── Phase 1: 귀문관살 → 鬼門 ──────────────
  if (sinSal.gwiMunGwan) {
    typeId = 'gwiMun';
    matchReason = '귀문관살이 사주에 있다. 귀신의 문이 열려있는 사주.';
  }
  // ── Phase 2: 도화살 + 수 과다 → 溺鬼 ──────
  else if (sinSal.doHwa && ohHaeng.counts['수'] >= 3) {
    typeId = 'ikGwi';
    matchReason = '도화살에 수 기운이 넘친다. 감정에 빠지면 헤어나오지 못하는 사주.';
  }
  // ── Phase 3: 일간 + 강약 + 십신 분포 ────────
  else {
    const result = classifyByPhase3(dayOhHaeng, strength, counts, ohHaeng, sinSal);
    typeId = result.typeId;
    matchReason = result.reason;
  }

  // Phase 3에서 못 잡으면 Phase 4로
  if (!typeId) {
    const result = classifyByPhase4(sinSal, relationships, counts);
    typeId = result.typeId;
    matchReason = result.reason;
  }

  // Phase 5: 오행 디폴트
  if (!typeId) {
    const result = classifyByPhase5(dayOhHaeng);
    typeId = result.typeId;
    matchReason = result.reason;
  }

  const affinityScore = calculateAffinity(sajuData, typeId);
  const affinityDescription = describeAffinity(affinityScore);
  const detectionLines = buildDetectionLines(sajuData, typeId);

  return {
    typeId,
    affinityScore,
    affinityDescription,
    matchReason,
    detectionLines,
  };
}

// ─── 십신 카테고리 카운트 ──────────────────────

interface SipShinCounts {
  bigyeop: number;   // 비겁 (비견+겁재)
  siksang: number;   // 식상 (식신+상관)
  jaesung: number;   // 재성 (편재+정재)
  gwansung: number;  // 관성 (편관+정관)
  insung: number;    // 인성 (편인+정인)
}

function countSipShinCategories(sajuData: SajuDataV2): SipShinCounts {
  const counts: SipShinCounts = {
    bigyeop: 0, siksang: 0, jaesung: 0, gwansung: 0, insung: 0,
  };

  const allSipShin: string[] = [];
  const pillars = [sajuData.saju.yearJu, sajuData.saju.monthJu, sajuData.saju.dayJu];
  if (sajuData.saju.timeJu) pillars.push(sajuData.saju.timeJu);

  for (const ju of pillars) {
    if (ju.sipShinGan && ju.sipShinGan !== '일주') allSipShin.push(ju.sipShinGan);
    for (const ss of ju.sipShinJi) {
      if (ss && ss !== '일주') allSipShin.push(ss);
    }
  }

  for (const ss of allSipShin) {
    if (ss === '비견' || ss === '겁재') counts.bigyeop++;
    else if (ss === '식신' || ss === '상관') counts.siksang++;
    else if (ss === '편재' || ss === '정재') counts.jaesung++;
    else if (ss === '편관' || ss === '정관') counts.gwansung++;
    else if (ss === '편인' || ss === '정인') counts.insung++;
  }

  return counts;
}

// ─── Phase 3: 일간 + 강약 + 십신 분포 ────────────

function classifyByPhase3(
  dayOhHaeng: string,
  strength: string,
  counts: SipShinCounts,
  ohHaeng: SajuDataV2['ohHaeng'],
  sinSal: SajuDataV2['expandedSinSal'],
): { typeId: GhostTypeId; reason: string } {

  // 화 과다 + 식상 과다 → 狂燐
  if (ohHaeng.counts['화'] >= 3 && counts.siksang >= 3) {
    return { typeId: 'gwangIn', reason: '화 기운과 식상이 넘친다. 불꽃처럼 타오르다 스스로를 태우는 사주.' };
  }

  // 식상 과다 → 蝕魅
  if (counts.siksang >= 4) {
    return { typeId: 'sikMae', reason: '식상이 넘쳐난다. 채워도 채워도 배고픈 사주.' };
  }

  // 관성 과다 + 강 이상 → 冥判
  if (counts.gwansung >= 3 && (strength === '강' || strength === '태강')) {
    return { typeId: 'myeongPan', reason: '관성이 강하고 사주도 강하다. 심판하고 통제하려는 기운.' };
  }

  // 재성 과다 → 渴魂
  if (counts.jaesung >= 4) {
    return { typeId: 'galHon', reason: '재성이 넘친다. 아무리 채워도 갈증이 나는 사주.' };
  }

  // 인성 과다 + 약 이하 → 夜燭鬼
  if (counts.insung >= 3 && (strength === '약' || strength === '태약')) {
    return { typeId: 'yaChokGwi', reason: '인성이 많고 사주가 약하다. 어둠 속에서 촛불 하나 들고 헤매는 사주.' };
  }

  // 비겁 없음 + 약 → 無面鬼
  if (counts.bigyeop === 0 && (strength === '약' || strength === '태약')) {
    return { typeId: 'muMyeonGwi', reason: '비겁이 없고 사주가 약하다. 자기 얼굴을 잃어버린 사주.' };
  }

  // 토 과다 + 인성 많음 → 繭靈
  if (ohHaeng.counts['토'] >= 3 && counts.insung >= 2) {
    return { typeId: 'gyeonRyeong', reason: '토 기운이 두텁고 인성이 많다. 스스로를 가두고 있는 사주.' };
  }

  // 화 과다 + 강 이상 → 狂燐
  if (ohHaeng.counts['화'] >= 3 && (strength === '강' || strength === '태강')) {
    return { typeId: 'gwangIn', reason: '화 기운이 넘치고 강한 사주. 통제 불능의 불꽃.' };
  }

  // 재성 과다 + 관성 과다 → 執魅
  if (counts.jaesung >= 3 && counts.gwansung >= 2) {
    return { typeId: 'jipMae', reason: '재성과 관성이 엉켜있다. 놓지 못하는 집착의 사주.' };
  }

  // 도화살 단독 → 溺鬼
  if (sinSal.doHwa && counts.jaesung >= 2) {
    return { typeId: 'ikGwi', reason: '도화살에 재성이 따른다. 사람에게 빠지면 헤어나오지 못하는 사주.' };
  }

  // 태강 + 식상 많음 → 不可殺
  if (strength === '태강' && counts.siksang >= 2) {
    return { typeId: 'bulGaSal', reason: '사주가 태강하고 식상이 있다. 쓰러져도 다시 일어서는 사주.' };
  }

  // 일간 수 + 약 → 滯魄
  if (dayOhHaeng === '수' && (strength === '약' || strength === '태약')) {
    return { typeId: 'cheBaek', reason: '수 일간에 약한 사주. 떠나지 못하고 맴도는 넋.' };
  }

  // @ts-expect-error - fallthrough to Phase 4
  return { typeId: null as GhostTypeId, reason: '' };
}

// ─── Phase 4: 복합 폴백 ─────────────────────

function classifyByPhase4(
  sinSal: SajuDataV2['expandedSinSal'],
  relationships: SajuDataV2['relationships'],
  counts: SipShinCounts,
): { typeId: GhostTypeId; reason: string } {

  // 역마살 → 黃泉客
  if (sinSal.yeokMa) {
    return { typeId: 'hwangCheonGaek', reason: '역마살이 있다. 한 곳에 머물지 못하는 떠돌이 사주.' };
  }

  // 충 2개 이상 → 黃泉客
  if (relationships.chungList.length >= 2) {
    return { typeId: 'hwangCheonGaek', reason: '충이 많다. 안정을 찾지 못하고 떠도는 사주.' };
  }

  // 화개살 → 鬼門
  if (sinSal.hwaGae) {
    return { typeId: 'gwiMun', reason: '화개살이 있다. 영적 감수성이 열려있는 사주.' };
  }

  // 원진 있으면 → 滯魄
  if (relationships.wonjinList.length > 0) {
    return { typeId: 'cheBaek', reason: '원진이 있다. 가까운 인연과 어긋나며 맴도는 넋.' };
  }

  // 관성 과다 → 冥判
  if (counts.gwansung >= 3) {
    return { typeId: 'myeongPan', reason: '관성이 강하다. 모든 것을 재고 따지는 심판관의 사주.' };
  }

  // 비겁 과다 → 不可殺
  if (counts.bigyeop >= 3) {
    return { typeId: 'bulGaSal', reason: '비겁이 강하다. 쓰러져도 다시 일어서는 사주.' };
  }

  // @ts-expect-error - fallthrough to Phase 5
  return { typeId: null as GhostTypeId, reason: '' };
}

// ─── Phase 5: 오행 디폴트 ─────────────────────

function classifyByPhase5(dayOhHaeng: string): { typeId: GhostTypeId; reason: string } {
  const map: Record<string, { typeId: GhostTypeId; reason: string }> = {
    '목': { typeId: 'cheBaek', reason: '목 일간의 기본 기질. 뿌리내리려 하나 쉽게 떠나지 못하는 넋.' },
    '화': { typeId: 'gwangIn', reason: '화 일간의 기본 기질. 불꽃처럼 타오르는 도깨비불.' },
    '토': { typeId: 'gyeonRyeong', reason: '토 일간의 기본 기질. 단단한 고치 속에 갇힌 영혼.' },
    '금': { typeId: 'bulGaSal', reason: '금 일간의 기본 기질. 부서져도 다시 단련되는 존재.' },
    '수': { typeId: 'ikGwi', reason: '수 일간의 기본 기질. 깊은 물속으로 끌려가는 기운.' },
  };

  return map[dayOhHaeng] || { typeId: 'chipRyong', reason: '잠든 용. 아직 때를 기다리는 사주.' };
}

// ─── 친화도 점수 (5-95) ─────────────────────

function calculateAffinity(sajuData: SajuDataV2, typeId: GhostTypeId): number {
  let score = 50; // 기본값

  const sinSal = sajuData.expandedSinSal;
  const strength = sajuData.strength;
  const ohHaeng = sajuData.ohHaeng;
  const relationships = sajuData.relationships;

  // 귀문관살 → +20
  if (sinSal.gwiMunGwan) score += 20;

  // 화개살 → +10
  if (sinSal.hwaGae) score += 10;

  // 도화살 → +8
  if (sinSal.doHwa) score += 8;

  // 충이 많으면 → +5 per chung
  score += relationships.chungList.length * 5;

  // 원진 → +5
  score += relationships.wonjinList.length * 5;

  // 태강/태약 → +10
  if (strength.strength === '태강' || strength.strength === '태약') score += 10;

  // 결손 오행 있으면 → +5 per missing
  score += ohHaeng.missing.length * 5;

  // 특정 유형별 보정
  if (typeId === 'gwiMun' && sinSal.gwiMunGwan) score += 10;
  if (typeId === 'ikGwi' && sinSal.doHwa) score += 10;
  if (typeId === 'hwangCheonGaek' && sinSal.yeokMa) score += 10;

  // 클램프
  return Math.max(5, Math.min(95, score));
}

// ─── 친화도 설명 ──────────────────────────

function describeAffinity(score: number): string {
  if (score >= 80) return '바짝 붙어있다. 거의 같이 사는 수준이야.';
  if (score >= 65) return '가까이 있다. 니가 약해지면 바로 온다.';
  if (score >= 50) return '좀 떨어져 있긴 한데, 보고는 있다.';
  if (score >= 35) return '멀리 있다. 근데 연결은 돼 있어.';
  return '아직 멀다. 근데 끊어진 건 아니야.';
}

// ─── 감지 대사 (김귀자 스타일) ─────────────────

function buildDetectionLines(sajuData: SajuDataV2, typeId: GhostTypeId): string[] {
  const lines: string[] = [];
  const sinSal = sajuData.expandedSinSal;
  const strength = sajuData.strength;
  const ohHaeng = sajuData.ohHaeng;
  const dayMaster = sajuData.dayMaster;

  // 1. 도입 — 일간 기반으로 동적 생성
  const dayLine = DAY_MASTER_DETECTION[dayMaster.gan];
  lines.push(dayLine || '니 사주에 하나 걸려있는 게 있다.');

  // 2. 오행 불균형 감지
  if (ohHaeng.missing.length > 0) {
    const missing = ohHaeng.missing[0];
    const missingLine = MISSING_OHAENG_LINES[missing];
    if (missingLine) lines.push(missingLine);
  } else if (ohHaeng.dominant.length > 0) {
    const dom = ohHaeng.dominant[0];
    const domLine = DOMINANT_OHAENG_LINES[dom];
    if (domLine) lines.push(domLine);
  }

  // 3. 신살 기반 감지 (해당 유형의 트리거 신살은 teaserLines에서 다루므로 중복 방지)
  if (sinSal.gwiMunGwan && typeId !== 'gwiMun') {
    lines.push('귀문관살이 열려있다. 문이 닫혀있어야 하는데.');
  }
  if (sinSal.doHwa && typeId !== 'ikGwi') {
    lines.push('도화살. 사람한테 끌려다니는 팔자다.');
  }
  if (sinSal.hwaGae) {
    lines.push('화개살. 보통 사람보다 많이 느끼는 사주야.');
  }
  if (sinSal.yeokMa && typeId !== 'hwangCheonGaek') {
    lines.push('역마살. 한 곳에 못 붙어있는 사주다.');
  }

  // 4. 강약 기반 감지
  if (strength.strength === '태강') {
    lines.push('사주가 세다. 이래 세면 고놈이 좋아하거든.');
  } else if (strength.strength === '태약') {
    lines.push('사주가 약하다. 빈틈이 많아.');
  }

  return lines;
}

// ─── 일간별 도입 라인 ─────────────────────────

const DAY_MASTER_DETECTION: Record<string, string> = {
  '갑': '갑목 일간... 큰 나무인데, 뿌리 쪽에 뭔가 있다.',
  '을': '을목 일간... 풀잎 같은데, 바람 불면 쏠린다.',
  '병': '병화 일간... 불이 세다. 근데 그 불이 좀 이상해.',
  '정': '정화 일간... 촛불 같은 사주인데, 바람에 흔들리고 있어.',
  '무': '무토 일간... 산 같은 사주인데, 속이 비어있다.',
  '기': '기토 일간... 땅인데, 밑에 뭔가 묻혀있어.',
  '경': '경금 일간... 쇠인데, 녹이 슬고 있다.',
  '신': '신금 일간... 칼날인데, 방향이 안 쪽을 향해있어.',
  '임': '임수 일간... 물이 깊다. 바닥이 안 보여.',
  '계': '계수 일간... 이슬 같은 사주인데, 아침이면 사라진다.',
};

// ─── 오행 결핍 라인 ─────────────────────────

const MISSING_OHAENG_LINES: Record<string, string> = {
  '목': '목 기운이 없다. 시작하는 힘이 부족하다.',
  '화': '화 기운이 없다. 따뜻함이 빠져있어.',
  '토': '토 기운이 없다. 중심을 잡을 데가 없다.',
  '금': '금 기운이 없다. 끊을 줄을 모른다.',
  '수': '수 기운이 없다. 쉴 줄을 모르는 사주야.',
};

// ─── 오행 과다 라인 ─────────────────────────

const DOMINANT_OHAENG_LINES: Record<string, string> = {
  '목': '목 기운이 넘친다. 자라기만 하고 열매를 안 맺어.',
  '화': '화 기운이 뛴다. 안에서 불이 타고 있어.',
  '토': '토 기운이 무겁다. 스스로를 가두고 있어.',
  '금': '금 기운이 날카롭다. 자기도 남도 베고 있어.',
  '수': '수 기운이 깊다. 감정이 넘치고 있어.',
};
