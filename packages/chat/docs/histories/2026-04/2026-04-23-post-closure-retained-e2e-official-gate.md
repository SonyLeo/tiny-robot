# 2026-04-23 Post-Closure Retained E2E Official Gate

## Summary

Adapted the first retained Playwright batch in `packages/test/src/chat` so post-closure cleanup can rely on an official-path e2e gate before deleting compatibility code.

## What Landed

- rewired `BlackboxScene.vue`, `WhiteboxScene.vue`, `GranularScene.vue`, and `RendererRegistryScene.vue` around the official entry ladder:
  - `TrChat`
  - `TrChat.Root + TrChat.Page`
  - `TrChat.Root + primitives`
- introduced `scenarios/officialSceneConfig.ts` as the shared target-`TrChatConfig` source for retained official-path scenes
- updated the first retained Playwright batch:
  - `index.spec.ts`
  - `history.spec.ts`
  - `request-lifecycle.spec.ts`
  - `scenario-specs/workspace-slots.spec.ts`
  - `scenario-specs/renderer-registry.spec.ts`
- kept the retained e2e assertions focused on official-path behavior instead of helper-heavy preset or scaffold semantics
- added a transient `err-once` mock-provider branch so official blackbox request-lifecycle tests can verify retry recovery without reviving legacy edge-only entry paths

## Why It Matters

- post-closure cleanup now has one promoted Playwright gate batch instead of only a future adaptation plan
- later legacy-pruning slices can reuse this official-path batch before deleting compatibility code
- the retained e2e suite now proves the same official ladder already frozen in package docs and package-local mounted tests

## Validation

- `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/history.spec.ts src/chat/request-lifecycle.spec.ts src/chat/scenario-specs/workspace-slots.spec.ts src/chat/scenario-specs/renderer-registry.spec.ts`
- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
- `node packages/chat/scripts/check-refactor-docs.mjs`
