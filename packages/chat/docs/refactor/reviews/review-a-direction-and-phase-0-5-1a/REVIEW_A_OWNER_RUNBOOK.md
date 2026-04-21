# Review A Owner Runbook

## 1. 这份文档怎么用

这份文档只给你这个主持人和 owner 使用，不发给评审人。

它的作用只有三件事：

1. 帮你把 `Review A` 这场会按固定顺序讲顺。
2. 帮你把会议控制在“方向 + 当前阶段开工 contract”这个范围里。
3. 帮你在会后把结论沉淀到 tracker 和规范文档。

这场会不是为了证明实现已经完成，而是为了判断：

- 当前重构主方向是否值得继续推进。
- 当前要冻结的 contract package 是否已经足够支撑开工。
- `Phase 1A` 的 scope / gate / exit criteria 是否足够支撑直接编码。
- 如果会前带了一小批 `Phase 1A preview`，这批 preview 是否足够证明当前 contract 具备最小可实现性。

## 2. 这场会的目标和输出

### 目标

- 让对方理解这次重构不是“改几个 API 名字”，而是在重建 chat 的主路径、升级梯子和 owner 边界。
- 让对方围绕 5 个关键问题给出判断和建议。
- 如果会前准备了 preview，让对方顺带判断这批 preview 能不能升级成正式 `Phase 1A`。

### 会议结束前必须拿到的输出

1. `Review A` 的结论：`pass / pass with follow-ups / blocked`
2. 是否直接进入 `Phase 1A`
3. 如果会前带了 preview，是否允许把 preview 升级成正式 `Phase 1A`
4. 如果不能直接开工，阻塞点是什么
5. 阻塞点应回写到哪一类文档：方向 / contract / 阶段 / 实现约束

## 3. 这场会只讨论什么

### 讨论范围

1. 入口心智是否收敛成：
   `TrChat` + `TrChat.Root`，其中 `TrChat.Page` 是默认页面层，不是第三入口
2. 黑盒到白盒的正式路径是否收敛成：
   `TrChat(config) -> createRuntimeFromConfig(config) -> TrChat.Root({ runtime, ui })`
3. runtime、`ui`、`Page` 的边界是否这样切合理
4. Phase 0.5 要冻结的 contract package 是否已经足够支撑开工
5. `Phase 1A` 的 scope / gate / exit criteria 是否合理
6. 如果会前带了 preview，这批 preview 是否足够证明“当前 contract 能直接支撑开工”

### 补充要求

- 这场会不能只停在抽象方向。
- 必须把这场会后立刻编码会依赖的 API / props / slot contract 定下来。
- 要明确区分：
  `Must Freeze Now`、
  `Freeze Semantics Now`、
  `Defer To Review B`

### 明确不讨论

- 所有 slot 的逐项实现细节
- helper 最终公开面
- compatibility / migration / deprecation
- Phase 2 以后所有 feature parity 细节
- `packages/kit` 的长期下沉策略

如果对方把讨论带到这些地方，直接记为 follow-up，不在本次会议展开。

## 4. 推荐会议时长和节奏

建议总时长：`40-50` 分钟。

### 第 1 段：开场和定范围，3 分钟

你要讲清三句话：

1. 这次不是评完整实现细节，而是评主路径、当前阶段 contract 和开工门禁。
2. 这次不要求证明 `Phase 1A` 已经完成，只要求判断是否足够支撑直接开工。
3. 如果会前带了 preview，它只是 evidence，不是新的规范来源。

建议开场说法：

> 这次我想先跟你对齐两件事：第一，当前 chat 重构的主方向和 contract 切法是否合理；第二，这一轮评完之后，能不能直接进入 `Phase 1A`。  
> 如果我会前带了少量 preview，我也只会把它当成“这套 contract 不是纸上设计”的证据，不会把它当成阶段完成报告。  
> 今天我会把讨论收敛到 5 个拍板问题上，超出范围的点先记下来，不在这场会里展开。

### 第 2 段：讲痛点，5 分钟

只讲 4 个痛点，不扩散：

1. 入口心智分裂
2. 黑盒到白盒没有稳定升级路径
3. `config`、runtime、页面结构、slot 混在一起
4. 很多能力靠历史约定，不靠 contract 和 tests 维持

这段只需要让对方接受一句话：

> 现在的问题已经不是局部实现细节，而是旧结构已经开始影响继续演进。

