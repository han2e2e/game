-- 화살베기 랭킹 테이블 (Supabase SQL Editor에서 실행)
-- 프로젝트: https://hneozwrttqvurhexpofe.supabase.co

create table if not exists rankings (
  id bigint generated always as identity primary key,
  nickname text not null,
  count int not null default 0,
  combo int not null default 0,
  created_at timestamptz default now()
);

alter table rankings enable row level security;

drop policy if exists "누구나 읽기 가능" on rankings;
create policy "누구나 읽기 가능"
  on rankings for select using (true);

drop policy if exists "누구나 삽입 가능" on rankings;
create policy "누구나 삽입 가능"
  on rankings for insert with check (true);
