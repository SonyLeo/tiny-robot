# Public API Adjudication Baseline

Status: active code-first decision record, partially landed in code.

This file records the current public-API adjudication for `packages/chat` after code-first review.
It exists to prevent drift while the package decides which exported surfaces should remain stable, which should stay public but be re-expressed, and which should stop being treated as frozen public contract.

This is not a user-facing package guide.
This is not a replacement for the final contract docs.
Until the API cleanup work lands, this file is the working decision record for public-surface discussion.

## Scope

This record is based on:

- `packages/chat/src/**`
- `packages/chat/demo/src/**`
- `packages/chat/tests/**`
- `packages/test/src/chat/**`

It does not treat current README wording or older refactor docs as the decision source.
Those documents may be stale.

## Decision Rule

Every relevant public surface should currently fall into one of three buckets:

- `keep`
  keep public and keep teaching it as a supported package surface
- `keep but re-express`
  keep public, but do not freeze the current naming, typing, export shape, or support-tier expression
- `do not treat as stable public contract`
  the current surface may continue to exist temporarily, but should not be treated as frozen package API

## High-Level Judgment

The package direction is still valid:

- `TrChat`
- `TrChat.Root + TrChat.Page`
- `TrChat.Root + primitives`
- retained advanced `TrChat.Provider`

The main problem is not that the product model is wrong.
The main problem is that the currently exported surface is broader, leakier, and less explicit than the public contract should be.

In short:

- the official entry ladder is mostly right
- the actual stable public API should be smaller than the current flat export surface

## Adjudicated Surfaces

### Keep

These surfaces are supported by actual code usage plus demo or test evidence, and should remain part of the public package story:

- `TrChat`
- `TrChat.Root`
- `TrChat.Page`
  Keep the path, not the current unfrozen `Page` sub-contract details
- `TrChat.Root + primitives` as an official composition path
- `TrChat.Provider`
  Keep the capability, even though the current expression still needs work
- `createRuntimeFromConfig`
  Keep as an advanced bridge helper, not as a normal component API
- `createRuntimeFromConfig(config) -> { runtime, ui }` as the current bridge story for whitebox upgrade
- `useMcpManager`
- `TrMcpTrigger`
- `TrChatFeedback`
- `TrChatConfig`
- `ChatContentLayout`

### Keep But Re-Express

These surfaces represent real capabilities, but the current public expression should not be frozen:

- `TrChat` default entry typing
  `config` is still typed too loosely relative to the actual supported contract
- `TrChat.Provider`
  keep the capability, but the current namespace and support-tier signal still make it read like a fourth official entry
- `ResponseProvider`
  keep as a compatibility alias, but the preferred public wording should move toward `transportAdapter`
- `ChatTransportAdapter`
  preferred transport-oriented alias for the retained provider path
- `createRuntimeFromConfig`
  keep it public, but treat it as an advanced bridge helper rather than a normal component API
- `TrChat.Layout`
- `TrChat.WorkspaceLayout`
- `TrChat.Welcome`
- `TrChat.Footer`
- `TrChat.Attachments`
- `TrMcpTrigger`
  current behavior is closer to a composed launcher than a simple trigger primitive
- `ChatUIMessage` vs `ChatMessage`
  the direction is right, but the public boundary is not yet cleanly explained by the types
- `afterReceive`
  useful hook, but the current name suggests a later lifecycle point than the code actually provides
- `error`
  useful hook, but the current surface mixes `ChatErrorInfo` and raw `Error`
- duplicate top-level aliases such as:
  `TrChatRoot`
  `TrChatPage`
  `TrChatProvider`
  `TrChatLayout`
  `TrChatWorkspaceLayout`
  `TrChatAttachments`
  The actual proved usage is mostly through `TrChat.*`, not duplicated flat names
- naming inconsistencies such as:
  `ui.copy` vs `messages`
  primitive names split between `TrChat.*` and standalone exports

### Do Not Treat As Stable Public Contract

These surfaces should not be treated as frozen public contract in their current form:

- current `TrChat.Page` props surface
- current `TrChat.Page` attrs surface
- current `TrChat.Page` emits surface
- current `TrChat.Page` slot surface
- current `TrChat.Page` slot-props surface
- current generated page slot contract artifacts
  until they match implementation and are backed by explicit component contract
- `TrChat.History`
  currently lacks enough direct public-consumer proof to be treated as stable
- `TrChat.WorkspaceShell`
  currently lacks enough direct public-consumer proof to be treated as stable
- `TrChat.WorkspaceRightSheet`
  currently lacks enough direct public-consumer proof to be treated as stable
- `TrChat.Header`
  now has clearer explicit contract than before, but still should not be treated as fully frozen leaf API
