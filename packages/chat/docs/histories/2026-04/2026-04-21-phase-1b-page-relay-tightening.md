## [2026-04-21 21:10] | Task: Phase 1B page relay tightening

### Why Now

The mounted `Root + Page` proof had already landed, but `TrChat.Page` still read several default page inputs directly from `scaffoldContext.presetSlices`.
That made the official page owner depend on a broad compatibility bucket instead of a narrow page-owned boundary.

### Files Changed

- `packages/chat/src/shared/context/index.ts`
- `packages/chat/src/legacy/rootBridge.ts`
- `packages/chat/src/root/TrChatRoot.vue`
- `packages/chat/src/components/core/ChatScaffold.vue`
- `packages/chat/src/page/TrChatPage.vue`
- `packages/chat/src/components/core/default-renderer/ChatDefaultBodyRegion.vue`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-page-relay-tightening.md`

### Contracts Touched

- page owner boundary:
  `TrChat.Page` now consumes a dedicated page-input context instead of reading generic scaffold preset buckets directly
- root / scaffold compatibility:
  both `TrChat.Root` and `TrChat.Scaffold` now provide the same narrow page-input boundary to the official page owner
- docs:
  page-input boundary is now recorded in the API/runtime contract and the page-region lookup artifact

### Changes Overview

- Main implementation result:
  Added `CHAT_PAGE_INPUTS_KEY` and a typed page-input contract for the default page owner.
  `TrChat.Page` now consumes `welcome`, `messageList`, `appearance`, `shell`, `modelSelector`, and `updateModel` through that dedicated boundary instead of directly reading `scaffoldContext.presetSlices`.
  `Root` provides the page inputs from the legacy bridge, and `Scaffold` provides the same shape from preset slices, so the page owner has one narrow read surface across both paths.
- Main test result:
  Contract tests now explicitly assert that `TrChat.Page` uses `useChatPageInputs()` and no longer reads raw `presetSlices` directly.
- Main docs result:
  Updated the active API/runtime contract, page-region contract, tracker note, and recurring-experience log to reflect the new page-input boundary.

### Validation

- Commands:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all passed

### Drift From Plan Or Review

- What drifted:
  - this slice replaced multiple page-owned reads in one cut instead of moving only a single field such as `shell`
- Why:
  - once the dedicated page-input context existed, keeping `TrChat.Page` partially on raw `presetSlices` would have left the owner boundary ambiguous
- Backwrite status:
  - tracker, API/runtime contract, page-region contract, experience log, and completed execution slice updated in the same task

### Known Limits

- `TrChat.Page` no longer reads raw preset buckets directly, but several underlying primitives still read scaffold slices through compatibility paths
- this slice does not retire the scaffold context itself
- no new public API was added; the page-input contract remains an internal owner boundary

### Follow-ups

- start the next Phase 1B slice to narrow the remaining primitive-level scaffold relay paths
- keep `TrChat.Page` composition-only while shrinking those relay reads
- decide when the new page-input-boundary lesson is stable enough to promote from `EXPERIENCE_LOG.md` into `PLAYBOOK.md`
