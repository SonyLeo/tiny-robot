# Phase 1A Bootstrap And Root Baseline

## Goal

建立 `TrChat.Root` 的最小可运行基线，并把 Phase 1A 的实现入口、验证门禁和代码写入范围固定下来。

## Scope

- In scope:
  - 明确 Phase 1A 的第一刀实现范围
  - 固定 `Root` baseline 需要承接的 runtime modules
  - 固定第一批实现入口、测试入口和验证命令
  - 约束本阶段只做 runtime foundation，不提前写 `Page` / app-shell
- Out of scope:
  - `TrChat.Page` 默认页面落地
  - `history / models / workspace` 运行时实现
  - MCP、message extension parity、workspace parity
  - 对外发布切换、deprecation、用户文档切换

## Frozen Inputs

- Review / phase gate:
  - Review A is recorded as `pass-with-follow-ups`; Phase 0.5 contract sign-off is complete and Phase 1A may start.
- Contract freeze:
  - `TrChat`, `TrChat.Root`, `TrChat.Page` remain the official mental model.
  - `createRuntimeFromConfig(config)` remains the official bridge entry.
  - `ui` remains display-only.
  - `Page` remains composition-only.
  - Runtime ownership follows source-of-truth boundaries, not page-region boundaries.
- Required source docs:
  - `packages/chat/docs/refactor/design/overview.md`
  - `packages/chat/docs/refactor/design/api-runtime.md`
  - `packages/chat/docs/refactor/design/execution.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`

## Relevant Source Docs

