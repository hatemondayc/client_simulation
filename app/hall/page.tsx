"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import HallCard from "@/components/HallCard";
import { fetchHall, type HallRow, type HallSort } from "@/lib/hall";
import { PERSONA_MAP, type PersonaKey } from "@/lib/personas";

export default function HallPage() {
  const [sort, setSort] = useState<HallSort>("likes");
  const [rows, setRows] = useState<HallRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchHall(sort).then((r) => {
      if (alive) {
        setRows(r.rows);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [sort]);

  const topPersona = useMemo<PersonaKey | null>(() => {
    if (rows.length === 0) return null;
    const counts = new Map<PersonaKey, number>();
    for (const r of rows) counts.set(r.persona, (counts.get(r.persona) ?? 0) + 1);
    let best: PersonaKey | null = null;
    let max = -1;
    for (const [k, v] of counts) {
      if (v > max) {
        max = v;
        best = k;
      }
    }
    return best;
  }, [rows]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/8 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
            <span className="text-lg">😈</span>
            <span className="text-sm sm:text-base">광고주 빙의 시뮬레이터</span>
          </Link>
          <Link
            href="/"
            className="rounded-full bg-lime px-3 py-1 text-xs font-black text-ink transition-all hover:brightness-95"
          >
            내 시안으로 당해보기 →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="mb-6 text-center">
          <h1 className="display text-4xl sm:text-5xl">🏛️ 명예의전당</h1>
          <p className="mt-3 text-paper/60">
            다들 이렇게 당했대요. “이거 완전 우리 광고주야ㅋㅋ” 싶으면 ♥ 눌러주세요.
          </p>
        </div>

        {topPersona && (
          <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-lime/30 bg-lime/10 px-5 py-4 text-center">
            <span className="text-sm text-paper/70">이번 주 최다 출몰 광고주 유형</span>
            <div className="mt-1 text-xl font-black text-lime">
              {PERSONA_MAP[topPersona].emoji} {PERSONA_MAP[topPersona].label}
            </div>
          </div>
        )}

        <div className="mb-5 flex items-center justify-center gap-2">
          {(["likes", "recent"] as HallSort[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                sort === s
                  ? "bg-paper text-ink"
                  : "border border-white/15 text-paper/60 hover:text-paper"
              }`}
            >
              {s === "likes" ? "공감순" : "최신순"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-paper/40">불러오는 중…</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <HallCard key={row.id} row={row} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-lime px-8 py-4 text-lg font-black text-ink transition-all hover:brightness-95 active:translate-y-0.5"
          >
            내 광고주도 등록하러 가기 →
          </Link>
        </div>
      </main>
    </>
  );
}
