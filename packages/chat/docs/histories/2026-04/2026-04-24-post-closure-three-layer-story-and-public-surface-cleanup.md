## [2026-04-24 23:55] | Task: post-closure three-layer story and public-surface cleanup

### Why Now

After the package-local coverage baseline landed, the next post-closure follow-up was to finish the first two preferred cleanup steps without reopening runtime architecture work:

- make the settled three-layer product story explicit in the package guidance
- trim the remaining provider-facing public-surface leakage that still spoke in old `chatKit` terms

### Files Changed

- `packages/chat/README.md`
- `packages/chat/src/components/core/ChatProvider.vue`
- `packages/chat/src/runtime/provider/resolveProviderRuntime.ts`
- `packages/chat/src/types/core.ts`
- `packages/chat/src/types/index.ts`
- `packages/chat/src/types/ui.ts`
- `packages/chat/src/components/feedback/ChatFeedback.vue`
- `packages/chat/src/components/feedback/useChatFeedback.ts`
- `packages/chat/src/components/renderers/EditInputRenderer.vue`
- `packages/chat/src/components/renderers/ErrorRenderer.vue`
- `packages/chat/src/root/RootBootstrapProvider.vue`
- `packages/chat/src/root/createRootBootstrapState.ts`
- `packages/chat/src/runtime/chat-kit/useChatConversation.ts`
- `packages/chat/src/runtime/chat-kit/useChatKit.ts`
- `packages/chat/src/shared/context/index.ts`
- `packages/chat/tests/_helpers.mjs`
- `packages/chat/tests/runtime/provider-response-provider.test.mjs`
- `packages/chat/tests/runtime/message-actions.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/docs/refactor/design/ui-runtime-transport-layering.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/exec-plans/completed/2026-04-24-post-closure-coverage-story-and-surface-cleanup.md`

### Contracts Touched

- docs:
  package guidance and process tracking for the settled three-layer product model
- public typing:
  provider-facing and message-action public surface only; no runtime, root, page, or transport behavior contract changed

### Changes Overview

- Main implementation result:
  the public package surface now centers provider-facing types on `TrChatProviderRuntimeOptions`, stops re-exporting `UseChatKitOptions`, `UseChatKitRuntimeBridge`, and `UseChatKitReturn`, removes fallback-runtime shape from the public message-action context, and renames the provider-side helper to `resolveProviderRuntime` while keeping the private runtime chain internal
- Main docs result:
  README and the standing layering design doc now explicitly describe the three-layer model and the retained `TrChat.Provider(responseProvider)` story as "our UI + runtime, your transport"

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat build`
  - `pnpm.cmd type-check`
  - `node tests/runtime/provider-response-provider.test.mjs`
  - `node tests/runtime/message-actions.test.mjs`
  - `node tests/contracts/public-surface.test.mjs`
  - `node tests/run-all.mjs tests/runtime`
  - `node tests/run-all.mjs tests/contracts`
  - `node tests/run-all.mjs tests/integration`
  - `pnpm.cmd -F tiny-robot-test test:chat:smoke`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/surface-api.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - build passed and the generated public declaration surface now keeps `UseChatKit*` only in `dist/internal.d.ts`, while the public `dist/index.d.ts` exposes the provider-facing `TrChatProviderRuntimeOptions` shape
  - targeted runtime and contract tests passed
  - package-local runtime, contract, and integration suites passed
  - retained Playwright smoke passed (`39` tests)
  - targeted `surface-api` Playwright coverage for `TrChat.Provider(responseProvider)` and related advanced surface proof passed (`9` tests)
  - docs validation passed

### Drift From Plan Or Review

- What drifted:
  the bounded public-surface cleanup batch ended up including message-action fallback-runtime cleanup in addition to provider-facing type cleanup
- Why:
  the public declaration build still exposed fallback runtime shape after the first type/export pass, so the cleanup had to split the feedback composable into a public path and an internal fallback-runtime path
- Backwrite status:
  README, tracker, completed execution slice, and this history now reflect the landed scope

### Known Limits

- the private runtime chain still exists internally and still surfaces in `@opentiny/tiny-robot-chat/internal`; this task only removes it from the public package story and provider-facing public types
- no deeper runtime re-architecture was attempted
- the deferred standalone page-level `footer` publishing semantics task remains separate
- local package-local test output still includes the existing non-blocking `localStorage is not defined` warning from `packages/kit`

### Follow-ups

- only reopen deeper private-runtime cleanup with a new scoped task if more public-surface or internal naming debt becomes worth paying down
- treat standalone page-level `footer` publishing semantics as its own contract slice
