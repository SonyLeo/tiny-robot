# Chat Progress

> Last updated: `2026-03-26`
> Design: [docs/chat-implementation.md](./docs/chat-implementation.md)
> Related: [docs/use-chat-kit-implementation-deep-dive.md](./docs/use-chat-kit-implementation-deep-dive.md)
> Demo proof target: [demo/src/components/WhiteboxDemo.vue](./demo/src/components/WhiteboxDemo.vue)

## Current Status

- Current track: `P1 / Stream B In Progress, Runtime Cleanup First`
- Current judgment: `P0 complete, P1 in progress`
- Current rule: development-stage direct fix only; do not preserve compatibility debt, do not add migration shims, and prefer converging to the cleaner contract now
- Max parallel workers: `3`
- Orchestrator remains the owner of shared-contract decisions, reserved files, integration, and final validation

## Frozen Decisions

- `packages/chat` remains the source of truth for `config -> adapter -> preset -> scaffold`
- `TrChat.HistorySurface` remains a supported white-box public building block and must become usable without hidden runtime dependencies
- Model selection semantics belong to the UI shell stream; the state/runtime stream must not redesign `useModelSelector` ownership
- The target direction for message UI state is a chat-side managed runtime contract, not more ad hoc `message.state` writes spread across renderers
- `TrChat.History` drawer flow remains the primary built-in path
- If implementation disproves a frozen decision, update this document before widening worker write scopes

## Current Priority

Priority order for the next implementation steps:

1. Keep the preset/config contract green and do not allow `createPresetChatProps -> createPresetChatSlices` drift
2. Continue Stream B and reduce runtime/message-state coupling
3. Move into Stream C and simplify the config/feature pipeline
4. Leave Stream A interaction polish (`ModelSelector` accessibility, keyboard scope, dropdown polish) for later unless it blocks core behavior

## Reserved Files

These files are orchestrator-owned and should not be edited by sub-agents unless ownership is explicitly reassigned for a specific batch:

- `packages/chat/src/context.ts`
- `packages/chat/src/components/chat/ChatRoot.vue`
- `packages/chat/src/components/chat/ChatScaffold.vue`
- `packages/chat/src/types/ui.ts`
- `packages/chat/src/types/index.ts`
- `packages/chat/src/index.ts`
- `packages/chat/src/internal.ts`
- `packages/chat/progress.md`

Reason:

- they define shared contracts or package entrypoints
- they are the highest-risk merge points across all three streams
- keeping them orchestrator-owned preserves parallel safety

## Phase Status

| Phase | Status | Notes |
|:--|:--|:--|
| P0 / Contract Freeze + Stream Setup | `completed` | shared contract decisions are recorded here and the first reserved-file implementation is landed |
| P1 / Parallel Stream A-B-C | `in progress` | shared context/history contract is landed; runtime and config work are now the main focus |
| P2 / Integration + Reserved File Updates | `planned` | orchestrator merges streams and updates shared files |
| P3 / Final Validation + Docs Closeout | `planned` | package and demo validation, progress closeout |

## P0 Orchestrator Tasks

- [x] `O0.1` Freeze the next `CHAT_UI_KEY` shape and the white-box history contract in `context.ts`
- [x] `O0.2` Freeze how `HistorySurface` receives chat/runtime access when used outside drawer-only composition
- [x] `O0.3` Freeze model-selection ownership: `useModelSelector + ModelSelector + dropdown/keyboard behavior` stay together in Stream A
- [x] `O0.4` Decide whether the state stream may introduce a dedicated message UI meta store immediately; current target is `yes`
- [x] `O0.5` Publish the exact stream write scopes before implementation starts

## Stream A

### Stream A / Drawer Shell Stabilization + UI Polish

- Owner: `Agent A`
- Status: `planned`
- Scope: own the built-in drawer shell and the remaining UI polish work
- Must not edit:
  - reserved files
  - `packages/chat/src/composables/useChatKit.ts`
  - `packages/chat/src/composables/useChatConversation.ts`
  - `packages/chat/src/composables/useChatRequest.ts`
  - `packages/chat/src/composables/useChatMessages.ts`
  - `packages/chat/src/composables/useChatAttachments.ts`
  - `packages/chat/src/adapters/*`
  - `packages/chat/src/features/*`

Candidate files:

