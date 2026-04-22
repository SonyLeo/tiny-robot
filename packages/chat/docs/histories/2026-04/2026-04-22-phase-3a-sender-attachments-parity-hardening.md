# Phase 3A Sender And Attachments Parity Hardening

## Task

Close the remaining Phase 3A sender-plus-attachments parity gap by proving that the default owner path no longer depends on feature-first attachment affordances.

## Why Now

After sender defaults, actions, feedback, renderer, and transform slices were closed, sender plus attachments was the last open Phase 3A hardening gap. Leaving it open would keep `senderActionsFeature` and attachment feature context looking like the real owner for upload affordances.

## Files Changed

- `packages/chat/src/components/core/ChatSender.vue`
- `packages/chat/src/components/attachments/ChatAttachments.vue`
- `packages/chat/tests/runtime/root-runtime.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/integration/root-page-mounted.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

## Contracts Touched

- `ChatSender` now prefers `runtime.attachments.uploadConfig` before attachment feature context and `senderActionsFeature` for upload affordances.
- `ChatAttachments` now falls back to `runtime.sender.pendingAttachments` and `runtime.attachments.listConfig` when attachment feature context is absent.
- The strongest parity proof is an isolated mounted `ChatSender + ChatAttachments` case with only `CHAT_RUNTIME_KEY`, not `Root + Page`, because the latter still projects attachment feature context through the bridge.

## Validation

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`

## Drift From Plan/Review

- The slice was originally framed as generic sender-plus-attachments parity. The final proof was tightened to a direct mounted sender/attachments case so the evidence would not be confounded by bridge-projected attachment feature context.

## Known Limits

- Phase 3A is now closed, but Phase 3B workspace/mobile/MCP parity still remains.

## Follow-ups

- Continue with `2026-04-22-phase-3b-workspace-mobile-parity-baseline.md`.