- `packages/chat/docs/refactor/design/overview.md`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/generated/runtime-owner-table.md`
- `packages/chat/docs/generated/config-bridge-matrix.md`
- `packages/chat/docs/generated/slot-catalog.md`
- `packages/chat/docs/generated/page-region-contract.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/root/*`
  - `packages/chat/src/runtime/core/*`
  - `packages/chat/src/runtime/config/*`
  - `packages/chat/src/runtime/conversation/*`
  - `packages/chat/src/runtime/sender/*`
  - `packages/chat/src/runtime/message/*`
  - `packages/chat/src/runtime/attachments/*`
  - `packages/chat/src/legacy/*`
  - `packages/chat/src/index.ts`
  - `packages/chat/src/internal.ts`
  - `packages/chat/tests/runtime/*`
  - `packages/chat/tests/contracts/*`
- Intended ownership:
  - `Root` owns runtime normalization, provide boundary, and baseline assembly.
  - `conversation / sender / message / attachments` own the send chain and message path.
  - `legacy` only owns migration bridges needed to keep current blackbox and whitebox anchors comparable during development.
- Planned validation:
  - package-local type-check
  - targeted runtime and contract suites for Phase 1A
  - one runnable demo or baseline mount that proves the `Root` chain stands up

## Risks

- Risk:
  - Root baseline drifts into `Page` or workspace concerns before the send chain is stable.
  - Mitigation:
    - treat `Page`, `history`, `models`, and `workspace` as explicit out-of-scope items for this slice.
- Risk:
  - implementation falls back to old `ChatScaffold` / `ChatProvider` structure instead of using the new routing.
  - Mitigation:
    - new structural code goes only into `src/root`, `src/runtime/*`, and `src/legacy`.
- Risk:
  - contract artifacts stop matching the actual first implementation cut.
  - Mitigation:
    - if runtime ownership or bridge scope changes, update the owning design doc first and then the generated artifact.
- Risk:
  - local validation is blocked by sibling package outputs instead of chat code itself.
  - Mitigation:
    - run validation in the main workspace and build sibling workspace packages first when required.

## Exit Criteria

- [x] Review A sign-off is recorded before implementation starts in earnest.
- [x] `TrChat.Root` baseline can stand up the conversation / sender / message / attachments chain.
- [x] Phase 1A targeted tests pass.
- [x] `Page` and app-shell code have not been pulled into this slice.
- [x] docs stay aligned.
- [x] drift is recorded.

## Validation

- Commands:
  - `pnpm -F @opentiny/tiny-robot-svgs build`
  - `pnpm -F @opentiny/tiny-robot-kit build`
  - `pnpm -F @opentiny/tiny-robot build`
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `pnpm -F @opentiny/tiny-robot-chat test:unit`
- Demo / baseline checks:
  - a minimal `Root`-based mount proves send chain wiring is alive
  - old shipping demos remain comparison anchors, not implementation targets
- Contract evidence:
  - runtime owner table still matches actual module ownership
  - config bridge matrix still matches the supported subset
  - slot catalog and page region contract remain unchanged for this slice

## Decision Log

- 2026-04-21:
  - Main workspace is the only active implementation surface; the temporary refactor worktree has been retired.
  - Phase 1A will start from `Root` runtime foundation rather than `Page` or feature parity work.
  - Review A passed with follow-ups; implementation may proceed while carrying footer treatment and contract-test baseline as explicit follow-ups.
  - Additive bootstrap implementation landed in `src/root`, `src/runtime/core`, `src/runtime/config/createRuntimeFromConfig.ts`, and `src/legacy`, while existing primitives continue to run through a temporary legacy adapter.
  - `TrChat.Root`, `createRuntimeFromConfig`, and the first batch of Root/runtime public types are now exposed through the package public surface and covered by package-local contract/runtime tests.
  - `createRuntimeFromConfig` now defaults to a no-op in-memory storage strategy when `conversation.persistence` is not provided, so the helper does not silently fall back to browser `localStorage`.
  - Root-mode sender draft and pending attachments now route through `runtime.sender`, and the legacy bridge keeps the attachments area bound to `sender.pendingAttachments` instead of a separate manager-owned queue.
  - Phase 1A message runtime hardening landed: `messageId` now persists through message `state`, edit/retry/regenerate flows preserve the source user `messageId`, and `message runtime` exposes canonical `copy`, `editing`, `optimistic`, and error/busy view-state by `messageId`.
  - Built-in feedback actions now prefer `messageId + runtime` execution paths, with `copy / edit` delegating to `message runtime` and assistant refresh delegating to `conversation runtime`.
  - Edit and error renderers now also prefer `messageId + runtime`: inline edit save/cancel delegates to `message runtime`, and retry from the error renderer delegates to `conversation runtime`.
  - Message action context and emitted payloads now carry both `messageId` and `messageIds`, so custom actions can target grouped messages by stable ids while `messageIndex` remains migration-only metadata.
  - `conversation.initialMessages` is now locked as an eager first-screen baseline in the Root bridge path: when no restore exists, `createRuntimeFromConfig(config)` materializes the active conversation up front and does not duplicate the seed on first send.
  - Phase 1A validation is now routable through package-local scripts: `test:runtime`, `test:contracts`, and `check:phase-1a`.
  - Footer treatment is now explicitly closed for Phase 1A: the default page path keeps `footer-extra` as the only page-level footer slot, and contract tests assert that no standalone `footer` replace slot leaked into the default renderer.

## Drift Backwrite

- What changed from the original slice:
  - This plan is re-established in the main workspace after the temporary worktree was removed.
  - The first implementation cut reuses existing primitives through a legacy bridge instead of rewriting the primitive layer in the same slice.
  - Phase 1A now treats `messageId` as a persisted state-backed action key so edit, retry, regenerate, and restore flows do not fall back to index-only targeting.
  - Message action context now carries `messageId` as the formal key, while `messageIndex` remains legacy metadata for wrappers and transition paths.
  - Inline edit and retry renderers now follow the same runtime-first rule, so `messageIndex` fallback is narrower and mostly confined to explicit legacy adapters.
  - Custom message actions now receive `messageIds` alongside the primary `messageId`, so grouped-action paths can keep moving away from index semantics without waiting on legacy wrappers to disappear.
- Which source docs need follow-up:
  - `alignment-tracker.md` to mark the slice complete and advance Review B readiness
  - `execution.md` only if later phases change gates or validation expectations
