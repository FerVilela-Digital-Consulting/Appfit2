-- Advanced physiological metrics

create extension if not exists pgcrypto;

create table if not exists public.daily_biofeedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date_key date not null,
  sleep_quality smallint not null check (sleep_quality between 1 and 10),
  hunger_level smallint not null check (hunger_level between 1 and 10),
  daily_energy smallint not null check (daily_energy between 1 and 10),
  training_energy smallint not null check (training_energy between 1 and 10),
  perceived_stress smallint not null check (perceived_stress between 1 and 10),
  libido smallint not null check (libido between 1 and 10),
  digestion smallint not null check (digestion between 1 and 10),
  notes text null,
  created_at timestamptz not null default now(),
  constraint daily_biofeedback_user_day_uniq unique (user_id, date_key)
);

create index if not exists idx_daily_biofeedback_user_date_key
  on public.daily_biofeedback (user_id, date_key);

alter table public.daily_biofeedback enable row level security;

drop policy if exists daily_biofeedback_select_own on public.daily_biofeedback;
create policy daily_biofeedback_select_own
on public.daily_biofeedback
for select
using (user_id = auth.uid());

drop policy if exists daily_biofeedback_insert_own on public.daily_biofeedback;
create policy daily_biofeedback_insert_own
on public.daily_biofeedback
for insert
with check (user_id = auth.uid());

drop policy if exists daily_biofeedback_update_own on public.daily_biofeedback;
create policy daily_biofeedback_update_own
on public.daily_biofeedback
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists daily_biofeedback_delete_own on public.daily_biofeedback;
create policy daily_biofeedback_delete_own
on public.daily_biofeedback
for delete
using (user_id = auth.uid());

create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date_key date not null,
  waist_cm numeric not null check (waist_cm > 0),
  neck_cm numeric not null check (neck_cm > 0),
  hip_cm numeric null check (hip_cm > 0),
  thigh_cm numeric null check (thigh_cm > 0),
  arm_cm numeric null check (arm_cm > 0),
  body_fat_pct numeric null,
  fat_mass_kg numeric null,
  lean_mass_kg numeric null,
  notes text null,
  created_at timestamptz not null default now(),
  constraint body_measurements_user_day_uniq unique (user_id, date_key)
);

create index if not exists idx_body_measurements_user_date_key
  on public.body_measurements (user_id, date_key);

alter table public.body_measurements enable row level security;

drop policy if exists body_measurements_select_own on public.body_measurements;
create policy body_measurements_select_own
on public.body_measurements
for select
using (user_id = auth.uid());

drop policy if exists body_measurements_insert_own on public.body_measurements;
create policy body_measurements_insert_own
on public.body_measurements
for insert
with check (user_id = auth.uid());

drop policy if exists body_measurements_update_own on public.body_measurements;
create policy body_measurements_update_own
on public.body_measurements
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists body_measurements_delete_own on public.body_measurements;
create policy body_measurements_delete_own
on public.body_measurements
for delete
using (user_id = auth.uid());

create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start_date date not null,
  hydration_state text not null check (hydration_state in ('dry', 'retention', 'variable')),
  training_performance text not null check (training_performance in ('better', 'same', 'worse')),
  notes text null,
  created_at timestamptz not null default now(),
  constraint weekly_reviews_user_week_uniq unique (user_id, week_start_date)
);

create index if not exists idx_weekly_reviews_user_week_start
  on public.weekly_reviews (user_id, week_start_date);

alter table public.weekly_reviews enable row level security;

drop policy if exists weekly_reviews_select_own on public.weekly_reviews;
create policy weekly_reviews_select_own
on public.weekly_reviews
for select
using (user_id = auth.uid());

drop policy if exists weekly_reviews_insert_own on public.weekly_reviews;
create policy weekly_reviews_insert_own
on public.weekly_reviews
for insert
with check (user_id = auth.uid());

drop policy if exists weekly_reviews_update_own on public.weekly_reviews;
create policy weekly_reviews_update_own
on public.weekly_reviews
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists weekly_reviews_delete_own on public.weekly_reviews;
create policy weekly_reviews_delete_own
on public.weekly_reviews
for delete
using (user_id = auth.uid());

