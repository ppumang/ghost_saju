import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const REVIEWS_FILE = path.join(process.cwd(), "reviews.json");

export async function POST(request: Request) {
  try {
    const { review, timestamp } = await request.json();

    if (!review || typeof review !== "string") {
      return NextResponse.json(
        { error: "리뷰 내용이 필요합니다." },
        { status: 400 }
      );
    }

    let reviews: Array<{ review: string; timestamp: string }> = [];

    try {
      const data = await fs.readFile(REVIEWS_FILE, "utf-8");
      reviews = JSON.parse(data);
    } catch {
      // 파일이 없으면 빈 배열로 시작
    }

    reviews.push({
      review: review.slice(0, 500),
      timestamp: timestamp || new Date().toISOString(),
    });

    await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");

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
    const data = await fs.readFile(REVIEWS_FILE, "utf-8");
    const reviews = JSON.parse(data);
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json([]);
  }
}
