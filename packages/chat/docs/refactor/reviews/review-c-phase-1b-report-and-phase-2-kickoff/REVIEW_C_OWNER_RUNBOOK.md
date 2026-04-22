# Review C Owner Runbook

## Update | 2026-04-21 | Phase 2 kickoff preview

会前请额外统一一个现状，避免评审人还停留在“Phase 2 还完全没开始”的认知里：

- 仓库里已经落地一条很窄的黑盒 kickoff preview
- 当 `TrChat` 收到 target `TrChatConfig`
- 且没有 `runtime`、`callbacks`、`presetOverrides`

默认黑盒入口已经先走：

`createRuntimeFromConfig(config) -> TrChat.Root + TrChat.Page`

同时保留明确 fallback：

- 旧 shipping `ChatConfig` 形态
- compatibility-only props

它们当前仍显式回退到 `ChatScaffold`。

这意味着本次 `Review C` 后半段要多拍板一件事：

- 这条 preview 是否可以升级为 `Phase 2` 的正式黑盒 entry baseline

建议会中直接引用的补充 evidence：

- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
- `packages/chat/docs/exec-plans/active/2026-04-21-phase-2-blackbox-trchat-cutover-baseline.md`
- `packages/chat/docs/histories/2026-04/2026-04-21-phase-2-blackbox-root-page-kickoff.md`

## 1. 这份文档怎么用

这份文档只给主持人和 owner 自己用，不发给评审人。

`Review C` 不是重开 `Review B`，而是做两件事：

1. 汇报 `Phase 1B` 的实现结果，判断默认 `Page` owner path 是否真的站住
2. 在默认 owner path 站住的前提下，决定是否允许进入 `Phase 2`，并冻结 `Phase 2` 立刻依赖的黑盒 `TrChat` cutover contract

这场会的重点不是“`Page` 写了多少”，而是：

- `TrChat.Page` 是否已经成为默认 page composition owner
- `Page` 是否仍然保持 composition-only
- `history / models / workspace` baseline 是否已经被真实消费验证
- `Phase 2` 黑盒入口回切前必须冻结的边界是否已经清楚

## 2. 这场会的目标和输出

### 目标

- 证明 `Phase 1B` 不是“又做了一轮 UI 调整”，而是真的把默认 page owner path 站住
- 明确列出当前实现与 `Review B` 预期的偏差
- 判断这些偏差是否阻塞 `Phase 1B` 退出
- 冻结 `Phase 2` 黑盒 `TrChat` 默认主路径回切所立刻依赖的 contract

### 会议结束前必须拿到的输出

1. `Phase 1B` 的结论：`pass / pass with follow-ups / blocked`
2. 是否允许直接进入 `Phase 2`
   - 如果结论是 `pass with follow-ups`，必须额外写清是 `可直接进入` 还是 `需先收口 follow-ups`
3. 如果不能进入，阻塞点是什么
4. 如果可以进入，`Phase 2` 的 `Must Freeze Now` 是什么

### 会前先统一的现状

建议在开场前先把下面这 5 个现状讲清楚，避免评审人还停留在旧版 `Phase 1B` 认知里：

1. tracker 当前已经记录：
   - `Phase 1B = completed`
   - `Phase 2 = preview-landed-awaiting-review-c`
   - `Review C = ready-to-schedule`
2. `TrChat.Page` 已经成为默认 page composition owner，`ChatDefaultRenderer` 已退回 compatibility delegate。
3. `history / models / workspace` baseline 已经通过 page-level consumption 站住。
4. mounted `Root + Page` integration proof 已存在，默认 owner path 下的 relay tightening 已经闭环。
5. 当前仍明确延后的只有：
   - standalone page-level `footer` replace slot
   - 黑盒 `TrChat` 默认主路径回切
   - 最终 parity / public surface 收口

## 3. 这场会只讨论什么

### 讨论范围

1. `Phase 1B` 已实现了哪些 page-level baseline contract
2. `TrChat.Page` 是否仍保持 composition-only
3. `history / models / workspace` baseline 是否已真实消费
4. contract tests / integration proof / completed slices 是否足够支撑 `Phase 1B pass`
5. `Phase 2` 范围是否合理：
   黑盒 `TrChat` 默认主路径回切
