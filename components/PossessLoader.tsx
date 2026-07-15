"use client";

import { useEffect, useState } from "react";
import { PERSONA_MAP, type PersonaKey } from "@/lib/personas";

const STEPS = [
  "광고주 접속 중…",
  "시안 째려보는 중…",
  "트집 고르는 중…",
  "받아칠 논리 짜는 중…",
];

/** 제출~결과 사이 전체화면 '빙의' 연출. 페르소나 이모지가 커지고 멘트가 넘어간다. */
export default function PossessLoader({
  persona,
}: {
  persona: PersonaKey | null;
}) {
  const [step, setStep] = useState(0);
  const emoji = persona ? PERSONA_MAP[persona].emoji : "😈";
  const label = persona ? PERSONA_MAP[persona].label : "광고주";

  useEffect(() => {
    const t = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      850,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 bg-ink/95 px-6 backdrop-blur-sm">
      <div className="relative flex size-32 items-center justify-center">
        <span className="absolute inline-flex size-28 animate-ping rounded-full bg-lime/20" />
        <span className="absolute size-24 rounded-full border border-lime/25" />
        <span className="animate-breathe text-7xl">{emoji}</span>
      </div>

      <div className="text-center">
        <p className="text-sm font-bold text-lime">{label}</p>
        <p className="mt-1.5 text-lg font-black text-paper">{STEPS[step]}</p>
      </div>

      <div className="flex items-center gap-1.5">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= step ? "w-6 bg-lime" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
