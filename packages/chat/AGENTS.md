# AGENTS.md

Package-level instructions for coding agents working in `packages/chat`.

## Scope

This file applies to `packages/chat/**`.

## Package Role

`@opentiny/tiny-robot-chat` is the high-level chat UX package in this monorepo.

It provides three official entry surfaces:

1. `TrChat` — blackbox config entry, pass a `TrChatConfig` directly
2. `TrChat.Root + TrChat.Page` — whitebox page path, user owns runtime creation
3. `TrChat.Root + primitives` — granular whitebox path, user composes the page

`TrChat.Provider` is a bounded advanced helper for teams that want package-owned UI and runtime but their own transport layer.

## Source Directory Layout

```
src/
  entry/              TrChat, TrChatRoot, TrChatPage, TrChatProvider, createRootBootstrapState
  components/         UI components
    page-regions/     ChatPageContent, ChatDefaultHeaderRegion, ChatDefaultBodyRegion, ChatDefaultFooterRegion
    workspace/        WorkspaceShell, ChatWorkspaceLayout, LeftSheet, RightSheet, Sidebar
    attachments/      ChatAttachments, useChatAttachments
    feedback/         ChatFeedback, useChatFeedback
    history/          ChatHistory, ChatHistoryPanel, useHistoryState
    mcp/              McpTrigger, ChatMcpPanel, useMcpManager
    model-selector/   ModelSelector, useModelSelector
    renderers/        ErrorRenderer, EditInputRenderer, ToolCallsRenderer, MarkStreamRenderer, AttachmentsRenderer
    shared/           ConditionalThemeProvider
  runtime/
    config/           createRuntimeFromConfig, trchatConfigEntry, useTrChatConfigRuntimeResolution, resolveProviderRuntime
    core/             normalizeRuntime, messageIdentity
    engine/           useChatKit, useChatConversation, useChatMessages, useChatRequest, chatMessageState, chatRenderMessages
    transport/        openaiCompatibleTransport
    features/         feature registry
  shared/
    context/          chatUiContext, injection keys
    messages/         CHAT_MESSAGES, resolveChatMessages
    utils/            props, typeGuards, iconMap
  types/              component, config, runtime, message, model, workspace, core
  styles/             CSS tokens, layout, drawer, mcp-trigger, model-selector
```

## Test Directory Layout

```
tests/
  runtime/            runtime semantics (composables, root-runtime, message-actions, lifecycle, etc.)
  contracts/          public contract proof (public-surface, chat-messages, chat-ui-context, workspace-slot, etc.)
  integration/        mounted owner-path proof (root-page-mounted, trchat-entry-root-page)
  _helpers.mjs        shared test utilities (createMockFetch, createMockRuntime, createMockClipboard, etc.)
  _harness.mjs        minimal runner/harness
  _stubs/             SSR/import stubs
```

E2E tests live in `packages/test/src/chat/`:

```
smoke-specs/          smoke-level Playwright specs (entry, history, lifecycle, attachments, feedback, model-switch)
scenario-specs/       feature-level Playwright specs (workspace-slots, whitebox-slots, error-retry, message-edit, etc.)
scenarios/            Vue scene fixtures
```

## Key References

Before working on this package, read:

- `packages/chat/README.md` — official entry surfaces, config domains, component list, validation commands
- `packages/chat/docs/refactor/design/overview.md` — design mental model and boundaries
- `packages/chat/docs/refactor/design/api-runtime.md` — public contract, runtime ownership, slot and message-model rules
- `packages/chat/docs/refactor/design/ui-runtime-transport-layering.md` — three-layer product model (UI / orchestration runtime / transport)

When the task involves tests:

- `packages/chat/docs/refactor/process/test-governance-standard.md` — unit/e2e design standard
- `packages/chat/docs/refactor/process/test-boundary-baseline.md` — test classification and gate commands
- `packages/chat/docs/refactor/process/test-suite-audit-baseline.md` — file-level test audit

For implementation lessons from the refactor:

- `packages/chat/docs/refactor/PLAYBOOK.md` — promoted recurring guidance

For quick lookup tables:

- `packages/chat/docs/generated/slot-catalog.md` — page and workspace slot contract
- `packages/chat/docs/generated/config-bridge-matrix.md` — config field bridge status
- `packages/chat/docs/generated/runtime-owner-table.md` — runtime module ownership
- `packages/chat/docs/generated/page-region-contract.md` — page region read boundaries

## Validation Commands

```bash
# type-check
pnpm -F @opentiny/tiny-robot-chat type-check

# unit tests (runtime + contracts + integration)
pnpm -F @opentiny/tiny-robot-chat test

# build
pnpm -F @opentiny/tiny-robot-chat build

# E2E smoke (needs dev server: pnpm -F tiny-robot-test dev)
pnpm -F tiny-robot-test test:chat:smoke

# E2E scenario
pnpm -F tiny-robot-test test:chat:scenario
```

## Working Rules

- Put logic in the lowest reusable layer that matches its responsibility.
- Prefer runtime-owned behavior over scaffold or relay patterns.
- Use `messageId` for all message-level actions; do not introduce `messageIndex`-based semantics.
- If a code change makes a doc stale, update the doc in the same task.
- Generated docs under `docs/generated/` are derived artifacts — update them only when their source changes.
- Do not add `data-testid` to `packages/chat/src/` component source code; use `title` or `aria-label` attributes for E2E selectors.
- `data-testid` is only for test scene fixtures in `packages/test/`.
