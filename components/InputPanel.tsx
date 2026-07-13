"use client";

import PersonaPicker from "./PersonaPicker";
import type { PersonaKey } from "@/lib/personas";

const EXAMPLES = [
  "여름 세일 배너 (메인 레드)",
  "신규 카페 인스타 런칭 콘텐츠",
  "가전 신제품 런칭 영상 기획",
  "앱 온보딩 화면 리뉴얼",
  "생수 브랜드 리브랜딩",
];

export default function InputPanel({
  input,
  setInput,
  persona,
  setPersona,
  onSubmit,
  loading,
}: {
  input: string;
  setInput: (v: string) => void;
  persona: PersonaKey | null;
  setPersona: (k: PersonaKey) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const ready = input.trim().length > 0 && !!persona && !loading;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-3xl border border-white/10 bg-ash/40 p-5 shadow-2xl shadow-black/50 sm:p-7">
        <label className="mb-2 block text-sm font-bold text-paper/70">
          1. 어떤 시안·기획이에요?
        </label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && ready) onSubmit();
          }}
          maxLength={80}
          placeholder="예: 여름 세일 배너 (메인 레드)"
          className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-base text-paper outline-none placeholder:text-paper/30 focus:border-lime"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setInput(ex)}
              className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-paper/70 transition-colors hover:border-lime/60 hover:text-lime"
            >
              {ex}
            </button>
          ))}
        </div>

        <label className="mb-2 mt-6 block text-sm font-bold text-paper/70">
          2. 어떤 광고주로 빙의시킬까요?
        </label>
        <PersonaPicker value={persona} onChange={setPersona} />

        <button
          type="button"
          onClick={onSubmit}
          disabled={!ready}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-6 py-4 text-lg font-black text-ink transition-all hover:brightness-95 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
              빙의하는 중…
            </>
          ) : (
            <>😈 빙의 시작</>
          )}
        </button>
      </div>
    </div>
  );
}
