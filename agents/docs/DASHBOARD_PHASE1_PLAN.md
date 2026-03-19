# Dashboard Phase 1 Plan

## CTO Analysis
Task type: Refactor + UX composition optimization.
Architecture impact: Medium-high on frontend composition; low on backend/infra.

## Assigned Agents and Routes
- CTO Agent: `C:\Users\STEVAN\Documents\GitHub\agents\cto_agent.md`
- Architecture Agent: `C:\Users\STEVAN\Documents\GitHub\agents\architecture_agent.md`
- Frontend Agent: `C:\Users\STEVAN\Documents\GitHub\agents\frontend_agent.md`
- QA Agent: `C:\Users\STEVAN\Documents\GitHub\agents\qa_agent.md`

## Recommended Workflow
Architecture Agent -> Frontend Agent -> QA Agent

## Implementation Blueprint
1. Create dashboard registry and typed contracts
- `dashboardTypes.ts`
- `dashboardRegistry.ts`
- `dashboardViewModel.ts`

2. Refactor composition into reusable shells
- `DashboardCardShell`
- `DashboardSectionTitle`
- `DashboardLoadingState`
- `DashboardEmptyState`

3. Recompose screen in five zones
- Hero operational
- Immediate action strip
- Daily operations grid
- Insights/context rail
- Progressive extension stack

4. Preserve current data sources
- Keep snapshot and preference services as-is.
- Move inline calculations to view model functions.

5. Add interaction baseline
- Subtle state-driven transitions (enter/update).
- Progressive disclosure for secondary modules.
- Stable loading/empty states to avoid layout shift.

## QA Acceptance Checklist (Phase 1)
- Unit: layout ordering and progress derivations.
- Integration: widget/module toggles and persistence.
- E2E: responsive hierarchy and keyboard navigation.
- Accessibility: labels, focus flow, non-color-only states.

## Technical Risks
- Excessive page-level coupling during refactor.
- Layout regressions on mobile if order metadata is fragmented.
- Preference inconsistency (remote vs local fallback).
- Security risk if secrets are logged or hardcoded.

## Final Recommendation
Execute Phase 1 as a structure-first refactor with strict behavior parity.
Do not introduce new business rules until phase stabilization is verified by QA.
