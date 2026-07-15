"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HeroDemo from "./HeroDemo";
import InputPanel from "./InputPanel";
import AttackDefense from "./AttackDefense";
import { generatePossession, type Intensity } from "@/lib/possess-client";
import { enshrineAttack } from "@/lib/hall";
import type { PersonaKey } from "@/lib/personas";
import type { QAItem } from "@/lib/seed-content";

type View = "landing" | "input" | "result";

export default function Experience() {
  const router = useRouter();
  const [view, setView] = useState<View>("landing");
  const [input, setInput] = useState("");
  const [copy, setCopy] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<Intensity>("normal");
  const [chatSample, setChatSample] = useState("");
  const [persona, setPersona] = useState<PersonaKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<QAItem[]>([]);

  const hasContent = input.trim().length > 0 || copy.trim().length > 0 || !!image;

  function summaryLabel(): string {
    return (
      input.trim() ||
      copy.trim().slice(0, 60) ||
      (image ? "이미지 시안" : "내 시안")
    );
  }

  function toTop() {
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  function goInput() {
    setView("input");
    toTop();
  }

  async function submit() {
    if (!persona || !hasContent || loading) return;
    setLoading(true);
    const result = await generatePossession({
      persona,
      input: input.trim(),
      copy: copy.trim(),
      image,
      intensity,
      chatSample: chatSample.trim(),
    });
    setItems(result.items);
    setLoading(false);
    setView("result");
    toTop();
  }

  async function handleEnshrine(item: QAItem): Promise<boolean> {
    if (!persona) return false;
    try {
      await enshrineAttack({
        persona,
        attack_text: item.attack,
        input_summary: summaryLabel(),
      });
      return true;
    } catch {
      return false;
    }
  }

  if (view === "input") {
    return (
      <section className="px-4 py-10 sm:py-16">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 className="display text-3xl sm:text-4xl">
            내 시안, <span className="text-lime">누구한테</span> 당해볼까?
          </h2>
        </div>
        <InputPanel
          input={input}
          setInput={setInput}
          copy={copy}
          setCopy={setCopy}
          image={image}
          setImage={setImage}
          intensity={intensity}
          setIntensity={setIntensity}
          chatSample={chatSample}
          setChatSample={setChatSample}
          persona={persona}
          setPersona={setPersona}
          onSubmit={submit}
          loading={loading}
        />
        <div className="mt-6 text-center">
          <button
            onClick={() => setView("landing")}
            className="text-sm text-paper/40 hover:text-paper/70"
          >
            ← 처음으로
          </button>
        </div>
      </section>
    );
  }

  if (view === "result") {
    return (
      <section className="px-4 py-10 sm:py-14">
        <AttackDefense
          items={items}
          persona={persona!}
          input={summaryLabel()}
          onEnshrine={handleEnshrine}
          onRestart={goInput}
          onOpenHall={() => router.push("/hall")}
        />
      </section>
    );
  }

  // landing
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:pt-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[440px]"
        style={{
          background:
            "radial-gradient(55% 90% at 50% 0%, rgba(199,240,58,0.16), transparent 72%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <p className="mb-4 inline-block rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-paper/60">
            광고주는 못 바꿔도, 대비는 되니까
          </p>
          <h1 className="display mx-auto max-w-3xl text-[11.5vw] leading-[0.95] sm:text-6xl md:text-7xl">
            AI가 당신 광고주로
            <br />
            <span className="text-lime">빙의</span>합니다.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-paper/60 sm:text-lg">
            시안이나 카피를 넣어보고, 광고주에게 미리 매를 맞아보세요. 그리고
            어떻게 대답하면 좋을지까지 시뮬레이션해보세요.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <HeroDemo />
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={goInput}
            className="group flex items-center gap-2 rounded-2xl bg-lime px-8 py-4 text-xl font-black text-ink shadow-xl transition-all hover:brightness-95 active:translate-y-0.5"
          >
            내 시안으로 당해보기
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
          <p className="text-xs text-paper/40">5초면 충분</p>
        </div>
      </div>
    </section>
  );
}
