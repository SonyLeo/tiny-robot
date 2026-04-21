## [2026-04-21 16:40] | Task: Phase 1A Root bootstrap

### Why Now

Review A passed with follow-ups and moved `Phase 1A` from `ready-to-start` into active implementation.
The package needed a real `TrChat.Root` and `createRuntimeFromConfig(config)` baseline before any `Page`, history, models, or workspace work could proceed safely.

### Files Changed

- `packages/chat/src/index.ts`
- `packages/chat/src/types/index.ts`
- `packages/chat/src/types/root.ts`
- `packages/chat/src/root/TrChatRoot.vue`
- `packages/chat/src/root/index.ts`
- `packages/chat/src/runtime/config/index.ts`
- `packages/chat/src/runtime/config/createRuntimeFromConfig.ts`
- `packages/chat/src/runtime/core/messageIdentity.ts`
- `packages/chat/src/runtime/core/normalizeRuntime.ts`
- `packages/chat/src/runtime/chat-kit/useChatKit.ts`
- `packages/chat/src/runtime/chat-kit/useChatMessages.ts`
- `packages/chat/src/legacy/rootBridge.ts`
- `packages/chat/src/legacy/runtimeHints.ts`
- `packages/chat/src/shared/context/index.ts`
- `packages/chat/src/internal.ts`
- `packages/chat/src/components/core/ChatSender.vue`
- `packages/chat/src/components/feedback/ChatFeedback.vue`
- `packages/chat/src/components/feedback/useChatFeedback.ts`
- `packages/chat/src/components/renderers/EditInputRenderer.vue`
- `packages/chat/src/components/renderers/ErrorRenderer.vue`
- `packages/chat/src/types/core.ts`
- `packages/chat/tests/run-all.mjs`
- `packages/chat/package.json`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/REFACTOR_COLLAB_GUIDE.md`
- `packages/chat/docs/generated/config-bridge-matrix.md`
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/AGENTS.md`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/_helpers.mjs`
- `packages/chat/tests/runtime/message-actions.test.mjs`
- `packages/chat/tests/runtime/root-runtime.test.mjs`
- `packages/chat/tests/runtime/message-runtime.test.mjs`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1a-bootstrap-and-root-baseline.md`

### Contracts Touched

- runtime:
  `ChatRuntimeInput`, `ChatRuntime`, `ChatConversationRuntime`, `ChatSenderRuntime`, `ChatMessageRuntime`, `ChatAttachmentsRuntime`
- root:
  `TrChat.Root`
- config:
  `createRuntimeFromConfig(config)` Phase 1A subset
- docs:
  Phase 1A tracker and active execution slice

### Changes Overview

- Main implementation result:
  Added an additive bootstrap path for `TrChat.Root` and `createRuntimeFromConfig(config)`, with new runtime/root public types and a temporary legacy bridge that lets existing primitives keep working during Phase 1A.
  The follow-up hardening pass also switched `Root` mode sender draft and attachment handling onto `runtime.sender`, and kept the visible attachments area bound to `sender.pendingAttachments`.
  A second hardening pass made `messageId` state-backed and stable across edit / retry / regenerate flows, and moved message-level `copy` plus `editing / optimistic / error / busy` view-state into the `message runtime` contract.
  The latest cut keeps built-in feedback actions on that same path: `copy / edit` now prefer `message runtime`, assistant refresh prefers `conversation runtime`, and action context carries `messageId` as the formal key while `messageIndex` stays legacy-only metadata.
  The renderer layer now follows suit: inline edit save/cancel prefers `message runtime`, and message-level retry in the error renderer prefers `conversation runtime` before falling back to legacy `chatKit` behavior.
  The next tightening pass gives custom actions a stable grouped-message path too: action context and emitted payloads now include `messageIds`, so multi-message actions can stop keying off array position even while legacy wrappers still expose `messageIndex`.
  The closing pass locks the remaining Phase 1A semantics: `conversation.initialMessages` now eagerly materializes the first active conversation when no restore exists, the default page path explicitly keeps `footer-extra` as the only page-level footer slot, and package-local scripts expose runtime/contract/doc checks as the default Phase 1A validation baseline.
- Main docs result:
  Backwrote Phase 1A status and execution-slice progress after the first Root/bootstrap cut landed, and updated the `ChatMessageViewState` contract snippet so it matches the new runtime behavior.
  `packages/chat/AGENTS.md` now explicitly requires a progress update after each completed task, using the tracker and active execution slice as the default evidence base.

### Validation

- Commands:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `pnpm -F @opentiny/tiny-robot-chat test:unit`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all passed

### Drift From Plan Or Review

- What drifted:
  - the first cut reused existing primitives through a temporary legacy adapter instead of rewriting the primitive layer in the same slice
- Additional implementation note:
  - `ChatSender.vue` now has a Root-aware branch that consumes `CHAT_RUNTIME_KEY`; legacy scaffold mode still follows the old `chatKit + attachments manager` path
  - `messageId` is now written into message `state` so persistence/hydration can restore the same UI action key, while retry/regenerate/edit resend paths explicitly preserve the source user message identity
- Why:
  - this kept the first implementation cut small, reviewable, and compatible with current package-local validation
- Backwrite status:
  - active execution slice and alignment tracker updated in the same task

### Known Limits

- `TrChat.Page` is still out of scope for this slice.
- `history / models / workspace / mcp` runtime modules remain deferred.
- a standalone page-level `footer` replace slot remains deferred until Phase 1B proves the page baseline contract.

### Follow-ups

- Use Review B to report the closed Phase 1A foundation evidence and open Phase 1B.
- Keep built-in message actions moving toward `message runtime` as the single execution path, so legacy `chatKit` index adapters can keep shrinking.
- Continue shrinking `messageIndex` usage so built-in and custom action execution can eventually rely on `messageId` alone outside `legacy/`.
- Keep custom message actions on the new `messageId` / `messageIds` path and avoid adding any new index-only action helpers.
- Continue shrinking renderer-side `messageIndex` fallbacks until remaining index usage is isolated to clearly named legacy bridges.
- Carry the deferred standalone `footer` replace-slot decision into the Phase 1B page baseline instead of back-porting it into Phase 1A.
