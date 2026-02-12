import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju/engine";
import { buildBatchPrompts } from "@/lib/saju/prompt-builder-v2";
import { mergeBatchResults } from "@/lib/saju/section-parser";
import { saveReading } from "@/lib/supabase/queries";
import type { BirthInput, SajuDataV2 } from "@/lib/saju/types";

const client = new Anthropic();

export async function POST(request: Request) {
  try {
    const { year, month, day, hour, calendarType, isLeapMonth, gender } =
      await request.json();

    if (!year || !month || !day || !hour || !gender) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    const input: BirthInput = {
      year,
      month,
      day,
      hour,
      calendarType: calendarType || "solar",
      isLeapMonth: isLeapMonth || false,
      gender,
    };

    // [1] 사주 계산 (확장 엔진 v2)
    const sajuData = calculateSaju(input) as SajuDataV2;

    // [2] 4배치 프롬프트 생성
    const batchPrompts = buildBatchPrompts(sajuData);

    // [3] 4개 병렬 Claude API 호출
    const batchResults = await Promise.allSettled(
      batchPrompts.map(async ({ batch, system, user }) => {
        const message = await client.messages.create({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 8192,
          system,
          messages: [{ role: "user", content: user }],
        });

        console.log(`Fortune API batch ${batch} stop_reason:`, message.stop_reason);

        const textBlock = message.content.find((block) => block.type === "text");
        return { batch, text: textBlock ? textBlock.text : "" };
      })
    );

    // [4] 배치 결과 수집
    const resolvedResults = batchResults.map((result, i) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      console.error(`Batch ${batchPrompts[i].batch} failed:`, result.reason);
      return { batch: batchPrompts[i].batch, text: null };
    });

    // [5] 13개 섹션으로 파싱/병합
    const sections = mergeBatchResults(resolvedResults);

    // [6] Supabase 저장 (non-blocking, sections를 JSON으로 저장)
    let readingId: string | null = null;
    try {
      readingId = await saveReading(input, sajuData, JSON.stringify(sections));
    } catch (err) {
      console.error("DB 저장 실패 (무시):", err);
    }

    // [7] 응답
    return NextResponse.json({ sections, sajuData, readingId });
  } catch (error) {
    console.error("Fortune API error:", error);
    return NextResponse.json(
      { error: "사주 풀이 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
