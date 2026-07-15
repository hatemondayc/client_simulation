import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_KR({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto",
  display: "swap",
  preload: false,
});

// OG/트위터 이미지의 절대 URL 기준. Vercel은 VERCEL_PROJECT_PRODUCTION_URL을
// 자동 주입(프로덕션 도메인, 배포마다 안정적) → 별도 env 설정 없이 공유 미리보기 동작.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "광고주 빙의 시뮬레이터",
  description:
    "“느낌이 좀 다른데…” 그 말 나오기 전에, AI가 여러분의 광고주로 빙의해 소재에 피드백을 쏟아냅니다. 어떻게 대답하면 좋을지 답까지 같이 짜드려요.",
  openGraph: {
    title: "광고주 빙의 시뮬레이터",
    description:
      "“느낌이 좀 다른데…” 그 말 나오기 전에, AI가 광고주로 빙의해 소재에 피드백을 쏟아냅니다.",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "광고주 빙의 시뮬레이터",
    description:
      "“느낌이 좀 다른데…” 그 말 나오기 전에, AI가 광고주로 빙의해 소재에 피드백을 쏟아냅니다.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0e0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={noto.variable}>
      <body className="min-h-dvh bg-ink text-paper antialiased">{children}</body>
    </html>
  );
}
