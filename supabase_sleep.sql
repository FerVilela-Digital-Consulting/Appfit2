-- Sleep tracking + profile goal

create extension if not exists pgcrypto;

create table if not exists public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date_key date not null,
  sleep_start timestamptz null,
  sleep_end timestamptz null,
  total_minutes int not null check (total_minutes > 0 and total_minutes <= 1440),
  quality smallint null check (quality between 1 and 5),
  notes text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_sleep_logs_user_date_key
  on public.sleep_logs (user_id, date_key);

create index if not exists idx_sleep_logs_user_created_at
  on public.sleep_logs (user_id, created_at desc);

alter table public.sleep_logs enable row level security;

drop policy if exists sleep_logs_select_own on public.sleep_logs;
create policy sleep_logs_select_own
on public.sleep_logs
for select
using (user_id = auth.uid());

drop policy if exists sleep_logs_insert_own on public.sleep_logs;
create policy sleep_logs_insert_own
on public.sleep_logs
for insert
with check (user_id = auth.uid());

drop policy if exists sleep_logs_update_own on public.sleep_logs;
create policy sleep_logs_update_own
on public.sleep_logs
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists sleep_logs_delete_own on public.sleep_logs;
create policy sleep_logs_delete_own
on public.sleep_logs
for delete
using (user_id = auth.uid());

alter table public.profiles
add column if not exists sleep_goal_minutes int not null default 480;

