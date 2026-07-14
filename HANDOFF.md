# 🏠 집 컴퓨터 이어하기 핸드오프 — 광고주 빙의 시뮬레이터

> 회사 PC는 제한(PowerShell 권한, API 키 연동 등)이 있어, **집 로컬 컴퓨터에서 이어서 세팅·배포**하기 위한 자립형 가이드.
> 이 문서 하나 + 소스 파일만 있으면 처음부터 끝까지 됩니다. (사람이 따라 해도, 집에서 Claude Code로 시켜도 OK)

---

## 0. 지금 어디까지 됐나 (요약)
- **앱은 이미 완성**돼 있고 프로덕션 빌드(`next build`)까지 통과함. 4화면 전부 동작.
- **키(Groq/Supabase) 없이도 seed 폴백으로 완전히 굴러감** — 랜딩 자동재생, 입력→공격→방어 루프, 명예의전당 피드, 공유 링크, OG 썸네일 다 됨.
- **집에서 할 일**: ① 코드 가져오기 ② Node 설치 + `npm install` ③ 키 3개 넣기 ④ 로컬 확인 ⑤ Vercel 배포. 끝.

---

## 1. 이 프로젝트가 뭔지 (맥락)
- **이노션 사내 바이브코딩 대회 출품작.** 노리는 상: **좋아요상(전 임직원 투표)** 1순위.
- **컨셉**: AI가 우리 광고주로 "빙의"해 내 시안을 두들겨 패고(공격 3~5개), 그걸 어떻게 받아칠지 방어 논리까지 짜준다. 웃긴 공격은 "명예의전당"에 박제해 사내 메신저로 공유 → 자가증식.
- **페르소나 4종(전부 가상 아키타입, 실명·실브랜드 금지)**: 사장님이바꾸래요형 / 느낌만있는형 / 디테일지옥형 / 레퍼런스형.
- **양보 불가 원칙**: ① 로드 즉시 예시 자동재생(5초 훅, 아무도 타이핑 안 함) ② 명예의전당=투표 엔진 ③ 로그인 0 ④ 실명·실브랜드 0 ⑤ 모바일 필수 ⑥ API 키 클라 노출 0.
- 원본 상세 스펙(회사 PC): `C:\Users\innocean\Downloads\광고주빙의_핸드오프.md` (집엔 없을 수 있음. 핵심은 위에 다 요약됨.)

---

## 2. 코드를 집으로 가져오기 (택 1)

### 옵션 A — GitHub (추천, 배포까지 매끄러움)
회사에서 GitHub push가 되면:
```bash
cd advertiser-sim
git add -A && git commit -m "광고주 빙의 시뮬레이터 초기 빌드"
git remote add origin https://github.com/<내계정>/advertiser-sim.git
git push -u origin main
```
집에서: `git clone` 후 → 4번으로.

### 옵션 B — 압축본 복사 (회사 push가 막힐 때)
회사 PC에 만들어 둔 **`C:\Users\innocean\Downloads\advertiser-sim-source.tar.gz`** (node_modules/.next 제외, 소스만 ~0.5MB)를 USB나 개인 클라우드(구글드라이브/메일 첨부 등)로 집에 옮김.
집에서 압축 해제:
- Windows 11: 탐색기에서 우클릭 → 압축 풀기, 또는 `tar -xzf advertiser-sim-source.tar.gz`
- Mac: 더블클릭

> ⚠️ `node_modules`는 안 들어있음 — 정상. 집에서 `npm install`로 받음.
> ⚠️ 실제 키가 든 `.env.local`은 애초에 없음(예시 `.env.local.example`만 있음). 안전.

---

## 3. 집 컴퓨터 사전 준비 (한 번만)

### Node.js 설치 (집은 일반 설치 — 회사 PC의 포터블 꼼수 불필요)
- https://nodejs.org 에서 **LTS(현재 v22.x)** 다운로드 → 그냥 설치.
- 확인: 터미널에서 `node -v` (v22 이상), `npm -v`.

### 프로젝트 의존성
```bash
cd advertiser-sim
npm install
```

---

## 4. 키 3개 세팅 + 로컬 실행

### 4-1. 환경변수 파일
```bash
cp .env.local.example .env.local     # Windows cmd: copy .env.local.example .env.local
```
그리고 `.env.local`을 열어 값 채움 (아래 4-2, 4-3에서 얻음).

