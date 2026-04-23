# Post-Closure Provider Helper Decision

## Goal

Turn the remaining provider/comparison helper question into a concrete keep/delete baseline before any more helper-side code is removed.

## Scope

- In scope:
  - inventory the currently public provider/comparison helper surfaces
  - recommend `promote` or `retire` for each cluster
  - update process docs so the next cleanup slice can delete code from an explicit baseline instead of from memory
- Out of scope:
  - deleting helpers in the same slice
  - broad Playwright scene migration
  - final helper-surface implementation cleanup

## Frozen Inputs

- Official entry ladder remains:
  - `TrChat`
  - `TrChat.Root + TrChat.Page`
  - `TrChat.Root + primitives`
- The current question is not whether helper APIs may exist at all.
  The question is which ones still deserve to survive after the main refactor closed.

## Relevant Source Docs

- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/README.md`

## Implementation Slice

- Target files:
  - `packages/chat/docs/refactor/process/provider-helper-decision-baseline.md`
  - `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
  - `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`
  - `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- Intended ownership:
  - name the remaining helper clusters concretely
  - make the next delete batch deterministic
- Planned validation:
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Exit Criteria

- [x] a concrete keep/delete recommendation exists for each provider/comparison helper cluster
- [x] roadmap and tracker point to the same next implementation direction
- [x] no helper cluster is still described only as “temporary but public”

## Risks

- Risk:
  - a recommendation may be too aggressive if it forgets a still-real user boundary
- Mitigation:
  - keep this slice documentation-only and require a later implementation slice to prove the boundary handoff before deletion

## Drift Backwrite

- What changed from the original slice:
  - the slice also backwrote routing docs (`docs/README.md`, `refactor/README.md`, `SOURCE_OF_TRUTH.md`, `AGENTS.md`) so later cleanup work can actually find the decision baseline.
- Which source docs need follow-up:
  - the next implementation slice should start from `provider-helper-decision-baseline.md`
