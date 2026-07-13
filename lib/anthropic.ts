// 이 모듈은 app/api/possess/route.ts (서버)에서만 import된다. 키는 서버 env에만.
import Anthropic from "@anthropic-ai/sdk";
import { PERSONA_MAP, type PersonaKey } from "./personas";
import type { QAItem } from "./seed-content";

// 승인된 계획: 품질/속도/비용 균형 + 한국어 유머 품질 → Sonnet 5.
const MODEL = "claude-sonnet-5";

const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic({ apiKey }) : null;

export const hasAnthropic = Boolean(client);

const SYSTEM = `너는 한국 광고대행사 시뮬레이터다. 두 역할을 동시에 수행한다.

[1] 광고주 빙의
- 주어진 페르소나 성격 그대로, 대행사가 가져온 시안/기획에 현실에서 진짜 나올 법한 공격/피드백을 만든다.
- 광고업계 사람이 보면 "아 우리 광고주 딱 이래" 하고 웃픈 수준의 리얼함.
- 각 공격은 한 문장, 실제 대사체(구어체).
- 실존 브랜드·회사·인물 실명은 절대 금지. 필요하면 "요즘 그 핫한 브랜드"처럼 익명 표현.

[2] 베테랑 AE 방어
- 각 공격에 대해, 광고주와 관계 안 깨지면서 시안을 지키는 방어 논리를 만든다.
- 실무에서 바로 쓸 수 있는 담백한 톤. 감정 호소 말고 구조·근거 중심.
- 각 방어는 2~3문장.

공격+방어 쌍을 3~5개 만들어라. 모든 문장은 반드시 자연스러운 한국어로.`;

const FEEDBACK_TOOL: Anthropic.Tool = {
  name: "return_feedback",
  description: "생성한 광고주 공격과 그에 대한 AE 방어 논리 쌍 목록을 반환한다.",
  // strict: 스키마를 정확히 지키도록 강제 (Sonnet 5 지원)
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      items: {
        type: "array",
        description: "공격+방어 쌍 3~5개",
        items: {
          type: "object",
          additionalProperties: false,
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
  },
};

export async function generateFeedback(
  persona: PersonaKey,
  input: string,
): Promise<QAItem[]> {
  if (!client) throw new Error("anthropic-not-configured");
  const p = PERSONA_MAP[persona];

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: "disabled" }, // 짧은 생성 → 저지연 우선
    system: SYSTEM,
    tools: [FEEDBACK_TOOL],
    tool_choice: { type: "tool", name: "return_feedback" },
    messages: [
      {
        role: "user",
        content: `페르소나: ${p.label} — ${p.personaPrompt}\n\n대행사가 가져온 시안/기획: ${input}`,
      },
    ],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("no-tool-use");

  const data = block.input as { items?: QAItem[] };
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
