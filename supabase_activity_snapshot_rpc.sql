-- Aggregated activity snapshot for calendar/dashboard month ranges.
-- Safe to run multiple times.

create or replace function public.get_activity_range_snapshot(
  p_from date,
  p_to date,
  p_timezone text default 'America/Lima'
)
returns table (
  date_key date,
  water_ml integer,
  sleep_minutes integer,
  weight_kg numeric,
  has_water boolean,
  has_sleep boolean,
  has_weight boolean,
  has_biofeedback boolean,
  has_note boolean,
  has_nutrition boolean,
  nutrition_calories integer
)
language sql
security definer
set search_path = public
as $$
with days as (
  select generate_series(p_from, p_to, interval '1 day')::date as date_key
),
water as (
  select
    w.date_key::date as date_key,
    coalesce(sum(w.consumed_ml), 0)::int as total_ml
  from public.water_intake_logs w
  where w.user_id = auth.uid()
    and w.date_key::date between p_from and p_to
  group by w.date_key::date
),
sleep as (
  select
    s.date_key::date as date_key,
    coalesce(sum(s.total_minutes), 0)::int as total_minutes
  from public.sleep_logs s
  where s.user_id = auth.uid()
    and s.date_key::date between p_from and p_to
  group by s.date_key::date
),
weight as (
  select
    b.measured_at::date as date_key,
    max(b.weight_kg)::numeric as weight_kg
  from public.body_metrics b
  where b.user_id = auth.uid()
    and b.measured_at::date between p_from and p_to
  group by b.measured_at::date
),
bio as (
  select
    d.date_key::date as date_key,
    true as has_biofeedback
  from public.daily_biofeedback d
  where d.user_id = auth.uid()
    and d.date_key::date between p_from and p_to
  group by d.date_key::date
),
note as (
  select
    n.date_key::date as date_key,
    true as has_note
  from public.daily_notes n
  where n.user_id = auth.uid()
    and n.date_key::date between p_from and p_to
  group by n.date_key::date
),
nutrition as (
  select
    ne.date_key::date as date_key,
    coalesce(sum(ne.calories), 0)::int as calories
  from public.nutrition_entries ne
  where ne.user_id = auth.uid()
    and ne.date_key::date between p_from and p_to
  group by ne.date_key::date
)
select
  d.date_key,
  coalesce(w.total_ml, 0) as water_ml,
  coalesce(s.total_minutes, 0) as sleep_minutes,
  wt.weight_kg,
  coalesce(w.total_ml, 0) > 0 as has_water,
  coalesce(s.total_minutes, 0) > 0 as has_sleep,
  wt.weight_kg is not null as has_weight,
  coalesce(b.has_biofeedback, false) as has_biofeedback,
  coalesce(nt.has_note, false) as has_note,
  coalesce(nu.calories, 0) > 0 as has_nutrition,
  coalesce(nu.calories, 0) as nutrition_calories
from days d
left join water w on w.date_key = d.date_key
left join sleep s on s.date_key = d.date_key
left join weight wt on wt.date_key = d.date_key
left join bio b on b.date_key = d.date_key
left join note nt on nt.date_key = d.date_key
left join nutrition nu on nu.date_key = d.date_key
order by d.date_key asc;
$$;

revoke all on function public.get_activity_range_snapshot(date, date, text) from public;
grant execute on function public.get_activity_range_snapshot(date, date, text) to authenticated;

