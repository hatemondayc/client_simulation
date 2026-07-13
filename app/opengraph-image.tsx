import { ImageResponse } from "next/og";
import { loadKoreanFont, OG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "광고주 빙의 시뮬레이터 — AI가 당신 광고주로 빙의합니다";

const KICKER = "이노션 바이브코딩 출품작";
const LINE1 = "AI가 당신 광고주로";
const LIME = "빙의";
const LINE2_REST = "합니다";
const BUBBLE = "제가 좋다고 했는데 위에서 빨간색 빼래요";
const ATTR = "— 우리 광고주";
const FOOTER = "광고주 빙의 시뮬레이터";

export default async function Image() {
  const allText =
    KICKER + LINE1 + LIME + LINE2_REST + BUBBLE + ATTR + FOOTER;
  const font = await loadKoreanFont(allText, 900);

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
            top: -160,
            right: -120,
            width: 460,
            height: 460,
            borderRadius: 9999,
            backgroundColor: OG.lime,
            opacity: 0.16,
            display: "flex",
          }}
        />

        <div style={{ display: "flex" }}>
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
            {KICKER}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", fontSize: 92, letterSpacing: -4, lineHeight: 1.02 }}>
            {LINE1}
          </div>
          <div style={{ display: "flex", fontSize: 92, letterSpacing: -4, lineHeight: 1.02 }}>
            <span style={{ color: OG.lime }}>{LIME}</span>
            <span>{LINE2_REST}</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 30,
              maxWidth: 900,
              backgroundColor: OG.navy,
              borderLeft: `10px solid ${OG.lime}`,
              borderRadius: 20,
              padding: "26px 32px",
            }}
          >
            <div style={{ display: "flex", fontSize: 40, color: OG.paper, lineHeight: 1.25 }}>
              “{BUBBLE}”
            </div>
            <div style={{ display: "flex", fontSize: 24, color: "#a7a9c0", marginTop: 10 }}>
              {ATTR}
            </div>
          </div>
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
