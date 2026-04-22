## [2026-04-21 20:03] | Task: Phase 1B welcome/message-list relay pruning

### Why Now

After layout, header/history, and workspace owner paths all stopped leaving silent compatibility relay active in the default page path, the remaining obvious body-path drift sat in `ChatWelcome` and `ChatMessageList`.
`TrChat.Page` already passed explicit welcome and message-list owner inputs through `ChatDefaultBodyRegion`, but those primitives could still silently rediscover defaults from scaffold relay.

### Files Changed

- `packages/chat/src/components/core/ChatWelcome.vue`
- `packages/chat/src/components/core/ChatMessageList.vue`
- `packages/chat/src/components/core/default-renderer/ChatDefaultBodyRegion.vue`
- `packages/chat/src/types/ui.ts`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-welcome-message-list-relay-pruning.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

### Contracts Touched

- welcome/message-list default owner path:
  the default page body path can now explicitly disable compatibility relay once it already provides welcome/message-list owner inputs
- compatibility fallback:
  `ChatWelcome` and `ChatMessageList` still preserve scaffold-based fallback for broader compatibility consumers when the opt-out is not used
- phase closure:
  this slice closes the remaining default-page compatibility relay work that was blocking the Phase 1B owner-path baseline from being considered complete

### Changes Overview

- Main implementation result:
  `ChatWelcome` and `ChatMessageList` now accept a compatibility-relay toggle.
  `ChatDefaultBodyRegion` uses that toggle to disable scaffold fallback in the official default page path, keeping the owner-input chain explicit through the body composition too.
- Main test result:
  `public-surface.test.mjs` now asserts that the default page body path explicitly disables compatibility relay for welcome/message-list and that both primitives expose the corresponding relay guard in source.
- Main docs result:
  Updated the completed execution slice, tracker, API/runtime contract, page-region contract, and experience log.

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
  - the default page body path already has explicit owner inputs, but direct primitive usage still benefits from bounded compatibility fallback
- Backwrite status:
  - completed slice, tracker, API/runtime contract, page-region contract, and experience log updated in the same task

### Known Limits

- standalone page-level `footer` replace slot remains deferred and is now a Review C / Phase 2 follow-up, not a Phase 1B blocker
- this slice does not attempt full primitive-level scaffold-context retirement outside the default owner path

### Follow-ups

- prepare Review C using the complete Phase 1B evidence bundle
- start Phase 2 planning only after Review C accepts the Phase 1B default-owner-path baseline
