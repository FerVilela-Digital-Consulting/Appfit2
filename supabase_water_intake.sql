-- Water intake events + profile preferences

create extension if not exists pgcrypto;

create table if not exists public.water_intake_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consumed_ml int not null check (consumed_ml > 0),
  logged_at timestamptz not null default now(),
  date_key date not null,
  created_at timestamptz default now()
);

create index if not exists idx_water_intake_logs_user_date_key
  on public.water_intake_logs (user_id, date_key);

create index if not exists idx_water_intake_logs_user_logged_at
  on public.water_intake_logs (user_id, logged_at);

alter table public.water_intake_logs enable row level security;

drop policy if exists water_intake_logs_select_own on public.water_intake_logs;
create policy water_intake_logs_select_own
on public.water_intake_logs
for select
using (user_id = auth.uid());

drop policy if exists water_intake_logs_insert_own on public.water_intake_logs;
create policy water_intake_logs_insert_own
on public.water_intake_logs
for insert
with check (user_id = auth.uid());

drop policy if exists water_intake_logs_update_own on public.water_intake_logs;
create policy water_intake_logs_update_own
on public.water_intake_logs
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists water_intake_logs_delete_own on public.water_intake_logs;
create policy water_intake_logs_delete_own
on public.water_intake_logs
for delete
using (user_id = auth.uid());

alter table public.profiles
add column if not exists water_goal_ml int not null default 2000;

alter table public.profiles
add column if not exists water_quick_options_ml int[] not null default array[250, 500, 1000, 2000];
