# Chat Entry Structure Refactor Plan

> Last updated: `2026-03-27`
> Scope: `packages/chat/src/components/chat/*`
> Status: partially applied
> Related:
> - [chat-implementation.md](./chat-implementation.md)
> - [use-chat-kit-implementation-deep-dive.md](./use-chat-kit-implementation-deep-dive.md)

---

## 1. Purpose

This document records the entry-structure refactor context for later work.

It now serves two purposes:

1. record what the old model/provider path looked like
2. record what has already changed in the current codebase

This makes it easier to understand the current `TrChat -> ChatScaffold -> ChatRoot -> ChatDefaultRenderer` chain without rereading the whole implementation history.

---

## 2. Old Main Path

Before the recent cleanup, the effective model/provider path was:

```text
ChatConfig
  -> loadChatConfig()
  -> providerFactories
  -> match(model)
  -> createProvider(model)
  -> chatKit.updateResponseProvider()
```

At the UI layer, this leaked into multiple places:

- `ChatScaffold.vue`
- `useModelSelector.ts`
- `ModelSelector.vue`
- `ChatDefaultRenderer.vue`
- scaffold context types

The old structure had these problems:

1. `provider` mixed two meanings:
   - provider identity
   - provider implementation path
2. `providerFactories` became the central abstraction even though the real stable runtime contract was already `ResponseProvider`
3. model switching was split between scaffold and selector logic
4. `TrChatPresetOverrides.models/defaultModel` created a second model source of truth above adapter state

---

## 3. Current Main Path

The current model/provider path is now:

```text
ChatConfig
  -> loadChatConfig()
  -> createChatAdapterFromConfig()
    -> adapter.getModel()
    -> adapter.createResponseProvider()
  -> ChatScaffold
    -> currentModel
    -> chatKit.updateResponseProvider()
```

At the naming layer:

- `provider` has been replaced by `providerId`
- `providers[*].type` defaults to `openai-compatible`

At the implementation layer:

- brand-specific provider helpers were removed from `packages/chat/src/providers/*`
- a single protocol-level transport now lives in:
  - `packages/chat/src/adapters/openaiCompatibleTransport.ts`

Direction confirmed for later follow-up:

- continue simplifying the main runtime path
- keep adapter as the only runtime source of model catalog and default model
- do not reintroduce `presetOverrides`-driven model identity inside scaffold

---

## 4. What Was Actually Applied

### 4.1 Adapter / transport cleanup

Applied:

- removed `packages/chat/src/providers/*`
- added `packages/chat/src/adapters/openaiCompatibleTransport.ts`
- `ChatAdapter` now owns:
  - `getModel(modelId?)`
  - `createResponseProvider(modelId?)`

### 4.2 Selector / scaffold cleanup

Applied:

- removed `providerFactories` from scaffold context
- `useModelSelector()` is now state-only
- `ModelSelector.vue` no longer owns runtime provider switching
- `ChatDefaultRenderer.vue` no longer checks `providerFactories`
- `ChatScaffold.vue` is the only place that updates `chatKit.responseProvider`

### 4.3 Override cleanup

Applied:

- `TrChatPresetOverrides.models` removed
- `TrChatPresetOverrides.defaultModel` removed
- `TrChatScaffoldContextValue` no longer exposes `providerFactories`

This means model identity is now sourced from adapter/runtime state, not from preset override state.

---

## 5. Current Layering

The current runtime layering is:

```text
TrChat
  -> ChatScaffold
    -> ChatRoot
      -> ChatDefaultRenderer
        -> ChatLayout + leaf components
```

### 5.1 `Chat.vue`

Role:

- black-box public facade
- forwards `config / runtime / callbacks / presetOverrides`
- keeps named slot passthrough

This remains intentionally thin.

### 5.2 `ChatScaffold.vue`

Role:

- parses `config` into adapter
- derives model catalog and default model directly from adapter
- creates or reuses `chatKit`
- updates runtime provider when current model changes
- computes `presetProps`
- computes `presetSlices`
- provides scaffold context
- renders default slot or `ChatDefaultRenderer`

Important current contract notes:

