import { NextResponse } from "next/server";
import {
  generateFeedback,
  hasAI,
  type ImageInput,
  type ImageMediaType,
  type Intensity,
} from "@/lib/groq";
import { isPersonaKey } from "@/lib/personas";

export const runtime = "nodejs";
export const maxDuration = 60;

const INTENSITIES: Intensity[] = ["mild", "normal", "spicy"];
// data:image/(png|jpeg|webp|gif);base64,<data>
const DATA_URL_RE = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/;
const MAX_IMAGE_B64 = 5_000_000; // ~3.7MB 원본 (Vercel 4.5MB 본문 한도 대비 여유)

/**
 * AI 프록시 — 클라이언트가 직접 Groq를 부르지 않고 이 라우트가 대신 호출한다.
 * GROQ_API_KEY 는 서버 env 에만 존재. 실패 시 non-200 → 클라 seed 폴백.
 */
export async function POST(req: Request) {
  if (!hasAI) {
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }

  const {
    persona,
    brand,
    input,
    copy,
    intensity,
    image,
    chatSample,
  } = (body ?? {}) as {
    persona?: string;
    brand?: string;
    input?: string;
    copy?: string;
    intensity?: string;
    image?: string;
    chatSample?: string;
  };

  if (!isPersonaKey(persona)) {
    return NextResponse.json({ error: "invalid-persona" }, { status: 400 });
  }

  const cleanBrand = typeof brand === "string" ? brand.trim().slice(0, 40) : "";
  const cleanInput = typeof input === "string" ? input.trim().slice(0, 200) : "";
  const cleanCopy = typeof copy === "string" ? copy.trim().slice(0, 1000) : "";
  // 광고주 말투 샘플: 저장하지 않고 프롬프트에만 사용, 1500자 컷
  const cleanChat =
    typeof chatSample === "string" ? chatSample.trim().slice(0, 1500) : "";
  const level: Intensity = INTENSITIES.includes(intensity as Intensity)
    ? (intensity as Intensity)
    : "normal";

  let img: ImageInput | null = null;
  if (typeof image === "string" && image.startsWith("data:")) {
    const m = image.match(DATA_URL_RE);
    if (m && m[2].length <= MAX_IMAGE_B64) {
      img = { media_type: m[1] as ImageMediaType, data: m[2] };
    } else {
      return NextResponse.json(
        { error: "image-invalid-or-too-large" },
        { status: 400 },
      );
    }
  }

  if (!cleanInput && !cleanCopy && !img) {
    return NextResponse.json({ error: "empty-input" }, { status: 400 });
  }

  try {
    const items = await generateFeedback({
      persona,
      brand: cleanBrand,
      input: cleanInput,
      copy: cleanCopy,
      image: img,
      intensity: level,
      chatSample: cleanChat,
    });
    return NextResponse.json({ items });
  } catch (e) {
    console.error("[/api/possess] generation failed:", e);
    return NextResponse.json(
      {
        error: "generation-failed",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 502 },
    );
  }
}
