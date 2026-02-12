import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import { completePurchase } from '@/lib/supabase/queries';

const secretKey = process.env.TOSSPAY_SECRET_KEY;

async function confirmTossPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}) {
  const encryptedSecretKey =
    'Basic ' + Buffer.from(secretKey + ':').toString('base64');

  const response = await fetch(
    'https://api.tosspayments.com/v1/payments/confirm',
    {
      method: 'POST',
      headers: {
        Authorization: encryptedSecretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: params.orderId,
        amount: params.amount,
        paymentKey: params.paymentKey,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'TossPayments 결제 승인 실패');
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const { paymentKey, orderId, amount, purchaseId } = await request.json();

    if (!paymentKey || !orderId || !amount || !purchaseId) {
      return NextResponse.json(
        { error: 'paymentKey, orderId, amount, purchaseId는 필수입니다.' },
        { status: 400 },
      );
    }

    if (!secretKey) {
      console.error('TOSSPAY_SECRET_KEY가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: '서버 설정 오류' },
        { status: 500 },
      );
    }

    // DB에서 PENDING 구매 레코드 조회
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'DB 연결 실패' },
        { status: 500 },
      );
    }

    const { data: purchase, error: fetchError } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .eq('status', 'PENDING')
      .single();

    if (fetchError || !purchase) {
      return NextResponse.json(
        { error: '구매 레코드를 찾을 수 없거나 이미 처리되었습니다.' },
        { status: 400 },
      );
    }

    // TossPayments 결제 승인 (DB에 저장된 금액으로 검증)
    const confirmResponse = await confirmTossPayment({
      paymentKey,
      orderId,
      amount: purchase.price,
    });

    // 결제 성공 시 DB 업데이트
    if (confirmResponse.status === 'DONE') {
      const updated = await completePurchase({
        purchaseId: purchase.id,
        tossPaymentKey: paymentKey,
      });

      if (!updated) {
        console.error('결제 승인 성공했으나 DB 업데이트 실패:', purchaseId);
      }
    }

    return NextResponse.json({ data: confirmResponse });
  } catch (error) {
    console.error('Payment confirm error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '결제 승인 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
