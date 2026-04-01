# Chat Directory Refactor Checklist

> Last updated: `2026-04-02`
> Status: `Tracking`
> Scope: `packages/chat`
> Related:
> - [Chat Directory Refactor Plan](./chat-directory-refactor-plan.md)
> - [Chat Implementation](./chat-implementation.md)

## Overall Status

- [x] Phase 0: Freeze scope and constraints
- [x] Phase 1: Create target directory skeleton
- [x] Phase 2: Migrate `runtime/config`
- [x] Phase 3: Migrate `runtime/scaffold`
- [x] Phase 4: Migrate `runtime/chat-kit`
- [x] Phase 5: Consolidate `workspace`
- [x] Phase 6: Consolidate `history`
- [x] Phase 7: Consolidate `mcp`
- [x] Phase 8: Consolidate `model-selector`
- [x] Phase 9: Consolidate `feedback` and `attachments`
- [x] Phase 10: Consolidate `core`
- [x] Phase 11: Consolidate `shared`
- [x] Phase 12: Reorganize styles
- [x] Phase 13: Reorganize tests

## Phase Notes

### Phase 0

- [x] Confirm current refactor remains internal-only
- [x] Keep `src/index.ts` and `src/internal.ts` stable
- [x] Keep public export names stable
- [x] Keep workspace slot contract stable

### Phase 1

- [ ] Create `src/shared`
- [x] Create `src/runtime`
- [ ] Create `src/components/core`
- [x] Create feature directories under `src/components`
- [x] Add initial barrel files where needed

### Phase 2

- [x] Move `src/adapters/*` into `src/runtime/config/*`
- [x] Move `src/features/*` into `src/runtime/config/*`
- [x] Move `src/capabilities.ts` into `src/runtime/config/capabilities.ts`
- [x] Add compatibility re-exports for old `adapters` and `features` paths
- [x] Validate config and preset pipeline still works

### Phase 3

- [x] Move `src/helpers/scaffoldRuntime.ts` into `src/runtime/scaffold/`
- [x] Move `src/helpers/resolveRootChatKit.ts` into `src/runtime/scaffold/`
- [x] Add compatibility re-exports for old helper paths
- [x] Validate scaffold entry flow still works

### Phase 4

- [x] Move runtime chat composables into `src/runtime/chat-kit/`
- [x] Move `chatMessageState.ts` into `src/runtime/chat-kit/`
- [x] Move `chatRenderMessages.ts` into `src/runtime/chat-kit/`
- [x] Add compatibility re-exports for old runtime composable paths
- [x] Validate root/runtime chat flow still works

### Phase 5

- [x] Create single `src/components/workspace/` feature root
- [x] Move `src/chatUiContext.ts` into workspace feature
- [x] Move `src/components/chat/ChatWorkspaceLayout.vue` into workspace feature
- [x] Move `src/components/chat/workspace/*` into workspace feature
- [x] Keep old workspace paths working via compatibility layer
- [x] Validate workspace slot contract

### Phase 6

- [x] Move `useHistoryState.ts` into `src/components/history/`
- [x] Keep history injection keys stable
- [x] Validate history surface and drawer flows

### Phase 7

- [x] Move `McpTrigger.vue` into `src/components/mcp/`
- [x] Move `ChatMcpPanel.vue` into `src/components/mcp/`
- [x] Move `useMcpManager.ts` into `src/components/mcp/`
- [x] Validate MCP trigger and panel flow

### Phase 8

- [x] Move model selector composables into `src/components/model-selector/`
- [x] Keep provider icon lookup in shared utils
- [x] Validate model selection and keyboard navigation

### Phase 9

- [x] Move feedback component and composable into `src/components/feedback/`
- [x] Move attachments component and composable into `src/components/attachments/`
- [x] Validate feedback and attachments flow

### Phase 10

- [x] Move chat skeleton components into `src/components/core/`
- [x] Move default renderer internals into `src/components/core/default-renderer/`
- [x] Keep old `components/chat` import paths working during migration
- [x] Validate blackbox and whitebox composition flow

### Phase 11

- [x] Move shared context into `src/shared/context/`
- [x] Move shared messages into `src/shared/messages/`
- [x] Move shared utils into `src/shared/utils/`
- [x] Validate import aliases and barrel stability

### Phase 12

- [x] Keep `src/styles/index.css` as unified entry
- [x] Rename `variables.css` to `tokens.css`
- [x] Re-evaluate feature-owned CSS placement
- [x] Validate build output style entry stability

### Phase 13

- [x] Make `tests/_harness.mjs` support recursive discovery
- [x] Group tests into `contracts / runtime / config / ui`
- [x] Keep contract tests covering public surface and workspace slots
- [x] Validate test runner after relocation

## Validation Log

- [x] Latest `pnpm.cmd -F @opentiny/tiny-robot-chat type-check` passed
- [x] Latest `pnpm.cmd -F @opentiny/tiny-robot-chat test` passed
