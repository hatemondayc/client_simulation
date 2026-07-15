"use client";

import { useState } from "react";

/** 방어 멘트 등 텍스트 복사 버튼. paper 카드 위에 얹는 다크 톤. */
export default function CopyButton({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 클립보드 API가 막힌 환경 폴백: 임시 textarea + execCommand
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        return;
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="방어 멘트 복사"
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
        copied
          ? "bg-limedeep/15 text-limedeep"
          : "text-ink/45 hover:bg-ink/5 hover:text-ink/75"
      } ${className}`}
    >
      {copied ? "✓ 복사됨" : "📋 복사"}
    </button>
  );
}
