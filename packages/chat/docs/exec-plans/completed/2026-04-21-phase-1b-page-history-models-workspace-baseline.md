# Phase 1B Page / History / Models / Workspace Baseline

## Goal

建立 `TrChat.Page` 的最小可运行页面基线，并把 `history / models / workspace` 从“延后能力”推进为 page-level runtime consumption 的正式实现面。

## Scope

- In scope:
  - 建立 `history / models / workspace` baseline runtime
  - 建立 `TrChat.Page` 最小页面壳与 region wiring
  - 建立 `Header / History / ModelSelector / WorkspaceShell` 的最小 page-level consumption 路径
  - 把 Phase 1B 的 page/slot/provider 边界固化到测试和文档
- Out of scope:
  - 黑盒 `TrChat` 主路径 cutover
  - 完整 slot parity 和最终命名收口
  - standalone page-level `footer` replace slot
  - 完整 MCP parity
  - 最终 helper / public surface 收口

## Frozen Inputs

- Review / phase gate:
  - Review B is recorded as `pass-with-follow-ups`; Phase 1A foundation evidence is accepted and Phase 1B may start immediately.
- Contract freeze:
  - `TrChat.Page` remains composition-only.
  - `Page` must consume named minimal modules instead of relaying whole runtime.
  - `history / models / workspace` enter through page-level consumption, not by re-expanding `Root`.
  - `footer-extra` remains the only frozen page-level footer slot; standalone `footer` replace semantics stay deferred.
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
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/docs/generated/config-bridge-matrix.md`
- `packages/chat/docs/generated/runtime-owner-table.md`
- `packages/chat/docs/generated/slot-catalog.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/components/history/*`
  - `packages/chat/src/components/model-selector/*`
  - `packages/chat/src/components/workspace/*`
  - `packages/chat/src/runtime/config/*`
  - `packages/chat/src/runtime/core/*`
  - `packages/chat/src/root/*`
  - `packages/chat/src/types/model.ts`
  - `packages/chat/src/types/workspace.ts`
  - `packages/chat/tests/runtime/*`
  - `packages/chat/tests/contracts/*`
- Intended ownership:
  - `history / models / workspace` own their module state, actions, and degrade behavior.
  - `Page` owns official region composition, slot anchor wiring, and minimal provider boundaries.
  - `Root` remains the `{ runtime, ui }` boundary and must not grow a second config projection layer.
- Planned validation:
  - package-local type-check
  - targeted runtime suites for history/models/workspace behavior
  - targeted contract suites for page region, slot-provider, and degrade rules
  - one `Root + Page` baseline path that proves the page shell stands up

## Risks

- Risk:
  - `Page` drifts into whole-runtime relay or starts re-reading config.
  - Mitigation:
    - treat `page-region-contract.md` as the active boundary source and add contract tests before broad integration.
- Risk:
  - `history / models / workspace` get reassembled in `Root` or legacy adapters instead of page-level consumption.
  - Mitigation:
    - keep new stateful logic in the owning module/runtime areas and only let `Page` consume named minimal modules.
- Risk:
  - standalone `footer` replace semantics leak into Phase 1B by accident.
  - Mitigation:
    - keep `footer-extra` as the only frozen footer slot and cover the default page path with contract tests.
- Risk:
  - Phase 1B starts dragging in blackbox cutover, full slot parity, or MCP parity before the page shell is stable.
  - Mitigation:
    - treat those as explicit out-of-scope items for this slice and record any pressure as follow-up drift rather than absorbing it into the implementation.

## Exit Criteria

- [x] `history / models / workspace` baseline runtime paths stand up
- [x] `Root + Page` baseline stands up without reopening `Root` or `ui` boundaries
- [x] targeted tests pass
- [x] docs stay aligned
- [x] drift is recorded

## Validation

- Commands:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Demo / baseline checks:
  - a minimal `Root + Page` baseline proves header/body/footer/workspace composition is alive
  - current shipping demos remain comparison anchors, not the design source of truth
- Contract evidence:
  - `page-region-contract.md` still matches actual page region reads and degrade rules
  - `config-bridge-matrix.md` only expands when the newly-supported Phase 1B fields are actually implemented
  - `api-runtime.md` remains the owning source for history/models/workspace/page contracts

## Decision Log

- 2026-04-21:
  - Review B passed with follow-ups and accepted the Phase 1A foundation evidence as sufficient to start Phase 1B immediately.
  - Phase 1B starts from `Page / history / models / workspace` baseline rather than blackbox cutover or full feature parity.
  - standalone page-level `footer` replace slot remains deferred; this slice keeps `footer-extra` as the only frozen footer slot while page baseline semantics are proven.

## Drift Backwrite

- What changed from the original slice:
  - the first implementation cut entered Phase 1B as a thin `TrChat.Page` wrapper, then moved the actual default page composition into `TrChat.Page` while keeping `ChatDefaultRenderer` as a compatibility delegate.
  - `history / models / workspace` baseline currently enters the page through `Root`'s legacy scaffold bridge and runtime-backed `ChatProvider` workspace state, rather than through a brand-new page-only provider layer.
- Which source docs need follow-up:
  - `alignment-tracker.md` as the slice moves from kickoff into concrete runtime/page implementation
  - `execution.md` and `config-bridge-matrix.md` because the Phase 1B bridge subset is now partially implemented
  - `api-runtime.md` only if the current compatibility-delegate shape for `ChatDefaultRenderer` becomes a lasting contract concern instead of a bounded implementation cut
