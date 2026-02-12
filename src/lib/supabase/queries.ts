import type { BirthInput, SajuData, GhostClassification } from '../saju/types';
import { createServerSupabaseClient } from './client';
import type { ProductId } from '../payment/constants';

/**
 * 사주 풀이 결과를 Supabase에 저장한다.
 * 실패해도 예외를 던지지 않는다 (non-blocking).
 */
export async function saveReading(
  input: BirthInput,
  sajuData: SajuData,
  text: string,
  modelUsed: string = 'claude-sonnet-4-5-20250929',
  email?: string,
  ghostClassification?: GhostClassification,
): Promise<string | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  try {
    const insertData: Record<string, unknown> = {
      gender: input.gender,
      birth_year: input.year,
      birth_month: input.month,
      birth_day: input.day,
      birth_hour: input.hour,
      calendar_type: input.calendarType,
      is_leap_month: input.isLeapMonth,
      saju_data: sajuData,
      reading_text: text,
      engine_version: sajuData.engineVersion,
      model_used: modelUsed,
    };

    if (email) insertData.email = email;
    if (ghostClassification) insertData.ghost_classification = ghostClassification;

    const { data, error } = await supabase
      .from('saju_readings')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('Supabase saveReading error:', error);
      return null;
    }

    return data?.id ?? null;
  } catch (err) {
    console.error('Supabase saveReading exception:', err);
    return null;
  }
}

/**
 * 빈 reading 레코드를 먼저 생성한다 (이메일 발송용).
 * AI 생성 후 updateReadingText()로 텍스트를 채운다.
 */
export async function createPendingReading(
  input: BirthInput,
  sajuData: SajuData,
  modelUsed: string = 'gpt-5.2',
  email?: string,
  ghostClassification?: GhostClassification,
): Promise<string | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  try {
    const insertData: Record<string, unknown> = {
      gender: input.gender,
      birth_year: input.year,
      birth_month: input.month,
      birth_day: input.day,
      birth_hour: input.hour,
      calendar_type: input.calendarType,
      is_leap_month: input.isLeapMonth,
      saju_data: sajuData,
      reading_text: '',
      engine_version: sajuData.engineVersion,
      model_used: modelUsed,
    };

    if (email) insertData.email = email;
    if (ghostClassification) insertData.ghost_classification = ghostClassification;

    const { data, error } = await supabase
      .from('saju_readings')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('Supabase createPendingReading error:', error);
      return null;
    }

    return data?.id ?? null;
  } catch (err) {
    console.error('Supabase createPendingReading exception:', err);
    return null;
  }
}

/**
 * AI 생성 완료 후 reading 텍스트를 업데이트한다.
 */
export async function updateReadingText(
  readingId: string,
  text: string,
): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('saju_readings')
      .update({ reading_text: text })
      .eq('id', readingId);

    if (error) {
      console.error('Supabase updateReadingText error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase updateReadingText exception:', err);
    return false;
  }
}

/**
 * readingId로 사주 풀이 결과를 조회한다.
 */
export async function getReading(readingId: string) {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('saju_readings')
      .select('*')
      .eq('id', readingId)
      .single();

    if (error) {
      console.error('Supabase getReading error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Supabase getReading exception:', err);
    return null;
  }
}

/**
 * 결제 후 이메일 업데이트
 */
export async function updateReadingEmail(
  readingId: string,
  email: string,
): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('saju_readings')
      .update({ email })
      .eq('id', readingId);

    if (error) {
      console.error('Supabase updateReadingEmail error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase updateReadingEmail exception:', err);
    return false;
  }
}

/**
 * 리뷰를 Supabase에 저장한다.
 */
export async function saveReview(
  reviewText: string,
  readingId?: string
): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('reviews')
      .insert({
        review_text: reviewText.slice(0, 500),
        reading_id: readingId || null,
      });

    if (error) {
      console.error('Supabase saveReview error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Supabase saveReview exception:', err);
    return false;
  }
}

/**
 * 최근 리뷰를 조회한다.
 */
export async function getRecentReviews(limit: number = 20): Promise<Array<{
  id: string;
  created_at: string;
  review_text: string;
}>> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, created_at, review_text')
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase getRecentReviews error:', error);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error('Supabase getRecentReviews exception:', err);
    return [];
  }
}

// ─── Payment Queries ────────────────────────────────────────────

export interface PurchaseRecord {
  id: string;
  toss_order_id: string;
  toss_payment_key: string | null;
  product_id: string;
  price: number;
  status: string;
  reading_id: string | null;
  email: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

/**
 * purchaseId로 구매 레코드를 조회한다.
 */
export async function getPurchase(purchaseId: string): Promise<PurchaseRecord | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (error) {
      console.error('getPurchase error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('getPurchase exception:', err);
    return null;
  }
}

/**
 * PENDING 상태의 구매 레코드를 생성한다.
 */
export async function createPurchase(params: {
  tossOrderId: string;
  productId: ProductId;
  price: number;
  email?: string;
  payload?: Record<string, unknown>;
}): Promise<PurchaseRecord | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  try {
    const insertData: Record<string, unknown> = {
      toss_order_id: params.tossOrderId,
      product_id: params.productId,
      price: params.price,
      status: 'PENDING',
    };
    if (params.email) insertData.email = params.email;
    if (params.payload) insertData.payload = params.payload;

    const { data, error } = await supabase
      .from('purchases')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('createPurchase error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('createPurchase exception:', err);
    return null;
  }
}

/**
 * 결제 승인 후 구매 레코드를 SUCCESS로 업데이트한다.
 */
/**
 * 결제 후 readingId를 purchases에 연결한다.
 */
export async function linkPurchaseReading(
  purchaseId: string,
  readingId: string,
): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('purchases')
      .update({ reading_id: readingId })
      .eq('id', purchaseId);

    if (error) {
      console.error('linkPurchaseReading error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('linkPurchaseReading exception:', err);
    return false;
  }
}

/**
 * 결제 승인 후 구매 레코드를 SUCCESS로 업데이트한다.
 */
export async function completePurchase(params: {
  purchaseId: string;
  tossPaymentKey: string;
  readingId?: string;
}): Promise<PurchaseRecord | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  try {
    const updateData: Record<string, unknown> = {
      toss_payment_key: params.tossPaymentKey,
      status: 'SUCCESS',
    };
    if (params.readingId) updateData.reading_id = params.readingId;

    const { data, error } = await supabase
      .from('purchases')
      .update(updateData)
      .eq('id', params.purchaseId)
      .eq('status', 'PENDING')
      .select()
      .single();

    if (error) {
      console.error('completePurchase error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('completePurchase exception:', err);
    return null;
  }
}
