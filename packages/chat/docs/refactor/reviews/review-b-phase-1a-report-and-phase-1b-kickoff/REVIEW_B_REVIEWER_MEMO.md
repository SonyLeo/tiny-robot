# Review B Reviewer Memo

## 1. 这次我希望你帮我判断什么

这次我只希望和你一起判断两件事：

1. `Phase 1A` 有没有真的把 foundation 站住
2. 如果 foundation 站住了，是否可以直接进入 `Phase 1B`

这次不是重开 `Review A`。  
我更希望你重点帮我判断：

- 当前实现到底证明了什么
- `Review A` 冻结的关键 contract 有没有在实现里跑偏
- 下一阶段立刻会依赖的 `Page / history / models / workspace / slot` contract 是否已经足够清楚

## 2. 这次默认承接 `Review A` 的哪些前提

这次默认下面这些前提已经在 `Review A` 通过：

- `TrChat / TrChat.Root / TrChat.Page` 的角色已经冻结
- `createRuntimeFromConfig(config) -> { runtime, ui }` 已被冻结为唯一官方桥接路径
- `Root` 只消费 `{ runtime, ui }`
- `ui` 保持 display-only
- `Page` 保持 composition-only
- `messageId` 是稳定动作定位键
- `Phase 1A` bridge subset 已经写清支持范围
- 核心 slot contract 已冻结，但完整 slot 消费面留到后续轮次

这次不会重新论证这些前提“为什么这样设计”；  
这次只检查：它们有没有在 `Phase 1A` 实现里被打穿。

## 3. 这次我会拿什么来证明 `Phase 1A`

我会重点给你看三类证据：

1. 实现结果  
   runtime foundation、`Root` baseline、bridge subset、最小 UI baseline

2. 验证证据  
   targeted contract tests、最小可运行链路、必要的 baseline / demo

3. 偏差说明  
   哪些地方与 `Review A` freeze 完全一致，哪些地方有偏差，这些偏差是否阻塞

一句话说，这次不是按“写了多少代码”判断，而是按“有没有证据证明 foundation 成立”判断。

### 这次已经准备好的 5 组关键证据

为了避免你在会上只听到抽象表述，我会直接把下面这 5 组已经落地的证据讲清楚：

1. `Root + createRuntimeFromConfig` 已经是可运行 on-ramp，而不是只停留在设计文档里。
2. `messageId` 已经在 edit / retry / regenerate / restore 路径里站住，action context 也已经显式带上 `messageId / messageIds`。
3. `conversation.initialMessages` 现在是 eager first-screen baseline：没有 restore 时，会先 materialize active conversation，而不是等第一次 send。
4. 默认 page source 现在已经把 `footer-extra` 锁成唯一 page-level footer slot，并有 contract tests 防止 standalone `footer` replace slot 提前漏进来。
5. `Phase 1A` 默认验证基线已经存在：`type-check`、`test:runtime`、`test:contracts`、`check:docs`，以及收口脚本 `check:phase-1a`。

### 如果你只想快速抽查证据，先看这 6 个 artifact

- `packages/chat/tests/runtime/root-runtime.test.mjs`
  看 `Root + createRuntimeFromConfig` baseline 和 `conversation.initialMessages` eager baseline
- `packages/chat/tests/runtime/message-runtime.test.mjs`
  看 `messageId` lifecycle、edit / retry / regenerate / view-state
- `packages/chat/tests/runtime/message-actions.test.mjs`
  看 built-in actions 和 custom action context 是否已经优先走 `messageId / messageIds`
- `packages/chat/tests/contracts/public-surface.test.mjs`
  看默认 page source 是否只冻结 `footer-extra`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1a-bootstrap-and-root-baseline.md`
  看这轮实际落地、验证命令和回写边界
- `packages/chat/docs/histories/2026-04/2026-04-21-phase-1a-root-bootstrap.md`
  看当前已知 drift、known limits、follow-ups

## 4. 如果 `Phase 1A` 通过，下一步准备做什么

如果这轮通过，我准备直接进入 `Phase 1B`。

`Phase 1B` 的重点不是黑盒主路径，也不是最终 parity，而是：

- `TrChat.Page` baseline
- `history / models / workspace` baseline
- Page shell 对这些 runtime module 的消费边界
- 真正进入 `Phase 1B` 的 slot scope

也就是说：

- `Review A` 冻结了“第一批开工 contract”
- `Review B` 要验证这些 contract 没被打穿，并冻结 `Phase 1B` 立刻会依赖的 contract

## 5. 这次我最想请你帮我判断的 6 个问题

### 1. `Phase 1A` 是否真的证明了 foundation

我希望你重点帮我看：

- 这些实现是否已经足以证明 foundation 成立
- 还是只是把 types / 骨架先搭上了

### 2. `Review A` 的硬门禁有没有被实现打穿

我希望你重点帮我看：

- `Root` 是否仍只吃 `{ runtime, ui }`
- `ui` 是否仍保持 display-only
- `messageId` 是否仍是稳定动作定位键
- bridge subset 是否仍然清楚，没有越界承诺后续域

### 3. 当前 tests / baseline 证据是否够

我希望你重点帮我看：

- 当前证据是否足以支撑 `Phase 1A pass`
- 还是还缺某种关键证明链路

### 4. `Phase 1B` 的范围是否合理

我的建议是：

- 下一阶段聚焦 `Page baseline / history / models / workspace`
- 不把黑盒主路径和更后面的 parity 提前拖进来

### 5. `Phase 1B` 立刻依赖的 API / props contract 是否已经够清楚

我希望你重点帮我看：

- `Page` 的核心 region 组合是否已经能支撑开工
- `history / models / workspace` 的 page consumption 边界是否合理

### 6. `Phase 1B` 立刻依赖的 slot contract 是否已经够清楚

我希望你重点帮我看：

- 这轮是否已经明确哪些 slot scope 进入 `Phase 1B`
- provider / props 边界是否已经够清楚
- 哪些 slot 细节应该继续留到 `Review C`

## 6. 这次不展开什么

为了控制会议范围，这次先不展开：

- 为什么要重构
- `TrChat / Root / Page` 的大方向是否成立
- 黑盒 `TrChat` 最终主路径
- 最终 helper / public surface 收口
- 完整 slot parity
- 最终 MCP parity
- Phase 3/4 所有细节

如果你觉得这些内容有风险，我会先记下来，但不拿它们阻塞这轮 `Phase 1A / Phase 1B` 判断。

## 7. 我希望这次会议最后得到什么

我希望最后能收出 3 个结论：

1. `Phase 1A` 是 `pass / pass with follow-ups / blocked`
2. 是否直接进入 `Phase 1B`
3. 如果还不能进入，最优先要补的阻塞点是什么

## 8. 如果你时间有限，只看这几句就够了

- 这轮不重评大方向，只评 `Phase 1A` foundation 是否真的成立
- 我会重点证明：runtime foundation、`Root + createRuntimeFromConfig`、最小 UI 主链路、`messageId / messageIds`、`conversation.initialMessages` eager baseline、`footer-extra` footer contract，以及对应 contract tests
- 我会单独检查 `Review A` 冻结的硬门禁有没有在实现里被打穿
- 如果这些成立，下一阶段我准备做 `Page baseline / history / models / workspace`
- 这轮我最需要你帮我判断的是：当前证据够不够支撑 `Phase 1A pass`，以及 `Phase 1B` 立刻依赖的 API / props / slot contract 是否已经足够清楚
