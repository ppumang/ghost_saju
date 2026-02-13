import { NextResponse } from "next/server";
import { createPendingReading, linkPurchaseReading } from "@/lib/supabase/queries";
import { sendResultEmail } from "@/lib/email/send";
import { sendSlackWebhook } from "@/lib/slack";
import { GHOST_TYPES } from "@/lib/saju/ghost-types";
import type { SajuDataV2, GhostClassification, GhostTypeId } from "@/lib/saju/types";

/**
 * POST /api/reading/prepare
 * 1. 빈 reading 레코드 생성
 * 2. 이메일 즉시 발송
 * 3. purchase에 readingId 연결
 * → readingId 반환 (AI 생성은 별도 /api/fortune에서 처리)
 */
export async function POST(request: Request) {
  try {
    const { sajuData, ghostClassification, email, purchaseId } =
      (await request.json()) as {
        sajuData: SajuDataV2;
        ghostClassification?: GhostClassification;
        email?: string;
        purchaseId?: string;
      };

    if (!sajuData) {
      return NextResponse.json(
        { error: "sajuData가 필요합니다." },
        { status: 400 }
      );
    }

    // 1. 빈 reading 레코드 생성
    const readingId = await createPendingReading(
      sajuData.input,
      sajuData,
      "gpt-5.2",
      email,
      ghostClassification,
    );

    if (!readingId) {
      return NextResponse.json(
        { error: "reading 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    // 2. purchases에 readingId 연결
    if (purchaseId) {
      linkPurchaseReading(purchaseId, readingId).catch(console.error);
    }

    // 3. 이메일 즉시 발송
    let emailStatus: string = 'skipped';
    if (email) {
      const ghostDef = ghostClassification
        ? GHOST_TYPES[ghostClassification.typeId as GhostTypeId]
        : undefined;

      try {
        const emailId = await sendResultEmail(email, readingId, ghostDef?.hanja, ghostDef?.reading);
        emailStatus = emailId ? `sent:${emailId}` : 'failed:null_response';
        if (emailId) {
          sendSlackWebhook(`📧 [이메일 발송 성공] ${email}`).catch(() => {});
        } else {
          sendSlackWebhook(`❌ [이메일 발송 실패] ${email} — null response`).catch(() => {});
        }
      } catch (err) {
        emailStatus = `error:${err instanceof Error ? err.message : String(err)}`;
        console.error("Email send error:", err);
        sendSlackWebhook(`❌ [이메일 발송 에러] ${email} — ${err instanceof Error ? err.message : String(err)}`).catch(() => {});
      }
    } else {
      emailStatus = 'skipped:no_email';
    }

    return NextResponse.json({ readingId, emailStatus });
  } catch (error) {
    console.error("Reading prepare error:", error);
    return NextResponse.json(
      { error: "처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
