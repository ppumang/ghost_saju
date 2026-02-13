import { NextResponse } from 'next/server';
import { sendResultEmail } from '@/lib/email/send';
import { sendSlackWebhook } from '@/lib/slack';

export async function POST(request: Request) {
  try {
    const { email, readingId, ghostHanja, ghostReading } = await request.json();

    if (!email || !readingId) {
      return NextResponse.json(
        { error: 'email과 readingId가 필요합니다.' },
        { status: 400 }
      );
    }

    const emailId = await sendResultEmail(email, readingId, ghostHanja, ghostReading);

    if (emailId) {
      sendSlackWebhook(`📧 [이메일 발송 성공] ${email}`).catch(() => {});
    } else {
      sendSlackWebhook(`❌ [이메일 발송 실패] ${email} — null response`).catch(() => {});
    }

    return NextResponse.json({ sent: !!emailId, emailId });
  } catch (error) {
    console.error('Send result email error:', error);
    sendSlackWebhook(`❌ [이메일 발송 에러] ${email} — ${error instanceof Error ? error.message : String(error)}`).catch(() => {});
    return NextResponse.json(
      { error: '이메일 발송에 실패했습니다.' },
      { status: 500 }
    );
  }
}
