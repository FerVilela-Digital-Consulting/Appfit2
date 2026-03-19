# Architecture

## Context
Dashboard is being restructured using the current UI as base, inspired by a high-density card composition reference.
Theme details are intentionally excluded; only card aesthetics, information order, and interaction model are adopted.

## Phase 1 Architecture Decision
Use a composition architecture with five zones:
1. Hero Operational Zone
2. Immediate Action Zone
3. Daily Operations Grid
4. Insights and Context Rail
5. Progressive Extension Zone

## UI Composition Model
- One dominant hero card with day status and primary action.
- Compact KPI cards row for quick daily metrics.
- Mid-grid with operational cards (training, nutrition, hydration, sleep, body metrics).
- Side rail for trend/context modules (weekly consistency, calendar, upcoming items).
- Expandable secondary stack for less frequent modules.

## Component Boundaries
- `DashboardPage`: orchestration only.
- `dashboardViewModel`: transforms snapshot data into render-ready model.
- `dashboardRegistry`: source of truth for card order and placement.
- `DashboardCardShell`: reusable frame for card interactions and structure.

## State Boundaries
- Server state: snapshot and persisted preferences.
- Derived state: computed completion and next action.
- UI state: local interaction toggles (expanded sections, visible submodule).

## Responsive Ordering Rules
- Mobile: strict narrative top-down order by priority.
- Desktop: two-column balanced layout, preserving narrative intent.
- Single registry controls both mobile and desktop ordering metadata.

## Risks
- Overloaded orchestration if logic remains inside page component.
- Visual instability if card heights/loads are not normalized.
- Preference divergence if local fallback and remote profile become inconsistent.

## Security
- No secret values in frontend.
- Use only public client keys where needed.
- Rotate backend secrets in secure environment.
- Do not store sensitive payloads in localStorage.