6. `Phase 2` 立刻依赖的 API / props / slot / relay contract 是否足够冻结

### 明确不讨论

- 是否要重写整体方向
- 为什么要重构
- `Phase 1A` foundation 是否重新评审
- standalone `footer` replace slot 的最终发布语义
- 最终 helper / public surface 收口
- 全量 parity
- `Review D` 才会关心的最终闭环问题

如果对方把讨论带回 `Review A / Review B` 已通过的设计前提，你只问一件事：

> 这是实现把既有 freeze 打穿了，还是你希望重新打开已经通过的设计判断？

如果是前者，记到 drift。
如果是后者，记成 follow-up，不在本轮展开。

## 4. 这场会的推荐结构

建议总时长：`35-45` 分钟。

### 第 1 段：开场，3 分钟

把定位说清楚：

> 这轮不是重开 `Review B`，而是先看 `Phase 1B` 有没有真的把默认 page owner path 站住。
> 如果 `Phase 1B` 站住了，这场会后我希望直接进入 `Phase 2`，所以这轮还要顺手把黑盒 `TrChat` 默认主路径回切立刻依赖的 contract 定下来。
> 前半段是阶段汇报，后半段是下一阶段开工签字。

### 第 2 段：汇报 `Phase 1B` 结果，10-12 分钟

按这个顺序讲：

1. `Page / history / models / workspace` baseline 做了什么
2. mounted `Root + Page` integration proof 证明了什么
3. page-input boundary 和 default owner path tightening 做到什么程度
4. workspace / renderer / header / history / welcome / messageList 这一圈 relay tightening 如何闭环
5. 当前 tests / histories / completed slices 如何共同证明 `Phase 1B`

这一段一定要持续回答两句话：

- 现在到底证明了什么
- 还没有证明什么

### 第 3 段：单独看 drift，8-10 分钟

把 drift 单独拉出来讲，不要混在实现汇报里。

重点问：

1. `Review B` 认可的 contract 有没有被实现打穿
2. 哪些偏差只是 bounded follow-ups
3. 哪些偏差已经动到了硬门禁：
   `Page composition-only`、default owner path、page-input boundary、history/models/workspace owner

### 第 4 段：讲 `Phase 2` 为什么现在该开始，5-6 分钟

只讲三层逻辑：

1. `Phase 1B` 已经解决默认 page owner path
2. 所以下一轮该解决黑盒 `TrChat` 默认主路径
3. 这一轮要把下一轮立刻会依赖的 contract 冻结下来

不要在这里重讲 `Review A / B` 的主路径设计理由。

### 第 5 段：集中拍板 `Phase 2` contract，10-12 分钟

按下面顺序问：

1. `Phase 1B` 是否退出
2. `Phase 2` 范围是否合理
3. 黑盒 `TrChat` 默认主路径是否应切到 `createRuntimeFromConfig(config) -> Root + Page`
4. 哪些 config projection / compatibility relay 仍允许保留为 bounded compatibility path
5. 哪些问题明确留到 `Review D`

## 5. 这场会的 evidence index

建议会中直接引用下面这些 artifact，不要临场自己拼：

