## [2026-04-25 23:55] | Task: post-closure public API contract and export cleanup

### Why Now

The refactor branch had already converged on the three official entry levels, but the actual public package surface was still broader and less explicit than the intended product story.
The package needed a code-first cleanup pass before any user-facing docs could be trusted again.

### Files Changed

- `packages/chat/src/index.ts`
- `packages/chat/src/types/core.ts`
- `packages/chat/src/types/root.ts`
- `packages/chat/src/types/ui.ts`
- `packages/chat/src/types/index.ts`
- `packages/chat/src/page/TrChatPage.vue`
- `packages/chat/src/components/core/ChatSender.vue`
- `packages/chat/src/components/core/ChatMessageList.vue`
- `packages/chat/src/components/core/ChatHeader.vue`
- `packages/chat/src/components/core/ChatWelcome.vue`
- `packages/chat/src/components/history/ChatHistory.vue`
- `packages/chat/src/runtime/config/useTrChatConfigRuntimeResolution.ts`
- `packages/chat/src/runtime/config/createRuntimeFromConfig.ts`
- `packages/chat/src/runtime/provider/resolveProviderRuntime.ts`
- `packages/chat/src/components/feedback/useChatFeedback.ts`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/runtime/root-runtime.test.mjs`
- `packages/chat/tests/runtime/message-actions.test.mjs`
- `packages/chat/tests/runtime/provider-response-provider.test.mjs`
- `packages/chat/tests/integration/root-page-mounted.test.mjs`
- `packages/chat/tests/_stubs/tiny-robot.mjs`
- `packages/test/src/chat/scenarios/*.vue`
- `packages/test/src/chat/mockProvider.ts`

### Contracts Touched

- package root export surface
- public type surface
- `TrChat` default entry contract
- `TrChat.Page` props / emits / slots contract
- `TrChat.Sender` wrapper contract
- `TrChat.MessageList` wrapper contract
- provider transport aliasing
- runtime lifecycle and retry semantics

### Changes Overview

- Main implementation result:
  the package root now promotes a much smaller public surface, `TrChat.config` is explicitly typed as target `TrChatConfig | string`, `TrChat.Page` has explicit props/emits/slot types, `TrChat.Sender` and `TrChat.MessageList` now use explicit props plus named advanced escape hatches instead of raw prop passthrough, `compatibilityRelay` is no longer part of the active leaf public path, `beforeSend` is narrowed to text-only input, `conversation.retry(messageId?)` now honors the targeted failed turn, grouped `messageIndex` handling aligns with the primary message, and `transportAdapter` is now the clearer preferred alias for the retained advanced provider path while `responseProvider` remains supported for compatibility.
- Main docs result:
  package docs and internal refactor routing now point to the code-first API adjudication records rather than treating the older public-surface discussion docs as the latest settled state.

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat build`
  - `node tests/run-all.mjs tests/contracts`
  - `node tests/runtime/trchat-config-entry.test.mjs`
  - `node tests/runtime/trchat-config-runtime-resolution.test.mjs`
  - `node tests/runtime/root-runtime.test.mjs`
  - `node tests/runtime/message-actions.test.mjs`
  - `node tests/runtime/provider-response-provider.test.mjs`
  - `node tests/integration/root-page-mounted.test.mjs`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/surface-api.spec.ts`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/sender-extensions.spec.ts src/chat/scenario-specs/surface-api.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  all commands above passed during the cleanup batches; the only recurring non-blocking issue remained the existing `packages/kit` warning around `localStorage is not defined` during certain mounted/provider paths.

### Drift From Plan Or Review

- What drifted:
  the cleanup ended up going further than a pure export-trim pass and also tightened several runtime-facing public contracts.
- Why:
  once the wrapper contracts and provider aliasing were reviewed against real code and consumer scenarios, a few signature-vs-behavior mismatches were too risky to leave behind.
- Backwrite status:
  completed for the package entry guide and internal adjudication/routing docs.

### Known Limits

- `responseProvider` still exists as a supported compatibility alias beside the clearer `transportAdapter` name.
- some advanced runtime and owner-domain types still remain at the package root even after the top-level type cleanup.
- the large refactor design docs still need a fuller end-state backwrite if the branch wants every contract source to describe the same cleaned surface in detail.

### Follow-ups

- decide whether `responseProvider` should remain a long-term compatibility alias or eventually demote behind `transportAdapter`
- if desired, run one final conservative pass over the remaining root type exports
- backwrite the final user-facing API story into the higher-level design docs now that the code-side public surface has largely stabilized
