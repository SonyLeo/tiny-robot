# Review C Reviewer Memo

## Update | 2026-04-21 | Phase 2 kickoff preview

在正式开 `Review C` 之前，仓库里已经额外落地了一条很窄的 `Phase 2` kickoff preview：

- 当 `TrChat` 收到的 `config` 已经匹配 target `TrChatConfig`
- 且没有额外提供 `runtime`、`callbacks`、`presetOverrides`

默认黑盒入口已经先走：

`createRuntimeFromConfig(config) -> TrChat.Root + TrChat.Page`

同时保留一条明确的 compatibility fallback：

- 旧 shipping `ChatConfig` 形态
- compatibility-only props

它们当前仍显式回退到 `ChatScaffold`。

这轮 `Review C` 现在还需要顺手判断：

- 这条 preview 是否足够干净，可以作为 `Phase 2` 的正式黑盒 entry baseline
- 还是应该把它继续视为受限预热切片，等 Review C 后再扩大 cutover 范围

补充 evidence：

- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
- `packages/chat/docs/exec-plans/active/2026-04-21-phase-2-blackbox-trchat-cutover-baseline.md`
- `packages/chat/docs/histories/2026-04/2026-04-21-phase-2-blackbox-root-page-kickoff.md`

## 1. 这次我希望你帮我判断什么

这次我只希望和你一起判断两件事：

1. `Phase 1B` 有没有真的把默认 `Page` owner path 站住
2. 如果默认 `Page` owner path 已经站住，是否可以直接进入 `Phase 2`

这次不是重开 `Review B`。
我更希望你重点帮我判断：

- `TrChat.Page` baseline 到底已经证明了什么
- `Page` 有没有在实现里重新长回第二个 owner
- `history / models / workspace` baseline 是否已经被真实消费验证
- 黑盒 `TrChat` 回切到新主路径时，`Phase 2` 立刻依赖的 contract 是否已经够清楚

## 2. 这次默认承接 `Review B` 的哪些前提

这次默认下面这些前提已经在 `Review B` 通过：

- `Phase 1A` foundation 已通过
- `Root + createRuntimeFromConfig(config)` 已经是正式 on-ramp
- `TrChat.Page` 是官方默认 page layer
- `Page` 保持 composition-only
- `history / models / workspace` 在 `Phase 1B` 进入 page-level baseline
- `footer-extra` 仍是当前唯一冻结的 page-level footer slot

这次不再重新论证这些前提“为什么这样设计”；
这次只检查：它们有没有在 `Phase 1B` 的实现和证据里真正站住。

## 3. 这次我会拿什么来证明 `Phase 1B`

我会重点给你看三类证据：

1. 默认 page owner path 证据
   `TrChat.Page`、page-input boundary、default primitives、workspace owner chain

2. 集成证据
   mounted `Root + Page` proof、contract tests、integration tests

3. 偏差说明
   哪些地方与 `Review B` 预期完全一致，哪些地方仍然是 bounded follow-ups

一句话说，这次不是按“Page 代码写了多少”判断，
而是按“默认 page owner path 有没有被证据证明站住”判断。

### 这次已经准备好的 6 组关键证据

1. `TrChat.Page` 已经成为默认 page composition owner，`ChatDefaultRenderer` 退回 compatibility delegate。
2. `history / models / workspace` baseline 已经通过 `Page` 消费，而不是重新塞回 `Root` 总装配。
3. mounted `Root + Page` integration proof 已经存在，不再只停留在 source-level contract。
4. page-input boundary 已经建立，`Page` 不再直接读 broad scaffold / preset buckets。
5. 默认 owner path 上的最近一级 primitives 已经切成“显式输入优先 + compatibility relay 显式化”。
6. `workspace / sidebar / mobile-sheet`、`layout renderer`、`header / history / welcome / messageList` 这一圈 relay tightening 已经全部关完，Phase 1B 默认 owner-path baseline 已闭环。

### 如果你只想快速抽查证据，先看这 7 个 artifact

- `packages/chat/tests/contracts/public-surface.test.mjs`
  看默认 page owner path、显式输入链和 compatibility relay opt-out
- `packages/chat/tests/contracts/workspace-slot-contract.test.mjs`
  看 workspace owner chain 和 slot contract
