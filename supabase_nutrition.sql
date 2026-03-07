create extension if not exists pgcrypto;

create table if not exists public.nutrition_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date_key date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name text not null,
  serving_size numeric not null check (serving_size >= 0),
  serving_unit text not null,
  calories numeric not null default 0 check (calories >= 0),
  protein_g numeric not null default 0 check (protein_g >= 0),
  carbs_g numeric not null default 0 check (carbs_g >= 0),
  fat_g numeric not null default 0 check (fat_g >= 0),
  fiber_g numeric default 0 check (fiber_g >= 0),
  sugar_g numeric default 0 check (sugar_g >= 0),
  notes text,
  created_at timestamptz default now()
);

create index if not exists nutrition_entries_user_date_idx on public.nutrition_entries (user_id, date_key);
create index if not exists nutrition_entries_user_created_idx on public.nutrition_entries (user_id, created_at desc);

alter table public.nutrition_entries enable row level security;

drop policy if exists nutrition_entries_select_own on public.nutrition_entries;
create policy nutrition_entries_select_own
on public.nutrition_entries
for select
using (user_id = auth.uid());

drop policy if exists nutrition_entries_insert_own on public.nutrition_entries;
create policy nutrition_entries_insert_own
on public.nutrition_entries
for insert
with check (user_id = auth.uid());

drop policy if exists nutrition_entries_update_own on public.nutrition_entries;
create policy nutrition_entries_update_own
on public.nutrition_entries
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists nutrition_entries_delete_own on public.nutrition_entries;
create policy nutrition_entries_delete_own
on public.nutrition_entries
for delete
using (user_id = auth.uid());

create table if not exists public.nutrition_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  serving_size numeric not null check (serving_size >= 0),
  serving_unit text not null,
  calories numeric not null default 0 check (calories >= 0),
  protein_g numeric not null default 0 check (protein_g >= 0),
  carbs_g numeric not null default 0 check (carbs_g >= 0),
  fat_g numeric not null default 0 check (fat_g >= 0),
  fiber_g numeric default 0 check (fiber_g >= 0),
  created_at timestamptz default now()
);

create index if not exists nutrition_favorites_user_created_idx on public.nutrition_favorites (user_id, created_at desc);

alter table public.nutrition_favorites enable row level security;

drop policy if exists nutrition_favorites_select_own on public.nutrition_favorites;
create policy nutrition_favorites_select_own
on public.nutrition_favorites
for select
using (user_id = auth.uid());

drop policy if exists nutrition_favorites_insert_own on public.nutrition_favorites;
create policy nutrition_favorites_insert_own
on public.nutrition_favorites
for insert
with check (user_id = auth.uid());

drop policy if exists nutrition_favorites_update_own on public.nutrition_favorites;
create policy nutrition_favorites_update_own
on public.nutrition_favorites
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists nutrition_favorites_delete_own on public.nutrition_favorites;
create policy nutrition_favorites_delete_own
on public.nutrition_favorites
for delete
using (user_id = auth.uid());

alter table public.profiles
add column if not exists calorie_goal numeric not null default 2000,
add column if not exists protein_goal_g numeric not null default 150,
add column if not exists carb_goal_g numeric not null default 250,
add column if not exists fat_goal_g numeric not null default 70;

