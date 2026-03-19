# Engineering Runbook

## Scope
This runbook defines execution for Dashboard Restructure Phase 1 (structure and interaction only).

## Objectives
- Reorganize dashboard composition with reusable card patterns.
- Improve hierarchy and action-first flow without changing theme (colors/background).
- Reduce coupling in dashboard page orchestration.

## Out of Scope
- New business rules.
- New backend APIs.
- Theme redesign.

## Delivery Stages
1. Architecture baseline and contracts.
2. Frontend composition and responsive ordering.
3. QA validation (unit/integration/e2e checklist).

## Required Inputs
- Current dashboard page and modules.
- Existing user preferences for visible widgets/modules.
- Snapshot hook as source of truth for dashboard data.

## Build Rules
- Keep UI logic separated from data normalization.
- Use typed contracts for card registry and view model.
- Preserve existing behavior while refactoring composition.
- Add progressive disclosure for secondary content.

## Security Rules
- Never hardcode credentials.
- Never expose secrets in client-side code.
- Use placeholders for env values in examples.
- Avoid logging sensitive payloads.

## Completion Criteria
- Dashboard loads with stable visual hierarchy across mobile/tablet/desktop.
- Preferences still persist and restore correctly.
- Main CTA and quick actions remain accessible and interactive.
- Tests cover layout ordering, state transitions, and accessibility basics.
