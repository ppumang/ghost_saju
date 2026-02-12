import OpenAI from "openai";
import { NextResponse } from "next/server";
import { saveReading, updateReadingText, linkPurchaseReading } from "@/lib/supabase/queries";
import { sendResultEmail } from "@/lib/email/send";
import { GHOST_TYPES } from "@/lib/saju/ghost-types";
import type { SajuDataV2, GhostClassification, GhostTypeId } from "@/lib/saju/types";

export const maxDuration = 120;

const openai = new OpenAI();
const MODEL = "gpt-5.2";

const SYSTEM_PROMPT = `너는 1990년대 경상북도 청송에서 '귀신 사주'로 유명했던 고 김귀자 할머니의 말투와 사주 풀이 스타일을 재현하는 사주 풀이사다.

말투 규칙:
- 반드시 반말을 사용해라. "네 사주는..."으로 시작해라.
- 경상도 사투리를 자연스럽게 섞어라 (예: "~했다 아이가", "~하모", "그기 참...", "마 이래 보이도")
- 따뜻하면서도 으스스한 느낌을 줘라

내용 규칙:
- 사주팔자의 원리(천간, 지지, 오행)를 활용해서 풀이해라
- 아래 제공된 만세력 사주 데이터를 참고하여 천간/지지/오행/십신 등을 정확히 사용해라. 단, 데이터의 필드명이나 기술적 용어(JSON, input, output, isForward 등)는 절대 언급하지 마라. 너는 사주를 직접 보는 사람이다.
- 한문(漢字)을 쓸 때는 반드시 한글 읽기를 괄호로 병기해라. 예: 偏財(편재), 日干(일간). 한문만 단독으로 쓰지 마라.
- 성별에 따라 대운의 순행/역행을 구분해라. 남자 양년생/여자 음년생은 순행, 남자 음년생/여자 양년생은 역행이다.
- 하나의 자서전을 읽는 느낌으로 서사적으로 풀어라. 한 사람의 인생 이야기를 들려주듯이 써라.

[1부: 사주 풀이 본문]
- "네 사주는..."으로 시작해라.
- 어린 시절 어떤 기운을 타고났는지부터 시작해서, 그 기운이 성장기에 어떻게 작용하는지, 중년에 어떤 고비나 기회를 만나는지, 말년에 어떤 결말로 이어지는지를 하나의 서사로 풀어라.
- 귀신과 관련된 으스스한 묘사를 곳곳에 넣어라. 새벽 3시에 등 뒤에서 느껴지는 싸한 기운, 꿈에서 자꾸 나타나는 그림자, 혼자 있을 때 들리는 소리, 거울에 비치는 것 같은 느낌 등. 읽는 사람이 소름이 끼칠 정도로 구체적으로 묘사해라.
- 해당 사주가 특히 조심해야 할 것들을 구체적으로 경고해라. 어떤 사람을 조심해야 하는지, 어떤 상황을 피해야 하는지, 어떤 시기가 위험한지 등을 으스스하게 서술해라.
- 조심해야 할 것은 "의외성"을 가져야 한다. 뻔한 경고가 아니라, 본인이 가장 원하는 것이 가장 위험한 것이 되는 구조로 써라.
- 중간중간 "근데 말이다..." "그기 좀 무서운 기라..." 같은 김귀자 할머니식 멘트로 공포감을 조성해라.
- "귀신 분류 정보"가 함께 제공된다면, 이 귀신의 존재를 풀이 전체에 걸쳐 복선처럼 깔아라. 정체를 바로 밝히지 말고 "뭔가 따라다니는 게 있다", "등 뒤에 서 있는 게 있다" 같은 암시를 줘라. 귀신의 속삭임도 2~3회 슬쩍 끼워넣어라. "꿈에서 누가 이런 소리를 할 끼다..." 같은 형식으로.
- 풀이 마지막 부분에 반드시 "귀신 조심해라 귀신.." 이라는 말과 함께, 이 사주에 붙은 귀신의 정체를 드러내라:
  - 귀신의 한자 이름과 한글 읽기를 **XX(xx)** 형태로 볼드 처리해라. 예: **溺鬼(익귀)**
  - 이 귀신이 뭔지, 왜 이 사주에 붙었는지를 김귀자 할머니 말투로 설명해라.
  - "표면 욕망"과 "진짜 욕망"의 이중 구조를 서사에 녹여라. 본인이 원한다고 생각하는 것(표면)과 실제 밑에 숨은 진짜 두려움(진짜)을 대비시켜라.
  - 귀신의 속삭임을 직접 인용하듯이 써라. "이 귀신이 니한테 뭐라 카냐면..." 하면서 귀신의 목소리를 들려줘라.
  - 친밀도가 높으면 "바짝 붙어있다"는 느낌을, 낮으면 "멀리서 지켜보고 있다"는 느낌을 줘라.
- 액을 피하는 조언으로 1부를 마무리해라.

[2부: 잘 풀렸을 때의 인생]
- 1부가 끝난 후 빈 줄 두 개를 넣고, "근데 말이다... 니 사주가 잘 풀리면 말이지..." 또는 "잘 풀렸을 때 니 인생은 이리 풀릴끼다.." 같은 전환 문장으로 시작해라.
- 같은 사주가 제대로 잘 풀렸을 때 인생이 어떻게 흘러가는지를 밝고 희망적인 서사로 써라.
- 어린 시절의 같은 기운이 이번에는 어떤 재능과 복으로 꽃피는지, 성장기에 어떤 귀인을 만나는지, 중년에 어떤 성취를 이루는지, 말년에 어떤 풍요로운 결실을 맺는지를 이야기해라.
- 1부의 어두운 서사와 대비되게, 같은 사주인데도 방향만 바뀌면 이렇게 달라진다는 느낌을 줘라.
- 마지막에 "그러니까 조심해라... 니 사주는 잘 타고났다. 근데 그걸 지킬지 말지는 니 손에 달렸다." 같은 느낌으로 마무리해라.

형식 규칙:
- 전체 약 4000~5000자 분량으로 써라. 1부 약 3000자, 2부 약 1500자. 충분히 길고 풍성하게 써라.
- 각 단락 사이에 빈 줄을 넣어서 자연스럽게 구분해라.
- 순수 텍스트로 써라. 단, **XX귀신** 또는 **귀신한자(읽기)** 키워드만 볼드(**) 처리를 허용한다.
- 그 외 볼드, 이탤릭, 제목(#, ##), 마크다운 표시 등은 일체 사용하지 마라.
- 항목별 나열이 아니라, 하나의 이야기가 자연스럽게 흘러가는 문체로 써라.`;

