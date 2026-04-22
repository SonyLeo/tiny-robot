# Review C Prep And Phase 2 Kickoff

## Goal

Prepare the Review C evidence bundle and freeze the handoff from the now-complete Phase 1B default-owner-path baseline into Phase 2 blackbox `TrChat` cutover work.

## Scope

- In scope:
  - refresh Review C readiness around completed Phase 1B evidence
  - identify the smallest safe Phase 2 kickoff slice
  - keep the deferred standalone `footer` replace-slot question explicit
- Out of scope:
  - implementing full Phase 2 blackbox cutover in this slice
  - reopening closed Phase 1B owner-path decisions
  - full parity closure

## Frozen Inputs

- Review / phase gate:
  - Review B remains `pass-with-follow-ups`
  - Phase 1B is complete pending Review C acceptance of the evidence bundle
- Contract freeze:
  - `TrChat.Page` remains composition-only
  - `TrChat.Page` remains the owner of the default page composition
  - `ChatDefaultRenderer` remains a compatibility delegate
  - `footer-extra` remains the only frozen page-level footer slot
- Required source docs:
  - `packages/chat/docs/refactor/design/api-runtime.md`
  - `packages/chat/docs/refactor/design/execution.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`

## Relevant Source Docs

- `packages/chat/docs/refactor/design/overview.md`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/review-scheme.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`

## Implementation Slice

- Target files:
  - `packages/chat/docs/refactor/reviews/**`
  - `packages/chat/docs/refactor/process/*`
  - `packages/chat/docs/exec-plans/active/*`
- Intended ownership:
  - Review C should report completed Phase 1B evidence, not renegotiate already-closed default owner-path contracts
  - Phase 2 kickoff should start from blackbox `TrChat` cutover concerns, not re-open Root/Page baseline work
- Planned validation:
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - Review C packet drifts back into narrative-only summaries instead of evidence-backed closure
  - Mitigation:
    - cite completed slices, histories, contract tests, and mounted proof directly
- Risk:
  - Phase 2 kickoff reopens Phase 1B relay work
  - Mitigation:
    - keep the deferred `footer` replace-slot question explicit and bounded

## Exit Criteria

- [x] Review C materials are ready to schedule
- [x] Phase 2 kickoff slice is identified
- [x] docs stay aligned
- [x] drift is recorded

## Validation

- Commands:
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Contract evidence:
  - Review C packet and tracker reflect the completed Phase 1B evidence bundle

## Decision Log

- 2026-04-21:
  - Phase 1B closed once the default page body path also stopped leaving silent compatibility relay active
  - Review C should report Phase 1B through an explicit evidence index plus current drift summary, not narrative status text alone
  - The smallest safe Phase 2 kickoff slice is blackbox `TrChat` default-path cutover through `createRuntimeFromConfig(config) -> Root + Page`

## Drift Backwrite

- What changed from the original slice:
  - Review C packet now cites the completed Phase 1B slices, mounted proof, contract tests, and bounded follow-ups explicitly
  - Phase 2 kickoff was narrowed to blackbox default-path cutover only; parity and final public-surface closure remain deferred
- Which source docs need follow-up:
  - `alignment-tracker.md`
