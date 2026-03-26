# Chat Split Layout Assessment

## Conclusion

The left-right split layout is feasible.

The current `packages/chat` implementation already has the right reusable pieces:

- `ChatScaffold` can expose `chatKit`, model state, and preset slices to a custom shell.
- `ChatHistorySurface` is already a standalone history panel instead of a drawer-only implementation.
- `ChatMessageList`, `ChatFooter`, `ChatSender`, and `ModelSelector` are already independent leaf blocks.

The main limitation is that the default blackbox renderer still assumes a vertical stack:

- header
- welcome or message list
- footer
- history drawer

So the split layout is easy in whitebox composition today, and moderate effort as an opt-in blackbox mode.

## Current State

Relevant files:

- `packages/chat/src/components/chat/ChatDefaultRenderer.vue`
- `packages/chat/src/components/chat/ChatLayout.vue`
- `packages/chat/src/components/history/ChatHistory.vue`
- `packages/chat/src/components/history/ChatHistorySurface.vue`
- `packages/chat/src/components/chat/ChatHeader.vue`
- `packages/chat/src/context.ts`
- `packages/chat/src/adapters/types.ts`
- `packages/chat/src/adapters/config.ts`

Current constraints:

1. `ChatDefaultRenderer` always renders `ChatHistory` as a drawer.
2. `CHAT_UI_KEY` only exposes `showHistoryDrawer`, so header and history behavior are drawer-oriented.
3. `ChatLayoutConfig` only controls message list variant and bubble placement, not shell structure.
4. `ChatPresetLayoutSlice` also has no shell mode or sidebar metadata.
5. Repository docs currently describe workspace shell / side-panel layout as outside the active package responsibility.

This means the package should not blindly absorb a full application shell. The safe scope is a chat-scene split shell, not global product navigation.

## Recommended Path

### Option A: App-side split shell with existing whitebox API

Recommendation: use this first.

Why:

- no contract break
- lowest implementation risk
- preserves current blackbox behavior
- can validate the UX before promoting it into package defaults

Suggested composition:

```vue
<TrChat.Scaffold v-slot="{ chatKit, presetSlices }" ...>
  <div class="tr-chat-split-shell">
    <aside class="tr-chat-split-shell__sidebar">
      <TrChat.HistorySurface />
    </aside>

    <section class="tr-chat-split-shell__main">
      <TrChat.Layout>
        <TrChat.Header :show-history="false" />

        <div v-if="chatKit.messages.value.length === 0" class="tr-chat__welcome-area">
          <TrChat.Welcome @prompt-click="chatKit.sendMessage($event)" />
        </div>
        <TrChat.MessageList v-else v-bind="presetSlices.messageList" />

        <TrChat.Footer>
          <TrChat.Attachments />
          <TrChat.Sender>
            <template #footer>
              <TrModelSelector />
            </template>
          </TrChat.Sender>
        </TrChat.Footer>
      </TrChat.Layout>
    </section>
  </div>
</TrChat.Scaffold>
```

What stays outside `packages/chat`:

- user account area
- product-level navigation
- workspace-wide menus

What can stay inside the chat scene:

- conversation list
- new chat action
- history search
- current conversation surface

### Option B: Add an opt-in split mode to the package

Recommendation: do this only after Option A proves the UX.

Suggested contract direction:

```ts
interface ChatLayoutConfig {
  variant?: ChatListVariant
  placements?: ChatLayoutPlacementsConfig
  shell?: 'stack' | 'split'
  sidebarWidth?: number | string
}

interface ChatHistoryFeatureOptions {
  display?: 'drawer' | 'sidebar'
  collapsible?: boolean
  defaultCollapsed?: boolean
}
```

Implementation notes:

1. Keep current behavior as the default:
   - `shell = 'stack'`
   - `history.display = 'drawer'`
2. Add a dedicated split renderer or shell component.
3. Reuse `ChatHistorySurface` for the sidebar body.
4. Change UI state from a single `showHistoryDrawer` boolean to a richer history-shell state.
5. Keep message list variants (`bubble/docs/workspace`) independent from shell mode.

Do not directly mutate `ChatLayout` into a split-only container. It is currently the stable outer boundary for both blackbox and whitebox usage.

## Suggested Runtime Model

Desktop:

- left sidebar width: `260px` to `300px`
- main area: flexible width
- input area remains in the main pane
- header history toggle becomes sidebar collapse when `display = 'sidebar'`

Mobile:

- degrade to drawer mode below a breakpoint such as `960px`
- keep one source of truth for history content

This prevents the package from carrying two separate history implementations.

## Required Changes For Package-level Support

If Option B is chosen, expected touch points are:

- `packages/chat/src/context.ts`
- `packages/chat/src/components/chat/ChatRoot.vue`
- `packages/chat/src/components/chat/ChatDefaultRenderer.vue`
- `packages/chat/src/components/chat/ChatHeader.vue`
- `packages/chat/src/components/history/ChatHistory.vue`
- `packages/chat/src/components/history/ChatHistorySurface.vue`
- `packages/chat/src/styles/layout.css`
- `packages/chat/src/adapters/types.ts`
- `packages/chat/src/adapters/config.ts`
- `packages/chat/src/types/ui.ts`
- `packages/chat/docs/chat-implementation.md`
- demo and surface tests

## Risks

1. If the left sidebar tries to include global application navigation, package boundaries will become blurry.
2. If drawer and sidebar states are mixed into one boolean, behavior will become fragile.
3. If shell mode and message-list variant are coupled, future layout combinations will be harder to maintain.

## Validation Plan

1. Build one whitebox demo first.
2. Verify:
   - create conversation
   - switch conversation
   - delete conversation
   - model switching
   - welcome state to message state transition
   - fullscreen and mobile fallback behavior
3. Only then decide whether to promote the split shell into the package contract.