- `packages/chat/tests/integration/root-page-mounted.test.mjs`
  看 mounted `Root + Page` integration proof
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-page-history-models-workspace-baseline.md`
  看 `Page / history / models / workspace` baseline 是怎么落地的
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-mounted-root-page-integration.md`
  看 mounted proof 和验证链
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-welcome-message-list-relay-pruning.md`
  看默认 owner path 最后一刀 relay tightening 的闭环
- `packages/chat/docs/histories/2026-04/2026-04-21-phase-1b-welcome-message-list-relay-pruning.md`
  看 Phase 1B 收口后的真实落地、drift 和 follow-ups
- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
  看 target `TrChatConfig` 黑盒 preview 是否已真正进入 `Root + Page`
- `packages/chat/docs/exec-plans/active/2026-04-21-phase-2-blackbox-trchat-cutover-baseline.md`
  看这条 kickoff preview 当前冻结的边界和仍未关闭的 gate
- `packages/chat/docs/histories/2026-04/2026-04-21-phase-2-blackbox-root-page-kickoff.md`
  看这条 preview 为什么只先落 target-shaped input，而没有伪装成全量 cutover

## 4. 当前 drift 摘要

为了避免会中把“已知延后项”和“硬门禁 drift”混在一起，这次建议直接按下面这个口径讲：

- 当前没有已知 hard-gate drift：
  - `TrChat.Page` 仍保持 composition-only
  - `Page` 没有重新读回 broad preset buckets
  - `history / models / workspace` 没有反向打穿 `Root + Page + primitives` 分层
  - 默认 owner path 下的最近一级 primitives 已经开始以显式输入为 authoritative source
- 当前存在 3 个 bounded follow-ups：
  - standalone page-level `footer` replace slot 仍然明确延后，不在 `Phase 1B` 收口
  - 黑盒 `TrChat` 主路径还没有正式回切到 `Root + Page`
  - 最终 parity、helper/public surface 收口仍留给后续阶段

## 5. 如果 `Phase 1B` 通过，下一步准备做什么

如果这轮通过，我准备直接进入 `Phase 2`。

`Phase 2` 的重点不是 parity，也不是所有 helper/public surface 一次收口，而是：

- 黑盒 `TrChat` 默认主路径切到 `createRuntimeFromConfig(config) -> Root + Page`
- 收紧剩余 config projection / compatibility relay，让黑盒入口真正站到新主路径上
- 在不重开 `Phase 1B` 已闭环 owner-path contract 的前提下补黑盒级 integration proof

## 6. 这次我最想请你帮我判断的 6 个问题

### 1. `Phase 1B` 是否真的证明了 `Page` baseline

我希望你重点帮我看：

- `TrChat.Page` 是否已经成为默认 page composition owner
- 这是不是“真 owner”，而不只是表面加了一层组件

### 2. `TrChat.Page` 是否仍然保持 composition-only

我希望你重点帮我看：

- `Page` 有没有重新变成总装配大总管
- `Page` 有没有重新读回 broad scaffold / preset buckets

### 3. `history / models / workspace` baseline 是否真的站住

我希望你重点帮我看：

- 它们是不是已经被 page-level baseline 真实消费
- owner 和 page consumption 边界是不是足够清楚

### 4. 当前证据是否足够支撑 `Phase 1B pass`

我希望你重点帮我看：

- contract tests、integration proof、completed slices、histories 是否已经足够
- 还是还缺某种关键证明链路

### 5. `Phase 2` 范围是否合理

我的建议是：

- 下一阶段聚焦黑盒 `TrChat` 默认主路径回切
- 不把 parity / final public surface / helper 收口提前拖进来

### 6. `Phase 2` 立刻依赖的 contract 是否已经够清楚

我希望你重点帮我看：

- 黑盒入口回切时，哪些边界必须保持不变
- 哪些问题必须继续延后到 `Review D`

## 7. 这次不展开什么

为了控制会议范围，这次先不展开：

- 为什么要重构
- `TrChat / Root / Page` 的大方向是否成立
- `Phase 1A` foundation 是否重审
- standalone `footer` replace slot 的最终发布语义
- 全量 parity
- 最终 helper / public surface 收口
- `Review D` 才会关心的最终闭环问题

如果你觉得这些内容有风险，我会先记下来，但不拿它们阻塞这轮 `Phase 1B / Phase 2` 判断。

## 8. 我希望这次会议最后得到什么

我希望最后能收出 3 个结论：

1. `Phase 1B` 是 `pass / pass with follow-ups / blocked`
2. 是否直接进入 `Phase 2`
3. 如果还不能进入，最优先要补的阻塞点是什么

## 9. 如果你时间有限，只看这几句就够了

- 这轮不重评大方向，只评 `Phase 1B` 有没有真的把默认 page owner path 站住
- 我会重点证明：`TrChat.Page` owner、`history / models / workspace` baseline、mounted `Root + Page` proof、page-input boundary、以及默认 owner path 上的 relay tightening 全部闭环
- 我会单独列出当前 drift：没有 hard-gate drift，但 `footer` replace slot、黑盒 `TrChat` 主路径回切、最终 parity 仍然延后
- 如果这些成立，下一阶段就直接做黑盒 `TrChat` 默认主路径切到 `Root + Page`
- 这轮我最需要你帮我判断的是：当前证据够不够支撑 `Phase 1B pass`，以及 `Phase 2` 立刻依赖的 contract 是否已经够清楚
