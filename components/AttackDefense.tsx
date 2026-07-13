"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AttackBubble, DefenseCard } from "./Bubbles";
import { PERSONA_MAP, type PersonaKey } from "@/lib/personas";
import type { QAItem } from "@/lib/seed-content";

type EnshrineState = "idle" | "saving" | "done" | "error";

export default function AttackDefense({
  items,
  persona,
  input,
  onEnshrine,
  onRestart,
  onOpenHall,
}: {
  items: QAItem[];
  persona: PersonaKey;
  input: string;
  /** 박제 실행 — 성공 시 true 반환 */
  onEnshrine: (item: QAItem, index: number) => Promise<boolean>;
  onRestart: () => void;
  onOpenHall: () => void;
}) {
  const p = PERSONA_MAP[persona];
  const [revealed, setRevealed] = useState(0);
  const [states, setStates] = useState<Record<number, EnshrineState>>({});
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduce.current) {
      setRevealed(items.length);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    items.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealed(i + 1), 300 + i * 850));
    });
    return () => timers.forEach(clearTimeout);
  }, [items]);

  async function enshrine(item: QAItem, index: number) {
    if (states[index] === "saving" || states[index] === "done") return;
    setStates((s) => ({ ...s, [index]: "saving" }));
    try {
      const ok = await onEnshrine(item, index);
      setStates((s) => ({ ...s, [index]: ok ? "done" : "error" }));
    } catch {
      setStates((s) => ({ ...s, [index]: "error" }));
    }
  }

  const shown = items.slice(0, revealed);

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* 헤더 */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/40 bg-lime/10 px-3 py-1 text-sm font-bold text-lime">
          <span className="text-base">{p.emoji}</span> {p.label}
        </span>
        <span className="text-paper/40">가</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-paper/80">
          “{input}”
        </span>
        <span className="text-paper/40">보고 빙의했어요</span>
      </div>

      {/* 공격/방어 그리드 */}
      <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
        <div className="hidden text-xs font-bold uppercase tracking-widest text-paper/40 md:block">
          🗣️ 광고주가 이럽니다
        </div>
        <div className="hidden text-xs font-bold uppercase tracking-widest text-paper/40 md:block">
          🛡️ 이렇게 받아치세요
        </div>

        {shown.map((it, i) => {
          const st = states[i] ?? "idle";
          return (
            <Fragment key={i}>
              <div className="flex flex-col gap-2">
                <AttackBubble text={it.attack} persona={persona} />
                <div className="pl-[46px]">
                  <button
                    type="button"
                    onClick={() => enshrine(it, i)}
                    disabled={st === "saving" || st === "done"}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                      st === "done"
                        ? "cursor-default border-lime bg-lime/15 text-lime"
                        : "border-white/15 bg-white/5 text-paper/70 hover:border-lime/60 hover:text-lime"
                    }`}
                  >
                    {st === "saving" && (
                      <span className="size-3 animate-spin rounded-full border-2 border-paper/30 border-t-lime" />
                    )}
                    {st === "done"
                      ? "🏛️ 명예의전당에 박제 완료 ✓"
                      : st === "error"
                        ? "⚠️ 앗, 다시 눌러주세요"
                        : "🏛️ 이 말 박제하기"}
                  </button>
                </div>
              </div>
              <DefenseCard text={it.defense} delay={reduce.current ? 0 : 400} />
            </Fragment>
          );
        })}
      </div>

      {/* 액션 */}
      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRestart}
          className="w-full rounded-xl border border-white/20 px-6 py-3 font-bold text-paper transition-colors hover:bg-white/10 sm:w-auto"
        >
          ↺ 다른 시안으로 또 당해보기
        </button>
        <button
          type="button"
          onClick={onOpenHall}
          className="w-full rounded-xl bg-lime px-6 py-3 font-black text-ink transition-all hover:brightness-95 active:translate-y-0.5 sm:w-auto"
        >
          🏛️ 명예의전당 구경하기
        </button>
      </div>
    </div>
  );
}
