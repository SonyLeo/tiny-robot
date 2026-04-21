## [2026-04-21 18:25] | Task: Phase 1B page baseline kickoff

### Why Now

`Phase 1A` is already closed, and `Review B` accepted the foundation evidence as sufficient to start `Phase 1B`.
The package needed a real `TrChat.Page` surface plus baseline `history / models / workspace` runtime consumption before any deeper page-shell or blackbox cutover work could proceed safely.

### Files Changed

- `packages/chat/src/index.ts`
- `packages/chat/src/page/TrChatPage.vue`
- `packages/chat/src/page/index.ts`
- `packages/chat/src/components/core/ChatProvider.vue`
- `packages/chat/src/components/core/default-renderer/ChatDefaultRenderer.vue`
- `packages/chat/src/components/workspace/chatUiContext.ts`
- `packages/chat/src/legacy/rootBridge.ts`
- `packages/chat/src/runtime/config/createRuntimeFromConfig.ts`
- `packages/chat/src/types/index.ts`
- `packages/chat/src/types/root.ts`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/contracts/workspace-slot-contract.test.mjs`
- `packages/chat/tests/runtime/root-runtime.test.mjs`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/generated/config-bridge-matrix.md`
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-page-history-models-workspace-baseline.md`

### Contracts Touched

- runtime:
  `ChatHistoryRuntime`, `ChatModelRuntime`, `ChatWorkspaceRuntime`, `ChatWorkspaceRegionRuntime`
- root / page:
  `TrChat.Page`, `Root` bridge slices, runtime-backed provider workspace state
- config:
  `createRuntimeFromConfig(config)` Phase 1B baseline subset for `request.models`, `history.*`, `workspace.*`
- docs:
  Phase 1B active slice, tracker, and bridge matrix

### Changes Overview

- Main implementation result:
  Added the first official `TrChat.Page` export and then moved the actual default page composition into that surface, so `Root + Page` now has a stable public page owner instead of relying on implicit internal renderer knowledge.
  `createRuntimeFromConfig(config)` now builds baseline `history`, `models`, and `workspace` runtime modules, and `Root`'s legacy bridge exposes those modules through scaffold slices so the current page composition can consume them without reopening `Root` or recreating config projection.
  `ChatProvider` now prefers a runtime-backed workspace state when `Root` provides one, and `ChatDefaultRenderer` has been reduced to a compatibility delegate that forwards slots to `TrChat.Page`.
  Public contract tests now pin that ownership split directly: `TrChat.Page` owns the default page structure and workspace slot anchors, while `ChatDefaultRenderer` only has to prove that it delegates to the page surface.
- Main docs result:
  Recorded the Phase 1B bridge subset in `execution.md`, expanded `config-bridge-matrix.md` to show the now-supported `request.models`, `history.*`, and `workspace.*` fields, and updated the tracker/active slice so the current Phase 1B note reflects the landed Page baseline cut.

### Validation

- Commands:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all passed

### Drift From Plan Or Review

- What drifted:
  - the first Phase 1B cut reused the current default page renderer and scaffold bridge before the actual default composition was moved into `TrChat.Page`; a dedicated `src/page/*Region` tree still has not been introduced
- Why:
  - this keeps the page baseline additive, reviewable, and compatible with the existing primitive tree while the `history / models / workspace` runtime contract is still being proven
- Backwrite status:
  - execution slice, tracker, bridge matrix, and page-region contract updated in the same task

### Known Limits

- `TrChat.Page` now owns the default page composition, but it still depends on the current default regions and scaffold bridge instead of a fully independent `src/page/*Region` tree.
- direct mounted `Root + Page` integration coverage still needs to be added on top of the current source/runtime proof in this cut.
- standalone page-level `footer` replace semantics remain deferred.

### Follow-ups

- Add direct mounted `Root + Page` integration coverage that proves the exported page shell mounts and consumes the landed `history / models / workspace` baseline end to end.
- Start a new active Phase 1B slice for direct mounted `Root + Page` integration coverage.
- Continue shrinking scaffold-only assumptions inside the default page path so the future dedicated `src/page` layer can replace them cleanly.
- Keep `messageIndex` shrinkage and footer replace-slot decisions as explicit bounded Phase 1B follow-ups, not hidden regressions in the page baseline work.
