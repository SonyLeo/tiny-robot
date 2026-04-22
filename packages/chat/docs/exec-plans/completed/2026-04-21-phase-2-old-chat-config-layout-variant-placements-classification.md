# Phase 2 Old ChatConfig Layout Variant And Placements Classification

## Goal

Decide whether any narrow old `ChatConfig.layout.variant / layout.placements` subset can be normalized into the `Root + Page` blackbox path without reopening broad list-layout projection, role-placement relay, or scaffold-owned message layout semantics.

## Scope

- In scope:
  - audit whether `layout.variant` or `layout.placements` maps one-to-one into already-frozen target owner domains
  - decide whether a narrow layout subset can promote on top of the already-admitted request-only, display-default, `layout.contentLayout`, and shell-owner subsets
  - keep broader layout, shell, feature, and integration semantics explicit scaffold fallback
  - add proof for any newly admitted layout subset or explicit fallback decision
- Out of scope:
  - broad old `ChatConfig` parity
  - shell, features, or integrations cutover
  - message renderer or role-layout redesign

## Frozen Inputs

- Review / phase gate:
  - Review C passed with follow-ups and Phase 2 may continue
- Contract freeze:
  - target `TrChatConfig`, its serialized form, and the narrow old `ChatConfig` request-only, display-default, `layout.contentLayout`, and shell-owner subsets already enter through `Root + Page`
  - `ui.prompts` and `shell.viewState` are explicitly scaffold fallback
  - old `layout.variant / placements` semantics remain scaffold fallback until a narrow owner-aligned subset is explicitly promoted
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
  - classify `layout.variant / placements` by target owner domain before admitting any subset
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
  - layout promotion silently reopens scaffold-owned role placement semantics
  - Mitigation:
    - admit only fields that collapse directly into already-frozen target owners, otherwise keep the whole slice explicit fallback
- Risk:
  - the slice blurs the boundary between `ui.contentLayout` and broader legacy layout presets
  - Mitigation:
    - require docs and tests that name the admitted or rejected layout subset and the remaining fallback surface

## Exit Criteria

- [x] old `ChatConfig.layout.variant / placements` has one explicitly classified promoted subset or explicit fallback decision
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
  - already-supported target `TrChatConfig` and admitted legacy request/display/content-layout/shell subsets must keep entering through `Root + Page`
- Contract evidence:
  - source contract tests and one blackbox proof or explicit fallback proof for the layout decision

## Decision Log

- 2026-04-21:
  - after the shell-owner legacy subset was admitted, the next Phase 2 slice should decide whether any narrow `layout.variant / placements` subset can promote without reviving broader layout projection or role-placement relay
  - `layout.variant / placements` were kept on explicit scaffold fallback because they still map into old message-list and role-placement projection, not a frozen target blackbox owner domain

## Drift Backwrite

- What changed from the original slice:
  - the slice recorded an explicit fallback decision instead of promoting any part of `layout.variant / placements`
- Which source docs need follow-up:
  - completed in:
    - `design/api-runtime.md`
    - `design/execution.md`
    - `alignment-tracker.md`
    - `PLAYBOOK.md`
    - `EXPERIENCE_LOG.md`
