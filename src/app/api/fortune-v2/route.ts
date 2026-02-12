import OpenAI from "openai";
import { NextResponse } from "next/server";
import { buildBatchPrompts } from "@/lib/saju/prompt-builder-v2";
import { mergeBatchResults } from "@/lib/saju/section-parser";
import { saveReading } from "@/lib/supabase/queries";
import type { SajuDataV2, GhostClassification } from "@/lib/saju/types";

const openai = new OpenAI();
const MODEL = "gpt-5.2";

/**
 * POST /api/fortune
 * 결제 후 호출: sajuData + ghostClassification을 받아 AI 풀이를 생성한다.
 * (사주 계산은 /api/saju에서 이미 완료됨)
 */
export async function POST(request: Request) {
  try {
    const { sajuData, ghostClassification, email } =
      (await request.json()) as {
        sajuData: SajuDataV2;
        ghostClassification: GhostClassification;
        email?: string;
      };

    if (!sajuData || !ghostClassification) {
      return NextResponse.json(
        { error: "sajuData와 ghostClassification이 필요합니다." },
        { status: 400 }
      );
    }

    // [1] 4배치 프롬프트 생성 (귀신 컨텍스트 주입)
    const batchPrompts = buildBatchPrompts(sajuData, ghostClassification);

    // [2] 4개 병렬 GPT-5.2 호출
    const batchResults = await Promise.allSettled(
      batchPrompts.map(async ({ batch, system, user }) => {
        const completion = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          max_completion_tokens: 8192,
        });

        const text = completion.choices[0]?.message?.content ?? "";
        return { batch, text };
      })
    );

    // [3] 배치 결과 수집
    const resolvedResults = batchResults.map((result, i) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      console.error(`Batch ${batchPrompts[i].batch} failed:`, result.reason);
      return { batch: batchPrompts[i].batch, text: null };
    });

    // [4] 13개 섹션으로 파싱/병합
    const sections = mergeBatchResults(resolvedResults);

    // [5] Supabase 저장 (non-blocking)
    let readingId: string | null = null;
    try {
      readingId = await saveReading(
        sajuData.input,
        sajuData,
        JSON.stringify(sections),
        MODEL,
        email,
        ghostClassification,
      );
    } catch (err) {
      console.error("DB 저장 실패 (무시):", err);
    }

    // [6] 응답
    return NextResponse.json({ sections, sajuData, readingId });
  } catch (error) {
    console.error("Fortune API error:", error);
    return NextResponse.json(
      { error: "사주 풀이 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
