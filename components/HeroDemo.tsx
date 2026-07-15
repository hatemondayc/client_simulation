"use client";

import { useEffect, useRef, useState } from "react";
import MockBanner from "./MockBanner";
import { AttackBubble, DefenseCard } from "./Bubbles";
import { HERO_SCENARIO } from "@/lib/seed-content";
import { PERSONA_MAP } from "@/lib/personas";

const DEMO_ITEMS = HERO_SCENARIO.items.slice(0, 3);
const PERSONA = PERSONA_MAP[HERO_SCENARIO.persona];
const INPUT = HERO_SCENARIO.input;

const TYPING_MS = 900;
const HOLD_MS = 2900;

// 광고주 "입력 중…" 말풍선 (톡 느낌)
function TypingBubble() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-lime/60 bg-navy text-lg">
        {PERSONA.emoji}
      </div>
      <div className="relative rounded-2xl rounded-tl-md bg-navy px-4 py-3.5 shadow-lg shadow-black/40">
        <span className="absolute -left-1.5 top-3 size-3 rotate-45 bg-navy" />
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-bounce rounded-full bg-paper/60"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

export default function HeroDemo() {
  const [typed, setTyped] = useState(0);
  const [started, setStarted] = useState(false);
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<"typing" | "reveal">("typing");
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduce.current) {
      setTyped(INPUT.length);
      setStarted(true);
      setPhase("reveal");
    }
  }, []);

  // 좌측 기획 한 줄 타이핑 (1회)
  useEffect(() => {
    if (reduce.current) return;
    let i = 0;
    const typing = setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= INPUT.length) clearInterval(typing);
    }, 55);
    const startTimer = setTimeout(
      () => setStarted(true),
      INPUT.length * 55 + 400,
    );
    return () => {
      clearInterval(typing);
      clearTimeout(startTimer);
    };
  }, []);

  // 톡 사이클: 입력중(typing) → 공격·방어 pop(reveal) → 다음 쌍
  useEffect(() => {
    if (reduce.current || !started) return;
    setPhase("typing");
    const t1 = setTimeout(() => setPhase("reveal"), TYPING_MS);
    const t2 = setTimeout(
      () => setActive((a) => (a + 1) % DEMO_ITEMS.length),
      TYPING_MS + HOLD_MS,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [started, active]);

  const typingDone = typed >= INPUT.length;
  const it = DEMO_ITEMS[active];

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

        {/* 우: 빙의 스트림 — 톡처럼 한 쌍씩, 박스 높이는 사이저로 고정 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-paper/50">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-2 animate-ping rounded-full bg-lime opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-lime" />
            </span>
            광고주 빙의 중
          </div>

          {!started ? (
            <div className="text-sm text-paper/40">시안을 째려보는 중…</div>
          ) : (
            <>
              <div className="relative">
                {/* 사이저: 3쌍 겹쳐 렌더(안 보임) → 컨테이너 높이를 최대 쌍에 고정 */}
                <div className="invisible grid" aria-hidden>
                  {DEMO_ITEMS.map((p, i) => (
                    <div
                      key={i}
                      className="col-start-1 row-start-1 flex flex-col gap-2"
                    >
                      <AttackBubble text={p.attack} persona={PERSONA.key} animate={false} />
                      <DefenseCard text={p.defense} animate={false} />
                    </div>
                  ))}
                </div>

                {/* 실제 표시: 현재 쌍만, 입력중 → pop */}
                <div className="absolute inset-0 flex flex-col gap-2">
                  {phase === "typing" ? (
                    <TypingBubble />
                  ) : (
                    <>
                      <AttackBubble text={it.attack} persona={PERSONA.key} />
                      <DefenseCard text={it.defense} delay={reduce.current ? 0 : 450} />
                    </>
                  )}
                </div>
              </div>

              {/* 진행 도트 */}
              <div className="flex items-center gap-1.5">
                {DEMO_ITEMS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === active ? "w-4 bg-lime" : "w-1.5 bg-white/25"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
