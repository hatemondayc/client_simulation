"use client";

import { useEffect, useRef, useState } from "react";
import MockBanner from "./MockBanner";
import { AttackBubble, DefenseCard } from "./Bubbles";
import { HERO_SCENARIO } from "@/lib/seed-content";
import { PERSONA_MAP } from "@/lib/personas";

const DEMO_ITEMS = HERO_SCENARIO.items.slice(0, 3);
const PERSONA = PERSONA_MAP[HERO_SCENARIO.persona];
const INPUT = HERO_SCENARIO.input;

export default function HeroDemo() {
  const [typed, setTyped] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [run, setRun] = useState(0);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduce.current) {
      setTyped(INPUT.length);
      setRevealed(DEMO_ITEMS.length);
    }
  }, []);

  useEffect(() => {
    if (reduce.current) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    setTyped(0);
    setRevealed(0);

    let i = 0;
    const typing = setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= INPUT.length) clearInterval(typing);
    }, 55);

    const typeDur = INPUT.length * 55 + 400;
    DEMO_ITEMS.forEach((_, idx) => {
      timers.push(
        setTimeout(() => setRevealed(idx + 1), typeDur + idx * 1350),
      );
    });
    const total = typeDur + DEMO_ITEMS.length * 1350 + 3400;
    timers.push(setTimeout(() => setRun((r) => r + 1), total));

    return () => {
      clearInterval(typing);
      timers.forEach(clearTimeout);
    };
  }, [run]);

  const typingDone = typed >= INPUT.length;

  return (
    <div className="rounded-3xl border border-white/10 bg-ash/40 p-3 shadow-2xl shadow-black/50 sm:p-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* 좌: 시안 + 입력 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-bold tracking-wide text-paper/70">
              내 시안
            </span>
            <span className="text-[11px] text-paper/40">demo.png</span>
          </div>
          <MockBanner />
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <span className="text-lg">{PERSONA.emoji}</span>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-lime">
                {PERSONA.label}
              </div>
              <div className="truncate text-[11px] text-paper/50">
                {PERSONA.tagline}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm">
            <span className="text-paper/40">기획 한 줄&nbsp;</span>
            <span className={!typingDone ? "caret" : ""}>
              {INPUT.slice(0, typed)}
            </span>
          </div>
        </div>

        {/* 우: 빙의 스트림 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-paper/50">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-2 animate-ping rounded-full bg-lime opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-lime" />
            </span>
            광고주 빙의 중
          </div>

          <div className="flex flex-col gap-3">
            {revealed === 0 && (
              <div className="text-sm text-paper/40">
                시안을 째려보는 중…
              </div>
            )}
            {DEMO_ITEMS.slice(0, revealed).map((it, i) => (
              <div key={`${run}-${i}`} className="flex flex-col gap-2">
                <AttackBubble text={it.attack} persona={PERSONA.key} />
                <DefenseCard text={it.defense} delay={500} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
