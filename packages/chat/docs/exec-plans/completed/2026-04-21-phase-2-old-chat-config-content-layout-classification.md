# Phase 2 Old ChatConfig Content Layout Classification

## Goal

Decide whether the narrow old `ChatConfig.layout.contentLayout` field can be normalized into the `Root + Page` blackbox path without reopening layout projection, role placement relay, or workspace shell semantics.

## Scope

- In scope:
  - audit whether old `layout.contentLayout` maps one-to-one into target `ui.contentLayout`
  - decide whether that field can promote on top of the already-admitted request-only plus display-default legacy subsets
  - keep `layout.variant`, `layout.placements`, `shell`, `features`, and `integrations` explicit scaffold fallback
  - add blackbox proof for any newly admitted old-shape subset
- Out of scope:
  - broad old `ChatConfig` parity
  - `layout.variant` / `layout.placements` cutover
  - `shell`, `features.*`, or `integrations.*` cutover

## Frozen Inputs

- Review / phase gate:
  - Review C passed with follow-ups and Phase 2 may continue
- Contract freeze:
  - target `TrChatConfig`, its serialized form, and the narrow old `ChatConfig` request-only plus display-default subsets already enter through `Root + Page`
  - broader old layout and shell semantics remain scaffold fallback until a narrower subset is explicitly promoted
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
  - classify `layout.contentLayout` by target owner domain before admitting it
  - keep `createRuntimeFromConfig(config) -> Root + Page` as the only target blackbox on-ramp
  - do not reopen generic layout projection inside `Page`, `Chat.vue`, or the scaffold adapter
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - content-layout promotion silently reopens broader layout projection
  - Mitigation:
    - admit only `layout.contentLayout` if it maps one-to-one into target `ui.contentLayout`, and keep `variant / placements` out of scope
- Risk:
  - the slice blurs the line between target `ui` defaults and legacy layout presets
  - Mitigation:
    - require docs and tests that name the promoted content-layout subset and the remaining layout fallback surface

## Exit Criteria

- [x] the next smallest old `ChatConfig` content-layout subset is explicitly classified as promoted or fallback
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
  - already-supported target `TrChatConfig` and legacy request/display subsets must keep entering through `Root + Page`
- Contract evidence:
  - source contract tests and one blackbox proof for the classified content-layout subset

## Decision Log

- 2026-04-21:
  - after the display-default legacy subset was admitted, the next Phase 2 slice should decide whether `layout.contentLayout` can promote without reviving broader layout projection

## Drift Backwrite

- What changed from the original slice:
  - the slice promoted only `layout.contentLayout` instead of carrying broader old `layout` semantics into the blackbox path
  - `layout.variant` and `layout.placements` stayed explicit scaffold fallback
- Which source docs need follow-up:
  - completed in:
    - `design/api-runtime.md`
    - `design/execution.md`
    - `alignment-tracker.md`
    - `EXPERIENCE_LOG.md`
