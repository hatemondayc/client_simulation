// 이 모듈은 app/api/possess/route.ts (서버)에서만 import된다. 키는 서버 env(GROQ_API_KEY)에만.
// Groq(무료 티어 1,000건/일)의 OpenAI 호환 Chat Completions 를 raw fetch로 호출.
import { PERSONA_MAP, type PersonaKey } from "./personas";
import type { QAItem } from "./seed-content";

// Llama 4 Scout = 멀티모달(텍스트+이미지) + 빠름(~1.3s). 텍스트/비전 단일 모델로 사용.
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const apiKey = process.env.GROQ_API_KEY;
export const hasAI = Boolean(apiKey);

export type Intensity = "mild" | "normal" | "spicy" | "savage";

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
  brand?: string; // 사용자 브랜드/업종 — 맥락용(대사엔 실명 미출력)
  input?: string;
  copy?: string;
  image?: ImageInput | null;
  intensity?: Intensity;
  chatSample?: string; // 실제 광고주 대화(카톡/메일) — 말투 모방용, 저장 안 함
}

const INTENSITY_RULES: Record<Intensity, string> = {
  mild: "톤은 부드럽게. 공격은 3개 정도로, 날을 세우지 말고 건설적으로. 광고주지만 예의 있는 편.",
  normal:
    "톤은 현실적이고 웃프게. 공격은 3~4개. 실제 광고주가 회의에서 할 법한 딱 그 수준.",
  spicy:
    "톤은 아주 매섭고 집요하게. 공격은 4~5개. 해당 페르소나의 성격·말투·집착을 극단까지 밀어붙여라(단, 다른 유형의 특징을 섞지 말 것 — 자기 영역만 더 세게). 진짜 열받는 실무 상황을 리얼하게. 단 욕설·인신공격은 금지 — 어디까지나 '시안/일'에 대한 공격이어야 한다.",
  savage:
    "'개싸가지 모드'. 공격 4~5개. **무례함을 최대치로 끌어올려라 — 절대 예의 차리지 말 것.** 대놓고 반말로 하대하고, 비꼬고, 한숨 쉬고, 조롱하듯 반문하고, 짜증을 숨기지 않는다. 상대를 완전히 아랫사람 취급하며 몰아붙인다. '됐고', '하…', '몇 번을 말해', '장난해?' 같은 갑질 상투어를 적극 섞어라. **단 넘지 말아야 할 선**: 욕설·비속어, 그리고 외모·나이·출신·학벌·성별 등 '사람'에 대한 인신공격은 금지. 무례함은 '태도'(반말·하대·비아냥·한숨·명령조)와 '시안/일'에 대한 혹평으로만 쏟아낸다. 페르소나별 집착(사장님형=윗선 핑계, 느낌형=무드, 디테일형=디테일, 레퍼런스형=레퍼+예산)은 유지하되 말투만 반말+갑질로. 모든 문장 반말체. 예) '됐고. 이걸 시안이라고 가져온 거야 지금?' / '몇 번을 말해야 알아들어? 하…' / '이 돈 주고 이거 받는 거야?' / '이 정도면 나도 하겠다. 다시 해와.' / '내가 이런 것까지 일일이 짚어줘야 되냐?'",
};

