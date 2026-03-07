-- Persist dashboard weekly-trend metric preferences in profiles.
-- If this column is not present, the app falls back to localStorage.

alter table public.profiles
add column if not exists dashboard_trend_metrics text[] not null default array['weight', 'water', 'sleep_hours'];

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_dashboard_trend_metrics_check'
  ) then
    alter table public.profiles
    add constraint profiles_dashboard_trend_metrics_check
    check (
      array_length(dashboard_trend_metrics, 1) >= 1
      and dashboard_trend_metrics <@ array[
        'weight',
        'water',
        'sleep_hours',
        'sleep_quality',
        'energy',
        'stress',
        'training_energy',
        'hunger',
        'digestion',
        'libido',
        'waist_cm',
        'body_fat_pct',
        'completion_count',
        'goal_hits'
      ]::text[]
    );
  end if;
end $$;
