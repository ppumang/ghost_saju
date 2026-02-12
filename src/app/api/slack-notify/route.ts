import { NextResponse } from 'next/server';
import { sendSlackWebhook } from '@/lib/slack';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'text 필요' }, { status: 400 });
    }
    await sendSlackWebhook(text);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
