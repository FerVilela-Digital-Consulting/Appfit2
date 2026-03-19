-- Aggregated operational snapshot for dashboard core (today + rolling 7 days).
-- Safe to run multiple times.

create or replace function public.get_dashboard_operational_snapshot(
  p_today date,
  p_timezone text default 'America/Lima'
)
returns jsonb
language sql
security definer
set search_path = public
as $$
with bounds as (
  select
    p_today::date as today_key,
    (p_today::date - interval '6 day')::date as from_key
),
days as (
  select generate_series((select from_key from bounds), (select today_key from bounds), interval '1 day')::date as date_key
),
water_goal as (
  select coalesce(p.water_goal_ml, 2000)::int as water_goal_ml
  from public.profiles p
  where p.id = auth.uid()
),
sleep_goal as (
  select coalesce(p.sleep_goal_minutes, 480)::int as sleep_goal_minutes
  from public.profiles p
  where p.id = auth.uid()
),
water_by_day as (
  select
    d.date_key,
    coalesce(sum(w.consumed_ml), 0)::int as total_ml
  from days d
  left join public.water_intake_logs w
    on w.user_id = auth.uid()
    and w.date_key::date = d.date_key
  group by d.date_key
),
sleep_by_day as (
  select
    d.date_key,
    coalesce(sum(s.total_minutes), 0)::int as total_minutes
  from days d
  left join public.sleep_logs s
    on s.user_id = auth.uid()
    and s.date_key::date = d.date_key
  group by d.date_key
),
bio_rows as (
  select b.*
  from public.daily_biofeedback b
  where b.user_id = auth.uid()
    and b.date_key::date between (select from_key from bounds) and (select today_key from bounds)
  order by b.date_key asc
),
bio_today as (
  select to_jsonb(b.*) as value
  from public.daily_biofeedback b
  where b.user_id = auth.uid()
    and b.date_key::date = (select today_key from bounds)
  order by b.created_at desc
  limit 1
),
notes_7d as (
  select n.*
  from public.daily_notes n
  where n.user_id = auth.uid()
    and n.date_key::date between (select from_key from bounds) and (select today_key from bounds)
  order by n.date_key asc
),
note_today as (
  select to_jsonb(n.*) as value
  from public.daily_notes n
  where n.user_id = auth.uid()
    and n.date_key::date = (select today_key from bounds)
  order by n.created_at desc
  limit 1
),
note_latest as (
  select to_jsonb(n.*) as value
  from public.daily_notes n
  where n.user_id = auth.uid()
  order by n.date_key desc, n.created_at desc
  limit 1
),
nutrition_by_day as (
  select
    d.date_key,
    coalesce(sum(ne.calories), 0)::int as calories
  from days d
  left join public.nutrition_entries ne
    on ne.user_id = auth.uid()
    and ne.date_key::date = d.date_key
  group by d.date_key
),
active_days as (
  select count(distinct activity_date)::int as total
  from (
    select wb.date_key as activity_date
    from water_by_day wb
    where wb.total_ml > 0
    union all
    select sb.date_key as activity_date
    from sleep_by_day sb
    where sb.total_minutes > 0
    union all
    select b.date_key::date as activity_date
    from bio_rows b
    union all
    select n.date_key::date as activity_date
    from notes_7d n
    union all
    select nb.date_key as activity_date
    from nutrition_by_day nb
    where nb.calories > 0
    union all
    select bm.measured_at::date as activity_date
    from public.body_metrics bm
    where bm.user_id = auth.uid()
      and bm.measured_at::date between (select from_key from bounds) and (select today_key from bounds)
  ) u
)
select jsonb_build_object(
  'water_today_ml', coalesce((select wb.total_ml from water_by_day wb where wb.date_key = (select today_key from bounds)), 0),
  'water_goal_ml', coalesce((select wg.water_goal_ml from water_goal wg), 2000),
  'water_7d', coalesce((
    select jsonb_agg(
      jsonb_build_object('date_key', wb.date_key::text, 'total_ml', wb.total_ml)
      order by wb.date_key
    )
    from water_by_day wb
  ), '[]'::jsonb),
  'sleep_day', jsonb_build_object(
    'date_key', (select today_key::text from bounds),
    'total_minutes', coalesce((select sb.total_minutes from sleep_by_day sb where sb.date_key = (select today_key from bounds)), 0)
  ),
  'sleep_goal_minutes', coalesce((select sg.sleep_goal_minutes from sleep_goal sg), 480),
  'sleep_7d', coalesce((
    select jsonb_agg(
      jsonb_build_object('date_key', sb.date_key::text, 'total_minutes', sb.total_minutes)
      order by sb.date_key
    )
    from sleep_by_day sb
  ), '[]'::jsonb),
  'bio_today', (select bt.value from bio_today bt),
  'bio_7d', coalesce((select jsonb_agg(to_jsonb(br.*) order by br.date_key) from bio_rows br), '[]'::jsonb),
  'notes_7d', coalesce((select jsonb_agg(to_jsonb(n.*) order by n.date_key) from notes_7d n), '[]'::jsonb),
  'note_today', (select nt.value from note_today nt),
  'note_latest', (select nl.value from note_latest nl),
  'active_days_7', coalesce((select ad.total from active_days ad), 0)
);
$$;

revoke all on function public.get_dashboard_operational_snapshot(date, text) from public;
grant execute on function public.get_dashboard_operational_snapshot(date, text) to authenticated;