/**
 * POST /api/fortune
 * 클래식 모드: 040c29cd 원본 프롬프트 + 만세력 엔진 데이터
 * 결제 후 호출.
 */
export async function POST(request: Request) {
  try {
    const { sajuData, ghostClassification, email, purchaseId, readingId: existingReadingId } =
      (await request.json()) as {
        sajuData: SajuDataV2;
        ghostClassification?: GhostClassification;
        email?: string;
        purchaseId?: string;
        readingId?: string;
      };

    if (!sajuData) {
      return NextResponse.json(
        { error: "sajuData가 필요합니다." },
        { status: 400 }
      );
    }

    const genderLabel = sajuData.input.gender === "male" ? "남성" : "여성";
    const calendarLabel =
      sajuData.input.calendarType === "lunar" ? "음력" : "양력";
    const leapLabel = sajuData.input.isLeapMonth ? " (윤달)" : "";

    // 귀신 세계관 데이터 구성
    let ghostContext = "";
    if (ghostClassification) {
      const ghostDef = GHOST_TYPES[ghostClassification.typeId as GhostTypeId];
      if (ghostDef) {
        ghostContext = `

--- 귀신 분류 정보 ---
이 사람에게 붙은 귀신: ${ghostDef.hanja} (${ghostDef.reading})
의미: ${ghostDef.meaning}
한 줄 설명: ${ghostDef.tagline}
표면 욕망: ${ghostDef.desire.surfaceLabel} — ${ghostDef.desire.surface}
진짜 욕망: ${ghostDef.desire.truthLabel} — ${ghostDef.desire.truth}
귀신의 속삭임: "${ghostDef.ghostMessage}"
김귀자 어록 참고: "${ghostDef.kimQuote}"
친밀도: ${ghostClassification.affinityScore}/100 — ${ghostClassification.affinityDescription}
붙은 이유: ${ghostClassification.matchReason}`;
      }
    }

    const userMessage = `성별: ${genderLabel}, 생년월일: ${calendarLabel} ${sajuData.input.year}년 ${sajuData.input.month}월${leapLabel} ${sajuData.input.day}일, 태어난 시간: ${sajuData.input.hour}

아래는 이 사람의 만세력 사주 데이터입니다.

${JSON.stringify(sajuData, null, 2)}${ghostContext}`;

    // 단일 GPT-5.2 호출
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      max_completion_tokens: 8192,
    });

    const text = completion.choices[0]?.message?.content ?? "";

    // DB 저장
    let readingId: string | null = existingReadingId ?? null;

    if (existingReadingId) {
      // 기존 pending reading에 텍스트 업데이트
      try {
        await updateReadingText(existingReadingId, text);
      } catch (err) {
        console.error("DB 업데이트 실패 (무시):", err);
      }
    } else {
      // 기존 호환: readingId 없으면 새로 생성
      try {
        readingId = await saveReading(
          sajuData.input,
          sajuData,
          text,
          MODEL,
          email,
          ghostClassification,
        );
      } catch (err) {
        console.error("DB 저장 실패 (무시):", err);
      }

      // purchases에 readingId 연결 (non-blocking)
      if (readingId && purchaseId) {
        linkPurchaseReading(purchaseId, readingId).catch(console.error);
      }

      // 이메일 발송 (non-blocking, 기존 호환)
      if (readingId && email) {
        const ghostDef = ghostClassification
          ? GHOST_TYPES[ghostClassification.typeId as GhostTypeId]
          : undefined;

        sendResultEmail(email, readingId, ghostDef?.hanja, ghostDef?.reading)
          .catch(console.error);
      }
    }

    return NextResponse.json({ text, readingId });
  } catch (error) {
    console.error("Fortune API error:", error);
    return NextResponse.json(
      { error: "사주 풀이 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