### 第 3 段：讲新方案主路径，8 分钟

按下面顺序讲：

1. `TrChat / TrChat.Root / TrChat.Page` 的关系
2. `config -> runtime/ui -> Root` 的桥接路径
3. `Root` 只吃 `{ runtime, ui }`
4. `ui` display-only
5. `Page` composition-only

这一段你要反复强调的 5 句话：

1. `TrChat` 继续保留，仍然是默认黑盒入口
2. `TrChat.Root` 是正式白盒入口
3. `TrChat.Page` 是默认页面层，不是第三入口
4. `Root` 只吃 `{ runtime, ui }`
5. `createRuntimeFromConfig(config)` 是黑盒到白盒唯一官方桥接入口

### 第 4 段：讲为什么先做 `Phase 0.5 / Phase 1A`，8 分钟

只讲四层逻辑：

1. 先冻结 contract，避免后面实现一路漂
2. 先把 `conversation / sender / message / attachments` 这层最难返工的底座做起来
3. `Root + createRuntimeFromConfig` 先成立，后面的 `Page` 和黑盒主路径才有可信入口
4. 这场会如果通过，就直接进入 `Phase 1A`，不再额外再开一场“才能开工”的评审

这里要补一句：

- 第一场会必须定下“会后立刻编码会依赖的 API / props / slot contract”
- 但不要把 `Page baseline` 的完整 slot 消费面和最终公开面一次讲完

### 第 5 段：展示 preview evidence，8-10 分钟

这一段只有在你会前确实准备了 preview 的情况下使用。

你要讲清 4 条 preview 边界：

1. 这批 preview 不是第一阶段完成报告，只是 feasibility evidence
2. preview 只覆盖 `Must Freeze Now` 直接依赖的最小实现包
3. preview 明确没有提前做 `Page baseline / history / models / workspace / 黑盒主路径`
4. 如果评审通过，这批 preview 可以直接升级成正式 `Phase 1A`

建议说法：

> 我这次会前没有把第一阶段完整做完，但我带了一小批 preview。  
> 这批 preview 的作用不是证明“Phase 1A 已完成”，而是证明当前这批 contract 不是纸上设计。  
> 我会只用它来补充证明 4 件 `Must Freeze Now` 相关的可实现性证据：Root 最小链路能跑、bridge subset 能落、messageId 和 handoff 能被最小验证、foundation 能被最小 UI 消费。  
> 反过来说，我没有提前做 Page baseline、history/models/workspace、完整 slot 消费面，也没有让 preview 反向定义规范。  
> 所以我希望你把它当成 feasibility evidence，而不是当成既成实现事实。

### 第 6 段：集中拍板 5 个问题，15-18 分钟

按下面顺序问，不要跳：

1. 入口心智是否接受
2. `config -> runtime/ui -> Root` 的切法是否接受
3. runtime / `ui` / `Page` 这样切边界是否接受
4. 这轮要冻结的 contract package 是否已经足够支撑开工
5. `Phase 1A` 的 scope / gate / exit criteria 是否接受

如果带了 preview，每个问题再顺带问一句：

- 这批 preview 有没有暴露出你觉得会阻塞开工的隐藏问题？

### 第 7 段：收尾，5 分钟

必须当场定下：

- 结果是 `pass / pass with follow-ups / blocked`
- 是否直接进入 `Phase 1A`
- 如果带了 preview，是否允许把 preview 升级成正式 `Phase 1A`
- follow-ups 分别属于哪一类问题

## 5. 你要重点观察的反馈类型

### 可以接受的反馈

- “方向可以，但我担心某个边界还不够稳”
- “Phase 0.5 / 1A 合理，但 gate 需要再补一条”
- “入口心智可以接受，但 `Page` 的角色需要再写清”
- “preview 能说明这套路能走，但有 1-2 个 contract 还要补”

这类反馈通常意味着：

- 主方向大体通过
- 需要回写细节
- 结果大概率是 `pass with follow-ups`

### 需要特别警惕的反馈

- “我还是没听懂 `TrChat`、`Root`、`Page` 各自是什么”
- “为什么 `Root` 只吃 `{ runtime, ui }` 我没被说服”
- “为什么 `Phase 0.5 / 1A` 先做这些，而不是直接做 `Page`”
- “这些边界听起来像文档定义，不像能指导实现”
- “你带的 preview 已经偷偷做进了 `Review B` 才该决定的内容”

