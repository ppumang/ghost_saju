// 천간 (Heavenly Stems)
export type CheonGan = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';

// 지지 (Earthly Branches)
export type JiJi = '자' | '축' | '인' | '묘' | '진' | '사' | '오' | '미' | '신' | '유' | '술' | '해';

// 오행 (Five Elements)
export type OhHaeng = '목' | '화' | '토' | '금' | '수';

// 음양
export type EumYang = '양' | '음';

// 십신 (Ten Gods)
export type SipShin =
  | '비견' | '겁재'
  | '식신' | '상관'
  | '편재' | '정재'
  | '편관' | '정관'
  | '편인' | '정인';

// 십이운성 (Twelve Stages)
export type SipIiUnSeong =
  | '장생' | '목욕' | '관대' | '건록' | '제왕'
  | '쇠' | '병' | '사' | '묘' | '절' | '태' | '양';

// 간지 쌍
export interface GanJi {
  gan: CheonGan;
  ji: JiJi;
  ganOhHaeng: OhHaeng;
  jiOhHaeng: OhHaeng;
  ganEumYang: EumYang;
  jiEumYang: EumYang;
  raw: string; // 예: "갑자"
}

// 주 (하나의 기둥)
export interface Ju {
  ganJi: GanJi;
  sipShinGan: string;       // 천간 십신
  sipShinJi: string[];      // 지지 십신 (지장간별)
  hideGan: string[];        // 지장간
  diShi: string;            // 십이운성
  naYin: string;            // 납음
}

// 사주 (네 기둥)
export interface SaJu {
  yearJu: Ju;
  monthJu: Ju;
  dayJu: Ju;
  timeJu: Ju | null;  // null if 모름
}

// 오행 분포
export interface OhHaengDistribution {
  counts: {
    목: number;
    화: number;
    토: number;
    금: number;
    수: number;
  };
  dominant: OhHaeng[];
  weak: OhHaeng[];
  missing: OhHaeng[];
}

// 신살
export interface SinSal {
  doHwa: boolean;     // 도화살
  yeokMa: boolean;    // 역마살
  hwaGae: boolean;    // 화개살
  details: string[];  // 예: ["년지 도화살", "월지 역마살"]
}

// 대운 항목
export interface DaeUnItem {
  startAge: number;
  endAge: number;
  ganJi: string;
  startYear: number;
  endYear: number;
}

// 대운 정보
export interface DaeUnInfo {
  startAge: number;
  isForward: boolean;  // 순행 여부
  items: DaeUnItem[];
}

// 세운 항목
export interface SeUnItem {
  year: number;
  age: number;
  ganJi: string;
}

// 특수 궁위
export interface SpecialPalaces {
  taeWon: string;       // 태원
  taeWonNaYin: string;
  mingGong: string;     // 명궁
  mingGongNaYin: string;
  shenGong: string;     // 신궁
  shenGongNaYin: string;
}

// 입력 데이터
export interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: string;
  calendarType: 'solar' | 'lunar';
  isLeapMonth: boolean;
  gender: 'male' | 'female';
}

// 최종 사주 데이터
export interface SajuData {
  input: BirthInput;
  lunarDate: {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
    lunarDateStr: string;
  };
  saju: SaJu;
  dayMaster: {
    gan: CheonGan;
    ohHaeng: OhHaeng;
    eumYang: EumYang;
    description: string;
  };
  ohHaeng: OhHaengDistribution;
  sinSal: SinSal;
  daeUn: DaeUnInfo;
  seUn: SeUnItem[];
  specialPalaces: SpecialPalaces;
  zodiac: string;  // 띠
  engineVersion: string;
}

// === 확장 분석 타입 (v2) ===

// 사주 강약
export interface StrengthResult {
  strength: '태강' | '강' | '중화' | '약' | '태약';
  score: number;       // 비겁+인성 비율 (0~100)
  deukRyeong: boolean; // 득령 (월지 지지력)
}

// 용신/희신/기신
export interface YongShinResult {
  yongShin: OhHaeng;
  huiShin: OhHaeng;
  giShin: OhHaeng;
}

// 확장 신살 (기둥별) — v2 기존 8종
export interface ExpandedSinSal {
  doHwa: boolean;
  yeokMa: boolean;
  hwaGae: boolean;
  banAn: boolean;
  yukHae: boolean;
  hyeonChim: boolean;
  gwiMunGwan: boolean;
  jiSal: boolean;
  // v3 추가 8종
  yangIn: boolean;       // 양인살
  goeGang: boolean;      // 괴강살
  baekHo: boolean;       // 백호살
  geobSal: boolean;      // 겁살
  cheonRaJiMang: boolean; // 천라지망
  mangShin: boolean;     // 망신살
  jangSeong: boolean;    // 장성살
  gongMangSal: boolean;  // 공망살
  hongYeom: boolean;     // 홍염살
  details: string[];
  byPillar: {
    year: string[];
    month: string[];
    day: string[];
    time: string[];
  };
}

