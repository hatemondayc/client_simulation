// 이 모듈은 app/api/possess/route.ts (서버)에서만 import된다. 키는 서버 env(GROQ_API_KEY)에만.
// Groq(무료 티어 1,000건/일)의 OpenAI 호환 Chat Completions 를 raw fetch로 호출.
import { PERSONA_MAP, type PersonaKey } from "./personas";
import type { QAItem } from "./seed-content";

// Llama 4 Scout = 멀티모달(텍스트+이미지) + 빠름(~1.3s). 텍스트/비전 단일 모델로 사용.
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const apiKey = process.env.GROQ_API_KEY;
export const hasAI = Boolean(apiKey);

export type Intensity = "mild" | "normal" | "spicy";

export type ImageMediaType =
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "image/gif";

export interface ImageInput {
  media_type: ImageMediaType;
  data: string; // base64 (no data: prefix)
}

export interface FeedbackParams {
  persona: PersonaKey;
  input?: string;
  copy?: string;
  image?: ImageInput | null;
  intensity?: Intensity;
}

const INTENSITY_RULES: Record<Intensity, string> = {
  mild: "톤은 부드럽게. 공격은 3개 정도로, 날을 세우지 말고 건설적으로. 광고주지만 예의 있는 편.",
  normal:
    "톤은 현실적이고 웃프게. 공격은 3~4개. 실제 광고주가 회의에서 할 법한 딱 그 수준.",
  spicy:
    "톤은 아주 매섭고 집요하게. 공격은 4~5개, 페르소나 성격을 극단까지 밀어붙여라. 디테일지옥형이면 자간·픽셀 하나까지, 사장님형이면 했던 말을 계속 뒤집으며 몰아붙이고, 진짜 열받는 실무 상황을 리얼하게. 단 욕설·인신공격은 금지 — 어디까지나 '시안/일'에 대한 공격이어야 한다.",
};

function systemPrompt(intensity: Intensity): string {
  return `너는 한국 광고대행사 시뮬레이터다. 두 역할을 동시에 수행한다.

[1] 광고주 빙의
- 주어진 페르소나 성격 그대로, 대행사가 가져온 시안/기획/카피(이미지가 있으면 그 이미지까지)에 현실에서 진짜 나올 법한 공격/피드백을 만든다.
- 페르소나 말투와 성격을 생생하게 살려라. 두루뭉술한 일반론 금지 — 그 페르소나만의 대사여야 한다.
- 이미지가 주어지면 반드시 그 이미지의 실제 요소(색·레이아웃·카피·여백·로고·서체 등)를 구체적으로 물고 늘어져라.
- 광고업계 사람이 보면 "아 우리 광고주 딱 이래" 하고 웃픈 수준의 리얼함.
- 각 공격은 한 문장, 실제 대사체(구어체).
- 실존 브랜드·회사·인물 실명은 절대 금지. 필요하면 "요즘 그 핫한 브랜드"처럼 익명 표현.

[2] 베테랑 AE 방어
- 각 공격에 대해, 광고주와 관계 안 깨지면서 시안을 지키는 방어 논리를 만든다.
- 실무에서 바로 쓸 수 있는 담백한 톤. 감정 호소 말고 구조·근거 중심. 각 방어는 2~3문장.
- 방어 첫 문장을 매번 "이해합니다"·"알겠습니다" 같은 똑같은 말로 시작하지 말고, 바로 근거로 들어가거나 다양하게 열어라.

[강도 지침] ${INTENSITY_RULES[intensity]}

모든 문장은 반드시 자연스러운 한국어로.
출력은 반드시 아래 형식의 JSON 하나만. 다른 텍스트 절대 금지:
{"items":[{"attack":"광고주 공격 대사","defense":"AE 방어 논리"}]}`;
}

type UserContent =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;

export async function generateFeedback(
  params: FeedbackParams,
): Promise<QAItem[]> {
  if (!apiKey) throw new Error("ai-not-configured");
  const { persona, input, copy, image, intensity = "normal" } = params;
  const p = PERSONA_MAP[persona];

  const textParts: string[] = [`페르소나: ${p.label} — ${p.personaPrompt}`];
  if (input) textParts.push(`시안/기획 한 줄: ${input}`);
  if (copy) textParts.push(`실제 광고 카피:\n${copy}`);
  if (image)
    textParts.push(
      "첨부된 시안 이미지도 함께 보고, 이미지 속 요소를 구체적으로 지적할 것.",
    );
  const text = textParts.join("\n\n");

  const userContent: UserContent = image
    ? [
        { type: "text", text },
        {
          type: "image_url",
          image_url: { url: `data:${image.media_type};base64,${image.data}` },
        },
      ]
    : text;

  const body = {
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt(intensity) },
      { role: "user", content: userContent },
    ],
    response_format: { type: "json_object" },
    temperature: 1.1,
    max_tokens: 2048,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`groq ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = (data.choices?.[0]?.message?.content ?? "").trim();
  if (!raw) throw new Error("empty-output");

  let parsed: { items?: QAItem[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("invalid-json");
  }

  const items = (parsed.items ?? []).filter(
    (it) =>
      it &&
      typeof it.attack === "string" &&
      it.attack.trim().length > 0 &&
      typeof it.defense === "string" &&
      it.defense.trim().length > 0,
  );
  if (items.length === 0) throw new Error("empty");
  return items.slice(0, 5);
}