- `packages/chat/src/components/chat/ChatHeader.vue`
- `packages/chat/src/components/chat/ChatDefaultRenderer.vue`
- `packages/chat/src/components/chat/ChatLayout.vue`
- `packages/chat/src/components/history/ChatHistory.vue`
- `packages/chat/src/components/history/ChatHistorySurface.vue`
- `packages/chat/src/components/history/ChatHistoryContent.vue`
- `packages/chat/src/components/history/ChatHistoryList.vue`
- `packages/chat/src/components/history/ChatHistoryNewSession.vue`
- `packages/chat/src/components/history/ChatHistoryToolbar.vue`
- `packages/chat/src/components/history/ChatHistoryManageButton.vue`
- `packages/chat/src/components/history/ChatHistorySearch.vue`
- `packages/chat/src/components/history/ChatHistoryPanel.vue`
- `packages/chat/src/components/model-selector/ModelSelector.vue`
- `packages/chat/src/composables/useModelSelector.ts`
- `packages/chat/src/composables/useKeyboardNavigation.ts`
- `packages/chat/src/composables/useFloatingDropdown.ts`
- `packages/chat/demo/src/components/WhiteboxDemo.vue`

Checklist:

- [x] `A1` Make `HistorySurface` usable in white-box composition without hidden runtime dependencies
- [x] `A2` Align `ChatHistory*` leaf components with the frozen shell/runtime contract instead of implicit drawer-only assumptions
- [x] `A3` Align `ChatHeader` and `ChatHistory` with the frozen shell UI contract
- [ ] `A4` Keep `ChatDefaultRenderer` aligned with the same shell and model-selection contract
- [ ] `A5` Fix `ModelSelector.vue` keyboard scope and ARIA semantics
- [ ] `A6` Update `useFloatingDropdown.ts` and `useKeyboardNavigation.ts` only as needed for selector behavior
- [x] `A7` Keep `WhiteboxDemo.vue` on the drawer-based white-box path

Can run in parallel with:

- Stream B after `O0.3` and `O0.4`
- Stream C after `O0.1` through `O0.5`

Exit criteria:

- `HistorySurface` is viable in white-box composition without hidden injection requirements
- header/history behavior no longer assumes a drawer-only runtime model
- `ChatDefaultRenderer` stays aligned with the drawer mainline contract
- model selector interaction polish is complete if and when Stream A is revisited
- the white-box demo remains a stable drawer-based reference

## Stream B

### Stream B / Runtime State + Message Flow

- Owner: `Agent B`
- Status: `in progress`
- Scope: own optimistic turn state, retry/edit rollback, normalized runtime error handling, attachment lifecycle, and renderer integration for message UI state
- Must not edit:
  - reserved files
  - `packages/chat/src/components/chat/ChatHeader.vue`
  - `packages/chat/src/components/chat/ChatDefaultRenderer.vue`
  - `packages/chat/src/components/history/*`
  - `packages/chat/src/components/model-selector/ModelSelector.vue`
  - `packages/chat/src/composables/useModelSelector.ts`
  - `packages/chat/src/composables/useKeyboardNavigation.ts`
  - `packages/chat/src/composables/useFloatingDropdown.ts`
  - `packages/chat/src/adapters/*`
  - `packages/chat/src/features/*`

Candidate files:

- `packages/chat/src/composables/useChatKit.ts`
- `packages/chat/src/composables/useChatConversation.ts`
- `packages/chat/src/composables/useChatRequest.ts`
- `packages/chat/src/composables/useChatMessages.ts`
- `packages/chat/src/composables/useChatAttachments.ts`
- `packages/chat/src/components/chat/ChatFeedback.vue`
- `packages/chat/src/components/render/ErrorRenderer.vue`
- `packages/chat/src/components/render/EditInputRenderer.vue`
- `packages/chat/tests/composables.test.mjs`
- `packages/chat/tests/_helpers.mjs`

Checklist:

- [ ] `B1` Introduce or confirm the dedicated runtime contract for message UI state
- [ ] `B2` Centralize optimistic-turn, retry, edit rollback, and transient error state behind that contract
- [x] `B3` Remove scattered ad hoc UI-state writes from renderers and feedback/edit flows
- [x] `B4` Make attachment object URL lifecycle safe in `useChatAttachments`
- [ ] `B5` Keep `useChatConversation` and `useChatRequest` stable while narrowing responsibilities
- [ ] `B6` Expand composable/runtime tests to prove retry/edit/optimistic/error behavior after the refactor

Current notes:

