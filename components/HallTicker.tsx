import Link from "next/link";
import { SEED_FEED } from "@/lib/seed-content";
import { personaEmoji } from "@/lib/personas";

const QUOTES = SEED_FEED.map((c) => ({
  emoji: personaEmoji(c.persona),
  text: c.attack_text,
}));

/** 랜딩 하단 명예의전당 어록 티커(무한 마퀴). 클릭 시 명예의전당으로. */
export default function HallTicker() {
  const row = [...QUOTES, ...QUOTES]; // 이음새 없이 흐르게 1회 복제
  return (
    <Link
      href="/hall"
      aria-label="명예의전당 어록 보러가기"
      className="group block select-none"
    >
      <div className="relative overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused]">
          {row.map((q, i) => (
            <span
              key={i}
              className="flex items-center gap-2 whitespace-nowrap text-sm"
            >
              <span className="text-base">{q.emoji}</span>
              <span className="text-paper/55 transition-colors group-hover:text-paper/80">
                “{q.text}”
              </span>
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
