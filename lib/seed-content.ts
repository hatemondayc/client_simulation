import type { PersonaKey } from "./personas";

export interface QAItem {
  attack: string;
  defense: string;
}

export interface SeedScenario {
  persona: PersonaKey;
  input: string;
  items: QAItem[];
}

/**
 * pre-baked 예시. 세 곳에서 재사용된다:
 *  1) 랜딩 자동재생 데모 (API/DB 무의존 — 5초 훅 보장)
 *  2) /api/possess 실패·타임아웃 시 폴백
 *  3) Supabase 미설정 시 /hall 피드 폴백 (SEED_FEED)
 */
export const SEED: Record<PersonaKey, SeedScenario> = {
  boss: {
    persona: "boss",
    input: "여름 세일 배너 (메인 컬러 레드)",
    items: [
      {
        attack: "제가 어제 레드 좋다고 했는데… 위에서 왜 이렇게 빨갛냐고 하시네요.",
        defense:
          "레드가 세일·긴급성엔 클릭이 제일 잘 나오는 색이긴 해요. 그래도 위에서 부담스러워하시니, 채도만 살짝 낮춘 버전 같이 놓고 클릭 데이터로 골라보시죠.",
      },
      {
        attack: "사장님이 로고가 좀 작은 것 같대요. 느낌이요, 느낌.",
        defense:
          "로고는 가이드 최소 규정보다 이미 1.4배 큰데요. 작아 보이는 건 대개 주변이 빡빡해서예요. 로고 옆 여백을 키워서 더 눈에 들어오게 한 안 가져왔습니다.",
      },
      {
        attack: "이거 우리 사모님한테도 한번 보여드릴게요.",
        defense:
          "네 좋아요. 대신 의견 주시는 분이 늘면 일정이 밀리니까, 사모님 피드백도 이번 1차 컨펌 때 같이 받아서 한 번에 정리하는 게 안전합니다.",
      },
      {
        attack: "일단 방향 다른 시안 세 개만 더 볼 수 있을까요? 비교하게.",
        defense:
          "너무 여러 개 비교하면 오히려 결정이 더 늦어져요. 지금 안을 가운데 두고 '좀 더 안정적인 쪽 / 좀 더 과감한 쪽' 두 개만 더 붙여서, 고르기 쉽게 좁혀드릴게요.",
      },
    ],
  },
  vibe: {
    persona: "vibe",
    input: "신규 카페 브랜드 인스타 런칭 콘텐츠",
    items: [
      {
        attack: "좀 더 힙한데, 무게감 있게, 근데 너무 튀지는 않게 해주세요.",
        defense:
          "힙하면서 무게감 있고 안 튀는 걸 한 컷에 다 넣으면 서로 깎아먹어요. 힙은 레이아웃으로, 무게감은 타이포로, 안정감은 컬러로 나눠서 담은 안 보여드릴게요.",
      },
      {
        attack: "느낌 아시죠? 그 뭔가… 요즘 감성이요.",
        defense:
          "그 '요즘 감성'을 저희끼리 같은 그림으로 맞춰야 해서요. 무드보드 세 장 먼저 골라주시면, 그다음부터 시안 왔다 갔다 하는 게 절반으로 줄어요.",
      },
      {
        attack: "MZ스럽게 해주세요. 근데 40대도 좋아할 만하게.",
        defense:
          "타깃을 둘 다 정면으로 잡으면 톤이 흔들려요. 코어는 MZ로 두고, 40대한테는 '봐도 이해되는 정도'의 위트만 살짝 깔아두는 쪽으로 가시죠.",
      },
      {
        attack: "심플한데 꽉 찬 느낌으로 가주세요.",
        defense:
          "심플은 여백을 비우는 거고 꽉 참은 정보를 채우는 거라, 사실 방향이 반대예요. 핵심 메시지 하나만 크게 남기고 나머지를 덜면, 여백은 심플한데 임팩트는 꽉 차 보입니다.",
      },
    ],
  },
  detail: {
    persona: "detail",
    input: "제품 상세페이지 상단 키비주얼",
    items: [
      {
        attack: "여기 로고 2px만 내려주시고, 자간은 -5로 주세요.",
        defense:
          "2px 내리고 자간 -5, 바로 반영할게요. 다만 그보다 더 좁히면 모바일에서 글자가 붙어서 잘 안 읽혀요. -3 정도를 권장선으로 잡고 같이 보여드릴게요.",
      },
      {
        attack: "이 그림자 각도가 왼쪽 요소랑 미묘하게 다른 것 같은데요?",
        defense:
          "정확히 보셨어요. 광원 기준이 두 개로 갈려 있었네요. 전체를 45도 한 방향으로 통일했고, 다른 요소들도 같은 규칙으로 다 맞췄습니다.",
      },
      {
        attack: "느낌적으로 여기가 1px 정도 뜬 것 같아요.",
        defense:
          "확인해보니 진짜로 정렬선이 살짝 어긋나 있었어요. 8pt 그리드에 전부 다시 맞춰서 딱 떨어지게 정리했습니다.",
      },
      {
        attack: "이 초록이 우리 브랜드 초록이랑 살짝 달라 보여요.",
        defense:
          "스포이드로 찍어보니 브랜드 가이드 HEX값이랑 정확히 같아요. 옆에 레드가 있어서 보색 대비 때문에 달라 보이는 착시인데요, 옆 컬러 면적을 조정해서 잡았습니다.",
      },
    ],
  },
  reference: {
    persona: "reference",
    input: "가전 신제품 런칭 영상 기획",
    items: [
      {
        attack: "요즘 그 핫한 브랜드 영상처럼 해주세요. 딱 그 느낌만.",
        defense:
          "그 톤의 핵심이 '카피 확 줄이고 롱테이크로 가는 건데', 그건 제작비랑 촬영 일수가 받쳐줘야 나와요. 지금 예산에서 그 무드를 살릴 수 있는 대체 연출로 정리해 왔습니다.",
      },
      {
        attack: "이거 그냥 그 감성만 살짝 얹으면 되는 거 아니에요?",
        defense:
          "그 '살짝'이 사실 제일 비싸요. 그 감성이 색보정·사운드·모션이 다 합쳐진 결과라서요. 예산 안에서 제일 티 나는 것부터 순서대로 넣는 걸로 제안드릴게요.",
      },
      {
        attack: "해외에서 이런 거 봤는데, 우리도 이 정도는 되잖아요?",
        defense:
          "그 퀄리티, 저희도 낼 수 있어요. 관건은 예산이랑 일정이라, 그 영상이 어떤 조건에서 나온 건지 표로 비교해 드릴 테니 어디에 투자할지 같이 정하시죠.",
      },
      {
        attack: "예산은 이건데, 퀄리티는 저거였으면 좋겠어요.",
        defense:
          "예산이랑 기대치 사이 갭을 솔직하게 말씀드릴게요. 전체를 골고루 깎기보다, 소비자가 제일 오래 보는 앞 3초에 예산을 몰아서 체감 퀄리티를 지키는 쪽을 권합니다.",
      },
    ],
  },
};

