# 광고주 빙의 시뮬레이터

이노션 바이브코딩 대회 출품작. **AI가 우리 광고주로 빙의해 내 시안을 두들겨 패고, 방어 논리까지 짜주는** 시뮬레이터.

- 로드 즉시 예시 자동 재생 (5초 훅) — 아무도 타이핑 안 해도 굴러감
- 원루프 4단계: 입력 → 빙의 공격 → 방어 논리 → 명예의전당(공유·누적)
- 광고주 페르소나 4종 (전부 가상 아키타입, 실명·실브랜드 없음)
- 로그인 없음 / 모바일 대응 / API 키 서버 은닉

## 스택
- Next.js 15 (App Router) + TypeScript + Tailwind v4
- AI: Google Gemini (`gemini-3.5-flash`, 무료 티어) — **API 라우트(`/api/possess`)가 프록시**해 키를 서버에 숨김
- DB: Supabase (`hall_of_fame` 테이블) — 명예의전당 누적·공유 + 좋아요
- 배포: Vercel
- OG 썸네일: `next/og` 로 동적 생성 (카드별 공격 문구가 그대로 썸네일)

## 로컬 실행
```bash
npm install
cp .env.local.example .env.local   # 값 채우기 (아래 참고)
npm run dev                          # http://localhost:3000
```
> 키가 없어도 앱은 동작합니다. AI는 seed 폴백 콘텐츠로, 명예의전당은 seed 피드로 graceful degrade.

## 배포 준비 (사용자 직접 스텝)

### 1) Supabase
1. https://supabase.com 에서 프로젝트 생성 (무료).
2. SQL Editor 에 [`supabase/schema.sql`](supabase/schema.sql) 전체를 붙여넣고 실행.
   - `hall_of_fame` 테이블 + RLS(익명 select/insert) + `increment_like` RPC + 시드 10건 생성.
3. Project Settings → API 에서 **Project URL** 과 **anon public key** 복사 → env 에 입력.

### 2) Gemini 키 (무료)
- https://aistudio.google.com/apikey → Google 계정으로 로그인 → Create API key → `GEMINI_API_KEY` 에 입력. 카드 등록 불필요.

### 3) Vercel 배포
1. 이 폴더를 GitHub 레포로 push (또는 `vercel` CLI 로 직접 배포).
2. Vercel 에서 New Project → 레포 임포트.
3. **Environment Variables** 에 등록:
   - `GEMINI_API_KEY` (서버 전용)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (선택) `NEXT_PUBLIC_SITE_URL` = 배포된 프로덕션 URL
4. Deploy → 생성된 프로덕션 URL 을 대회에 제출. ([`SUBMISSION.md`](SUBMISSION.md) 의 카피 5칸과 함께)

## 환경 변수
| 변수 | 용도 | 노출 |
|---|---|---|
| `GEMINI_API_KEY` | Gemini 호출 (공격/방어 생성) | 서버 전용 |
| `NEXT_PUBLIC_SUPABASE_URL` | 명예의전당 DB | 클라 (anon) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 명예의전당 DB (RLS 보호) | 클라 (anon) |
| `NEXT_PUBLIC_SITE_URL` | OG 썸네일 절대경로 | 클라 |

## 구조
```
app/
  page.tsx              메인 원루프 (랜딩→입력→결과)
  hall/page.tsx         명예의전당 피드
  card/[id]/            박제 카드 퍼머링크 + 카드별 OG 이미지
  opengraph-image.tsx   기본 OG 썸네일(키비주얼)
  api/possess/route.ts  AI 프록시 (키 은닉)
components/             HeroDemo · PersonaPicker · InputPanel · AttackDefense · HallCard · Bubbles · MockBanner
lib/                    personas · seed-content · gemini(서버) · supabase · hall · og
supabase/schema.sql     DB 스키마 (한 번 실행)
```
