# Phase 2 Old ChatConfig Request Subset Classification

## Goal

Decide whether a narrow old `ChatConfig` request-oriented subset can be normalized into the `Root + Page` blackbox path without reopening scaffold projection or Phase 1B owner-path contracts.

## Scope

- In scope:
  - audit the smallest old `ChatConfig` subset that only expresses request and display defaults
  - decide whether that subset can be translated into target `TrChatConfig` at the blackbox entry boundary
  - keep the rest of old `ChatConfig` explicit scaffold fallback
  - add blackbox proof for any newly admitted old-shape subset
- Out of scope:
  - broad old `ChatConfig` parity
  - `features.*` / `integrations.*` cutover
  - helper/public surface cleanup

## Frozen Inputs

- Review / phase gate:
  - Review C passed with follow-ups and Phase 2 may continue
- Contract freeze:
  - target `TrChatConfig` and its serialized form already enter through `Root + Page`
  - lifecycle-compatible callbacks already normalize into `config.lifecycle.afterReceive / error`
  - old `ChatConfig` and serialized old `ChatConfig` remain scaffold fallback until a narrow subset is explicitly promoted
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
  - `packages/chat/src/components/core/Chat.vue`
  - `packages/chat/src/runtime/config/*`
  - `packages/chat/tests/runtime/*`
  - `packages/chat/tests/contracts/*`
  - `packages/chat/tests/integration/*`
- Intended ownership:
  - classify old `ChatConfig` by target owner domains before admitting any subset
  - keep `createRuntimeFromConfig(config) -> Root + Page` as the only target blackbox on-ramp
  - do not reopen generic config projection inside `Page` or `Chat.vue`
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - old `ChatConfig` subset promotion quietly recreates adapter/projection semantics under a new name
  - Mitigation:
    - only admit the smallest request-oriented subset and keep `features / integrations / layout relay` out of scope
- Risk:
  - promotion blurs the line between target contract and compatibility bridge
  - Mitigation:
    - require explicit docs and tests that name the promoted subset and the remaining fallback surface

## Exit Criteria

- [x] the next smallest old `ChatConfig` subset is explicitly classified as promoted or fallback
- [x] any promoted subset has targeted blackbox proof
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
  - already-supported target `TrChatConfig` shapes must keep entering through `Root + Page`
- Contract evidence:
  - source contract tests and one blackbox proof for the classified old-shape subset

## Decision Log

- 2026-04-21:
  - after classifying serialized target config as safe, the next Phase 2 slice should decide whether any request-oriented old `ChatConfig` subset can be promoted without reviving broad scaffold projection

## Drift Backwrite

- What changed from the original slice:
  - the slice promoted the narrow old `ChatConfig` request-only subset instead of keeping all old config shapes in fallback
  - the admitted subset is now explicitly constrained to `models / providers / defaults` with a single provider map
  - broader display-default or multi-provider old shapes remain explicit scaffold fallback
- Which source docs need follow-up:
  - completed in:
    - `design/api-runtime.md`
    - `design/execution.md`
    - `alignment-tracker.md`
    - `EXPERIENCE_LOG.md`
