"use client";

import { useEffect, useState } from "react";

// 사내 투표 페이지 URL이 정해지면 여기에 넣으면 "투표하러 가기" 버튼이 뜬다.
// 비어 있으면 가벼운 리마인드만.
const VOTE_URL = "";
const KEY = "vote-prompt-dismissed";

/** 결과를 한 번 본 뒤(=한 라운드 완료) 뜨는 투표 유도 플로팅. 닫으면 다시 안 뜸. */
export default function VotePrompt({ active }: { active: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!active) return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(KEY) === "1";
    } catch {
      /* localStorage 차단 환경 무시 */
    }
    if (dismissed) return;
    const t = setTimeout(() => setShow(true), 1100); // 결과 음미할 시간 준 뒤
    return () => clearTimeout(t);
  }, [active]);

  function close() {
    setShow(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-sm animate-fadeup rounded-2xl border border-lime/40 bg-ash/95 p-4 shadow-2xl shadow-black/60 backdrop-blur sm:inset-x-auto sm:right-4">
      <button
        type="button"
        onClick={close}
        aria-label="닫기"
        className="absolute right-2.5 top-2.5 text-paper/40 transition-colors hover:text-paper"
      >
        ✕
      </button>
      <p className="pr-5 text-sm font-black text-paper">😆 좀 웃기셨나요?</p>
      <p className="mt-1 text-xs leading-relaxed text-paper/65">
        재밌으셨다면, 사내 바이브코딩 투표에서{" "}
        <b className="text-lime">광고주 빙의 시뮬레이터</b> 한 표 부탁드려요!
      </p>
      {VOTE_URL ? (
        <a
          href={VOTE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
          className="mt-3 block rounded-lg bg-lime px-4 py-2 text-center text-sm font-black text-ink transition-all hover:brightness-95 active:translate-y-0.5"
        >
          🗳️ 투표하러 가기
        </a>
      ) : (
        <button
          type="button"
          onClick={close}
          className="mt-3 block w-full rounded-lg border border-white/15 px-4 py-2 text-center text-sm font-bold text-paper/80 transition-colors hover:border-lime/50 hover:text-lime"
        >
          알겠어요 👍
        </button>
      )}
    </div>
  );
}
