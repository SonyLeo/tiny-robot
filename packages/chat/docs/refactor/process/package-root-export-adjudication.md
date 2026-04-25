# Package Root Export Adjudication

Status: active internal export-tier decision record, partially landed in code.

This file narrows the public-surface adjudication down to one concrete question:

- what should `packages/chat/src/index.ts` continue exporting from the package root

This is a code-first working record.
It is not a user-facing package guide.
It should not be used to overwrite package docs until the package explicitly approves the export cleanup.

## Scope

This decision record is based on:

- `packages/chat/src/index.ts`
- `packages/chat/src/types/index.ts`
- direct implementation files behind those exports
- current demos under `packages/chat/demo/src`
- current package-local tests under `packages/chat/tests`
- current consumer-style chat scenarios under `packages/test/src/chat`

Current older docs are not treated as the authority for this file.

## Decision Buckets

For package-root exports, use four buckets:

- `keep at root`
  continue exporting from the package root as part of the supported package story
- `keep at root but demote`
  continue exporting for compatibility or advanced usage, but stop treating it as a primary root API
- `keep public but move out of the primary root story`
  keep reachable somehow, but do not keep treating the package root export as part of the stable promoted surface
- `candidate root removal`
  current root export should not continue as stable top-level package API

## High-Level Rule

The package root should primarily teach and expose:

1. official entry surfaces
2. the official bridge helper for the whitebox upgrade path
3. a very small number of advanced owner-domain helpers that are actually proven by real consumption

The package root should not continue to act like a flat mirror of every reachable implementation helper, renderer, registry, or internal test convenience export.

## Root Export Matrix

### Primary root surface: keep at root

These exports are supported by actual consumer-style usage and should remain first-class root exports:

- `TrChat`
  primary package entry
- `createRuntimeFromConfig`
  advanced bridge helper for `TrChatConfig -> { runtime, ui }`
- `TrChatConfig`
  central config contract
- `ChatContentLayout`
  actually consumed by demos and scene helpers
- `ChatTransportAdapter`
  preferred transport-oriented alias for the retained provider path
- `ResponseProvider`
  supported compatibility alias for the retained provider path
- `useMcpManager`
  actually consumed by scenario code
- `TrMcpTrigger`
  retained advanced standalone surface with direct consumer proof
- `TrChatFeedback`
  retained advanced standalone adjunct surface with direct consumer proof

### Compound members that should remain promoted through `TrChat.*`

These should remain available through the `TrChat` compound namespace and continue to define the main supported story:

- `TrChat.Root`
- `TrChat.Page`
- `TrChat.Provider`
- `TrChat.Layout`
- `TrChat.WorkspaceLayout`
- `TrChat.Header`
- `TrChat.Welcome`
- `TrChat.MessageList`
- `TrChat.Footer`
- `TrChat.Attachments`
- `TrChat.Sender`

Note:

- keeping them as `TrChat.*` does not mean their current contracts are fully frozen
- several of these still need contract cleanup before being treated as stable leaf APIs

### Duplicate flat aliases: landed removal

These duplicate root aliases were previously marked for demotion.
They have now been removed from the package root and should stay removed:

- `TrChatRoot`
- `TrChatPage`
- `TrChatProvider`
- `TrChatLayout`
- `TrChatWorkspaceLayout`
- `TrChatAttachments`

Reason:

- the real consumer story is through `TrChat.*`
- the flat aliases duplicated the compound entry without adding a clearer public story

### Keep public but move out of the primary root story

These exports do not belong in the promoted root story and have either already been removed from the root or should continue to stay out of it:

- `TrChatHistory`
- `TrChatWorkspaceShell`
- `TrChatWorkspaceRightSheet`
- internal-style config/message helpers should stay package-local rather than package-root promoted

Reason:

- some of these lack direct real-consumer evidence
- some are useful but more as advanced implementation details than as promoted entry-level surface
- `CHAT_MESSAGES` and `resolveChatMessages` may still be useful, but they read more like lower-level plumbing than package-root story

### Candidate root removal

