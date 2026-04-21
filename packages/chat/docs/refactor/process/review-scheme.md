# Chat 重构评审方案

Status: active review scheme.

本文件用于固定 `packages/chat` 重构在开发阶段的评审方法，避免后续因为上下文切换、参与人变化或阶段推进而让评审方向跑偏。

它回答的是“怎么评审这套方案”，而不是“方案 contract 是什么”。

## 1. 文档角色

本文件负责：

- 固定整套重构的沟通主线
- 固定评审时使用的分层框架
- 固定关键评审节奏
- 固定每次评审的输入、输出与模板
- 固定规范文档、过程文档、评审材料之间的分工

本文件不负责：

- 定义 API/runtime/slot contract
- 定义 phase 门禁细节
- 记录阶段状态
- 记录阶段性结论与行动项

对应分工：

- 规范文档：`design/overview.md`、`design/api-runtime.md`、`design/execution.md`
- 方法文档：本文件
- 过程文档：[alignment-tracker.md](./alignment-tracker.md)

## 2. 评审总原则

这套重构的评审不应采用“一次评完整套长文档”的方式，而应采用：

- 一条固定主线
- 四层对齐框架
- 四次关键评审
- 固定会议模板
- 证据驱动的阶段汇报

原因很简单：

- 这套方案同时包含方向、contract、阶段、实现约束四类信息
- 如果把这四类问题放进同一场会议里，结论很容易发散
- 当前文档体系已经足够支撑按阶段拍板，不需要一次性评完全部未来细节

## 3. 固定主线

之后所有评审和汇报，都建议先统一到下面这条主线：

1. 我们不是在改几个 API 名字，而是在把 `packages/chat` 从“多层隐式装配”重建成“黑盒简单、白盒边界清楚、可分层测试”的 chat UI 系统
2. 正式对外心智收敛到两层入口：`TrChat` 和 `TrChat.Root`
3. `TrChat.Page` 是官方默认页面组件，但不是第三层独立入口，而是 `Root` 之上的官方 page layer
4. 唯一升级梯子是：
   `TrChat -> TrChat.Root + TrChat.Page -> TrChat.Root + primitives`
5. 黑盒只保留一个主配置对象 `TrChatConfig`；`Root` 只消费 `{ runtime, ui }`

这 5 句话建议作为每次沟通的固定开场。

## 4. 四层对齐框架

整套方案建议始终按下面 4 层讲，不要混讲：

### 4.1 方向层

回答：

- 为什么要重构
- 用户心智是什么
- 非目标是什么

主要看：

- [overview.md](../design/overview.md)

### 4.2 contract 层

回答：

- API 怎么设计
- runtime owner 怎么切
- slot、message model、source of truth 怎么定义

主要看：

- [api-runtime.md](../design/api-runtime.md)

### 4.3 阶段层

回答：

- 为什么这么拆 phase
- 每阶段交付什么
- 每阶段测试什么
- 每阶段退出条件是什么

主要看：

- [execution.md](../design/execution.md)

### 4.4 实现约束层

回答：

- Phase 0.5 先冻结什么
- Page/slot/runtime 的实现门禁是什么
- 第一批实现切片怎么落

主要看：

- [phase-0_5-freeze-record.md](../archive/phase-0_5-freeze-record.md)

## 5. 四次关键评审

这套方案建议固定为 4 次关键评审。

### 5.1 Review A：整体方向 + Phase 0.5 contract sign-off

这是一场“评完即可决定能否开工”的评审。

本次只评：

- 重构目标与非目标
- `TrChat / Root / Page` 的关系
- `config -> runtime/ui -> Root` 的桥接路径
- runtime、`ui`、`Page` 的边界
- Phase 0.5 要冻结的 contract package 是否足够支撑编码
- Phase 1A 的 scope / gate / exit criteria 是否合理

本轮必须明确冻结 3 层内容：

#### A. Must Freeze Now

