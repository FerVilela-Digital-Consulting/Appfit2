-- Persist onboarding state in profiles

alter table public.profiles
add column if not exists onboarding_completed boolean not null default false;

-- Backfill for existing users that already have profile data
update public.profiles
set onboarding_completed = true
where onboarding_completed = false
  and (
    full_name is not null
    or weight is not null
    or height is not null
    or goal_type is not null
  );
