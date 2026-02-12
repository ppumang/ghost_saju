import { NextResponse } from 'next/server';
import { getPurchase } from '@/lib/supabase/queries';

export async function POST(request: Request) {
  try {
    const { purchaseId } = await request.json();

    if (!purchaseId) {
      return NextResponse.json(
        { error: 'purchaseId는 필수입니다.' },
        { status: 400 },
      );
    }

    const purchase = await getPurchase(purchaseId);

    if (!purchase) {
      return NextResponse.json(
        { error: '구매 레코드를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: purchase });
  } catch (error) {
    console.error('Payment get error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
