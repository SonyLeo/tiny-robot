# Chat Refactor Experience Log

This file is the lightweight tracker for recurring refactor lessons.

Use it when a lesson:

- repeats across slices
- blocks or reshapes review
- causes multiple rewrites
- clearly changes how later implementation should proceed

Do not use it for every finished task.

## Status Meanings

- `candidate`:
  the lesson is recurring, but not yet stable enough to prescribe broadly
- `promoted`:
  the lesson is stable enough to appear in `PLAYBOOK.md`
- `dropped`:
  the lesson was tracked, but should not become standing guidance

## Entries

| ID | Status | Lesson | Why it matters | Evidence |
| --- | --- | --- | --- | --- |
| K-001 | `promoted` | new behavior should move into owning runtime modules before scaffold or bridge layers are widened | prevents refactor work from re-creating config projection and keeps slices reviewable | `2026-04-21-phase-1a-root-bootstrap.md`, `2026-04-21-phase-1b-page-baseline.md`, `PLAYBOOK.md#1-move-new-behavior-toward-runtime-ownership-not-scaffold-relay` |
| K-002 | `promoted` | message targeting should use `messageId / messageIds`, not new `messageIndex` semantics | avoids edit/retry/regenerate/custom-action drift when message order changes | `2026-04-21-phase-1a-root-bootstrap.md`, `PLAYBOOK.md#2-prefer-stable-ids-over-positional-semantics` |
| K-003 | `promoted` | public composition surfaces need one clear owner and narrow compatibility delegates | avoids ambiguous ownership when `Page` or other official surfaces are introduced | `2026-04-21-phase-1b-page-baseline.md`, `PLAYBOOK.md#3-keep-a-single-owner-for-each-public-composition-surface` |
| K-004 | `promoted` | bridge subsets should only expand when code, tests, and docs all agree | keeps `createRuntimeFromConfig(config)` additive instead of aspirational | `config-bridge-matrix.md`, `2026-04-21-phase-1b-page-baseline.md`, `PLAYBOOK.md#4-expand-bridge-subsets-only-when-they-are-implemented-and-evidenced` |
| K-005 | `candidate` | mounted `Root + Page` proof should be added soon after a baseline slice lands, not deferred too long | source/runtime proof can still leave ownership drift or composition regressions undetected | `2026-04-21-phase-1b-mounted-root-page-integration.md`, `alignment-tracker.md` |
| K-006 | `candidate` | compatibility delegates should be contract-tested whenever ownership shifts | without explicit tests, wrapper layers quietly grow back into second owners | `public-surface.test.mjs`, `workspace-slot-contract.test.mjs` |
