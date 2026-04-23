# Post-Closure Legacy Surface Inventory

Status: settled inventory after the root-bridge-retirement cleanup slice.

This file records which legacy entry, bridge, helper, and test surfaces still remain after the scaffold-surface-removal batch, and whether each one should be:

- `delete-later`
- `keep-temporarily`
- `already-pruned`

It exists so post-closure cleanup can close its first slice without pretending every compatibility-shaped file must disappear immediately.

## Closure Decision

The current post-closure cleanup slice is considered complete when:

1. the official-path gate is frozen
2. at least one real delete-now batch has landed
3. the remaining legacy surface is explicitly classified

That bar is now met.

The remaining files below are not hidden cleanup debt from the closed refactor phases.
They are either:

- bounded delete-later compatibility surfaces
- or temporary implementation bridges that still carry official-path functionality today

## Inventory

| Area | Files | Classification | Why it stays or goes | Evidence |
| --- | --- | --- | --- | --- |
| blackbox legacy promotion | `src/runtime/config/blackboxEntry.ts` old `ChatConfig` subset promotion | `already-pruned` | the blackbox entry now accepts only target `TrChatConfig`, serialized target config, and lifecycle-compatible callbacks | `src/runtime/config/blackboxEntry.ts`, `tests/runtime/blackbox-entry.test.mjs`, `tests/integration/trchat-blackbox-root-page.test.mjs` |
| edge compatibility scene branches | previously `packages/test/src/chat/edge-overrides.spec.ts` handed-off `maxLength`, placement, header/footer slot, sender-config disable, and close-composition branches | `already-pruned` | every remaining boundary now has either an official-path successor proof or an explicit contract drop, so the edge scene/spec pair is gone | `packages/test/src/chat/sender-actions.spec.ts`, `packages/test/src/chat/scenario-specs/surface-api.spec.ts`, `refactor/process/test-boundary-baseline.md` |
| blackbox scaffold fallback in `TrChat` | `src/components/core/Chat.vue` old `v-else <ChatScaffold ...>` branch | `already-pruned` | `TrChat` now accepts only target `TrChatConfig` or serialized target `TrChatConfig` and throws for non-target input instead of falling back to scaffold wiring | `src/components/core/Chat.vue`, `tests/runtime/blackbox-entry.test.mjs`, `tests/contracts/public-surface.test.mjs` |
| explicit scaffold helper surface | `src/components/core/ChatScaffold.vue`, `src/runtime/scaffold/**/*`, `src/types/scaffold.ts`, scaffold exports in `src/index.ts` | `already-pruned` | the explicit scaffold helper surface has been deleted from source, exports, and package-local runtime tests | `src/index.ts`, `src/components/core/index.ts`, `tests/runtime/provider-chat-kit.test.mjs` |
| runtime bridge | formerly `src/legacy/rootBridge.ts`, now root-local bootstrap state in `src/root/createRootBootstrapState.ts` | `already-pruned` | the last file under `src/legacy/` is gone; the surviving official-path bootstrap wiring now lives under `src/root/` instead of pretending to be a legacy bridge | `src/root/TrChatRoot.vue`, `src/root/createRootBootstrapState.ts`, `tests/runtime/root-runtime.test.mjs`, `tests/integration/root-page-mounted.test.mjs` |
| internal scaffold provision | `CHAT_SCAFFOLD_KEY`, `useChatScaffoldContext()`, related exports in `src/shared/context/index.ts`, `src/internal.ts`, and `src/root/TrChatRoot.vue` | `already-pruned` | official-path consumers were already gone, so this internal scaffold provision could be deleted without changing the frozen owner ladder | `src/shared/context/index.ts`, `src/internal.ts`, `src/root/TrChatRoot.vue`, `tests/contracts/public-surface.test.mjs` |
| runtime legacy hints | `src/legacy/runtimeHints.ts`, `attachLegacyPhase1ABridgeHints(...)` in `src/runtime/config/createRuntimeFromConfig.ts` | `already-pruned` | the root bootstrap path now derives page inputs, attachment helpers, and fallback `chatKit` directly from runtime state, so the extra runtime hint channel is gone | `src/root/createRootBootstrapState.ts`, `src/runtime/config/createRuntimeFromConfig.ts`, `tests/runtime/root-runtime.test.mjs` |
| scaffold-context consumers on official paths | `ChatLayout.vue`, `ChatHeader.vue`, `ChatMessageList.vue`, `ChatSender.vue`, `ChatWelcome.vue`, `ChatHistory.vue`, `ModelSelector.vue` | `already-pruned` | the official owner-path consumers now read page inputs, runtime-owned defaults, or explicit props instead of `useChatScaffoldContext()`, which removes the last user-facing reason for the bridge to keep scaffold slices alive | `src/components/core/ChatLayout.vue`, `src/components/core/ChatHeader.vue`, `src/components/core/ChatMessageList.vue`, `src/components/core/ChatSender.vue`, `src/components/core/ChatWelcome.vue`, `src/components/history/ChatHistory.vue`, `src/components/model-selector/ModelSelector.vue`, `tests/contracts/public-surface.test.mjs`, `tests/integration/root-page-mounted.test.mjs` |
| secondary package-local helper tests | `tests/config/*`, `tests/runtime/provider-chat-kit.test.mjs` | `delete-later` | these are still useful while provider/comparison helper surfaces remain public, but they are no longer the cleanup gate and should retire with the helper surfaces they protect | `refactor/process/test-boundary-baseline.md` |
| stale scaffold-era docs and e2e fixture helpers | `docs/demos/chat/preset-overrides.vue`, `docs/demos/chat/features-playground.vue`, `docs/demos/chat/mcp-minimal.vue`, `docs/demos/chat/workspace-panel-slots.vue`, `packages/test/src/chat/scenarios/sharedDemoFixtures.ts` | `already-pruned` | these files no longer backed any official entry path, demo route, or retained e2e scene after the target-config scene migration | `docs/src/components/chat*.md`, `packages/test/src/chat/README.md`, `packages/test/src/chat/scenarios/officialSceneConfig.ts` |
| mixed e2e adaptation backlog | `packages/test/src/chat` remaining `adapt` group | `delete-later` | these tests are no longer blockers for the first cleanup slice; they should be adapted or retired only when the helper or compatibility surfaces they still touch are actually removed | `packages/test/src/chat/README.md`, `refactor/process/test-boundary-baseline.md` |

The current helper-side decision baseline now lives in:

- `./provider-helper-decision-baseline.md`

## What This Means For Closure

The current slice can close because:

- the scaffold-surface-removal cleanup work has landed
- the remaining legacy surface is no longer implicit
- the remaining kept files are now clearly split into:
  - temporary bridge dependencies for today's official path
  - or optional later cleanup for public helper and compatibility surfaces

## Next Optional Cleanup Themes

If later cleanup continues, it should start from one of these two explicit themes rather than from this closed inventory slice:

1. replace official-path `useChatScaffoldContext()` reads so `src/legacy/rootBridge.ts` and `runtimeHints.ts` can be retired safely
2. retire provider/comparison helper surfaces once their boundaries have official-path successors or explicit contract drops

The bridge-focused themes have now landed.
If later cleanup continues, the next explicit theme is:

1. retire provider/comparison helper surfaces once their boundaries have official-path successors or explicit contract drops
2. retire the remaining mixed `adapt` e2e group and package-local legacy sentinels as their target helper surfaces disappear
