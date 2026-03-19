# Performance Scan Phase 2 (CTO)

## Date
- 2026-03-19

## Objective
- Reduce perceived delay when loading user data across dashboard and calendar panels.

## Main Bottlenecks Detected
1. Global header dependency on dashboard snapshot:
   - `Header` used `useDashboardSnapshot`, triggering heavy dashboard data fetches on non-dashboard routes.
2. Heavy range calls requesting full weight history:
   - Monthly/weekly visualizations were using `"all"` weight range and filtering client-side.
3. Frequent refetch behavior:
   - Multiple high-traffic queries lacked local `staleTime` and focus refetch controls.

## Changes Applied
1. Header optimization:
   - Replaced header data dependency with lightweight hook:
   - `src/hooks/useHeaderWeeklyConsistency.ts`
   - Scope reduced to weekly consistency sources only.
2. Weight-range optimization:
   - Added bounded query:
   - `listBodyMetricsBetween(...)` in `src/services/bodyMetrics.ts`
   - Replaced `"all"` history calls in:
     - `src/hooks/useDashboardSnapshot.ts`
     - `src/pages/calendar/useCalendarPageState.ts`
3. Query policy tuning:
   - Global React Query defaults in `src/App.tsx`.
   - Per-query stale/focus policies in calendar and dashboard snapshot hooks.

## Estimated Impact (Code-level Trace)
- Header load path:
  - Before: dashboard snapshot month/core (heavy, multi-source) on all authenticated screens.
  - After: dedicated weekly consistency query for header.
- Weight reads for monthly/week views:
  - Before: full historical weight fetch, then date filtering on client.
  - After: DB-bounded fetch (`from/to`) only.
- Refetch pressure:
  - Before: high chance of repeated query execution on focus/navigation.
  - After: reduced via `staleTime` + `refetchOnWindowFocus: false` in critical routes.

## Validation
- `npm run lint` passed after changes.

## Next Recommended Phase (Optional)
1. Add performance telemetry per panel (`calendar_data`, `dashboard_snapshot`) with p50/p95 timings.
2. Introduce backend aggregation endpoints/RPC for calendar/month snapshots to reduce client fan-out.
3. Add query budgets per route and alerting for regressions in CI.
