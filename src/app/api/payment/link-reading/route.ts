import { NextResponse } from 'next/server';
import { linkPurchaseReading } from '@/lib/supabase/queries';

export async function POST(request: Request) {
  try {
    const { purchaseId, readingId } = await request.json();

    if (!purchaseId || !readingId) {
      return NextResponse.json(
        { error: 'purchaseId와 readingId는 필수입니다.' },
        { status: 400 },
      );
    }

    const ok = await linkPurchaseReading(purchaseId, readingId);

    return NextResponse.json({ ok });
  } catch (error) {
    console.error('Link reading error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