These root exports have been removed from the package root and should continue to stay removed:

- `useChatAttachments`
- `useDefaultBubbleConfig`
- `useModelSelector`
- `useChatFeedback`
- `useFloatingDropdown`
- `useKeyboardNavigation`
- `useHistoryState`
- `useSlotFilter`
- `MarkStreamRenderer`
- `ErrorRenderer`
- `EditInputRenderer`
- `ToolCallsRenderer`
- `ToolCallRenderer`
- `AttachmentsRenderer`
- `CHAT_FEATURE_REGISTRY`
- `resolveChatFeatures`
- `KNOWN_PROVIDERS`

Reason:

- current evidence shows these are mostly source-visible, internally convenient, or token-protected
- they are not part of the actual promoted consumer paths
- keeping them at package root encourages consumers to treat implementation surface as semver-stable API

## Type Export Adjudication

### Keep as promoted top-level types

These type exports are important enough to remain clearly supported from the package root:

- `TrChatConfig`
- `CreateRuntimeFromConfigResult`
- `TrChatRootProps`
- `TrChatRootUiConfig`
- `TrChatProps`
- `TrChatProviderProps`
- `TrChatProviderRuntimeOptions`
- `TrChatProviderRuntimeOptionsBase`
- `ChatTransportAdapter`
- `ResponseProvider`
- `ChatContentLayout`
- `ChatUIMessage`
- `ChatSendInput`
- `ChatMessageActionPayload`
- `ChatMessageActionContext`
- `ChatMessageActionDefinition`
- `ChatMessageActionsInput`
- `ChatMessageTransforms`

Note:

- keeping a type exported does not freeze every detail of its current contract
- several of these still need redesign or narrowing

### Keep exported but demote

These types may continue to be exported, but should not be treated as part of the small primary top-level type story:

- most feature-resolution types from `runtime/config`
- most leaf-component prop types
- most low-level runtime owner types that are useful mainly for advanced composition
- duplicated helper types whose value depends on exports already marked for demotion

### Candidate top-level type pruning later

The package currently exports too many top-level types for the amount of real external-style evidence available.
After runtime and component contracts are tightened, reassess whether the root still needs to expose:

- all feature-resolution types
- all low-level workspace shell types
- all low-level owner-runtime helper shapes
- all leaf component prop types

## `createRuntimeFromConfig` Decision

### Keep

`createRuntimeFromConfig` should remain public.

### But not as a normal component API

It should be treated as:

- advanced bridge helper
- whitebox upgrade on-ramp
- `TrChatConfig -> { runtime, ui }` adapter

It should not be treated as:

- required for normal `TrChat` usage
- a peer-level component API beside `TrChat`

### Working export conclusion

Keep it at the root for now because it is the only realistic bridge from blackbox config to whitebox runtime ownership.
But in package messaging and future cleanup, it should sit under advanced bridge semantics rather than ordinary component semantics.

## Real Consumer Signals

The strongest real consumer evidence currently supports:

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

Many other root exports are only preserved by:

- string-token tests
- package-local helper imports
- internal test convenience

That is not enough to keep treating them as stable top-level public surface.

## Current Landing Status

These export-tier decisions have already landed in code:

- low-level helper, renderer, registry, and constant exports were removed from the package root
- duplicate flat aliases were pruned from the root and the `TrChat.*` compound path remains the promoted surface
- `TrModelSelector`, `TrChatMcpPanel`, `CHAT_MESSAGES`, and `resolveChatMessages` are no longer promoted at the root
- multiple supporting top-level type exports were removed from the root surface
- `ChatTransportAdapter` was added as the clearer transport-oriented alias for the retained provider path

## Suggested Implementation Order

When implementation starts, use this order:

1. tighten the package-root export tiers in `packages/chat/src/index.ts`
2. keep `TrChat` and `TrChat.*` as the primary promoted surface
3. keep `createRuntimeFromConfig` but explicitly as advanced bridge
4. demote or later prune flat aliases and low-level helpers
5. only after export tiers are settled, tighten the detailed component and runtime contracts behind them