### 4-2. Groq 키 (AI 공격/방어 생성 · 무료)
- https://console.groq.com → 로그인 → API Keys → Create → `gsk_...` 복사.
- `.env.local`의 `GROQ_API_KEY=...` 에 붙여넣기.
- 이 키는 **서버(`/api/possess` 라우트)에서만** 쓰이고 브라우저로 안 나감. 모델은 `meta-llama/llama-4-scout`(Groq, 무료 티어 1,000건/일, 카드 불필요, 멀티모달).

### 4-3. Supabase (명예의전당 DB)
1. https://supabase.com → New project (무료).
2. 좌측 **SQL Editor** → New query → 이 레포의 **`supabase/schema.sql`** 전체 붙여넣고 **Run**.
   - `hall_of_fame` 테이블 + RLS(익명 insert/select) + `increment_like` RPC + 시드 10건이 생성됨.
3. **Project Settings → API**에서:
   - `Project URL` → `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4-4. 실행 & 확인
```bash
npm run dev      # http://localhost:3000
```
확인 포인트:
- `/` 로드 즉시 데모 자동재생.
- 입력창에 아무 시안 + 페르소나 고르고 "빙의 시작" → **이번엔 seed가 아니라 라이브 Groq가 생성**(키 정상이면). 실패해도 seed로 안 죽음.
- "박제하기" → `/hall`에 실제로 카드가 쌓이는지(= Supabase insert 됨). ♥ 눌러 카운트 증가 확인.

---

## 5. Vercel 배포 (제출용 URL 생성)
1. https://vercel.com 로그인 → **Add New → Project** → GitHub 레포 임포트(옵션 A) 또는 `npm i -g vercel && vercel` CLI.
2. **Settings → Environment Variables**에 3개(+선택 1) 등록:
   | 변수 | 값 |
   |---|---|
   | `GROQ_API_KEY` | (console.groq.com 발급, gsk_..., 무료) |
   | `NEXT_PUBLIC_SUPABASE_URL` | https://xxxx.supabase.co |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJ... |
   | `NEXT_PUBLIC_SITE_URL` (선택) | 배포된 https URL (OG 썸네일 절대경로용) |
3. **Deploy** → 나온 프로덕션 URL을 대회에 제출. 카피는 `SUBMISSION.md` 5칸 그대로.
4. 배포 후 `NEXT_PUBLIC_SITE_URL`을 프로덕션 URL로 채우고 재배포하면 공유 미리보기가 정확해짐.

---

## 6. 코드 지도 (수정할 때)
```
app/
  page.tsx                 메인 원루프(랜딩→입력→결과) 껍데기 + 헤더/푸터
  hall/page.tsx            명예의전당 피드(정렬·스탯)
  card/[id]/page.tsx       박제 카드 퍼머링크 + 카드별 메타
  card/[id]/opengraph-image.tsx  카드별 OG 밈 썸네일(동적)
  opengraph-image.tsx      기본 OG 썸네일(키비주얼)
  api/possess/route.ts     AI 프록시(키 은닉, 503→클라 폴백)
components/
  Experience.tsx           상태머신(landing/input/result 전환) ← 여기가 흐름 중심
  HeroDemo.tsx             랜딩 자동재생
  PersonaPicker / InputPanel / AttackDefense / HallCard / Bubbles / MockBanner
lib/
  personas.ts              페르소나 4종 정의(성격 프롬프트 포함) ← 톤 바꾸려면 여기
  seed-content.ts          pre-baked 예시(데모·폴백·피드시드) ← 문구 바꾸려면 여기
  anthropic.ts             서버 전용 Claude 호출 + 프롬프트 + 구조화 출력 스키마
  supabase.ts / hall.ts    Supabase 연동(없으면 seed 폴백)
  og.ts                    OG용 한글 폰트 로더
