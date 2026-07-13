import { ImageResponse } from "next/og";
import { loadKoreanFont, OG } from "@/lib/og";

// 브라우저 탭 파비콘 — 라임 배경 + 잉크 "빙" (브랜드 훅 '빙의')
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const font = await loadKoreanFont("빙", 900);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: OG.lime,
          color: OG.ink,
          fontSize: 46,
          fontWeight: 900,
        }}
      >
        빙
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
