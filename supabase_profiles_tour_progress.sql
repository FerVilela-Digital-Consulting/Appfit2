-- Persist per-account first-time tab tour state in profiles

alter table public.profiles
add column if not exists app_tour_progress jsonb not null default '{"version":1,"completedTabs":[],"inviteResponded":false,"updatedAt":null}'::jsonb;

