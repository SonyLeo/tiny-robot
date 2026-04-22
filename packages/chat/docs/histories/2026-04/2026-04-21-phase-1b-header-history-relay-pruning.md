## [2026-04-21 19:55] | Task: Phase 1B header/history relay pruning

### Why Now

After `TrChat.Page` narrowed the page-input boundary, tightened the nearest default primitives, and removed mixed renderer ownership from `ChatLayout`, the next remaining owner-path drift sat in `ChatHeader` and `ChatHistory`.
The default page path already passed explicit owner inputs into those primitives, but compatibility relay still stayed silently active underneath.

### Files Changed

- `packages/chat/src/components/core/ChatHeader.vue`
- `packages/chat/src/components/history/ChatHistory.vue`
- `packages/chat/src/components/core/default-renderer/ChatDefaultHeaderRegion.vue`
- `packages/chat/src/page/TrChatPage.vue`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-header-history-relay-pruning.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

### Contracts Touched

- header/history default owner path:
  the default page path can now explicitly disable compatibility relay once it already provides header/history owner inputs
- compatibility fallback:
  `ChatHeader` and `ChatHistory` still preserve scaffold-based fallback for broader compatibility consumers when the opt-out is not used
- knowledge layer:
  the repeated lesson about authoritative owner inputs and explicit compatibility relay is now promoted into the playbook

### Changes Overview

- Main implementation result:
  `ChatHeader` and `ChatHistory` now accept a compatibility-relay toggle.
  `TrChat.Page` and `ChatDefaultHeaderRegion` use that toggle to disable scaffold fallback in the official default page path, keeping the owner-input chain explicit end to end.
- Main test result:
  `public-surface.test.mjs` now asserts that the default page path explicitly disables compatibility relay for header/history and that both primitives expose the corresponding relay guard in source.
- Main docs result:
  Updated the completed execution slice, tracker, API/runtime contract, page-region contract, playbook, and experience log.

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
  - the slice landed as an explicit compatibility-relay opt-out instead of removing scaffold fallback entirely
- Why:
  - the default page path already has explicit owner inputs, but direct primitive usage still benefits from bounded compatibility fallback
- Backwrite status:
  - completed slice, tracker, API/runtime contract, page-region contract, playbook, and experience log updated in the same task

### Known Limits

- `ChatWelcome` and `ChatMessageList` still retain compatibility relay for non-page usage
- this slice does not attempt full primitive-level scaffold retirement

### Follow-ups

- continue with the remaining welcome/message-list compatibility relay
- keep promoting repeated narrowing rules into the knowledge layer instead of leaving them buried in histories