/** 랜딩 자동재생에 쓰는 대표 시나리오 */
export const HERO_SCENARIO: SeedScenario = SEED.boss;

/** API 실패 시 폴백 QA */
export function fallbackFor(persona: PersonaKey): QAItem[] {
  return SEED[persona].items.slice(0, 4);
}

export interface FeedSeedCard {
  persona: PersonaKey;
  attack_text: string;
  input_summary: string;
  likes: number;
}

/** Supabase 미설정 시 /hall 이 비어보이지 않게 하는 폴백 피드 */
export const SEED_FEED: FeedSeedCard[] = [
  { persona: "boss", attack_text: SEED.boss.items[0].attack, input_summary: SEED.boss.input, likes: 142 },
  { persona: "vibe", attack_text: SEED.vibe.items[0].attack, input_summary: SEED.vibe.input, likes: 128 },
  { persona: "reference", attack_text: SEED.reference.items[0].attack, input_summary: SEED.reference.input, likes: 119 },
  { persona: "detail", attack_text: SEED.detail.items[0].attack, input_summary: SEED.detail.input, likes: 97 },
  { persona: "vibe", attack_text: SEED.vibe.items[1].attack, input_summary: SEED.vibe.input, likes: 88 },
  { persona: "boss", attack_text: SEED.boss.items[2].attack, input_summary: SEED.boss.input, likes: 76 },
  { persona: "detail", attack_text: SEED.detail.items[2].attack, input_summary: SEED.detail.input, likes: 64 },
  { persona: "reference", attack_text: SEED.reference.items[1].attack, input_summary: SEED.reference.input, likes: 51 },
];
