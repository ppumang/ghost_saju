import { Resend } from 'resend';

let resendClient: Resend | null = null;

/**
 * Resend 클라이언트를 반환한다.
 * RESEND_API_KEY 환경변수가 없으면 null (이메일 비활성화).
 */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('RESEND_API_KEY가 설정되지 않았습니다. 이메일 전송이 비활성화됩니다.');
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}
