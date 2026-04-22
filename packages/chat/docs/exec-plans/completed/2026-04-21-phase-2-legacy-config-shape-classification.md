# Phase 2 Legacy Config Shape Classification

## Goal

Choose the next safe legacy blackbox input shape beyond lifecycle-compatible callbacks, and either normalize it into the `Root + Page` path or keep it as an explicit scaffold fallback.

## Scope

- In scope:
  - audit the old `ChatConfig` and compatibility-only entry shapes still routed through `ChatScaffold`
  - decide whether any of those shapes can be classified into already-frozen target owner domains
  - keep any unresolved shape as an explicit bounded fallback instead of silently widening scaffold projection
  - add blackbox proof for any newly admitted shape
- Out of scope:
  - parity closure
  - final helper cleanup
  - footer replace-slot publishing work

## Frozen Inputs

- Review / phase gate:
  - Review C passed with follow-ups and Phase 2 may continue
- Contract freeze:
  - target `TrChatConfig` blackbox path and lifecycle-compatible callbacks already enter through `createRuntimeFromConfig(config) -> Root + Page`
  - `onBeforeSend / onMessageAction / onModelChange` remain explicit scaffold fallback
  - old `ChatConfig` shapes remain explicit fallback until code, tests, and docs agree on the next promotion
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
- `packages/chat/docs/generated/config-bridge-matrix.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/components/core/Chat.vue`
  - `packages/chat/src/runtime/config/*`
  - `packages/chat/tests/runtime/*`
  - `packages/chat/tests/contracts/*`
  - `packages/chat/tests/integration/*`
- Intended ownership:
  - keep `createRuntimeFromConfig(config) -> Root + Page` as the only target blackbox on-ramp
  - classify the next legacy shape by target owner domain before admitting it
  - keep unresolved shapes as explicit scaffold fallback
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - widening old `ChatConfig` support reopens hidden config projection
  - Mitigation:
    - admit only the next owner-aligned slice and keep the rest explicit fallback
- Risk:
  - Phase 2 starts implying parity closure
  - Mitigation:
    - keep this slice strictly about blackbox entry classification, not feature parity

## Exit Criteria

- [x] at least one additional legacy input shape is explicitly classified as either promoted or fallback
- [x] any newly promoted shape has targeted blackbox proof
- [x] docs stay aligned
- [x] drift is recorded

## Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Demo / baseline checks:
  - blackbox `TrChat` still chooses the same owner path for already-supported `TrChatConfig` inputs
- Contract evidence:
  - source contract tests and one mounted or blackbox proof for the newly classified shape

## Decision Log

- 2026-04-21:
  - after lifecycle-compatible callbacks were admitted into the target blackbox path, the next Phase 2 slice should classify old `ChatConfig` shapes one bounded step at a time instead of reopening all compatibility paths together

## Drift Backwrite

- What changed from the original slice:
  - the slice classified serialized target `TrChatConfig` as a promoted blackbox entry shape
  - old `ChatConfig` and serialized old `ChatConfig` stayed explicit scaffold fallback
- Which source docs need follow-up:
  - completed in:
    - `design/api-runtime.md`
    - `design/execution.md`
    - `alignment-tracker.md`
