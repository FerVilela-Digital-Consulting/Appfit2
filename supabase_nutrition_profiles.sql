create extension if not exists pgcrypto;

create table if not exists public.nutrition_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  archetype text not null check (archetype in ('base', 'heavy', 'recovery')),
  is_default boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nutrition_profiles_user_idx
  on public.nutrition_profiles (user_id, is_archived, created_at desc);

create unique index if not exists nutrition_profiles_user_single_default_idx
  on public.nutrition_profiles (user_id)
  where is_default = true and is_archived = false;

alter table public.nutrition_profiles enable row level security;

drop policy if exists nutrition_profiles_select_own on public.nutrition_profiles;
create policy nutrition_profiles_select_own
on public.nutrition_profiles
for select
using (user_id = auth.uid());

drop policy if exists nutrition_profiles_insert_own on public.nutrition_profiles;
create policy nutrition_profiles_insert_own
on public.nutrition_profiles
for insert
with check (user_id = auth.uid());

drop policy if exists nutrition_profiles_update_own on public.nutrition_profiles;
create policy nutrition_profiles_update_own
on public.nutrition_profiles
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists nutrition_profiles_delete_own on public.nutrition_profiles;
create policy nutrition_profiles_delete_own
on public.nutrition_profiles
for delete
using (user_id = auth.uid());

create table if not exists public.daily_nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date_key date not null,
  nutrition_profile_id uuid references public.nutrition_profiles(id) on delete restrict,
  profile_name_snapshot text,
  archetype_snapshot text check (archetype_snapshot is null or archetype_snapshot in ('base', 'heavy', 'recovery')),
  target_calories numeric,
  target_protein_g numeric,
  target_carbs_g numeric,
  target_fat_g numeric,
  base_tdee numeric,
  weight_snapshot_kg numeric,
  calorie_adjustment numeric,
  calorie_override numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_nutrition_logs_user_day_uniq unique (user_id, date_key)
);

create index if not exists daily_nutrition_logs_user_date_idx
  on public.daily_nutrition_logs (user_id, date_key);

create index if not exists daily_nutrition_logs_profile_idx
  on public.daily_nutrition_logs (nutrition_profile_id);

alter table public.daily_nutrition_logs enable row level security;

drop policy if exists daily_nutrition_logs_select_own on public.daily_nutrition_logs;
create policy daily_nutrition_logs_select_own
on public.daily_nutrition_logs
for select
using (user_id = auth.uid());

drop policy if exists daily_nutrition_logs_insert_own on public.daily_nutrition_logs;
create policy daily_nutrition_logs_insert_own
on public.daily_nutrition_logs
for insert
with check (user_id = auth.uid());

drop policy if exists daily_nutrition_logs_update_own on public.daily_nutrition_logs;
create policy daily_nutrition_logs_update_own
on public.daily_nutrition_logs
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists daily_nutrition_logs_delete_own on public.daily_nutrition_logs;
create policy daily_nutrition_logs_delete_own
on public.daily_nutrition_logs
for delete
using (user_id = auth.uid());

alter table public.nutrition_entries
add column if not exists daily_log_id uuid;

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'nutrition_entries'
      and constraint_name = 'nutrition_entries_daily_log_id_fkey'
  ) then
    alter table public.nutrition_entries
      add constraint nutrition_entries_daily_log_id_fkey
      foreign key (daily_log_id) references public.daily_nutrition_logs(id) on delete set null;
  end if;
end $$;

create index if not exists nutrition_entries_daily_log_idx
  on public.nutrition_entries (daily_log_id);

insert into public.daily_nutrition_logs (
  user_id,
  date_key,
  archetype_snapshot,
  target_calories,
  target_protein_g,
  target_carbs_g,
  target_fat_g,
  base_tdee,
  weight_snapshot_kg,
  calorie_adjustment,
  calorie_override,
  created_at,
  updated_at
)
select
  target.user_id,
  target.date_key,
  target.day_archetype,
  target.final_target_calories,
  target.protein_grams,
  target.carb_grams,
  target.fat_grams,
  target.tdee,
  null,
  target.archetype_delta,
  target.calorie_override,
  target.created_at,
  target.updated_at
from public.daily_nutrition_targets target
on conflict (user_id, date_key) do update
set
  archetype_snapshot = excluded.archetype_snapshot,
  target_calories = excluded.target_calories,
  target_protein_g = excluded.target_protein_g,
  target_carbs_g = excluded.target_carbs_g,
  target_fat_g = excluded.target_fat_g,
  base_tdee = excluded.base_tdee,
  calorie_adjustment = excluded.calorie_adjustment,
  calorie_override = excluded.calorie_override,
  updated_at = excluded.updated_at;

insert into public.daily_nutrition_logs (user_id, date_key)
select distinct entry.user_id, entry.date_key
from public.nutrition_entries entry
on conflict (user_id, date_key) do nothing;

update public.nutrition_entries entry
set daily_log_id = log.id
from public.daily_nutrition_logs log
where entry.user_id = log.user_id
  and entry.date_key = log.date_key
  and entry.daily_log_id is null;
