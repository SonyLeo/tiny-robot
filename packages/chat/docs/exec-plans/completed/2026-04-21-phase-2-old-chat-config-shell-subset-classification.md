# Phase 2 Old ChatConfig Shell Subset Classification

## Goal

Decide whether any narrow old `ChatConfig.shell` subset can be normalized into the `Root + Page` blackbox path without reopening broad workspace shell projection or reviving scaffold-owned layout semantics.

## Scope

- In scope:
  - audit whether any old `shell` fields map one-to-one into target `workspace`
  - decide whether a narrow shell subset can promote on top of the already-admitted request-only, display-default, and `layout.contentLayout` legacy subsets
  - keep broader `shell`, `features`, and `integrations` semantics explicit scaffold fallback
  - add proof for any newly admitted shell subset or explicit fallback decision
- Out of scope:
  - broad old `ChatConfig` parity
  - full workspace shell parity
  - `features.*` / `integrations.*` cutover

## Frozen Inputs

- Review / phase gate:
  - Review C passed with follow-ups and Phase 2 may continue
- Contract freeze:
  - target `TrChatConfig`, its serialized form, and the narrow old `ChatConfig` request-only, display-default, and `layout.contentLayout` subsets already enter through `Root + Page`
  - `ui.prompts` is now explicitly classified as scaffold fallback
  - old `shell` semantics remain scaffold fallback until a narrow owner-aligned subset is explicitly promoted
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
  - classify old `shell` fields by target owner domain before admitting any subset
  - keep `createRuntimeFromConfig(config) -> Root + Page` as the only target blackbox on-ramp
  - do not reopen generic workspace shell projection inside `Page`, `Chat.vue`, or the scaffold adapter
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - shell promotion silently reopens broad workspace projection
  - Mitigation:
    - admit only fields that collapse one-to-one into target `workspace`, and keep view-state / broad region semantics out of scope unless explicitly evidenced
- Risk:
  - the slice blurs the line between target workspace defaults and legacy shell presets
  - Mitigation:
    - require docs and tests that name the admitted or rejected shell subset and the remaining fallback surface

## Exit Criteria

- [x] old `ChatConfig.shell` has one explicitly classified promoted subset or explicit fallback decision
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
  - source contract tests and one blackbox proof or explicit fallback proof for the shell subset decision

## Decision Log

- 2026-04-21:
  - after `ui.prompts` was explicitly classified as scaffold fallback, the next Phase 2 slice should decide whether any narrow old `shell` subset can promote without reviving broad workspace projection
  - the admitted shell-owner subset is limited to `shell.variant / shell.leftRegion / shell.rightRegion`, normalized into target `workspace.defaultView / left / right`
  - `shell.viewState` remains explicit scaffold fallback because the target blackbox path still has no frozen workspace owner for that field

## Drift Backwrite

- What changed from the original slice:
  - the slice promoted only `shell.variant / shell.leftRegion / shell.rightRegion`
  - `shell.viewState` stayed explicit scaffold fallback instead of being carried through as a pseudo-workspace default
- Which source docs need follow-up:
  - completed in:
    - `design/api-runtime.md`
    - `design/execution.md`
    - `alignment-tracker.md`
    - `EXPERIENCE_LOG.md`
