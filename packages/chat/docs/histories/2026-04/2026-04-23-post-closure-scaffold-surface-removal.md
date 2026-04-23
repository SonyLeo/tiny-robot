## [2026-04-23 16:40] | Task: post-closure scaffold surface removal

### Why Now

Post-closure cleanup had already frozen the official-path gate and removed the old blackbox promoted subsets. The next bounded cleanup step was to remove the remaining `TrChat` scaffold fallback and explicit scaffold helper surface, then re-anchor the affected docs and e2e boundaries on the official entry ladder.

### Files Changed

- `packages/chat/src/components/core/Chat.vue`
- `packages/chat/src/runtime/config/blackboxEntry.ts`
- `packages/chat/src/index.ts`
- `packages/chat/src/shared/context/index.ts`
- `packages/chat/src/types/ui.ts`
- `packages/chat/tests/runtime/blackbox-entry.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
- `packages/test/src/chat/scenarios/officialSceneConfig.ts`
- `packages/test/src/chat/scenarios/BlackboxEdgeScene.vue`
- `packages/test/src/chat/scenarios/McpFeatureScene.vue`
- `packages/test/src/chat/scenarios/MessageTransformsScene.vue`
- `packages/test/src/chat/scenarios/SenderExtensionsScene.vue`
- `packages/test/src/chat/scenarios/SurfaceApiScene.vue`
- `packages/test/src/chat/README.md`
- `packages/test/src/chat/edge-overrides.spec.ts`
- `packages/test/src/chat/scenario-specs/mcp-feature.spec.ts`
- `packages/test/src/chat/scenario-specs/message-transforms.spec.ts`
- `packages/test/src/chat/scenario-specs/sender-extensions.spec.ts`
- `packages/test/src/chat/scenario-specs/surface-api.spec.ts`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/README.md`
- `docs/src/components/chat.md`
- `docs/src/components/chat-features.md`
- `docs/src/components/chat-advanced.md`
- `docs/demos/chat/blackbox.vue`

### Contracts Touched

- runtime / root / page / config / docs / tests:
  - blackbox `TrChat` is now config-only: target `TrChatConfig` object or serialized target `TrChatConfig`
  - `TrChat.Scaffold` / `TrChatScaffold` and scaffold-only runtime/type/test surfaces are removed
  - official-path e2e boundaries now hand off through `officialSceneConfig.ts`, `TrChat`, `TrChat.Root + TrChat.Page`, `TrChat.Root + primitives`, and bounded `TrChat.Provider` helper scenes

### Changes Overview

- Main implementation result:
  - removed the remaining scaffold fallback from `TrChat`
  - removed the explicit scaffold helper surface and scaffold-only runtime/type/test exports
  - rewired the affected e2e scenes to official target-config or whitebox entry paths
  - tightened failing MCP and surface-api scenarios to the new official boundary instead of preserving old scene assumptions
- Main docs result:
  - rewrote current-state design/process docs so they describe config-only blackbox entry, already-pruned scaffold surface, and the retained closure-batch Playwright gate
  - deleted stale scaffold-era docs demos and the unused `sharedDemoFixtures.ts` helper

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/history.spec.ts src/chat/request-lifecycle.spec.ts src/chat/scenario-specs/workspace-slots.spec.ts src/chat/scenario-specs/renderer-registry.spec.ts src/chat/scenario-specs/layout-config.spec.ts src/chat/scenario-specs/welcome-prompts.spec.ts src/chat/sender-actions.spec.ts src/chat/scenario-specs/surface-api.spec.ts src/chat/scenario-specs/sender-extensions.spec.ts src/chat/scenario-specs/mcp-feature.spec.ts src/chat/scenario-specs/message-transforms.spec.ts src/chat/edge-overrides.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all commands passed
  - the retained Playwright gate initially surfaced 5 stale scene/assertion mismatches in `mcp-feature` and `surface-api`; those were adapted to the new official boundary and the rerun passed

### Drift From Plan Or Review

- What drifted:
  - the planned validation stage exposed old MCP and surface-api assertions that still expected scaffold-era behavior
- Why:
  - the official entry-path cleanup changed the meaning of “default MCP trigger” and some slot/message-count assumptions
- Backwrite status:
  - fixed in the same slice and reflected in `test-boundary-baseline.md`, `packages/test/src/chat/README.md`, and the retained gate command

### Known Limits

- `src/legacy/rootBridge.ts`, `src/legacy/runtimeHints.ts`, and current official-path `useChatScaffoldContext()` consumers still remain and are intentionally outside this slice
- standalone page-level `footer` replace-slot publishing semantics remain deferred

### Follow-ups

- if later cleanup continues, start from replacing official-path `useChatScaffoldContext()` reads so `src/legacy/*` can retire safely
- separately decide whether the reduced compatibility-only edge proofs and provider/comparison helper surfaces should keep evolving or be retired after boundary handoff
