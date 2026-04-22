# Phase 2 Old ChatConfig Display-Default Classification

## Goal

Decide whether a narrow display-default old `ChatConfig` subset can be normalized into the `Root + Page` blackbox path without reopening preset projection or Phase 1B owner-path contracts.

## Scope

- In scope:
  - audit the smallest old `ChatConfig` subset that adds display defaults on top of the already-promoted request-only subset
  - decide whether any of `appearance`, `ui.brand`, or `ui.welcome` can translate directly into target `ui`
  - keep `ui.prompts`, `layout`, `shell`, `features`, and `integrations` explicit scaffold fallback
  - add blackbox proof for any newly admitted old-shape subset
- Out of scope:
  - broad old `ChatConfig` parity
  - `features.*` / `integrations.*` cutover
  - helper/public surface cleanup

## Frozen Inputs

- Review / phase gate:
  - Review C passed with follow-ups and Phase 2 may continue
- Contract freeze:
  - target `TrChatConfig`, its serialized form, and the narrow old `ChatConfig` request-only subset already enter through `Root + Page`
  - lifecycle-compatible callbacks already normalize into `config.lifecycle.afterReceive / error`
  - broader old `ChatConfig` shapes remain scaffold fallback until a narrow display-default subset is explicitly promoted
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
  - classify old display-default fields by target owner domain before admitting any subset
  - keep `createRuntimeFromConfig(config) -> Root + Page` as the only target blackbox on-ramp
  - do not reopen generic config projection inside `Page`, `Chat.vue`, or the scaffold adapter
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - display-default promotion silently reopens preset projection through `ui` or page relay
  - Mitigation:
    - admit only fields that map one-to-one into target `ui`, and keep `ui.prompts / layout / shell` out of scope
- Risk:
  - promotion blurs the line between target config and compatibility bridge
  - Mitigation:
    - require docs and tests that name the admitted display-default subset and the remaining fallback surface

## Exit Criteria

- [x] the next smallest old `ChatConfig` display-default subset is explicitly classified as promoted or fallback
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
  - already-supported target `TrChatConfig` and request-only legacy subset must keep entering through `Root + Page`
- Contract evidence:
  - source contract tests and one blackbox proof for the classified display-default subset

## Decision Log

- 2026-04-21:
  - after the request-only legacy subset was admitted, the next Phase 2 slice should decide whether any old display-default fields can also promote without reviving broad preset projection

## Drift Backwrite

- What changed from the original slice:
  - the slice promoted `appearance` plus `ui.brand / ui.welcome` instead of keeping all old display-default fields in fallback
  - `ui.prompts`, `layout`, `shell`, `features`, and `integrations` stayed explicit scaffold fallback
- Which source docs need follow-up:
  - completed in:
    - `design/api-runtime.md`
    - `design/execution.md`
    - `alignment-tracker.md`
    - `PLAYBOOK.md`
    - `EXPERIENCE_LOG.md`
