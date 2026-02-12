/**
 * 13개 섹션 정의: ID, 순서, 배치 소속, 귀신테마 제목
 */

export interface SectionDef {
  id: string;
  order: number;
  batch: 'A' | 'B' | 'C1' | 'C2';
  hanjaIcon: string;
  title: string;
  fallbackTitle: string;
}

export const SECTIONS: SectionDef[] = [
  // 배치 A: 성격/특징 (섹션 1-4)
  { id: 'ilju_character',   order: 1,  batch: 'A',  hanjaIcon: '魂', title: '니 영혼의 본모습',   fallbackTitle: '魂: 니 영혼의 본모습' },
  { id: 'saju_traits',      order: 2,  batch: 'A',  hanjaIcon: '影', title: '숨겨진 그림자',      fallbackTitle: '影: 숨겨진 그림자' },
  { id: 'ohaeng_analysis',  order: 3,  batch: 'A',  hanjaIcon: '氣', title: '기운의 균형',        fallbackTitle: '氣: 기운의 균형' },
  { id: 'sipsung_analysis', order: 4,  batch: 'A',  hanjaIcon: '緣', title: '인연의 그물',        fallbackTitle: '緣: 인연의 그물' },

  // 배치 B: 인생 흐름 (섹션 5-8)
  { id: 'period_traits',    order: 5,  batch: 'B',  hanjaIcon: '命', title: '운명의 길목',        fallbackTitle: '命: 운명의 길목' },
  { id: 'twelve_stages',    order: 6,  batch: 'B',  hanjaIcon: '劫', title: '인생의 고비',        fallbackTitle: '劫: 인생의 고비' },
  { id: 'sinsal_analysis',  order: 7,  batch: 'B',  hanjaIcon: '煞', title: '살기의 흔적',        fallbackTitle: '煞: 살기의 흔적' },
  { id: 'guiin_analysis',   order: 8,  batch: 'B',  hanjaIcon: '貴', title: '귀인과 고독',        fallbackTitle: '貴: 귀인과 고독' },

  // 배치 C1: 재물/소비 (섹션 9-10)
  { id: 'wealth_overview',  order: 9,  batch: 'C1', hanjaIcon: '財', title: '재물의 흐름',        fallbackTitle: '財: 재물의 흐름' },
  { id: 'wealth_detail',    order: 10, batch: 'C1', hanjaIcon: '慾', title: '탐욕의 경계',        fallbackTitle: '慾: 탐욕의 경계' },

  // 배치 C2: 사랑/직업/결론 (섹션 11-13)
  { id: 'love_marriage',    order: 11, batch: 'C2', hanjaIcon: '情', title: '사랑과 인연',        fallbackTitle: '情: 사랑과 인연' },
  { id: 'career_study',     order: 12, batch: 'C2', hanjaIcon: '業', title: '업과 재능',          fallbackTitle: '業: 업과 재능' },
  { id: 'ghost_conclusion', order: 13, batch: 'C2', hanjaIcon: '鬼', title: '귀신사주 결론',      fallbackTitle: '鬼: 귀신사주 결론' },
];

export const SECTION_MAP = Object.fromEntries(SECTIONS.map(s => [s.id, s]));

export function getSectionsByBatch(batch: SectionDef['batch']): SectionDef[] {
  return SECTIONS.filter(s => s.batch === batch);
}
