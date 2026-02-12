import type { FortuneSection } from './types';
import { SECTIONS, SECTION_MAP } from './section-constants';

/**
 * 배치 응답 텍스트에서 섹션을 파싱한다.
 * 구분자: ===SECTION_START::id=== ... ===SECTION_END::id===
 * 첫 줄 = 제목, 나머지 = 본문
 */
export function parseBatchResponse(responseText: string): FortuneSection[] {
  const sections: FortuneSection[] = [];
  const regex = /===SECTION_START::(\w+)===\s*([\s\S]*?)===SECTION_END::\1===/g;

  let match;
  while ((match = regex.exec(responseText)) !== null) {
    const id = match[1];
    const rawContent = match[2].trim();
    const def = SECTION_MAP[id];

    if (!def) continue;

    // 첫 줄 = 제목, 나머지 = 본문
    const lines = rawContent.split('\n');
    const title = lines[0]?.trim() || def.fallbackTitle;
    const content = lines.slice(1).join('\n').trim();

    sections.push({
      id,
      title,
      content,
      order: def.order,
    });
  }

  return sections;
}

/**
 * 여러 배치 결과를 병합하고 13개 섹션으로 정렬한다.
 * 실패한 배치의 섹션은 폴백 메시지 사용.
 */
export function mergeBatchResults(
  batchResults: { batch: string; text: string | null }[]
): FortuneSection[] {
  const allSections: FortuneSection[] = [];

  for (const { text } of batchResults) {
    if (text) {
      const parsed = parseBatchResponse(text);
      allSections.push(...parsed);
    }
  }

  // 누락된 섹션에 폴백 추가
  const foundIds = new Set(allSections.map(s => s.id));
  for (const def of SECTIONS) {
    if (!foundIds.has(def.id)) {
      allSections.push({
        id: def.id,
        title: def.fallbackTitle,
        content: '귀신이 방해해서 이 풀이가 안 됐다... 나중에 다시 와봐라.',
        order: def.order,
      });
    }
  }

  // 순서대로 정렬
  return allSections.sort((a, b) => a.order - b.order);
}
