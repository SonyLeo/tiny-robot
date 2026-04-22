# Phase 2 Old ChatConfig Prompts Classification

## Goal

Decide whether old `ChatConfig.ui.prompts` should stay explicit scaffold fallback or whether any narrower prompt-oriented subset can normalize into the `Root + Page` blackbox path without reopening preset projection or welcome-feature relay.

## Scope

- In scope:
  - audit whether old `ui.prompts` maps one-to-one into any already-frozen target owner domain
  - decide whether that field must remain explicit fallback, or whether a narrower prompt-oriented subset can safely promote
  - keep `layout.variant`, `layout.placements`, `shell`, `features`, and `integrations` explicit scaffold fallback
  - add proof for either a promoted or explicitly rejected prompt subset
- Out of scope:
  - broad old `ChatConfig` parity
  - feature parity for welcome prompt actions
  - `shell`, `features.*`, or `integrations.*` cutover

## Frozen Inputs

- Review / phase gate:
  - Review C passed with follow-ups and Phase 2 may continue
- Contract freeze:
  - target `TrChatConfig`, its serialized form, and the narrow old `ChatConfig` request-only, display-default, and `layout.contentLayout` subsets already enter through `Root + Page`
  - `ui.prompts` and broader preset-oriented legacy semantics remain scaffold fallback until a narrower prompt subset is explicitly classified
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
  - classify `ui.prompts` by target owner domain before admitting any subset
  - keep `createRuntimeFromConfig(config) -> Root + Page` as the only target blackbox on-ramp
  - do not reopen generic preset projection inside `Page`, `Chat.vue`, or the scaffold adapter
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - prompt promotion silently reopens preset projection and welcome feature relay
  - Mitigation:
    - prefer an explicit fallback decision unless a prompt subset maps one-to-one into an already-frozen owner path
- Risk:
  - the slice blurs the line between target `ui` defaults and legacy welcome prompt presets
  - Mitigation:
    - require docs and tests that name the admitted or rejected prompt subset and the remaining fallback surface

## Exit Criteria

- [x] old `ChatConfig.ui.prompts` is explicitly classified as promoted subset or fallback
- [x] any promoted subset has targeted proof, or an explicit fallback decision has tests/docs support
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
  - already-supported target `TrChatConfig` and legacy request/display/content-layout subsets must keep entering through `Root + Page`
- Contract evidence:
  - source contract tests and one blackbox proof or explicit fallback proof for the prompt subset decision

## Decision Log

- 2026-04-21:
  - after `layout.contentLayout` was admitted, the next Phase 2 slice should decide whether `ui.prompts` is promotable at all or should remain an explicit scaffold-only fallback

## Drift Backwrite

- What changed from the original slice:
  - the slice explicitly classified `ui.prompts` as scaffold fallback instead of trying to promote a narrower prompt subset
  - the fallback decision now has runtime and blackbox proof
- Which source docs need follow-up:
  - completed in:
    - `design/api-runtime.md`
    - `design/execution.md`
    - `alignment-tracker.md`
    - `EXPERIENCE_LOG.md`