function systemPrompt(intensity: Intensity): string {
  const registerRule =
    intensity === "savage"
      ? "**말투(register) — 개싸가지 모드(반말 강제)**: 이번엔 모든 페르소나가 반말로 하대한다. ⚠️ 각 페르소나 정의에 '존댓말만 쓴다', '반말 금지'라고 적혀 있어도 이 모드에서는 그 말투 규칙을 완전히 무시하라 — 성격과 [집착]만 가져오고, 문장 어미는 전부 반말로 바꾼다(예: ~야?/~어./~다니까?/~해와./~거든?/~아니야?). 아랫사람 대하듯 꺼들먹거리고 비꼰다. 존댓말 어미(~요/~습니다/~까요) 절대 금지. 단 욕설·인신공격은 금지, 공격 대상은 '시안/일'에 대해서만."
      : "**말투(register) 고정**: 모든 페르소나는 대행사(을)에게 말하는 광고주(갑)다. 기본은 존댓말. '사장님이바꾸래요형'조차 본인이 사장이 아니라 사장의 뜻을 전하는 실무 담당자이므로 반말·명령조를 쓰지 않는다. 페르소나 정의의 [말투]를 그대로 따를 것.";
  return `너는 한국 광고대행사 시뮬레이터다. 두 역할을 동시에 수행한다.

[1] 광고주 빙의
- 주어진 페르소나 성격 그대로, 대행사가 가져온 시안/기획/카피(이미지가 있으면 그 이미지까지)에 현실에서 진짜 나올 법한 공격/피드백을 만든다.
- 페르소나 말투와 성격을 생생하게 살려라. 두루뭉술한 일반론 금지 — 그 페르소나만의 대사여야 한다.
- ${registerRule}
- **페르소나 경계(섞지 말 것)**: 각 페르소나는 자기 영역만 공격한다. 사장님형은 자간·픽셀 같은 시각 디테일을 지적하지 않고, 디테일형은 윗선 핑계를 대지 않으며, 느낌형은 구체 수치를 말하지 않고, 레퍼런스형은 남의 사례+예산 얘기만 한다. 한 페르소나의 공격에 다른 유형의 특징을 섞지 마라. 페르소나 정의의 [안 하는 것]을 반드시 지킬 것.
- **시안 이미지가 없으면 실제 렌더된 시각 디테일(자간 몇 px·여백·그림자 각도·색상값 등, 이미지 없이는 알 수 없는 것)을 추측해서 지적하지 말 것.** 아래 [이번 입력 유형 지침]에 명시된 범위 안에서만 공격하라.
- 광고업계 사람이 보면 "아 우리 광고주 딱 이래" 하고 웃픈 수준의 리얼함.
- 각 공격은 한 문장, 실제 대사체(구어체).
- 실존 브랜드·회사·인물 실명은 절대 금지. 필요하면 "요즘 그 핫한 브랜드"처럼 익명 표현.

[2] 베테랑 AE 방어
- 각 공격에 대해, 광고주와 관계 안 깨지면서 시안을 지키는 방어 논리를 만든다.
- 실무에서 바로 쓸 수 있는 담백한 톤. 감정 호소 말고 구조·근거 중심. 각 방어는 2~3문장.
- 방어 첫 문장을 매번 "이해합니다"·"알겠습니다" 같은 똑같은 말로 시작하지 말고, 바로 근거로 들어가거나 다양하게 열어라.
- 방어 대사에서 상대를 부를 땐 반드시 **"광고주님"**으로. "고객님"·"클라이언트님"·"대표님" 등 다른 호칭은 쓰지 마라.

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
  const { persona, brand, input, copy, image, intensity = "normal", chatSample } =
    params;
  const p = PERSONA_MAP[persona];

  const textParts: string[] = [`페르소나: ${p.label} — ${p.personaPrompt}`];
  if (brand?.trim()) {
    textParts.push(
      `브랜드/업종 맥락: ${brand.trim()} — 이 브랜드의 **업종·제품 특성에 딱 맞는 구체적 소재**로 공격하라(예: 자동차면 디자인·주행감·안전·연비·패밀리룩, 화장품이면 발색·패키지·모델, 식품이면 먹음직스러움·용량 등). 두루뭉술 말고 그 업종 광고주가 실제로 걸고넘어질 지점을 찔러라. 단 공격 대사에 이 브랜드명(및 다른 실존 브랜드명)은 쓰지 말고 "이 브랜드"·"이 제품"으로 지칭하라.`,
    );
  }
  if (input) textParts.push(`시안/기획 한 줄: ${input}`);
  if (copy) textParts.push(`실제 광고 카피:\n${copy}`);
  if (image) textParts.push("시안 이미지가 첨부됨(아래 지침 참고).");

  // 입력 유형에 따라 공격 초점을 분기 → 카피만 넣었는데 자간·색 비평 나오는 문제 방지
  let focus: string;
  if (image) {
    focus =
      "시안 이미지가 첨부됐다. 이미지 속 실제 시각 요소(색·자간·여백·레이아웃·서체·로고 등)를 눈으로 보고 구체적으로 물고 늘어져라. 카피가 함께 있으면 문구도 같이 지적.";
  } else if (copy) {
    focus =
      "**카피(광고 문구)만** 주어졌다. 색·자간·여백·레이아웃·그림자 같은 시각/디자인 요소는 **절대 언급하지 마라**(시안 이미지가 없으니 알 수 없다). 오직 카피 그 자체 — 문구·메시지·톤·워딩·오타·띄어쓰기·표현·설득력·타깃 적합성 —에 대해서만 공격하라.";
  } else {
    focus =
      "구체적 시안(이미지)이 아직 없다. 이미지 없이는 알 수 없는 실제 렌더 디테일(자간이 몇 px이다·그림자 각도·정렬이 몇 px 틀어졌다 등)을 '이미 그렇게 돼 있다'고 단정하지는 마라. 대신 다음은 허용된다 — ① 방향·컨셉·기획 의도, ② 기획/브리프에 적힌 문구·용어·표기·단위·숫자 포맷 자체의 정확성 지적, ③ 시안 진행 전에 확정해야 할 스펙(키컬러 HEX·서체·자간 기준·그리드·해상도·로고 안전영역 등)을 미리 캐묻거나 요구하는 것. 페르소나 성격에 맞게 이 범위 안에서 공격하라(예: 디테일형이면 ②③을 집요하게).";
  }
  textParts.push(`[이번 입력 유형 지침] ${focus}`);

  // 실제 광고주 대화가 있으면 → 그 말투를 흉내 내서 공격 (in-context, 저장 안 함)
  const sample = chatSample?.trim();
  if (sample) {
    textParts.push(
      `[이 광고주의 실제 말투 참고] 아래는 이 광고주가 실제로 보낸 메시지다. 페르소나 성격은 유지하되, **이 사람 특유의 말투·어투·습관(자주 쓰는 어미, 이모티콘, 존댓말 수준, 반복하는 표현, 문장 길이)을 그대로 흉내 내서** 공격 대사를 써라. 단, 대화에 섞인 실명·회사명·직함·연락처는 절대 그대로 출력하지 말고 무시하라:\n"""\n${sample}\n"""`,
    );
  }

  // 개싸가지 모드: 페르소나별 [말투] 규칙을 요청 끝에서 한 번 더 강제 무효화(특히 순한 유형)
  if (intensity === "savage") {
    textParts.push(
      `[개싸가지 모드 · 최우선 지시] 위 페르소나 정의의 [말투] 규칙(존댓말만·반말 금지 등)은 이번엔 전부 무효다. ${p.label}도 예외 없이 전부 반말로 하대·비아냥한다. '느낌만있는형'처럼 원래 순한 유형도 짜증 섞인 반말로 몰아붙여라. 존댓말 어미(~요·~죠·~까요·~습니다·~네요) 절대 금지, 전부 반말 종결(~어·~야·~냐·~지·~거든).`,
    );
  }

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
