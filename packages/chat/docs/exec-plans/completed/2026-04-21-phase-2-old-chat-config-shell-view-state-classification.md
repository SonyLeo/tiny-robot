# Phase 2 Old ChatConfig Shell View-State Classification

## Goal

Decide whether any narrow old `ChatConfig.shell.viewState` subset can be normalized into the `Root + Page` blackbox path without reopening scaffold-owned workspace display semantics or inventing a target workspace owner that does not exist yet.

## Scope

- In scope:
  - audit whether `shell.viewState` maps one-to-one into any already-frozen target owner domain
  - decide whether a narrow `shell.viewState` subset can promote on top of the already-admitted request-only, display-default, `layout.contentLayout`, and shell-owner subsets
  - keep broader shell, feature, and integration semantics explicit scaffold fallback
  - add proof for any newly admitted shell view-state subset or explicit fallback decision
- Out of scope:
  - broad old `ChatConfig` parity
  - layout, features, or integrations cutover
  - new target workspace display-state API design

## Frozen Inputs

- Review / phase gate:
  - Review C passed with follow-ups and Phase 2 may continue
- Contract freeze:
  - target `TrChatConfig`, its serialized form, and the narrow old `ChatConfig` request-only, display-default, `layout.contentLayout`, and shell-owner subsets already enter through `Root + Page`
  - `ui.prompts` and `layout.variant / placements` are explicitly scaffold fallback
  - old `shell.viewState` semantics remain scaffold fallback until a narrow owner-aligned subset is explicitly promoted
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
  - classify `shell.viewState` by target owner domain before admitting any subset
  - keep `createRuntimeFromConfig(config) -> Root + Page` as the only target blackbox on-ramp
  - do not invent a new workspace display-state target contract just to absorb legacy shell view-state
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - shell view-state promotion silently reopens scaffold-owned workspace display semantics
  - Mitigation:
    - admit only fields that collapse directly into already-frozen target owners, otherwise keep the whole slice explicit fallback
- Risk:
  - the slice invents a new target workspace API just to accommodate old shell semantics
  - Mitigation:
    - require explicit proof that any promoted field is already represented in the target contract before admitting it

## Exit Criteria

- [x] old `ChatConfig.shell.viewState` has one explicitly classified promoted subset or explicit fallback decision
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
  - already-supported target `TrChatConfig` and admitted legacy request/display/content-layout/shell-owner subsets must keep entering through `Root + Page`
- Contract evidence:
  - source contract tests and one blackbox proof or explicit fallback proof for the shell view-state decision

## Decision Log

- 2026-04-21:
  - after `layout.variant / placements` was explicitly classified as scaffold fallback, the next Phase 2 slice should decide whether any narrow `shell.viewState` subset can promote without reviving broader scaffold-owned workspace display semantics
  - `shell.viewState` was kept on explicit scaffold fallback because it still describes old shell display-state semantics and does not collapse directly into any already-frozen target workspace owner

## Drift Backwrite

- What changed from the original slice:
  - the slice recorded an explicit fallback decision instead of promoting any part of `shell.viewState`
- Which source docs need follow-up:
  - completed in:
    - `design/api-runtime.md`
    - `design/execution.md`
    - `alignment-tracker.md`
    - `PLAYBOOK.md`
    - `EXPERIENCE_LOG.md`
