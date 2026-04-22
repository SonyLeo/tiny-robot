## [2026-04-22 11:20] | Task: phase 3a message runtime action fallback

### Why Now

After sender `voice / wordCount` parity landed, the next highest-value Phase 3A gap was message extension ownership. `ChatFeedback` already used runtime methods for built-in actions, but it still depended on higher-level prop relay for action definitions and action mode.

### Files Changed

- `packages/chat/src/components/feedback/useChatFeedback.ts`
- `packages/chat/tests/runtime/message-actions.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/integration/root-page-mounted.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

### Contracts Touched

- runtime:
  `message runtime.getActions(messageId)` and runtime `actionMode` now act as the fallback owner path when explicit message-action props are absent
- message extension UI:
  `ChatFeedback` now falls back to runtime-owned action definitions instead of assuming `ChatMessageList` or page-input relay has already provided them
- docs:
  message runtime ownership notes and Phase 3A tracker state are backwritten

### Changes Overview

- Main implementation result:
  - `useChatFeedback` now falls back to `runtime.message.getActions(primaryMessageId)` and `runtime.message.config?.actionMode`
  - explicit `messageActions` input still wins, but runtime ownership now works without prop relay
- Main docs result:
  - `api-runtime.md` and `alignment-tracker.md` now record runtime-owned message action fallback as a landed Phase 3A slice

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all commands passed

### Drift From Plan Or Review

- What drifted:
  - the first active message-extension parity plan closed first on runtime-owned message action fallback before renderer or transform work
- Why:
  - action ownership was the narrowest remaining gap between frozen message runtime contracts and the actual default extension UI path
- Backwrite status:
  - completed

### Known Limits

- This slice does not yet close feedback semantics beyond action ownership.
- Renderer and transform parity still remain open Phase 3A work.

### Follow-ups

- Continue Phase 3A with renderer, feedback, and transform parity.
- Keep later message-extension work moving into runtime ownership instead of re-expanding prop relay assumptions.
