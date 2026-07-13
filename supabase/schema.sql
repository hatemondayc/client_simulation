-- 광고주 빙의 시뮬레이터 — 명예의전당 스키마
-- Supabase SQL Editor 에 그대로 붙여넣고 실행하세요. (한 번만)
-- 용도: 명예의전당(공격 누적·공유 피드) 단 하나. 로그인/개인화 없음.

-- 1) 테이블 ---------------------------------------------------------------
create table if not exists public.hall_of_fame (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  persona       text not null,
  attack_text   text not null,
  input_summary text,
  likes         integer not null default 0
);

create index if not exists hall_of_fame_created_at_idx on public.hall_of_fame (created_at desc);
create index if not exists hall_of_fame_likes_idx on public.hall_of_fame (likes desc);

-- 2) RLS: 익명 select/insert 만 허용, update/delete 는 막음 -----------------
alter table public.hall_of_fame enable row level security;

drop policy if exists "hall_select_all" on public.hall_of_fame;
create policy "hall_select_all"
  on public.hall_of_fame for select
  using (true);

drop policy if exists "hall_insert_anon" on public.hall_of_fame;
create policy "hall_insert_anon"
  on public.hall_of_fame for insert
  with check (
    persona in ('boss', 'vibe', 'detail', 'reference')
    and char_length(attack_text) between 1 and 400
    and char_length(coalesce(input_summary, '')) <= 200
    and likes = 0                       -- 삽입 시 좋아요 조작 방지
  );

-- 3) 좋아요 증가 RPC (update 정책 대신) — 임의값 세팅 차단 ------------------
create or replace function public.increment_like(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.hall_of_fame set likes = likes + 1 where id = p_id;
$$;

grant execute on function public.increment_like(uuid) to anon, authenticated;

-- 4) 시드 데이터 — 첫 로드부터 피드가 "살아있게" ---------------------------
insert into public.hall_of_fame (persona, attack_text, input_summary, likes, created_at) values
  ('boss',      '제가 어제 레드 좋다고 했는데… 위에서 왜 이렇게 빨갛냐고 하시네요.', '여름 세일 배너 (메인 레드)',        142, now() - interval '2 hours'),
  ('vibe',      '좀 더 힙한데, 무게감 있게, 근데 너무 튀지는 않게 해주세요.',        '신규 카페 인스타 런칭 콘텐츠',      128, now() - interval '5 hours'),
  ('reference', '요즘 그 핫한 브랜드 영상처럼 해주세요. 딱 그 느낌만.',              '가전 신제품 런칭 영상 기획',        119, now() - interval '8 hours'),
  ('detail',    '여기 로고 2px만 내려주시고, 자간은 -5로 주세요.',                  '제품 상세페이지 상단 키비주얼',      97, now() - interval '11 hours'),
  ('vibe',      '느낌 아시죠? 그 뭔가… 요즘 감성이요.',                             '신규 카페 인스타 런칭 콘텐츠',       88, now() - interval '1 day'),
  ('boss',      '이거 우리 사모님한테도 한번 보여드릴게요.',                        '여름 세일 배너 (메인 레드)',         76, now() - interval '1 day 3 hours'),
  ('detail',    '느낌적으로 여기가 1px 정도 뜬 것 같아요.',                         '제품 상세페이지 상단 키비주얼',      64, now() - interval '1 day 9 hours'),
  ('reference', '이거 그냥 그 감성만 살짝 얹으면 되는 거 아니에요?',                '가전 신제품 런칭 영상 기획',         51, now() - interval '2 days'),
  ('boss',      '일단 방향 다른 시안 세 개만 더 볼 수 있을까요? 비교하게.',        '앱 온보딩 화면 리뉴얼',              43, now() - interval '2 days 6 hours'),
  ('vibe',      '심플한데 꽉 찬 느낌으로 가주세요.',                                '생수 브랜드 리브랜딩',               38, now() - interval '3 days');
