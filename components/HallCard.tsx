"use client";

import { useEffect, useState } from "react";
import { PERSONA_MAP } from "@/lib/personas";
import { likeCard, type HallRow } from "@/lib/hall";

export default function HallCard({
  row,
  featured = false,
}: {
  row: HallRow;
  featured?: boolean;
}) {
  const p = PERSONA_MAP[row.persona];
  const [likes, setLikes] = useState(row.likes);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(`liked:${row.id}`) === "1");
    } catch {
      /* localStorage 차단 환경 무시 */
    }
  }, [row.id]);

  async function like() {
    if (liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    try {
      localStorage.setItem(`liked:${row.id}`, "1");
    } catch {}
    const ok = await likeCard(row.id);
    if (!ok) {
      setLiked(false);
      setLikes((n) => n - 1);
      try {
        localStorage.removeItem(`liked:${row.id}`);
      } catch {}
    }
  }

  async function share() {
    const url = `${window.location.origin}/card/${row.id}`;
    const text = `이거 완전 우리 광고주야ㅋㅋ “${row.attack_text}”`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "광고주 빙의 시뮬레이터", text, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      /* 사용자가 공유 취소 등 — 무시 */
    }
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-white/10 bg-ash/40 p-4 ${
        featured ? "sm:p-6" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{p?.emoji ?? "🗣️"}</span>
        <span className="rounded-full bg-lime/15 px-2.5 py-0.5 text-xs font-bold text-lime">
          {p?.label ?? row.persona}
        </span>
      </div>

      <p
        className={`font-bold leading-relaxed text-paper ${
          featured ? "text-xl sm:text-2xl" : "text-[15px]"
        }`}
      >
        “{row.attack_text}”
      </p>

      {row.input_summary && (
        <p className="text-xs text-paper/40">시안: {row.input_summary}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={like}
          disabled={liked}
          aria-label="공감"
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold transition-all ${
            liked
              ? "cursor-default border-lime/50 bg-lime/15 text-lime"
              : "border-white/15 text-paper/70 hover:border-lime/60 hover:text-lime active:scale-95"
          }`}
        >
          <span className="text-base">{liked ? "♥" : "♡"}</span>
          {likes}
        </button>

        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-sm font-bold text-paper/70 transition-colors hover:border-lime/60 hover:text-lime active:scale-95"
        >
          {copied ? "링크 복사됨 ✓" : "공유"}
        </button>
      </div>
    </div>
  );
}
