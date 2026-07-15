"use client";

import { useRef, useState } from "react";
import PersonaPicker from "./PersonaPicker";
import type { PersonaKey } from "@/lib/personas";
import type { Intensity } from "@/lib/possess-client";

const EXAMPLES = [
  "여름 세일 배너 (메인 레드)",
  "신규 카페 인스타 런칭 콘텐츠",
  "가전 신제품 런칭 영상 기획",
  "앱 온보딩 화면 리뉴얼",
  "생수 브랜드 리브랜딩",
];

const LEVELS: { key: Intensity; label: string; emoji: string; desc: string }[] = [
  { key: "mild", label: "순한맛", emoji: "🥛", desc: "부드럽게" },
  { key: "normal", label: "보통", emoji: "🙂", desc: "현실적으로" },
  { key: "spicy", label: "매운맛", emoji: "🌶️", desc: "집요하게" },
];

export type SourceMode = "copy" | "image";

// 브라우저에서 이미지를 긴 변 기준 축소 + jpeg 인코딩 → 전송 용량·비전 비용 절감
function downscaleToDataUrl(file: File, maxDim = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("no-canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("img-load-failed"));
    };
    img.src = url;
  });
}

export default function InputPanel({
  brand,
  setBrand,
  input,
  setInput,
  copy,
  setCopy,
  image,
  setImage,
  sourceMode,
  setSourceMode,
  intensity,
  setIntensity,
  chatSample,
  setChatSample,
  persona,
  setPersona,
  onSubmit,
  loading,
}: {
  brand: string;
  setBrand: (v: string) => void;
  input: string;
  setInput: (v: string) => void;
  copy: string;
  setCopy: (v: string) => void;
  image: string | null;
  setImage: (v: string | null) => void;
  sourceMode: SourceMode;
  setSourceMode: (v: SourceMode) => void;
  intensity: Intensity;
  setIntensity: (v: Intensity) => void;
  chatSample: string;
  setChatSample: (v: string) => void;
  persona: PersonaKey | null;
  setPersona: (k: PersonaKey) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imgBusy, setImgBusy] = useState(false);
  const activeSource =
    sourceMode === "copy" ? copy.trim().length > 0 : !!image;
  const hasContent = input.trim().length > 0 || activeSource;
  const ready = hasContent && !!persona && !loading;

  async function onFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setImgBusy(true);
    try {
      setImage(await downscaleToDataUrl(file));
    } catch {
      /* 무시 */
    } finally {
      setImgBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-3xl border border-white/10 bg-ash/40 p-5 shadow-2xl shadow-black/50 sm:p-7">
        {/* 1. 브랜드 */}
        <label className="mb-2 block text-sm font-bold text-paper/70">
          1. 어떤 브랜드예요?{" "}
          <span className="font-normal text-paper/40">
            (선택 · 업종 느낌만 참고해요)
          </span>
        </label>
        <input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          maxLength={40}
          placeholder="예: 현대자동차"
          className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-base text-paper outline-none placeholder:text-paper/30 focus:border-lime"
        />

        {/* 2. 시안/기획 */}
        <label className="mb-2 mt-6 block text-sm font-bold text-paper/70">
          2. 어떤 시안·기획이에요?
        </label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && ready) onSubmit();
          }}
          maxLength={80}
          placeholder="예: 여름 세일 배너 (메인 레드)"
          className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-base text-paper outline-none placeholder:text-paper/30 focus:border-lime"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setInput(ex)}
              className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-paper/70 transition-colors hover:border-lime/60 hover:text-lime"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* 3. 실제 소재 — 카피 or 이미지 택1 */}
        <div className="mb-2 mt-6 flex items-center justify-between gap-2">
          <label className="block text-sm font-bold text-paper/70">
            3. 실제 소재도 넣기{" "}
            <span className="font-normal text-paper/40">(선택)</span>
          </label>
          <div className="inline-flex rounded-lg border border-white/12 bg-black/30 p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSourceMode("copy")}
              className={`rounded-md px-3 py-1 transition-colors ${
                sourceMode === "copy"
                  ? "bg-lime text-ink"
                  : "text-paper/60 hover:text-paper"
              }`}
            >
              ✏️ 카피
            </button>
            <button
              type="button"
              onClick={() => setSourceMode("image")}
              className={`rounded-md px-3 py-1 transition-colors ${
                sourceMode === "image"
                  ? "bg-lime text-ink"
                  : "text-paper/60 hover:text-paper"
              }`}
            >
              🖼️ 이미지
            </button>
          </div>
        </div>

        {sourceMode === "copy" ? (
          <>
            <p className="mb-2 text-xs text-paper/40">
              실제 광고 문구를 붙여넣으면 그 문구를 물고 늘어져요.
            </p>
            <textarea
              value={copy}
              onChange={(e) => setCopy(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder={"예)\n메인카피: 이번 여름, 가장 시원한 선택\n서브: 최대 50% 할인"}
              className="w-full resize-y rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-paper outline-none placeholder:text-paper/25 focus:border-lime"
            />
          </>
        ) : (
          <>
            <p className="mb-2 text-xs text-paper/40">
              시안 이미지를 올리면 AI가 그림을 직접 보고 지적해요.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            {image ? (
              <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-black/30 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="업로드한 시안"
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div className="flex-1 text-sm text-paper/60">시안 이미지 첨부됨</div>
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-paper/70 hover:border-red-400/60 hover:text-red-300"
                >
                  제거 ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={imgBusy}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-4 text-sm text-paper/60 transition-colors hover:border-lime/50 hover:text-lime disabled:opacity-50"
              >
                {imgBusy ? "이미지 처리 중…" : "📎 이미지 선택 (PNG/JPG)"}
              </button>
            )}
          </>
        )}

        {/* 광고주 말투 입히기 (선택, 접이식) */}
        <details className="group mt-6 rounded-xl border border-white/12 bg-black/20">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold text-paper/70 [&::-webkit-details-marker]:hidden">
            <span>
              💬 우리 광고주로 빙의하기{" "}
              <span className="font-normal text-paper/40">(선택)</span>
            </span>
            <span className="text-paper/40 transition-transform group-open:rotate-180">
              ▾
            </span>
          </summary>
          <div className="border-t border-white/10 px-4 py-3">
            <p className="mb-2 text-xs text-paper/50">
              광고주와 주고받은 카톡·메일을 넣으면, 그 말투를 학습해서
              피드백해드려요.
            </p>
            <textarea
              value={chatSample}
              onChange={(e) => setChatSample(e.target.value)}
              maxLength={1500}
              rows={4}
              placeholder={
                "예)\n김프로 그거 시안 봤는데 색이 좀 촌스럽지 않아요?? ㅎㅎ\n윗분들은 좀 더 고급스러운 느낌 원하시는데~ 이번주까지 될까요?"
              }
              className="w-full resize-y rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-paper outline-none placeholder:text-paper/25 focus:border-lime"
            />
            <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-amber-300/75">
                ⚠️ 실명·연락처 등 개인정보는 지우고 붙여넣어 주세요. 대화 내용은
                저장되지 않아요.
              </span>
              <span className="shrink-0 text-paper/30">
                {chatSample.length}/1500
              </span>
            </div>
          </div>
        </details>

        {/* 4. 강도 */}
        <label className="mb-2 mt-6 block text-sm font-bold text-paper/70">
          4. 얼마나 빡세게?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map((lv) => {
            const active = intensity === lv.key;
            return (
              <button
                key={lv.key}
                type="button"
                onClick={() => setIntensity(lv.key)}
                className={`flex flex-col items-center gap-0.5 rounded-xl border py-2.5 transition-all ${
                  active
                    ? "border-lime bg-lime/15 ring-2 ring-lime"
                    : "border-white/12 bg-white/5 hover:border-white/30"
                }`}
              >
                <span className="text-lg">{lv.emoji}</span>
                <span className={`text-sm font-extrabold ${active ? "text-lime" : "text-paper"}`}>
                  {lv.label}
                </span>
                <span className="text-[10px] text-paper/50">{lv.desc}</span>
              </button>
            );
          })}
        </div>

        {/* 5. 페르소나 */}
        <label
          id="persona-picker"
          className="mb-2 mt-6 block scroll-mt-20 text-sm font-bold text-paper/70"
        >
          5. 어떤 광고주로 빙의시킬까요?
        </label>
        <PersonaPicker value={persona} onChange={setPersona} />

        <button
          type="button"
          onClick={onSubmit}
          disabled={!ready}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-6 py-4 text-lg font-black text-ink transition-all hover:brightness-95 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
              빙의하는 중…
            </>
          ) : (
            <>😈 빙의 시작</>
          )}
        </button>
      </div>
    </div>
  );
}
