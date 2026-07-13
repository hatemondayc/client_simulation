import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({}); // reads GEMINI_API_KEY

const schema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          attack: { type: "string" },
          defense: { type: "string" },
        },
        required: ["attack", "defense"],
      },
    },
  },
  required: ["items"],
};

try {
  const t0 = Date.now();
  const r = await client.interactions.create({
    model: "gemini-3.5-flash",
    input: [
      {
        type: "text",
        text: "페르소나: 레퍼런스형 — 남의 것 들고 온다. 대행사가 가져온 시안: 생수 브랜드 리브랜딩. 공격+방어 쌍 3개 만들어라.",
      },
    ],
    system_instruction:
      "너는 한국 광고대행사 시뮬레이터다. 광고주 공격과 AE 방어 쌍을 만들어라. 출력은 JSON 스키마를 따를 것.",
    generation_config: { thinking_level: "minimal" },
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema,
    },
  });
  console.log("OK in", Date.now() - t0, "ms");
  console.log("output_text:", (r.output_text || "").slice(0, 300));
} catch (e) {
  console.error("=== ERROR ===");
  console.error("name:", e?.name);
  console.error("status:", e?.status);
  console.error("message:", e?.message);
  try {
    console.error("full:", JSON.stringify(e, Object.getOwnPropertyNames(e)).slice(0, 1200));
  } catch {}
}