supabase/schema.sql        DB 스키마(한 번 실행)
```
- **공격/방어 톤을 바꾸고 싶다** → `lib/groq.ts`의 `systemPrompt()` + `INTENSITY_RULES` + `lib/personas.ts`의 `personaPrompt`.
- **데모/폴백 문구** → `lib/seed-content.ts`.
- **색/폰트** → `app/globals.css`(라임/잉크/네이비 토큰), 폰트는 `app/layout.tsx`(Noto Sans KR).

---

## 7. 핵심 기술 결정 & 함정 (이어서 작업할 사람 필독)
- **문서의 "Supabase Edge Function 프록시"는 Next.js API 라우트(`/api/possess`)로 대체함.** 키 숨김 의도는 동일, 배포는 훨씬 단순(승인됨). Supabase는 DB 전용.
- **모델은 `meta-llama/llama-4-scout-17b-16e-instruct`** (Groq, 무료 1,000건/일·카드 불필요·멀티모달·~2s). AI 엔진 변천사: Anthropic Claude(유료) → Google Gemini(무료지만 하루 20건뿐) → **Groq**(무료 1,000건/일)로 정착. 바꾸려면 `lib/groq.ts` 상단 `MODEL` + `GROQ_API_KEY` env.
- **SDK 안 씀 — raw fetch로 REST 호출.** Groq는 OpenAI 호환 Chat Completions: `POST https://api.groq.com/openai/v1/chat/completions`, 헤더 `Authorization: Bearer $GROQ_API_KEY`, 바디 `{model, messages:[{role:"system"},{role:"user"}], response_format:{type:"json_object"}, temperature, max_tokens}`. 결과는 `choices[0].message.content`(JSON 문자열, 직접 파싱). **JSON 모드는 프롬프트에 "JSON" 단어가 있어야 함**(현재 있음). (Anthropic·Google SDK 둘 다 이 환경에서 hang/불안정해서 raw fetch가 가장 안정적이었음.)
- **비전(이미지) 입력**: user content를 배열로 `[{type:'text',text},{type:'image_url',image_url:{url:'data:image/jpeg;base64,...'}}]`(OpenAI 비전 포맷). 클라이언트(`components/InputPanel.tsx`)에서 canvas로 긴 변 1600px 다운스케일 후 JPEG base64로 전송, 서버(`/api/possess`)가 data URL 파싱·크기 제한(~3.7MB) 검증. llama-4-scout가 멀티모달이라 단일 모델로 처리.
- **강도(순한맛/보통/매운맛)**: `lib/groq.ts`의 `INTENSITY_RULES`로 시스템 프롬프트만 바뀜, 모델은 고정.
- **OG 썸네일 한글 폰트 함정**: Satori는 woff2를 못 읽음. `lib/og.ts`는 Google Fonts를 **일반(non-browser) UA로 fetch**해 **ttf**를 받아야 함(모던 UA로 요청하면 woff2 와서 깨짐). 필요한 글자만 subset해서 가벼움.
- **graceful degrade가 설계 핵심**: 키 없거나 API 실패해도 seed 폴백으로 앱이 안 죽음(5초 훅 보장). 함부로 제거하지 말 것.
- 로컬 검증 팁: `npx tsc --noEmit`로 타입체크(dev는 타입체크 안 함), `next build`로 배포 전 최종 확인.

---

## 8. 집에서 Claude Code로 이어서 시키기 (붙여넣기용)
집 컴퓨터에서 이 폴더를 열고 Claude Code에 이렇게:

> 이 폴더는 이노션 바이브코딩 대회 출품작 "광고주 빙의 시뮬레이터"야. `HANDOFF.md`와 `README.md`를 먼저 읽고 현재 상태를 파악해줘. 그다음 `.env.local`에 내가 줄 Groq·Supabase 키를 넣고, `npm install` → `npm run dev`로 로컬에서 **라이브 AI 생성과 명예의전당 insert까지** 검증한 뒤, Vercel 배포를 도와줘. Supabase 스키마(`supabase/schema.sql`) 실행과 키 발급은 내가 대시보드에서 직접 할게.

---

## 부록 — 회사 PC에서만 있었던 제약 (집에선 대부분 무관)
집 일반 환경이면 아래는 신경 안 써도 됨. 참고용:
- 회사 PC는 시스템에 Node가 없어 **포터블 Node**를 `C:\Users\innocean\nodejs`에 깔고 bash 명령마다 PATH를 앞에 붙여 씀. **집은 일반 설치로 끝.**
- 회사 PC의 **PowerShell 도구가 권한/스폰 이슈로 죽어서** Bash로 작업함. 집 PowerShell은 정상일 것.
- Vercel/Supabase **OAuth·배포는 회사 비대화형 환경에서 못 해** 미룬 것 — 집에선 그냥 브라우저로 로그인해서 하면 됨.
