# Phase 1B Page Relay Tightening

## Goal

在 mounted `Root + Page` proof 已经成立的前提下，继续收紧默认 page 路径里的 scaffold relay 假设，让 `Page` 更明确地消费 page-owned / runtime-owned 输入。

## Scope

- In scope:
  - 缩减默认 page 路径里仅用于兼容的 scaffold relay 读取
  - 收紧 `Page` 对 `scaffoldContext.presetSlices` 的依赖边界
  - 为新的 page-owned 输入边界补 runtime / contract / integration 验证
- Out of scope:
  - 全量 `Page` region tree 重写
  - 黑盒 `TrChat` cutover
  - standalone page-level `footer` replace slot
  - workspace / MCP parity 收尾

## Frozen Inputs

- Review / phase gate:
  - Review B is recorded as `pass-with-follow-ups`; Phase 1B continues immediately after the mounted proof slice.
- Contract freeze:
  - `TrChat.Page` remains composition-only.
  - `TrChat.Page` remains the owner of the default page composition.
  - `ChatDefaultRenderer` remains a compatibility delegate.
  - `footer-extra` remains the only frozen page-level footer slot.
- Required source docs:
  - `packages/chat/docs/refactor/design/api-runtime.md`
  - `packages/chat/docs/refactor/design/execution.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`

## Relevant Source Docs

- `packages/chat/docs/refactor/design/overview.md`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/docs/generated/runtime-owner-table.md`
- `packages/chat/docs/histories/2026-04/2026-04-21-phase-1b-mounted-root-page-integration.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/page/*`
  - `packages/chat/src/root/*`
  - `packages/chat/src/legacy/*`
  - `packages/chat/src/components/core/default-renderer/*`
  - `packages/chat/tests/runtime/*`
  - `packages/chat/tests/contracts/*`
  - `packages/chat/tests/integration/*`
- Intended ownership:
  - `Root` keeps the `{ runtime, ui }` boundary.
  - `Page` consumes only the minimal page-owned or runtime-owned inputs it actually needs.
  - `legacy` stays bounded to compatibility relay that has not yet been retired.
- Planned validation:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - relay tightening accidentally reopens `Root` config projection or creates a second page owner.
  - Mitigation:
    - keep ownership checks centered on `api-runtime.md`, `page-region-contract.md`, and contract tests.
- Risk:
  - relay tightening becomes invisible cleanup instead of producing clearer page-owned inputs.
  - Mitigation:
    - each cut should identify which read moved, which owner now serves it, and which test proves it.

## Exit Criteria

- [x] at least one meaningful scaffold relay path is replaced with a clearer page-owned or runtime-owned input
- [x] targeted tests pass
- [x] docs stay aligned
- [x] drift is recorded

## Validation

- Commands:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Demo / baseline checks:
  - the mounted `Root + Page` proof still passes after relay tightening
- Contract evidence:
  - `page-region-contract.md` remains aligned with the actual page owner reads
  - ownership changes are reflected in the relevant runtime or bridge lookup tables

## Decision Log

- 2026-04-21:
  - the mounted `Root + Page` integration proof is complete
  - the next Phase 1B slice focuses on relay tightening instead of widening the public surface
  - `TrChat.Page` should stop reading raw `scaffoldContext.presetSlices` directly and instead consume a narrow page-input boundary provided by `Root` or `Scaffold`

## Drift Backwrite

- What changed from the original slice:
  - `TrChat.Page` now reads `welcome / messageList / appearance / shell / modelSelector / updateModel` through a dedicated page-input context instead of directly reading generic `presetSlices`
  - `Root` and `Scaffold` both provide that explicit page-input boundary so the default page path no longer depends on broad scaffold buckets at the page owner layer
  - `TrChat.Page` now passes explicit default inputs into `ChatProvider`, `ChatLayout`, `ChatHeader`, `ChatHistory`, `ChatWelcome`, and `ChatMessageList` so the nearest default page primitives no longer need to rediscover those values through scaffold relay
- Which source docs need follow-up:
  - `alignment-tracker.md`
  - `api-runtime.md`
  - `page-region-contract.md`
