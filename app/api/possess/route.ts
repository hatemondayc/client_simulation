import { NextResponse } from "next/server";
import { generateFeedback, hasAnthropic } from "@/lib/anthropic";
import { isPersonaKey } from "@/lib/personas";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * AI 프록시 — 클라이언트에서 직접 Anthropic을 부르지 않고 이 라우트가 대신 호출한다.
 * ANTHROPIC_API_KEY 는 서버 env 에만 존재하며 브라우저로 나가지 않는다.
 * 실패 시 non-200 → 클라이언트는 seed 폴백으로 graceful degrade.
 */
export async function POST(req: Request) {
  if (!hasAnthropic) {
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }

  const { persona, input } = (body ?? {}) as {
    persona?: string;
    input?: string;
  };

  if (!isPersonaKey(persona) || typeof input !== "string" || !input.trim()) {
    return NextResponse.json({ error: "invalid-input" }, { status: 400 });
  }

  try {
    const items = await generateFeedback(persona, input.trim().slice(0, 200));
    return NextResponse.json({ items });
  } catch (e) {
    console.error("[/api/possess] generation failed:", e);
    return NextResponse.json({ error: "generation-failed" }, { status: 502 });
  }
}