这类反馈说明：

- 不是细节问题，而是核心方案或 preview 边界还没讲透
- 不要急着推进下一评审
- 应该先回写 `REVIEW_A_SPEC_DETAIL.md` 和相关规范文档

## 6. 五个拍板问题的推荐判断标准

### 问题 1：入口心智是否接受

判断标准：

- 对方能不能复述出：
  `TrChat` 是黑盒入口，
  `TrChat.Root` 是白盒入口，
  `TrChat.Page` 是默认页面层
- 如果对方仍然把 `Page` 当成第三入口，这一项就不算通过

### 问题 2：桥接路径是否接受

判断标准：

- 对方是否接受黑盒到白盒只有一条官方路径
- 对方是否接受 `Root` 不再重新承担隐式装配职责
- 如果对方仍然希望 `Root` 直接吃整包 config，这一项就不算通过

### 问题 3：边界切法是否接受

判断标准：

- 对方是否接受 `ui` 是 display-only
- 对方是否接受 runtime 按 source of truth 切
- 对方是否接受 `Page` 是 composition-only，而不是 whole-runtime relay

### 问题 4：当前 contract package 是否足够支撑开工

判断标准：

- 对方是否接受这轮冻结的最小 contract 集合
- 对方是否认为关键 owner、桥接边界、handoff、message identity 已足够编码
- 如果对方认为还需要再补一轮大范围 contract 讨论，这一项就不算通过

### 问题 5：`Phase 1A` 阶段拆法是否接受

判断标准：

- 对方是否接受“先冻结 contract，再做 foundation”
- 对方是否接受 Phase 1A scope
- 对方是否接受 Phase 1A gate / exit criteria
- 如果带了 preview，对方是否接受“这批 preview 可以顺势升级成正式 `Phase 1A`”

## 7. 容易跑偏的话题和兜回方式

### 跑偏 1：开始讨论所有 slot 细节

兜回说法：

> 这些细节今天只看“是否影响开工门禁”，不展开全部实现。  
> 这次先判断当前冻结的 contract 是否已经足够进入 Phase 1A。  
> 真正进入 `Phase 1B` 的 slot scope，我们放到 `Review B` 再定。

### 跑偏 2：开始讨论最终导出或 publish 策略

兜回说法：

> 这轮先不讨论 publish。  
> 我们现在先判断开发阶段的结构性方案是否合理。  
> 如果这轮都还没能支持开工，现在谈最终公开面会把讨论带偏。

### 跑偏 3：开始问更远期 Phase 2/3/4 细节

兜回说法：

> 后面阶段今天可以作为风险记录，但不拿来阻塞这轮方向判断。  
> 这次只看主方向、contract 切法，以及当前是否已经足够进入 Phase 1A。

### 跑偏 4：preview 被当成既成事实

兜回说法：

> 这批 preview 只是 evidence，不是新的规范源。  
> 如果你觉得 contract 要改，我会先回到评审文档和规范文档，不会让 preview 反向定义方案。

## 8. 会中记录模板

你可以边聊边记下面这些：

### 结论

- `Review A`：
- 是否直接进入 `Phase 1A`：
- preview 是否允许升级成正式 `Phase 1A`：

### 五个问题的结果

- 入口心智：
- 桥接路径：
- 边界切法：
- contract package：
- `Phase 1A` 拆法：

### follow-ups

- 方向问题：
- contract 问题：
- phase / gate 问题：
- 实现约束问题：
- preview 证据问题：

## 9. 会后动作

### 如果结果是 `pass`

1. 更新 tracker 中 `Review A` 状态和结论
2. 如果会前带了 preview，直接把 preview 升级成正式 `Phase 1A`
3. 如果没有带 preview，直接开始 `Phase 1A`
4. 把会上的小修订先回写到详细说明和规范文档

### 如果结果是 `pass with follow-ups`

1. 先回写 `REVIEW_A_SPEC_DETAIL.md`
2. 再把结论同步回写到规范文档
3. 如果 preview 已存在，先修 preview 和 contract 的偏差
4. 等 follow-ups 收口后再进入 `Phase 1A`

### 如果结果是 `blocked`

1. 明确阻塞点属于哪一类问题
2. 先重写详细说明中的对应卡片
3. 需要时再回写规范文档
4. 如果 preview 已越界，先回退到 review docs 再决定是否保留
5. 重新安排 `Review A`
