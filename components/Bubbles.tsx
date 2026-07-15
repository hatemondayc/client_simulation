import { personaEmoji } from "@/lib/personas";
import CopyButton from "./CopyButton";

/** 광고주 공격 말풍선 — 빌런 톤(네이비/잉크) */
export function AttackBubble({
  text,
  persona,
  animate = true,
  spicy = false,
  className = "",
}: {
  text: string;
  persona: string;
  animate?: boolean;
  spicy?: boolean;
  className?: string;
}) {
  const anim = animate ? (spicy ? "attack-spicy" : "animate-pop") : "";
  return (
    <div className={`flex items-start gap-2.5 ${className}`}>
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-lime/60 bg-navy text-lg">
        {personaEmoji(persona)}
      </div>
      <div
        className={`relative max-w-[88%] rounded-2xl rounded-tl-md bg-navy px-4 py-3 text-[15px] leading-relaxed text-paper shadow-lg shadow-black/40 ${anim}`}
      >
        <span className="absolute -left-1.5 top-3 size-3 rotate-45 bg-navy" />
        {text}
      </div>
    </div>
  );
}

/** 방어 카드 — 히어로 톤(페이퍼/라임) */
export function DefenseCard({
  text,
  animate = true,
  delay = 0,
  copyable = false,
  className = "",
}: {
  text: string;
  animate?: boolean;
  delay?: number;
  copyable?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-black/5 border-l-4 border-l-lime bg-paper px-4 py-3 text-ink shadow-lg shadow-black/30 ${
        animate ? "animate-fadeup" : ""
      } ${className}`}
      style={animate && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-limedeep">
          <span aria-hidden>🛡️</span> 이렇게 대답해보세요
        </span>
        {copyable && <CopyButton text={text} />}
      </div>
      <p className="text-[15px] leading-relaxed">{text}</p>
    </div>
  );
}
