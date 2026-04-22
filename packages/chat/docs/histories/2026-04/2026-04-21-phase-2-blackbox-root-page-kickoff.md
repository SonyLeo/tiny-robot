## [2026-04-21 18:10] | Task: phase 2 blackbox root-page kickoff

### Why Now

`Phase 1B` 已经完成默认 `Page` owner path baseline，下一步自然进入黑盒 `TrChat` 主路径回切。
这次没有一次性吃掉所有 legacy config / compatibility surface，而是先落一条最窄的 target-config kickoff preview，给 `Review C` 一个真实可评审的黑盒入口证据。

### Files Changed

- `packages/chat/src/components/core/Chat.vue`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/reviews/review-c-phase-1b-report-and-phase-2-kickoff/REVIEW_C_OWNER_RUNBOOK.md`
- `packages/chat/docs/refactor/reviews/review-c-phase-1b-report-and-phase-2-kickoff/REVIEW_C_SPEC_DETAIL.md`
- `packages/chat/docs/refactor/reviews/review-c-phase-1b-report-and-phase-2-kickoff/REVIEW_C_REVIEWER_MEMO.md`
- `packages/chat/docs/exec-plans/active/2026-04-21-phase-2-blackbox-trchat-cutover-baseline.md`

### Contracts Touched

- runtime / root / page / config / docs:
  target-shaped blackbox `TrChat` input may now enter through `createRuntimeFromConfig(config) -> Root + Page`, while old config shapes and compatibility props remain explicit `ChatScaffold` fallback.

### Changes Overview

- Main implementation result:
  `TrChat` 现在在收到 target `TrChatConfig` 且没有 `runtime`、`callbacks`、`presetOverrides` 时，会直接走 `Root + Page` 黑盒预热主路径；其余 legacy/compatibility 入口继续显式回退到 `ChatScaffold`。
- Main docs result:
  `api-runtime`、`execution`、tracker、`Review C` packet 和 active plan 都已经同步成“Phase 2 kickoff preview 已落地，但 formal phase gate 仍由 Review C 拍板”的口径。

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  passed

### Drift From Plan Or Review

- What drifted:
  原始 `Phase 2` kickoff plan 想描述的是更广义的默认黑盒 cutover；实际先落地的是 target-config preview path。
- Why:
  当前 shipping blackbox usage 仍混用旧 `ChatConfig` 形态和 compatibility-only props，一次性并入新主路径会把 legacy drift 藏进 kickoff slice。
- Backwrite status:
  active plan、tracker、`Review C` packet 已回写，等待 `Review C` 决定这条 preview 是否升级为正式 entry baseline。

### Known Limits

- 旧 shipping `ChatConfig` 形态仍未进入 `Root + Page`
- 依赖 `runtime / callbacks / presetOverrides` 的黑盒入口仍保留显式 `ChatScaffold` fallback
- 这条 kickoff preview 还不等于 `Phase 2` 全部完成

### Follow-ups

- 用 `Review C` 拍板这条 preview 是否可以作为 `Phase 2` 的正式黑盒 entry baseline
- 继续收缩旧 `ChatConfig` 和 compatibility props 的 fallback 面
- 在不重开 `Phase 1B` owner-path contract 的前提下补更多黑盒对照与集成证据
