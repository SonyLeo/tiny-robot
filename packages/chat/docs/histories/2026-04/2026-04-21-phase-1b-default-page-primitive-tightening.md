## [2026-04-21 22:05] | Task: Phase 1B default page primitive relay tightening

### Why Now

The previous relay-tightening slice gave `TrChat.Page` a dedicated page-input boundary, but the nearest default page primitives still rediscovered several values through scaffold relay.
That left the official page owner narrower than before, yet still not fully responsible for passing the defaults it already owned.

### Files Changed

- `packages/chat/src/shared/context/index.ts`
- `packages/chat/src/legacy/rootBridge.ts`
- `packages/chat/src/root/TrChatRoot.vue`
- `packages/chat/src/components/core/ChatScaffold.vue`
- `packages/chat/src/components/core/ChatProvider.vue`
- `packages/chat/src/page/TrChatPage.vue`
- `packages/chat/src/components/core/default-renderer/ChatDefaultHeaderRegion.vue`
- `packages/chat/src/components/core/default-renderer/ChatDefaultBodyRegion.vue`
- `packages/chat/src/components/core/ChatHeader.vue`
- `packages/chat/src/components/history/ChatHistory.vue`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-page-relay-tightening.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

### Contracts Touched

- default page owner boundary:
  `TrChat.Page` now passes explicit default inputs to the nearest page primitives instead of relying on those primitives to rediscover the same values through scaffold relay
- provider boundary:
  `TrChat.Provider` no longer reads shell config from scaffold context; callers provide it explicitly when they want that shell preset
- docs:
  the page contract now distinguishes between page-input ownership and the remaining deeper compatibility relay paths

### Changes Overview

- Main implementation result:
  Expanded the page-input contract with `header`, `layout`, and `history` defaults.
  `Root` and `Scaffold` now both provide that expanded shape, and `TrChat.Page` forwards the relevant pieces to `ChatProvider`, `ChatLayout`, `ChatHeader`, `ChatHistory`, `ChatWelcome`, and `ChatMessageList`.
  This keeps the default page owner narrow but also makes it the clear source of defaults for the nearest official page primitives.
- Main test result:
  Contract tests now assert both that `TrChat.Page` avoids raw preset buckets and that it passes explicit primitive inputs near the page owner.
- Main docs result:
  Updated the completed relay-tightening slice, tracker, API/runtime contract, page-region contract, and experience log.

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
  - this task extended the completed relay-tightening slice instead of first opening a separately named follow-up slice
- Why:
  - once the page-input boundary existed, the next default page primitive relays were part of the same ownership cleanup and could be tightened safely in one continuation
- Backwrite status:
  - completed slice, tracker, API/runtime contract, page-region contract, and experience log updated in the same task

### Known Limits

- deeper workspace/sidebar/mobile-sheet compatibility paths still read scaffold-derived defaults
- `ChatLayout`, `ChatHeader`, `ChatHistory`, `ChatWelcome`, and `ChatMessageList` retain scaffold fallbacks for non-page compatibility paths
- this slice does not yet retire scaffold context from those deeper or legacy-only call sites

### Follow-ups

- start the next Phase 1B slice to tighten workspace/sidebar/mobile-sheet relay paths
- keep `TrChat.Page` composition-only while shrinking those deeper compatibility reads
- decide when the explicit-primitive-input lesson is stable enough to promote in the knowledge playbook
