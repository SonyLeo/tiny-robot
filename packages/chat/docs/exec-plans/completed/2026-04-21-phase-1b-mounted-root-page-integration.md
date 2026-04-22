# Phase 1B Mounted Root And Page Integration

## Goal

为 `Root + Page` 补上直接 mounted integration coverage，并进一步收紧当前默认 page 路径里的 scaffold-only 假设。

## Scope

- In scope:
  - 为 `TrChat.Root + TrChat.Page` 建立一条最小 mounted integration proof
  - 验证已落地的 `history / models / workspace` baseline 会在真实 page shell 里被消费
  - 收紧默认 page 路径里仅用于兼容的 scaffold relay 假设
- Out of scope:
  - 新一轮 `footer` replace slot 设计
  - 全量 `Page` region tree 重写
  - 黑盒 `TrChat` cutover
  - 完整 workspace parity 和 MCP parity

## Frozen Inputs

- Review / phase gate:
  - Review B is recorded as `pass-with-follow-ups`; Phase 1B may continue immediately.
- Contract freeze:
  - `TrChat.Page` remains composition-only.
  - `TrChat.Page` owns the default page composition.
  - `ChatDefaultRenderer` remains a compatibility delegate, not a second page owner.
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
- `packages/chat/docs/generated/config-bridge-matrix.md`
- `packages/chat/docs/histories/2026-04/2026-04-21-phase-1b-page-baseline.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/root/*`
  - `packages/chat/src/page/*`
  - `packages/chat/src/components/core/default-renderer/*`
  - `packages/chat/tests/runtime/*`
  - `packages/chat/tests/contracts/*`
- Intended ownership:
  - `Root` continues to own the `{ runtime, ui }` provide boundary.
  - `Page` owns default page composition and region slot anchors.
  - tests own the mounted proof that the current baseline is alive end to end.
- Planned validation:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - mounted integration proof turns into a one-off harness that does not reflect the public page surface.
  - Mitigation:
    - keep the proof centered on `TrChat.Root` and `TrChat.Page`, not internal-only wrappers.
- Risk:
  - provider/scaffold compatibility paths re-expand into a second page owner.
  - Mitigation:
    - keep `ChatDefaultRenderer` as a delegate and pin that behavior in contract tests.

## Exit Criteria

- [x] mounted `Root + Page` proof stands up
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
  - one direct mounted `Root + Page` proof demonstrates page shell composition without routing through blackbox `TrChat`
- Contract evidence:
  - `page-region-contract.md` remains aligned with the mounted page owner
  - contract tests keep `ChatDefaultRenderer` constrained to compatibility-delegate behavior

## Decision Log

- 2026-04-21:
  - the page/history/models/workspace baseline slice completed and moved to `completed/`
  - the next Phase 1B slice starts from mounted integration proof instead of further widening the bridge subset

## Drift Backwrite

- What changed from the original slice:
  - the mounted proof landed as a dedicated SSR-backed integration test that renders `TrChat.Root + TrChat.Page` through a Vite module load path, while aliasing `@opentiny/tiny-robot` and `markstream-vue` to narrow test stubs so the proof stays focused on page-shell ownership rather than upstream component-package SSR gaps
- Which source docs need follow-up:
  - `alignment-tracker.md`
  - `execution.md`
