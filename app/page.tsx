import Link from "next/link";
import Experience from "@/components/Experience";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/8 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-black tracking-tight"
          >
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

      <main>
        <Experience />
      </main>

      <footer className="border-t border-white/8 px-4 py-8 text-center text-xs text-paper/35">
        <p className="text-sm font-bold text-paper/75">
          광고주는 못 바꿔도, 대비는 되잖아요.
        </p>
        <p className="mt-1.5">나오는 광고주는 전부 가상 인물입니다.</p>
        <p className="mt-4 text-paper/30">
          AI 응답은 Groq · Llama 4 Scout로 생성됩니다
        </p>
        <p className="mt-1 select-all text-ink">
          디지털이니셔티브팀 오원기 시니어매니저 제작
        </p>
      </footer>
    </>
  );
}
