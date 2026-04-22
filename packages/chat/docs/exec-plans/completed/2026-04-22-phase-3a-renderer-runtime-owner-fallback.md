# Phase 3A Renderer Runtime Owner Fallback

## Goal

Close the remaining Phase 3A renderer parity gap by proving that the nearest renderer UI can fall back to runtime-owned renderer config instead of depending on page-input or scaffold relay.

## Scope

- In scope:
  - harden runtime-owned renderer fallback on the default message-owner path
  - add targeted proof that `message runtime.config.renderers` remains usable without broad relay assumptions
  - keep `messageId` semantics and current default renderer ordering intact
- Out of scope:
  - feedback or transform work already landed in the previous slice
  - workspace or MCP parity
  - broad legacy bridge removal

## Frozen Inputs

- Review / phase gate:
  - Reviews A, B, and C are accepted and Phase 2 is closed
- Landed Phase 3A inputs:
  - sender `voice / wordCount` parity lands through `sender runtime.defaults`
  - message-action fallback lands through `runtime.message.getActions(messageId)` plus runtime `actionMode`
  - feedback enablement fallback now lands through runtime-owned message extension config at the nearest extension UI
  - formal-path transform proof now exists on the `createRuntimeFromConfig -> Root` send path
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
  - `packages/chat/src/components/core/*`
  - `packages/chat/src/components/renderers/*`
  - `packages/chat/src/runtime/config/*`
  - `packages/chat/tests/runtime/*`
  - `packages/chat/tests/contracts/*`
  - `packages/chat/tests/integration/*`
- Intended ownership:
  - keep renderer fallback in runtime-owned message extension paths
  - avoid re-opening scaffold relay as the default renderer source
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - renderer parity is claimed only through source wiring while the real default owner path still depends on relay
  - Mitigation:
    - add both source proof and a targeted runtime or integration proof for the chosen renderer fallback
- Risk:
  - renderer fallback disturbs the already-frozen default renderer ordering
  - Mitigation:
    - keep default renderer ordering explicit and test it alongside runtime-owned fallback

## Exit Criteria

- [x] a runtime-owned renderer fallback slice lands with targeted proof
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
  - source contract tests plus runtime or integration proof for runtime-owned renderer fallback

## Decision Log

- 2026-04-22:
  - after feedback parity and transform proof were closed, renderer fallback remains the last open Phase 3A message-extension slice
  - `ChatLayout` now falls back to `runtime.message.config.renderers` before scaffold relay, and a mounted layout proof verifies that this fallback works even without page-input or scaffold projection

## Drift Backwrite

- What changed from the original slice:
  - the strongest proof ended up as a mounted `ChatLayout` integration that provides only `CHAT_RUNTIME_KEY`, instead of reusing `Root + Page` where renderer config is still also projected by bridge slices
- Which source docs need follow-up:
  - none
