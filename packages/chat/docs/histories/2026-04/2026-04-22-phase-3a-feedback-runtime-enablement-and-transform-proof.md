## [2026-04-22 14:40] | Task: phase 3a feedback runtime enablement and transform proof

### Why Now

After sender parity and message-action fallback landed, the active Phase 3A slice still had two important gaps: feedback enablement was still easy to read as a page-input-only behavior, and the formal-path transform proof had landed in runtime tests without being backwritten into the active docs.

### Files Changed

- `packages/chat/src/components/feedback/useChatFeedback.ts`
- `packages/chat/src/components/feedback/ChatFeedback.vue`
- `packages/chat/src/components/core/default-renderer/ChatDefaultBodyRegion.vue`
- `packages/chat/tests/_helpers.mjs`
- `packages/chat/tests/runtime/message-actions.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/exec-plans/completed/2026-04-22-phase-3a-renderer-feedback-transform-parity-baseline.md`
- `packages/chat/docs/exec-plans/active/2026-04-22-phase-3a-renderer-runtime-owner-fallback.md`

### Contracts Touched

- message extension UI:
  feedback enablement can now fall back to runtime-owned `message runtime.config.feedback` at the nearest extension UI instead of assuming page-input relay
- message extension proof:
  the formal Root send path now has a recorded `messages.transforms` proof through `createRuntimeFromConfig(config)`
- docs:
  Phase 3A tracker state, runtime ownership notes, and the promoted implementation lesson are backwritten

### Changes Overview

- Main implementation result:
  - `ChatFeedback` now resolves feedback enablement through a shared runtime-aware helper
  - `ChatDefaultBodyRegion` now treats runtime-owned feedback enablement as the fallback owner path when `messageListInput.showFeedback` is absent
  - runtime tests now cover the feedback-enablement helper explicitly
- Main docs result:
  - `api-runtime.md` and `alignment-tracker.md` now record feedback runtime fallback plus formal-path transform proof
  - the Phase 3A active slice was closed and replaced with a renderer-focused follow-up slice
  - `K-018` was promoted into the playbook

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all commands passed
  - runtime suite still prints the existing `localStorage is not defined` warning from `packages/kit/dist`, but the suite passes

### Drift From Plan Or Review

- What drifted:
  - the broad renderer/feedback/transform slice closed first on feedback runtime fallback plus transform proof backwrite before renderer parity
- Why:
  - feedback owner-path drift was the narrowest remaining extension bug, and formal-path transform proof already existed in runtime tests but had not been folded back into the active docs
- Backwrite status:
  - completed

### Known Limits

- This slice does not yet close renderer parity.
- The strongest proof for feedback enablement in this slice is runtime plus source validation rather than a dedicated mounted integration.

### Follow-ups

- Continue Phase 3A with runtime-owned renderer fallback.
- Keep later message-extension work reading runtime-owned config before reopening page-input or scaffold relay.
