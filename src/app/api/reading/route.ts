import { NextResponse } from "next/server";
import { getReading } from "@/lib/supabase/queries";

/**
 * POST /api/reading
 * readingId로 reading 데이터를 조회한다.
 * 결과 페이지에서 polling용으로 사용.
 */
export async function POST(request: Request) {
  try {
    const { readingId } = (await request.json()) as { readingId: string };

    if (!readingId) {
      return NextResponse.json({ error: "readingId 필요" }, { status: 400 });
    }

    const reading = await getReading(readingId);

    if (!reading) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    return NextResponse.json({ data: reading });
  } catch (error) {
    console.error("Reading API error:", error);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}