// 귀인 (시기별)
export interface GuiinResult {
  cheonUl: { present: boolean; positions: string[] };
  taeGeuk: { present: boolean; positions: string[] };
  wolDeok: { present: boolean; positions: string[] };
  // v3 추가 5종
  cheonDeok: { present: boolean; positions: string[] };
  munChang: { present: boolean; positions: string[] };
  hakDang: { present: boolean; positions: string[] };
  cheongWan: { present: boolean; positions: string[] };
  geumYeo: { present: boolean; positions: string[] };
  byPeriod: {
    choNyeon: string[];   // 연주 = 초년
    cheongNyeon: string[]; // 월주 = 청년
    jungNyeon: string[];   // 일주 = 중년
    malNyeon: string[];    // 시주 = 말년
  };
}

// 합/충 관계
export interface RelationshipItem {
  type: '천간합' | '충' | '원진' | '삼합' | '반삼합' | '육합' | '방합' | '형' | '파';
  elements: string;
  description: string;
}

export interface RelationshipResult {
  hapList: RelationshipItem[];
  chungList: RelationshipItem[];
  wonjinList: RelationshipItem[];
  samhapList: RelationshipItem[];
  yukhapList: RelationshipItem[];
  banghapList: RelationshipItem[];
  hyeongList: RelationshipItem[];
  paList: RelationshipItem[];
}

// API 응답 섹션
export interface FortuneSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

// 최종 사주 데이터 (확장)
export interface SajuDataV2 extends SajuData {
  strength: StrengthResult;
  yongShin: YongShinResult;
  expandedSinSal: ExpandedSinSal;
  guiin: GuiinResult;
  relationships: RelationshipResult;
}

// === 확장 분석 타입 (v3) ===

// 공망 (空亡)
export interface GongMangResult {
  gongMangJi: [JiJi, JiJi];  // 공망 지지 2개
  affectedPillars: string[];  // 공망에 해당하는 기둥 (예: ["년주", "시주"])
  details: string[];          // 해석 문자열
}

// 격국 (格局)
export type GeokGukType =
  // 내격 8격
  | '식신격' | '상관격' | '편재격' | '정재격'
  | '편관격' | '정관격' | '편인격' | '정인격'
  // 특수격
  | '건록격' | '양인격'
  // 종격
  | '종강격' | '종아격' | '종재격' | '종관격' | '종세격'
  // 외격/판정불가
  | '잡기격' | '판정불가';

export interface GeokGukResult {
  geokGuk: GeokGukType;
  category: '내격' | '특수격' | '종격' | '기타';
  monthJiJangGan: string;    // 월지 지장간 중기
  monthJiSipShin: string;    // 월지 중기의 십신
  description: string;
}

// 결정론적 해석 테이블 결과
export interface InterpretationData {
  yongShinAttributes: {
    color: string;
    direction: string;
    number: string;
    season: string;
    taste: string;
  };
  careerSuggestions: {
    ohHaeng: OhHaeng;
    categories: string[];
    specificJobs: string[];
  };
  sinsalInterpretations: Record<string, {
    meaning: string;
    positive: string;
    negative: string;
    advice: string;
  }>;
  sipiiUnseongInterpretations: Record<string, {
    meaning: string;
    energy: string;
    advice: string;
  }>;
  sipshinInterpretations: Record<string, {
    personality: string;
    relationship: string;
    career: string;
    health: string;
  }>;
}

// 최종 사주 데이터 (v3 확장 — v2 하위호환)
export interface SajuDataV3 extends SajuDataV2 {
  gongMang: GongMangResult;
  geokGuk: GeokGukResult;
  interpretations: InterpretationData;
}

// API 응답
export interface FortuneResponse {
  sections: FortuneSection[];
  sajuData: SajuData;
  readingId: string | null;
}

// === 귀신 유형 시스템 ===

export type GhostTypeId =
  | 'cheBaek' | 'ikGwi' | 'gwangIn' | 'sikMae' | 'myeongPan'
  | 'muMyeonGwi' | 'yaChokGwi' | 'galHon' | 'gyeonRyeong'
  | 'gwiMun' | 'hwangCheonGaek' | 'jipMae' | 'bulGaSal' | 'chipRyong';

export interface GhostDesire {
  surfaceLabel: string;
  surface: string;
  truthLabel: string;
  truth: string;
}

export interface GhostTypeDef {
  id: GhostTypeId;
  hanja: string;
  reading: string;
  meaning: string;
  tagline: string;
  desire: GhostDesire;
  colors: { primary: string; secondary: string };
  teaserLines: string[];
  ghostMessage: string;
  kimQuote: string;
}

export interface GhostClassification {
  typeId: GhostTypeId;
  affinityScore: number;
  affinityDescription: string;
  matchReason: string;
  detectionLines: string[];
}

export interface SajuAnalysisResponse {
  sajuData: SajuDataV2;
  ghostClassification: GhostClassification;
}
