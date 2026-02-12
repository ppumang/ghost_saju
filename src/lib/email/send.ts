import { getResendClient } from './client';

const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS ?? 'noreply@ghostsaju.com';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * 이메일을 발송한다.
 * 실패해도 예외를 던지지 않는다 (non-blocking).
 */
export async function sendEmail(params: SendEmailParams): Promise<string | null> {
  const resend = getResendClient();
  if (!resend) return null;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: params.subject,
      html: params.html,
      ...(params.text && { text: params.text }),
    });

    if (error) {
      console.error('Resend 이메일 발송 실패:', error);
      return null;
    }

    return data?.id ?? null;
  } catch (err) {
    console.error('Resend 이메일 발송 예외:', err);
    return null;
  }
}

/**
 * 결제 완료 영수증 이메일을 발송한다.
 */
export async function sendPaymentReceiptEmail(params: {
  to: string;
  orderId: string;
  productName: string;
  price: number;
}): Promise<string | null> {
  const formattedPrice = params.price.toLocaleString('ko-KR');

  return sendEmail({
    to: params.to,
    subject: `[귀신사주] 결제 완료`,
    html: `
      <div style="max-width:480px;margin:0 auto;background:#0a0a0a;padding:40px 24px;font-family:'Nanum Myeongjo',-apple-system,sans-serif">
        <h1 style="color:#d4c5a9;font-size:1.2rem;letter-spacing:0.15em;text-align:center;margin-bottom:8px">귀신사주</h1>
        <div style="width:40px;height:1px;background:#8b0000;margin:0 auto 28px"></div>

        <p style="color:#c4b896;font-size:0.9rem;line-height:1.8;text-align:center;margin-bottom:24px">
          결제가 완료되었습니다.
        </p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #222;color:#888;font-size:0.8rem">상품명</td>
            <td style="padding:10px 0;border-bottom:1px solid #222;text-align:right;font-weight:600;color:#d4c5a9;font-size:0.85rem">${params.productName}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #222;color:#888;font-size:0.8rem">금액</td>
            <td style="padding:10px 0;border-bottom:1px solid #222;text-align:right;font-weight:600;color:#d4c5a9;font-size:0.85rem">${formattedPrice}원</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #222;color:#888;font-size:0.8rem">주문번호</td>
            <td style="padding:10px 0;border-bottom:1px solid #222;text-align:right;color:#666;font-size:0.75rem">${params.orderId}</td>
          </tr>
        </table>

        <p style="color:#555;font-size:0.7rem;text-align:center;line-height:1.6">
          본 메일은 발신 전용입니다.
        </p>
      </div>
    `,
    text: `[귀신사주] 결제 완료\n상품명: ${params.productName}\n금액: ${formattedPrice}원\n주문번호: ${params.orderId}`,
  });
}

/**
 * 사주 풀이 결과 확인 링크를 이메일로 발송한다.
 * ghostHanja/ghostReading은 이메일에 귀신 유형을 표시하기 위해 사용.
 */
export async function sendResultEmail(
  to: string,
  readingId: string,
  ghostHanja?: string,
  ghostReading?: string,
): Promise<string | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ghostsaju.vercel.app';
  const resultUrl = `${baseUrl}/result/${readingId}`;

  const ghostDisplay = ghostHanja
    ? `<p style="font-size:2rem;color:#8b0000;letter-spacing:0.2em;margin:24px 0 8px;font-weight:bold;text-shadow:0 0 20px rgba(139,0,0,0.3)">${ghostHanja}</p>
       ${ghostReading ? `<p style="font-size:0.85rem;color:#888;letter-spacing:0.1em;margin:0 0 24px">${ghostReading}</p>` : ''}`
    : '';

  return sendEmail({
    to,
    subject: '[귀신사주] 사주 풀이가 완료되었습니다',
    html: `
      <div style="max-width:480px;margin:0 auto;background:#0a0a0a;padding:40px 24px;font-family:'Nanum Myeongjo',-apple-system,sans-serif">
        <h1 style="color:#d4c5a9;font-size:1.4rem;letter-spacing:0.15em;text-align:center;margin-bottom:8px">귀신사주</h1>
        <div style="width:60px;height:2px;background:#8b0000;margin:0 auto 32px;box-shadow:0 0 10px rgba(139,0,0,0.3)"></div>

        <p style="color:#c4b896;font-size:0.95rem;line-height:1.8;text-align:center;margin-bottom:24px">
          사주 풀이가 완료되었습니다.<br>
          아래 버튼을 눌러 결과를 확인해 주세요.
        </p>

        <div style="text-align:center">
          ${ghostDisplay}
        </div>

        <div style="text-align:center;margin:32px 0">
          <a href="${resultUrl}" style="display:inline-block;padding:14px 40px;background:#8b0000;color:#d4c5a9;text-decoration:none;font-size:0.95rem;font-weight:700;letter-spacing:0.1em">
            결과 보기
          </a>
        </div>

        <p style="color:#555;font-size:0.75rem;text-align:center;margin-top:40px;line-height:1.6">
          이 링크는 언제든지 다시 접속하여 확인하실 수 있습니다.<br>
          본 메일은 발신 전용입니다.
        </p>
      </div>
    `,
    text: `[귀신사주] 사주 풀이가 완료되었습니다.\n결과 확인: ${resultUrl}`,
  });
}
