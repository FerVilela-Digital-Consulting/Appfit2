# Performance Phase 3: Telemetry (p50/p95)

## Goal
Measure real query latency in app sessions for critical panels:
- `/today`
- `/calendar`
- `/nutrition`

## What was added
- Global tracker component:
  - `src/components/QueryPerformanceTracker.tsx`
- Query performance helpers:
  - `src/lib/queryPerformance.ts`
- Mounted in app root:
  - `src/App.tsx`

## Monitored query groups
- `dashboard_snapshot`
- `header_weekly_consistency`
- `calendar_data`
- `calendar_day_logs`
- `calendar_day_sleep`
- `calendar_day_biofeedback`
- `calendar_day_note`
- `calendar_day_nutrition`
- `nutrition_day_summary`

## How to inspect in browser
1. Open app and navigate naturally through `/today`, `/calendar`, `/nutrition`.
2. Open DevTools Console.
3. Run:

```js
window.__appfitPerf.report()
```

This returns rows with:
- `count`
- `avgMs`
- `p50Ms`
- `p95Ms`
- `maxMs`

Optional:

```js
window.__appfitPerf.samples()
window.__appfitPerf.clear()
```

## Optional live console table
- Add `?perf=1` to URL in development.
- The app prints an updated compact table when monitored queries finish.

## Notes
- Data is stored in `sessionStorage` only.
- Capped to recent 250 samples.
- No secrets are logged.