这些内容是 `Review A` 通过后立刻编码一定会依赖的 contract，本轮必须定下来：

- 入口 API：
  `TrChat / TrChat.Root / TrChat.Page`
- 桥接 API：
  `createRuntimeFromConfig(config) -> { runtime, ui }`
- `Root` props：
  只允许消费 `{ runtime, ui }`
- `Phase 1A` 会直接编码到的 runtime / primitive contract：
  `ChatUIMessage`、`messageId`、`createConversationRuntime`、`createSenderRuntime`、`createMessageRuntime`、`createAttachmentsRuntime`、`TrChat.Message`、`TrChat.MessageList`、`TrChat.Sender`
- 核心 slot API / contract：
  slot 是否存在、`replace / augment` 两类是否成立、slot 不得拿 whole runtime、slot props 只暴露最小必要模块、核心一级 slot catalog 是否成立
  这里的最小 slot catalog 以 `api-runtime.md` 为准，包含当前已冻结的 replace slots 与 augment slots

#### B. Freeze Semantics Now

这些内容本轮先冻结语义和边界，完整消费面放到下一轮：

- `Page` slot-provider 机制
- slot props 最小暴露原则
- degrade rules 的基本原则
- `Page` composition-only 的落地约束
- 核心 slot 一级名称和区域归属
- `footer-extra` augment slot 与 footer companion region 的读取边界

#### C. Defer To Review B

这些内容不应阻塞 `Review A` 开工签字，放到 `Review B` 结合 `Phase 1B` 一起讨论：

- `Page baseline` 的完整 slot 消费面
- `history / models / workspace` 完整 props 矩阵
- 独立 `footer` replace slot 与 `Footer` 的最终落位细节
- 所有 augment hook 的最终细粒度命名
- 最终公开面与发布语义

输出：

- 是否认可总方向
- 是否认可入口心智与桥接路径
- 是否完成 Phase 0.5 contract sign-off
- 是否允许直接进入 Phase 1A 实现

补充规则：

- 如果评审对象时间有限，`Review A` 可以额外携带一小批 `Phase 1A preview` 证据或最小演示
- 这批 preview 只能用于证明 `Must Freeze Now` contract 具备最小可实现性
- preview 不能越过 `Must Freeze Now`，提前做进 `Page baseline / history / models / workspace / 黑盒主路径 / 最终 public surface`
- preview 是 evidence，不是新的 contract source of truth

### 5.2 Review B：Phase 1A 汇报 + Phase 1B 开工评审

本次只评：

- Phase 1A 实际实现与测试
- `Root + createRuntimeFromConfig` 是否成立
- 与文档 contract 的偏差
- `history / models / workspace / Page shell` 是否作为下一阶段目标合理
- Phase 1B 的 scope / gate 是否足够支撑开工

输出：

- Phase 1A 是否退出
- 是否允许进入 Phase 1B 实现

### 5.3 Review C：Phase 1B 汇报 + Phase 2 开工评审

本次只评：

- `Page` baseline 是否成立
- `TrChat.Page` 是否仍保持 composition-only
- `history / models / workspace` baseline 是否成立
- 黑盒 `TrChat` 回到新主路径时的 Phase 2 contract 是否清楚

输出：

- Phase 1B 是否退出
- 是否允许进入 Phase 2 实现

### 5.4 Review D：Phase 2 汇报 + Phase 3/4 最终收口评审

本次只评：

- 黑盒 `TrChat` 新主路径是否成立
- `TrChat / Root + Page / Root + primitives` 三条路径是否对齐
- Phase 3/4 的 parity / hardening 结果是否足够进入最终收口
- docs / demos / tests / helper-public-surface 的最终收口是否清楚

输出：

- Phase 2 是否退出
- 是否完成 Phase 3/4 最终收口判断
- 是否满足整体方案闭环

## 6. 每次会议固定模板

每次评审建议固定使用下面模板：

