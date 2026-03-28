# Agents Audit - 2026-03-27

## Scope

Audit of prompt completeness and documentation discipline in:
- `agents/`
- `docs/`

## Prompt completeness criteria

A prompt is considered "complete" if it includes:
- role and objective
- required context files to read
- decision/execution process
- output format
- security rules
- documentation update requirement

## Current status

### Complete or near-complete
- `agents/cto_agent.md` (updated)
- `agents/architecture_agent.md`
- `agents/cybersecurity_agent.md`
- `agents/server_agent.md`
- `agents/scan_project.md`

### Partial (missing strict output/documentation sections)
- `agents/frontend_agent.md`
- `agents/backend_agent.md`
- `agents/qa_agent.md`
- `agents/refactor_agent.md`
- `agents/debugging_agent.md`
- `agents/devops_agent.md`

### Out-of-scope / likely stale
- `agents/figma_redesign_agent.md` references `apps/web/...` paths not present in this repo.

## Documentation discipline status

### Found
- Technical baseline docs exist (`ENGINEERING_RUNBOOK`, `ARCHITECTURE`, `DEPLOYMENT`, etc.).

### Missing before this audit
- No compact incremental update ledger optimized for context reuse.

### Added in this update
- `docs/UPDATES_LOG.md`
- `agents/context_documentation_agent.md`

## Risks detected

1. Prompt drift:
- Some agents can answer without a normalized output structure.

2. Context drift:
- Changes were spread across docs but not consistently logged per update.

3. Token inefficiency:
- Without incremental log, future sessions require re-reading many large docs.

## Recommended next actions

1. Upgrade partial prompts with a shared template (role, process, output, docs delta).
2. Make `docs/UPDATES_LOG.md` mandatory on every significant change.
3. Add a lightweight PR checklist item: "Docs update included".
4. Keep a monthly compressed summary in `docs` to reduce prompt context size.
