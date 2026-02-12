import { NextResponse } from "next/server";
import { saveReview, getRecentReviews } from "@/lib/supabase/queries";

export async function POST(request: Request) {
  try {
    const { review, readingId } = await request.json();

    if (!review || typeof review !== "string") {
      return NextResponse.json(
        { error: "리뷰 내용이 필요합니다." },
        { status: 400 }
      );
    }

    const success = await saveReview(review.slice(0, 500), readingId);

    if (!success) {
      // Supabase 미설정 시 조용히 성공 처리
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json(
      { error: "리뷰 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reviews = await getRecentReviews(20);
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json([]);
  }
}
