import { ImageResponse } from "next/og";
import { loadKoreanFont, OG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { fetchCard } from "@/lib/hall";
import { personaLabel } from "@/lib/personas";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "명예의전당 — 광고주 빙의 시뮬레이터";

const BADGE = "명예의전당";
const FOOTER = "광고주 빙의 시뮬레이터 · 나도 당해보기";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await fetchCard(id);
  const persona = card ? personaLabel(card.persona) : "우리 광고주";
  const quote = card?.attack_text ?? "AI가 여러분의 광고주로 빙의합니다";

  const font = await loadKoreanFont(BADGE + persona + quote + FOOTER, 900);
  const quoteSize = quote.length > 40 ? 48 : quote.length > 24 ? 60 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 68,
          backgroundColor: OG.ink,
          color: OG.paper,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -120,
            width: 460,
            height: 460,
            borderRadius: 9999,
            backgroundColor: OG.lime,
            opacity: 0.14,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", gap: 12 }}>
          <div
            style={{
              display: "flex",
              backgroundColor: OG.lime,
              color: OG.ink,
              fontSize: 26,
              fontWeight: 900,
              padding: "8px 20px",
              borderRadius: 9999,
            }}
          >
            {BADGE}
          </div>
          <div
            style={{
              display: "flex",
              border: `2px solid ${OG.lime}`,
              color: OG.lime,
              fontSize: 26,
              fontWeight: 900,
              padding: "8px 20px",
              borderRadius: 9999,
            }}
          >
            {persona}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: quoteSize,
            fontWeight: 900,
            letterSpacing: -2,
            lineHeight: 1.22,
            maxWidth: 1050,
          }}
        >
          “{quote}”
        </div>

        <div style={{ display: "flex", alignItems: "center", fontSize: 30, fontWeight: 900 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 9999,
              backgroundColor: OG.lime,
              marginRight: 14,
              display: "flex",
            }}
          />
          {FOOTER}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "NotoKR", data: font, weight: 900 as const, style: "normal" as const }]
        : [],
    },
  );
}
