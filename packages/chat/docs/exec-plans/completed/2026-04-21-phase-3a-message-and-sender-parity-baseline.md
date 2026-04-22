# Phase 3A Message And Sender Parity Baseline

## Goal

Start `Phase 3A` by closing the highest-value message and sender parity gaps on top of the now-closed `Root + Page` blackbox baseline.

## Scope

- In scope:
  - audit current message and sender parity gaps against the Phase 3A contract
  - prioritize attachments, sender voice or word-count affordances, message actions, feedback, renderers, and transforms
  - keep new work inside runtime-owned message or sender paths instead of widening scaffold fallback again
  - add the first targeted parity proof for the most urgent message or sender slice
- Out of scope:
  - workspace or MCP parity
  - helper-public-surface cleanup
  - legacy bridge removal

## Frozen Inputs

- Review / phase gate:
  - Review C passed with follow-ups and Phase 2 has now been closed
- Contract freeze:
  - blackbox `TrChat` now has a closed entry matrix for target `TrChatConfig` plus the admitted request-only, display-default, `layout.contentLayout`, and shell-owner legacy subsets
  - `ui.prompts`, `layout.variant / placements`, and `shell.viewState` are explicit scaffold fallback
  - `Phase 1A` and `Phase 1B` remain accepted as completed baselines
- Required source docs:
  - `packages/chat/docs/refactor/design/api-runtime.md`
  - `packages/chat/docs/refactor/design/execution.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`

## Relevant Source Docs

- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/runtime/message/*`
  - `packages/chat/src/runtime/sender/*`
  - `packages/chat/src/components/core/*`
  - `packages/chat/src/components/renderers/*`
  - `packages/chat/src/components/feedback/*`
  - `packages/chat/tests/runtime/*`
  - `packages/chat/tests/contracts/*`
  - `packages/chat/tests/integration/*`
- Intended ownership:
  - keep message and sender parity work on runtime-owned paths
  - treat `messageId / messageIds` as the only stable action key
  - do not reopen broad scaffold fallback just to hit parity quickly
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - parity work revives legacy index semantics or scaffold-owned message behavior
  - Mitigation:
    - keep `messageId / messageIds` authoritative and add targeted contract tests with each new parity slice
- Risk:
  - sender parity is claimed through ad hoc UI patches instead of runtime-owned behavior
  - Mitigation:
    - make runtime ownership explicit before changing visible sender behavior

## Exit Criteria

- [x] the first Phase 3A parity slice is explicitly scoped and landed with targeted proof
- [x] docs stay aligned
- [x] drift is recorded

## Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Contract evidence:
  - source contract tests plus at least one runtime or integration proof for the chosen parity slice

## Decision Log

- 2026-04-21:
  - after `Phase 2` closed the blackbox entry matrix, the next active work should move into `Phase 3A` message and sender parity instead of widening legacy fallback further
- 2026-04-22:
  - the first Phase 3A slice should close sender `voice / wordCount` parity by promoting `config.sender.*` into `sender runtime.defaults` and making default owner paths consume runtime defaults before `senderActionsFeature` fallback

## Drift Backwrite

- What changed from the original slice:
  - the first parity slice landed on sender runtime defaults before broader message parity work
- Which source docs need follow-up:
  - `alignment-tracker.md`
  - `design/execution.md`
  - `design/api-runtime.md`
  - `generated/config-bridge-matrix.md`
