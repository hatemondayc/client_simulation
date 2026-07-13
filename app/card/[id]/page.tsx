import Link from "next/link";
import type { Metadata } from "next";
import { fetchCard } from "@/lib/hall";
import { personaLabel } from "@/lib/personas";
import HallCard from "@/components/HallCard";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const card = await fetchCard(id);
  if (!card) {
    return {
      title: "광고주 빙의 시뮬레이터",
      description: "AI가 당신 광고주로 빙의해서 시안에 트집을 잡습니다.",
    };
  }
  const title = `“${card.attack_text}” — ${personaLabel(card.persona)}`;
  const description = "AI가 당신 광고주로 빙의합니다. 나도 당해보기 →";
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CardPage({ params }: Params) {
  const { id } = await params;
  const card = await fetchCard(id);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/8 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
            <span className="text-lg">😈</span>
            <span className="text-sm sm:text-base">광고주 빙의 시뮬레이터</span>
          </Link>
          <Link
            href="/hall"
            className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-paper/80 transition-colors hover:border-lime/60 hover:text-lime"
          >
            🏛️ 명예의전당
          </Link>
        </div>
      </header>

      <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-4 py-12">
        <div className="mb-6 text-center">
          <span className="rounded-full bg-lime/15 px-3 py-1 text-sm font-bold text-lime">
            🏛️ 명예의전당 박제
          </span>
          <h1 className="display mt-4 text-3xl sm:text-4xl">
            이 광고주, <span className="text-lime">우리 회사에도</span> 있다.
          </h1>
        </div>

        {card ? (
          <HallCard row={card} featured />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-ash/40 p-8 text-center text-paper/60">
            앗, 이 박제 카드를 찾을 수 없어요. 대신 직접 한번 당해보실래요?
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-lime px-8 py-4 text-xl font-black text-ink transition-all hover:brightness-95 active:translate-y-0.5"
          >
            나도 당해보기 →
          </Link>
          <Link href="/hall" className="text-sm text-paper/40 hover:text-paper/70">
            명예의전당 더 보기
          </Link>
        </div>
      </main>
    </>
  );
}
