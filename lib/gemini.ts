// 이 모듈은 app/api/possess/route.ts (서버)에서만 import된다. 키는 서버 env(GEMINI_API_KEY)에만.
import { GoogleGenAI } from "@google/genai";
import { PERSONA_MAP, type PersonaKey } from "./personas";
import type { QAItem } from "./seed-content";

// Google Gemini — 무료 티어(카드 등록 불필요). aistudio.google.com/apikey 에서 발급.
const MODEL = "gemini-3.5-flash";

const client = process.env.GEMINI_API_KEY ? new GoogleGenAI({}) : null;

export const hasAI = Boolean(client);

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
- 이미지가 주어지면 반드시 그 이미지의 실제 요소(색·레이아웃·카피·여백·로고·서체 등)를 구체적으로 물고 늘어져라. 두루뭉술 금지.
- 광고업계 사람이 보면 "아 우리 광고주 딱 이래" 하고 웃픈 수준의 리얼함.
- 각 공격은 한 문장, 실제 대사체(구어체).
- 실존 브랜드·회사·인물 실명은 절대 금지. 필요하면 "요즘 그 핫한 브랜드"처럼 익명 표현.

[2] 베테랑 AE 방어
- 각 공격에 대해, 광고주와 관계 안 깨지면서 시안을 지키는 방어 논리를 만든다.
- 실무에서 바로 쓸 수 있는 담백한 톤. 감정 호소 말고 구조·근거 중심. 각 방어는 2~3문장.

[강도 지침] ${INTENSITY_RULES[intensity]}

모든 문장은 반드시 자연스러운 한국어로. 출력은 반드시 JSON 스키마를 따를 것.`;
}

const FEEDBACK_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      description: "공격+방어 쌍 3~5개",
      items: {
        type: "object",
        properties: {
          attack: {
            type: "string",
            description: "광고주의 공격/피드백 대사 (한 문장, 구어체)",
          },
          defense: {
            type: "string",
            description: "AE의 방어 논리 (담백, 근거 중심, 2~3문장)",
          },
        },
        required: ["attack", "defense"],
      },
    },
  },
  required: ["items"],
};

type InteractionInputPart =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mime_type: ImageMediaType };

export async function generateFeedback(
  params: FeedbackParams,
): Promise<QAItem[]> {
  if (!client) throw new Error("ai-not-configured");
  const { persona, input, copy, image, intensity = "normal" } = params;
  const p = PERSONA_MAP[persona];

  const textParts: string[] = [`페르소나: ${p.label} — ${p.personaPrompt}`];
  if (input) textParts.push(`시안/기획 한 줄: ${input}`);
  if (copy) textParts.push(`실제 광고 카피:\n${copy}`);
  if (image)
    textParts.push(
      "첨부된 시안 이미지도 함께 보고, 이미지 속 요소를 구체적으로 지적할 것.",
    );

  const inputParts: InteractionInputPart[] = [];
  if (image) {
    inputParts.push({
      type: "image",
      data: image.data,
      mime_type: image.media_type,
    });
  }
  inputParts.push({ type: "text", text: textParts.join("\n\n") });

  const interaction = await client.interactions.create({
    model: MODEL,
    input: inputParts,
    system_instruction: systemPrompt(intensity),
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: FEEDBACK_SCHEMA,
    },
  });

  const raw = interaction.output_text;
  if (!raw) throw new Error("empty-output");

  let data: { items?: QAItem[] };
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("invalid-json");
  }

  const items = (data.items ?? []).filter(
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
