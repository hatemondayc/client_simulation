import { fallbackFor, type QAItem } from "./seed-content";
import type { PersonaKey } from "./personas";

export interface PossessResult {
  items: QAItem[];
  source: "ai" | "fallback";
}

/**
 * /api/possess 를 호출해 공격+방어 쌍을 받는다.
 * 실패·타임아웃·빈 응답이면 seed 폴백으로 graceful degrade → 앱은 절대 안 죽는다.
 */
export async function generatePossession(
  persona: PersonaKey,
  input: string,
): Promise<PossessResult> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 25000);
    const res = await fetch("/api/possess", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ persona, input }),
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as { items?: QAItem[] };
    const items = (data.items ?? []).filter(
      (it) => it && typeof it.attack === "string" && typeof it.defense === "string",
    );
    if (items.length === 0) throw new Error("empty");
    return { items: items.slice(0, 5), source: "ai" };
  } catch {
    return { items: fallbackFor(persona), source: "fallback" };
  }
}
