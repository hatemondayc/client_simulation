"use client";

import { PERSONAS, type PersonaKey } from "@/lib/personas";

export default function PersonaPicker({
  value,
  onChange,
}: {
  value: PersonaKey | null;
  onChange: (key: PersonaKey) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {PERSONAS.map((p) => {
        const active = value === p.key;
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => onChange(p.key)}
            aria-pressed={active}
            className={`group flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-all ${
              active
                ? "border-lime bg-lime/15 ring-2 ring-lime"
                : "border-white/12 bg-white/5 hover:border-white/30 hover:bg-white/10"
            }`}
          >
            <span className="text-2xl">{p.emoji}</span>
            <span
              className={`text-sm font-extrabold leading-tight ${
                active ? "text-lime" : "text-paper"
              }`}
            >
              {p.label}
            </span>
            <span className="text-[11px] leading-snug text-paper/55">
              {p.tagline}
            </span>
          </button>
        );
      })}
    </div>
  );
}
