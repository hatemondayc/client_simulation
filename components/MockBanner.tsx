/**
 * 데모용 가짜 시안 배너 — "여름 세일" 레드 배너.
 * 레드를 일부러 강하게 써서 사장님형의 "왜 이렇게 빨갛냐" 공격이 시각적으로 먹히게 함.
 * (앱 UI 팔레트가 아니라 '콘텐츠'라 레드 사용 OK)
 */
export default function MockBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 ${className}`}
      style={{
        containerType: "inline-size",
        background:
          "radial-gradient(120% 140% at 15% 0%, #ff5a4d 0%, #e11d2e 45%, #a10f1c 100%)",
      }}
      aria-hidden
    >
      {/* 배경 큰 타이포 */}
      <div className="pointer-events-none absolute -right-3 -top-6 select-none text-[34cqw] font-black leading-none text-white/10">
        SALE
      </div>

      <div className="absolute inset-0 flex flex-col justify-between p-[5cqw]">
        <div className="flex items-center gap-[2cqw]">
          <span className="rounded-full bg-white/95 px-[3cqw] py-[1cqw] text-[3.2cqw] font-extrabold tracking-tight text-[#e11d2e]">
            SUMMER
          </span>
          <span className="text-[3cqw] font-semibold text-white/80">
            2026 시즌오프
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="display text-[13cqw] text-white">
              여름 세일
            </div>
            <div className="mt-[1cqw] flex items-baseline gap-[1.5cqw]">
              <span className="display text-[20cqw] leading-none text-white">
                30
              </span>
              <span className="text-[8cqw] font-black text-white">%</span>
              <span className="text-[6cqw] font-black tracking-tight text-white/90">
                OFF
              </span>
            </div>
          </div>
          {/* 가짜 로고 */}
          <div className="mb-[1cqw] flex size-[16cqw] items-center justify-center rounded-full border-[0.6cqw] border-white/85 text-[4cqw] font-black text-white">
            LOGO
          </div>
        </div>

        <div className="flex items-center justify-between text-[2.6cqw] text-white/75">
          <span>지금 앱에서 · 한정수량</span>
          <span>~8/31</span>
        </div>
      </div>
    </div>
  );
}