- A bounded internal message-state helper now owns the common `error / isEditing / optimistic / turnId` reads and writes used by `useChatKit`, `useChatMessages`, and the feedback/error/edit renderers.
- The remaining direct `message.state` reads in default bubble matching have also been moved behind that helper, so Stream B no longer has scattered raw state access in `packages/chat/src`.
- `useChatAttachments` now revokes owned object URLs on remove/clear and when the current scope is disposed.
- The full runtime-state redesign is still pending; this batch is the cleanup step before any larger sidecar-store decision.

Can run in parallel with:

- Stream A after `O0.3` and `O0.4`
- Stream C almost immediately after `O0.5`

Exit criteria:

- runtime/message-state mutations are intentional and centralized
- renderer components no longer depend on casual state writes
- attachment URL cleanup is lifecycle-safe
- composable tests cover the new runtime contract

## Stream C

### Stream C / Config Pipeline + Package-local Contract Internals

- Owner: `Agent C`
- Status: `next-after-b`
- Scope: refactor the config parser and feature-projection pipeline behind the current package boundary, while updating package-local docs and contract tests
- Must not edit:
  - reserved files
  - `packages/chat/src/components/chat/*`
  - `packages/chat/src/components/history/*`
  - `packages/chat/src/components/model-selector/*`
  - `packages/chat/src/composables/useChatKit.ts`
  - `packages/chat/src/composables/useChatConversation.ts`
  - `packages/chat/src/composables/useChatRequest.ts`
  - `packages/chat/src/composables/useChatMessages.ts`
  - `packages/chat/src/composables/useChatAttachments.ts`

Candidate files:

- `packages/chat/src/adapters/config.ts`
- `packages/chat/src/adapters/index.ts`
- `packages/chat/src/adapters/types.ts`
- `packages/chat/src/features/registry.ts`
- `packages/chat/src/features/types.ts`
- `packages/chat/tests/config-and-features.test.mjs`
- `packages/chat/tests/preset-slices.test.mjs`
- `packages/chat/tests/public-surface.test.mjs`
- `packages/chat/docs/chat-implementation.md`

Checklist:

- [ ] `C1` Split `adapters/config.ts` into smaller reviewable responsibilities
- [ ] `C2` Centralize feature defaults and preset projection rules instead of duplicating them across parser and registry layers
- [ ] `C3` Keep config/public-surface tests aligned with the refactored adapter pipeline
- [ ] `C4` Update `chat-implementation.md` so the package-local implementation doc matches the new parser/feature structure
- [ ] `C5` Report any required reserved-file changes back to the orchestrator instead of editing entrypoints/shared types directly

Can run in parallel with:

- Stream B almost immediately
- Stream A once `O0.1` through `O0.5` are frozen

Exit criteria:

- config parsing is split into reviewable modules
- feature defaults and preset projection are defined in one clear place
- docs and tests describe the actual pipeline, not the old monolithic parser shape

## Orchestrator Integration Tasks

- [x] `I0` Re-check the preset-slice contract after the shared-contract batch; current tests are green, so there is no active preset-slice blocker at the moment
- [ ] `I1` Merge Stream B first if it introduces the new runtime state contract
- [ ] `I2` Merge Stream C next if it only touches internal parser/feature files and package-local docs/tests
- [ ] `I3` Merge Stream A after the UI shell contract has been applied to reserved files
- [ ] `I4` Update reserved files with the final integrated contract:
  - `context.ts`
  - `ChatRoot.vue`
  - `ChatScaffold.vue`
  - `types/ui.ts`
  - `types/index.ts`
  - `index.ts`
  - `internal.ts`
- [ ] `I5` Resolve any import or contract drift between streams before broad validation

## Validation Gate

Minimum validation after each stream lands:

- `pnpm -F @opentiny/tiny-robot-chat type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`

Required validation before closing the whole refactor wave:

- `pnpm -F @opentiny/tiny-robot-chat type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F @opentiny/tiny-robot-chat-demo type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat-demo build`

## Completion Standard

The current refactor wave is complete only when all of the following are true:

- `HistorySurface` works as a real white-box building block
- drawer-shell behavior remains the stable built-in mainline
- runtime/message UI state is centralized and no longer spread casually across message objects
- attachment lifecycle is safe
- config and feature defaults are easier to review than the current monolithic parser
- package docs and demo reflect the actual implementation

## Worker Reporting Format

Each sub-agent should report back using the repository minimum:

```text
Status: done | blocked | needs-review
Changed files:
- path/to/file

Assumptions:
- ...

Risks:
- ...

Validation:
- command
- result
```