1. `packages/chat/tests/contracts/public-surface.test.mjs`
2. `packages/chat/tests/contracts/workspace-slot-contract.test.mjs`
3. `packages/chat/tests/integration/root-page-mounted.test.mjs`
4. `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-page-history-models-workspace-baseline.md`
5. `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-mounted-root-page-integration.md`
6. `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-welcome-message-list-relay-pruning.md`
7. `packages/chat/docs/histories/2026-04/2026-04-21-phase-1b-welcome-message-list-relay-pruning.md`
8. `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
9. `packages/chat/docs/exec-plans/active/2026-04-21-phase-2-blackbox-trchat-cutover-baseline.md`
10. `packages/chat/docs/histories/2026-04/2026-04-21-phase-2-blackbox-root-page-kickoff.md`

## 6. 当前 drift 摘要

### 当前没有 hard-gate drift

- `TrChat.Page` 仍保持 composition-only
- `Page` 没有重新读回 broad preset buckets
- `history / models / workspace` 没有反向打穿 `Root + Page + primitives`
- 默认 owner path 下的最近一级 primitives 已开始以显式输入为 authoritative source

### 当前存在的 bounded follow-ups

- standalone page-level `footer` replace slot 仍明确延后
- 黑盒 `TrChat` 默认主路径还没有正式回切
- 最终 parity / helper-public-surface 收口仍留给后续阶段

## 7. 你要重点观察的反馈类型

### 可以接受的反馈

- “默认 owner path 成立了，但黑盒 `TrChat` 还要单独验证”
- “`Phase 2` 范围合理，但 `footer` replace slot 继续先别扩”
- “`Page` baseline 成立了，但某条 integration proof 还可以再补强”

这类反馈通常意味着：

- `Phase 1B` 大概率可以 `pass with follow-ups`
- `Phase 2` 大概率也能开工

### 需要特别警惕的反馈

- “我看不出 `TrChat.Page` 已经是真 owner”
- “`Page` 实际上还在读回 broad scaffold / preset buckets”
- “`history / models / workspace` 只是挂在页面上，还没有真实 owner chain”
- “当前证据仍然更像 narrative，而不是足够强的 phase evidence”
- “黑盒 `TrChat` 一旦回切，当前边界会重新散掉”

这类反馈说明：

- 问题不在下一阶段
- 而在当前阶段还没真正收住

## 8. 五个推荐拍板问题

### 问题 1：`Phase 1B` 是否真的证明了默认 page owner path

判断标准：

- `TrChat.Page` 是否已经成为默认 page composition owner
- `ChatDefaultRenderer` 是否已退回 compatibility delegate

### 问题 2：`TrChat.Page` 是否仍然保持 composition-only

判断标准：

- `Page` 是否重新变成总装配大总管
- `Page` 是否重新读回 broad preset / scaffold buckets

### 问题 3：当前证据是否足够

判断标准：

- 有没有 contract tests
- 有没有 mounted integration proof
- 有没有 completed slices / histories / current drift summary

### 问题 4：`Phase 2` 范围是否合理

判断标准：

- 是否聚焦黑盒 `TrChat` 默认主路径回切
- 是否没有把 parity / final public surface 提前拖进来

### 问题 5：`Phase 2` 立刻依赖的 contract 是否已冻结

判断标准：

- 黑盒入口是否明确从 `createRuntimeFromConfig(config)` 起步
- `Root + Page` baseline 是否保持关闭态，不再重开 owner-path contract
- 哪些 deferred items 被明确留到 `Review D`

## 9. 会中记录模板

### 结论

- `Phase 1B`：
- 是否直接进入 `Phase 2`：

### 五个问题的结果

- 默认 page owner path：
- `Page composition-only`：
- 证据充分性：
- `Phase 2` 范围：
- `Phase 2` contract：

### follow-ups

- 实现偏差：
- contract 偏差：
- phase / gate 问题：
- 后续项：

## 10. 会后动作

### 如果结果是 `pass`

1. 更新 tracker 中 `Review C` 状态和结论
2. 进入 `Phase 2` 实现
3. 把会上的修订回写到规范文档和 `Phase 2` active plan

### 如果结果是 `pass with follow-ups`

1. 先判断 follow-ups 是否碰到硬门禁
2. 如果 follow-ups 不碰 `Page composition-only`、default owner path、history/models/workspace owner、证据充分性，就按 `可直接进入 Phase 2` 记录，并把 follow-ups 写入 `REVIEW_C_SPEC_DETAIL.md`、tracker、active plan
3. 如果 follow-ups 实际碰到硬门禁，就不要记成 `pass with follow-ups`，而应回判为 `blocked`

### 如果结果是 `blocked`

1. 明确阻塞点是出在 `Phase 1B` 证据不足，还是 `Phase 2` contract 未冻结
2. 先回改详细说明中的对应部分
3. 再决定是否重新安排 `Review C`