- scaffold no longer treats `presetOverrides` as a runtime model source
- scaffold currently resolves:
  - `models` from `adapter.models`
  - `defaultModel` from `adapter.defaultModel`
- scaffold still merges `presetOverrides` into `presetProps`, but that no longer changes runtime model resolution

This is still the main orchestration core.

### 5.3 `ChatRoot.vue`

Role:

- pure context boundary
- consumes explicit `chatKit` or explicit `responseProvider`
- provides chat runtime context to the subtree

This should stay small and should not be merged into scaffold.

### 5.4 `ChatDefaultRenderer.vue`

Role:

- default black-box page template
- combines layout, header, welcome/message list fallback, footer, tools, history

It is no longer tied to `providerFactories`, but it is still template-heavy.

### 5.5 `ModelSelector.vue`

Role:

- dropdown UI for model selection
- consumes scaffold model state
- no longer owns provider update behavior
- still uses `useModelSelector()` locally for selection state and fallback behavior

This is cleaner than before, but the selector path can still be simplified further later if needed.

---

## 6. Remaining Structural Debt

The main cleanup is done, but some structural debt still remains.

### 6.1 `ChatScaffold.vue` is still heavy

It still owns:

- adapter creation
- model state
- `chatKit` creation
- provider update side effect
- preset projection
- scaffold context assembly
- slot prop assembly
- fallback renderer wiring

This is acceptable for now, but it is still the heaviest file in the entry chain.

### 6.2 `ChatScaffold.vue` runtime contract should be documented more explicitly

After the latest simplification, the most important remaining question is no longer "should scaffold still consume `providerFactories`?"

That answer is already "no".

The more important follow-up is:

- clearly document that scaffold runtime model resolution is adapter-owned
- avoid accidental reintroduction of `presetOverrides` model semantics
- keep the runtime path:

```text
adapter.models/defaultModel
  -> currentModel
  -> adapter.createResponseProvider(modelId)
  -> chatKit.updateResponseProvider(...)
```

If future work reintroduces runtime model override points above adapter, the main-path simplification would drift backwards.

### 6.3 `ChatDefaultRenderer.vue` is still multi-concern

It still mixes:

- header fallback
- welcome/message-list fallback
- footer composition
- footer tools composition
- history mounting

This is now easier to reason about than before, but it is still a likely future split point.

### 6.4 `ChatScaffold.vue` side effects are still expressed with `watchEffect`

The current file still uses `watchEffect` for:

- controlled `runtime.selectedModel` sync
- provider update sync

This is not wrong, but after direction A the dependencies are now explicit enough that later cleanup could switch them to `watch(...)` for clearer ownership and easier maintenance.

That change is optional, but it is a better fit for the now-simplified runtime graph.

### 6.5 Downstream tests are not migrated yet

The refactor intentionally focused on `packages/chat`.

Still pending in `packages/test`:

- `mockProvider.ts`
- `sharedDemoFixtures.ts`
- chat scenarios that still use `providerFactories`
- chat README notes that still describe `providerFactories`
- chat-cli scaffold tests still asserting old `provider` field names

---

## 7. Recommended Next Work

When we return to this later, the most efficient next sequence is:

1. keep `ChatScaffold.vue` on the adapter-owned runtime path
2. document scaffold runtime ownership in code comments and docs
3. optionally replace scaffold `watchEffect` usage with explicit `watch(...)`
4. migrate `packages/test/src/chat/sharedDemoFixtures.ts`
5. migrate `packages/test/src/chat/mockProvider.ts`
6. migrate `packages/test/src/chat/scenarios/*`
7. migrate `packages/test/src/chat-cli/*`
8. update test README / scenario docs

This preserves the current `packages/chat` implementation as the source of truth and brings the downstream test harness up to the new contract afterward.

---

## 8. Summary

The key context to remember is:

- the old chain was `providerFactories`-driven
- the current chain is `adapter.createResponseProvider()`-driven
- selector logic no longer controls runtime provider switching
- preset overrides no longer own model identity
- `ChatScaffold.vue` should keep adapter as the only runtime model source

That is the main refactor outcome. Everything else is follow-up.
