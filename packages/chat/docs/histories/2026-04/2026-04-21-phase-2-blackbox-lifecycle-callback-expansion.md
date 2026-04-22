## [2026-04-21 14:55] | Task: Phase 2 blackbox lifecycle callback expansion

### Why Now

`Review C` accepted the narrow target-`TrChatConfig` blackbox kickoff preview as the formal `Phase 2` entry baseline.
The next safe expansion was to stop treating every `callbacks` usage as a blanket scaffold fallback and instead admit the lifecycle-compatible subset into the target `Root + Page` path.

### Files Changed

- `packages/chat/src/components/core/Chat.vue`
- `packages/chat/src/runtime/config/blackboxEntry.ts`
- `packages/chat/src/runtime/config/createRuntimeFromConfig.ts`
- `packages/chat/src/runtime/chat-kit/useChatConversation.ts`
- `packages/chat/src/runtime/chat-kit/useChatKit.ts`
- `packages/chat/src/types/core.ts`
- `packages/chat/src/types/root.ts`
- `packages/chat/src/types/index.ts`
- `packages/chat/tests/runtime/blackbox-entry.test.mjs`
- `packages/chat/tests/runtime/composables.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/generated/config-bridge-matrix.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-2-legacy-entry-expansion-and-fallback-pruning.md`

### Contracts Touched

- config / lifecycle / blackbox entry:
  - target `TrChatConfig` blackbox entry now accepts lifecycle-compatible callbacks
  - `callbacks.onFinish` now normalizes into `config.lifecycle.afterReceive`
  - `callbacks.onError` now normalizes into `config.lifecycle.error`
  - `onBeforeSend / onMessageAction / onModelChange` remain explicit scaffold-only fallback

### Changes Overview

- Main implementation result:
  - extracted blackbox entry classification into `runtime/config/blackboxEntry.ts`
  - allowed `Chat.vue` to keep `Root + Page` for target `TrChatConfig` plus lifecycle-compatible callbacks
  - wired `afterReceive` into the target runtime and guaranteed it runs before message transforms while legacy `onFinish` remains the post-transform hook
- Main docs result:
  - backwrote the new callback classification rule into the API/runtime design
  - promoted `lifecycle.afterReceive` to `supported` in the current bridge matrix
  - closed the Phase 2 legacy-entry expansion slice and recorded the next remaining fallback surface in the tracker

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
- Result:
  - all passed
  - runtime suite still prints the pre-existing `localStorage is not defined` warnings from `packages/kit/dist` persistence fallback, but the suite completed successfully

### Drift From Plan Or Review

- What drifted:
  - the slice stopped short of widening old `ChatConfig` shapes and instead only admitted the lifecycle-compatible callback subset
- Why:
  - this was the first compatibility surface that mapped cleanly into already-frozen target ownership without reopening scaffold projection
- Backwrite status:
  - completed in design docs, bridge matrix, tracker, and the completed execution slice

### Known Limits

- old shipping `ChatConfig` shapes still fall back to `ChatScaffold`
- `onBeforeSend / onMessageAction / onModelChange` still remain scaffold-only compatibility callbacks
- no new helper/public surface cleanup landed in this slice

### Follow-ups

- keep shrinking Phase 2 fallback by classifying additional legacy entry shapes against target owner domains instead of reopening all-or-nothing scaffold cutover
- decide the next safe slice for old `ChatConfig` shape normalization separately from callback cleanup
