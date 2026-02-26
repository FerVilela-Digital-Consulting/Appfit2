-- Body weight tracking table + RLS policies

create extension if not exists pgcrypto;

create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at date not null default current_date,
  weight_kg numeric not null,
  notes text null,
  created_at timestamp with time zone default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'body_metrics_user_id_measured_at_key'
  ) then
    alter table public.body_metrics
      add constraint body_metrics_user_id_measured_at_key unique (user_id, measured_at);
  end if;
end $$;

alter table public.body_metrics enable row level security;

drop policy if exists "body_metrics_select_own" on public.body_metrics;
create policy "body_metrics_select_own"
on public.body_metrics
for select
using (user_id = auth.uid());

drop policy if exists "body_metrics_insert_own" on public.body_metrics;
create policy "body_metrics_insert_own"
on public.body_metrics
for insert
with check (user_id = auth.uid());

drop policy if exists "body_metrics_update_own" on public.body_metrics;
create policy "body_metrics_update_own"
on public.body_metrics
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "body_metrics_delete_own" on public.body_metrics;
create policy "body_metrics_delete_own"
on public.body_metrics
for delete
using (user_id = auth.uid());