1. 本次只评什么
2. 本次不评什么
3. 要拍板的 3-5 个问题
4. 当前文档结论
5. 实现/测试证据
6. 未决问题
7. 下一阶段入口条件

这套模板应同时用于：

- 方案评审
- 阶段汇报
- 下一阶段预对齐

## 7. 第一场评审建议

第一场评审不要深入所有后续细节，只建议拍板下面 8 件事：

1. 为什么要重构
2. `TrChat / Root / Page` 的关系是什么
3. `config -> runtime/ui -> Root` 的桥接路径是否成立
4. runtime、`ui`、`Page` 的边界是否成立
5. 第一场会后立刻编码会依赖的 API 是否已经冻结
6. 第一场会后立刻编码会依赖的 props contract 是否已经冻结
7. 第一场会后立刻编码会依赖的 slot contract 是否已经冻结
8. Phase 1A 的 scope / gate / exit criteria 是否合理

第一场不建议深讲：

- helper 最终公开面
- 兼容/迁移
- Phase 3/4 的细节
- 所有 slot 的完整消费面与最终细粒度命名

## 8. 评审材料建议

对当前这种“两人评审、owner 主持”的场景，更推荐使用三文档结构：

### 8.1 owner runbook

这是主持人和 owner 自己使用的流程把控文档，不发给评审人。

它应负责：

- 会议目标与时间控制
- 讲解顺序
- 必须拍板的问题
- 容易跑偏的话题
- 争议出现时回查哪份详细说明
- 会后要回写哪些规范文档与 tracker

### 8.2 spec detail

这是方案底稿，给 owner 和后续实现使用，不要求评审人会前读完。

它应按“问题卡片”写清：

- 之前是怎么样的
- 为什么有问题
- 准备怎么改
- 改完会变成什么
- 为什么这样改
- 当前阶段做到哪、不做到哪
- 还有哪些风险与未决点

### 8.3 reviewer memo

这是唯一默认发给评审人的材料，最好控制在 2-4 页。

它应直接回答：

- 这次为什么要改
- 这次准备怎么改
- 为什么先做当前阶段
- 这次只需要评哪几个问题
- 每个问题建议怎么拍
- 如果通过，下一步做什么

## 9. 三文档协作建议

推荐做法：

- 规范内容继续留在 `design/overview.md`、`design/api-runtime.md`、`design/execution.md`
- `OWNER_RUNBOOK` 负责流程把控，不对外发
- `SPEC_DETAIL` 负责完整说明，是方案底稿
- `REVIEWER_MEMO` 负责给评审人快速形成判断
- `ALIGNMENT_TRACKER` 负责状态、follow-ups、结论与行动项

这三份文档最好围绕同一组评审问题组织，只是粒度不同。

对于 `Review A`，建议显式使用下面 3 桶冻结清单：

- `Must Freeze Now`
- `Freeze Semantics Now`
- `Defer To Review B`

这样可以避免把“当前必须定的 API/props/slot contract”与“下一轮再展开的实现细节”混在一起。

不推荐继续把评审材料写成多份对外过程稿，或者要求评审人会前翻多份长文档。

## 10. 使用建议

后续如果 agent 被要求参与 chat 重构评审，应遵循下面顺序：

1. 先读本文件，明确评审方法
2. 再读 [alignment-tracker.md](./alignment-tracker.md)，明确当前阶段状态
3. 再读当前轮次的 `REVIEWER_MEMO`，明确本次会议的单入口材料
4. 最后按需要进入 `design/overview.md`、`design/api-runtime.md`、`design/execution.md`

这样可以确保：

- 先明确“这次要怎么评”
- 再明确“目前评到哪”
- 再明确“这次具体拿什么材料开会”
- 最后再看“具体方案是什么”

一句话总结：

本文件固定评审方法，`ALIGNMENT_TRACKER` 负责记录状态，规范文档负责定义方案本身。
