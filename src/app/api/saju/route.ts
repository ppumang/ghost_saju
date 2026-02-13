import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { calculateSaju } from '@/lib/saju/engine';
import { classifyGhost } from '@/lib/saju/ghost-classifier';
import { buildPreviewPrompt } from '@/lib/saju/prompt-builder-v2';
import type { BirthInput, SajuDataV3 } from '@/lib/saju/types';

const openai = new OpenAI();

/**
 * POST /api/saju
 * 엔진 + 프리뷰: 사주 계산 + 귀신 분류 + AI 프리뷰 맛보기
 * 결제 전 무료로 호출됨.
 */
export async function POST(request: Request) {
  try {
    const { year, month, day, hour, calendarType, isLeapMonth, gender } =
      await request.json();

    if (!year || !month || !day || !hour || !gender) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    const input: BirthInput = {
      year,
      month,
      day,
      hour,
      calendarType: calendarType || 'solar',
      isLeapMonth: isLeapMonth || false,
      gender,
    };

    // [1] 사주 계산 (확장 엔진 v3)
    let sajuData: SajuDataV3;
    try {
      sajuData = calculateSaju(input) as SajuDataV3;
    } catch (engineErr) {
      const msg = engineErr instanceof Error ? engineErr.message : '';
      // 유효하지 않은 날짜 (음력에 존재하지 않는 일자 등)
      if (msg.includes('only') || msg.includes('wrong lunar')) {
        return NextResponse.json(
          { error: '존재하지 않는 날짜입니다. 생년월일을 다시 확인해주세요.' },
          { status: 400 },
        );
      }
      throw engineErr;
    }

    // [2] 귀신 분류 (결정론적, AI 없음)
    const ghostClassification = classifyGhost(sajuData);

    // [3] AI 프리뷰 생성 (짧은 맛보기 — 결제 전환용)
    let previewText = '';
    try {
      const preview = buildPreviewPrompt(sajuData, ghostClassification);
      const completion = await openai.chat.completions.create({
        model: 'gpt-5.2',
        messages: [
          { role: 'system', content: preview.system },
          { role: 'user', content: preview.user },
        ],
        max_completion_tokens: 1024,
      });
      previewText = completion.choices[0]?.message?.content ?? '';
    } catch (err) {
      console.error('Preview generation failed (non-blocking):', err);
      // 프리뷰 실패해도 사주 데이터는 반환
    }

    return NextResponse.json({ sajuData, ghostClassification, previewText });
  } catch (error) {
    console.error('Saju API error:', error);
    return NextResponse.json(
      { error: '사주 계산 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
