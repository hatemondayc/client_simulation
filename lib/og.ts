// OG 이미지(ImageResponse/Satori)용 한국어 폰트 로더.
// Satori는 기본 한국어 폰트가 없어 글리프가 깨진다 → Google Fonts에서
// 필요한 글자만 subset(&text=)해 가져온다. 실패해도 null 반환 → 라틴 폴백.

const fontCache = new Map<string, ArrayBuffer>();

export async function loadKoreanFont(
  text: string,
  weight: 400 | 700 | 900 = 900,
): Promise<ArrayBuffer | null> {
  const key = `${weight}:${text}`;
  const cached = fontCache.get(key);
  if (cached) return cached;

  try {
    const api = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}&text=${encodeURIComponent(
      text,
    )}`;
    // 모던 브라우저 UA를 보내면 woff2를 주는데 Satori가 못 읽는다.
    // non-browser UA(기본)로 요청하면 Google이 truetype(ttf)를 반환한다.
    const cssRes = await fetch(api);
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    // ttf/otf(truetype/opentype) 소스만 골라 잡는다.
    const match =
      css.match(
        /src:\s*url\((https:\/\/[^)]+)\)\s*format\('(?:truetype|opentype)'\)/,
      ) ?? css.match(/url\((https:\/\/[^)]+\.(?:ttf|otf))\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    const buf = await fontRes.arrayBuffer();
    fontCache.set(key, buf);
    return buf;
  } catch {
    return null;
  }
}

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// 팔레트 (globals.css와 동기화)
export const OG = {
  ink: "#0e0e0c",
  paper: "#f4f2ea",
  lime: "#c7f03a",
  navy: "#191c46",
};