- `TrChat.Welcome`
  now has clearer explicit contract than before, but still should not be treated as fully frozen leaf API
- `TrChat.MessageList`
  now has clearer explicit contract and `bubbleListProps`, but still should not be treated as fully frozen leaf API
- `TrChat.Sender`
  now has clearer explicit contract and `senderProps`, but still should not be treated as fully frozen leaf API
- `TrChat.WorkspaceShell` in its current drifted type vs implementation form
- `TrModelSelector`
  currently lacks enough direct public-consumer proof to be treated as stable
- `TrChatMcpPanel`
  currently lacks enough direct public-consumer proof to be treated as stable
- root-level low-level hooks without public-consumer proof:
  `useChatAttachments`
  `useDefaultBubbleConfig`
  `useModelSelector`
  `useChatFeedback`
  `useFloatingDropdown`
  `useKeyboardNavigation`
  `useHistoryState`
  `useSlotFilter`
- root-level renderer exports without public-consumer proof:
  `MarkStreamRenderer`
  `ErrorRenderer`
  `EditInputRenderer`
  `ToolCallsRenderer`
  `ToolCallRenderer`
  `AttachmentsRenderer`
- root-level registry and resolver exports without public-consumer proof:
  `CHAT_FEATURE_REGISTRY`
  `resolveChatFeatures`
  `KNOWN_PROVIDERS`
- most top-level type exports that are only token-protected but not meaningfully proven by external-style package usage
- remaining public root exports or top-level types that do not have enough external-style consumer proof

## `createRuntimeFromConfig` Positioning

### What it is

`createRuntimeFromConfig` is currently an advanced bridge helper:

- input:
  target `TrChatConfig`
- output:
  `{ runtime, ui }`
- purpose:
  bridge the blackbox config model into the whitebox `TrChat.Root + ...` model

### What it is not

It should not be treated as:

- a normal component API
- a required step for ordinary `TrChat` usage
- a generic utility unrelated to the package entry ladder

### Working judgment

Keep it public because it is the only realistic on-ramp from:

- `TrChatConfig`
to
- `TrChat.Root + TrChat.Page`
- `TrChat.Root + primitives`

But do not present it as a first-class peer to the main component entry surfaces.
It should be treated as an advanced bridge helper.

## Real Consumer Evidence

The strongest actual consumer evidence currently supports:

- `TrChat`
- `TrChat.Root + TrChat.Page`
- `TrChat.Root + primitives`
- `TrChat.Provider`
- `createRuntimeFromConfig`
- `useMcpManager`
- `TrMcpTrigger`
- `TrChatFeedback`

This evidence comes from:

- `packages/chat/demo/src/components/TrChatDemo.vue`
- `packages/chat/demo/src/components/WhiteboxDemo.vue`
- `packages/chat/demo/src/components/GranularWorkspaceDemo.vue`
- `packages/test/src/chat/scenarios/*.vue`
- `packages/test/src/chat/scenario-specs/index.spec.ts`
- `packages/test/src/chat/scenario-specs/surface-api.spec.ts`
- `packages/test/src/chat/scenario-specs/mcp-feature.spec.ts`
- `packages/test/src/chat/scenario-specs/feedback.spec.ts`

Many other exports are only protected by source-token tests or internal package-local usage.
That is not enough to treat them as stable public API.

## Immediate Implications

Before rewriting public docs, the package should first decide:

1. which exports remain in the top-level package surface
2. which exports stay public but move into advanced or secondary positioning
3. which exports should stop being treated as frozen public API
4. which signatures need code changes because their current type contract over-promises behavior

## Current Landing Status

The following decisions have already been backwritten into code:

- `TrChat.config` is now typed as target `TrChatConfig | string`
- `TrChat.Page` now has explicit props, emits, and slot contract types
- `TrChat.Sender` now uses explicit props plus `senderProps` plus controlled DOM attr passthrough
- `TrChat.MessageList` now uses explicit props plus `bubbleListProps` plus controlled DOM attr passthrough
- `compatibilityRelay` is no longer part of the active leaf public path
- root exports have been pruned and demoted in multiple batches
- `retry(messageId?)`, `beforeSend`, and grouped `messageIndex` handling were aligned to the actual runtime behavior
- `transportAdapter` is now the clearer preferred alias for the retained provider path, while `responseProvider` remains supported as a compatibility alias

## Next Working Questions

The next implementation-facing decisions should focus on:

1. top-level export pruning or re-tiering in `packages/chat/src/index.ts`
2. `TrChat` default entry typing
3. `TrChat.Page` explicit contract design
4. leaf primitive contract cleanup
5. `Provider` / `ResponseProvider` / transport boundary naming
6. message and lifecycle contract tightening around `messageId`, `beforeSend`, `afterReceive`, and `error`
