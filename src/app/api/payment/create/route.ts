import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/payment/constants';
import { createPurchase } from '@/lib/supabase/queries';

export async function POST(request: Request) {
  try {
    const { orderId, productId, email, payload } = await request.json();

    if (!orderId || !productId) {
      return NextResponse.json(
        { error: 'orderId와 productId는 필수입니다.' },
        { status: 400 },
      );
    }

    const product = getProduct(productId);
    if (!product) {
      return NextResponse.json(
        { error: '유효하지 않은 상품입니다.' },
        { status: 400 },
      );
    }

    const purchase = await createPurchase({
      tossOrderId: orderId,
      productId: product.id,
      price: product.price,
      email: email || undefined,
      payload: payload || undefined,
    });

    if (!purchase) {
      return NextResponse.json(
        { error: '구매 레코드 생성에 실패했습니다.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: purchase });
  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
