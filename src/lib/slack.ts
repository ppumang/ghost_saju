const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';

/**
 * 핵심 이벤트를 슬랙 웹훅으로 전송한다.
 * 클라이언트에서 호출 (fire-and-forget).
 */
export async function notifySlack(text: string) {
  if (process.env.NODE_ENV !== 'production') return;
  try {
    await fetch('/api/slack-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch {
    // silent
  }
}

/**
 * 서버사이드에서 직접 슬랙 웹훅 호출.
 */
export async function sendSlackWebhook(text: string) {
  if (process.env.NODE_ENV !== 'production' || !SLACK_WEBHOOK_URL) return;
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch {
    // silent
  }
}
