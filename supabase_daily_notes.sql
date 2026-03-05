create extension if not exists pgcrypto;

create table if not exists public.daily_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date_key date not null,
  title text null,
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_daily_notes_user_date_key
  on public.daily_notes (user_id, date_key desc);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'daily_notes_user_date_key_key'
  ) then
    alter table public.daily_notes
      add constraint daily_notes_user_date_key_key unique (user_id, date_key);
  end if;
end $$;

alter table public.daily_notes enable row level security;

drop policy if exists daily_notes_select_own on public.daily_notes;
create policy daily_notes_select_own
on public.daily_notes
for select
using (user_id = auth.uid());

drop policy if exists daily_notes_insert_own on public.daily_notes;
create policy daily_notes_insert_own
on public.daily_notes
for insert
with check (user_id = auth.uid());

drop policy if exists daily_notes_update_own on public.daily_notes;
create policy daily_notes_update_own
on public.daily_notes
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists daily_notes_delete_own on public.daily_notes;
create policy daily_notes_delete_own
on public.daily_notes
for delete
using (user_id = auth.uid());
