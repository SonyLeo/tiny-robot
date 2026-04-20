# Chat 重构评审对齐与进度追踪

Status: active alignment tracker.

本文件用于记录 `packages/chat` 重构方案在开发阶段的评审范围、阶段状态、对齐结论、阶段性意见与下一步动作。

它是过程文档，不是新的 contract source of truth。

## 1. 文档角色

本文件只负责 5 件事：

- 记录“当前这一轮评审到底要评什么”
- 记录各阶段当前状态与是否进入下一阶段
- 记录已拍板结论、未决问题、风险与行动项
- 帮助主负责人持续跟踪重构推进节奏
- 为阶段汇报提供统一入口

本文件不负责：

- 重新定义对外 API
- 重新定义 runtime owner
- 重新定义 phase 门禁
- 替代实现蓝图

如果某个 contract 发生变化，必须先更新对应的规范文档，再回写本文件中的状态与结论。

## 2. 与其他文档的分工

当前重构文档建议按下面的分工理解：

- [ARCHITECTURE_REFACTOR_DESIGN.md](./ARCHITECTURE_REFACTOR_DESIGN.md)
  负责整体方向、目标心智、设计原则与非目标
- [ARCHITECTURE_REFACTOR_API_RUNTIME.md](./ARCHITECTURE_REFACTOR_API_RUNTIME.md)
  负责 API、runtime、slot、message model、source of truth 等正式 contract
- [ARCHITECTURE_REFACTOR_EXECUTION.md](./ARCHITECTURE_REFACTOR_EXECUTION.md)
  负责 phase 划分、阶段门禁、测试矩阵、里程碑与退出条件
- [ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md](./ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md)
  负责 Phase 0.5 的实现级 contract 收口、实现约束与第一批落地切片
- 本文件
  负责评审节奏、进度追踪、阶段意见、已决议项与未决问题

建议使用顺序：

1. 先看 `DESIGN`，理解为什么要这样重构
2. 再看 `API_RUNTIME`，理解新 contract 长什么样
3. 再看 `EXECUTION`，理解为什么这么拆阶段
4. 需要开工时看 `BLUEPRINT`
5. 需要跟踪推进、汇报进展、记录评审结论时看本文件

## 3. 推荐的对齐方法

当前更适合采用“总方向评审 + 阶段门禁评审”的推进方式，而不是一次性评完整套长文档。

推荐节奏：

1. 先对齐整体方向与当前阶段
2. 开始实现当前阶段
3. 用测试、示例、阶段汇报证明当前阶段 contract 已成立
4. 在当前阶段收口后，再对齐下一阶段的目标与范围

这套方法的核心原因是：

- 长方案里最容易失控的是把“方向、contract、阶段、实现细节”混在同一场会里讨论
- 当前文档体系已经可以支撑按阶段拍板，不需要一次性冻结所有未来细节
- 每个阶段都可以用 tests、baseline、示例来证明，而不是只靠文档口头解释

## 4. 当前总方向结论

截至当前文档状态，整体方向已经收敛到以下结论：

- 正式对外心智收敛到 `TrChat` 与 `TrChat.Root` 两层入口
- `TrChat.Page` 是官方默认页面组件与 preset page layer，但不是第三层独立入口
- 唯一升级梯子是：
  `TrChat -> TrChat.Root + TrChat.Page -> TrChat.Root + primitives`
- 黑盒只保留一个主配置对象 `TrChatConfig`，并按功能域组织
- `TrChat.Root` 只消费 `{ runtime, ui }`
- `createRuntimeFromConfig(config)` 是唯一官方桥接入口，但每个阶段只承诺当期 bridge subset
- `ui` 严格保持 display-only
- runtime 按 source of truth 切分，不按页面上有没有按钮切分
- `messageId` 是 next-surface 中唯一稳定的消息动作定位键
- `Page` 是 composition-only，不允许退化成 whole-runtime relay

这些结论的规范来源主要见：

- [ARCHITECTURE_REFACTOR_DESIGN.md](./ARCHITECTURE_REFACTOR_DESIGN.md)
- [ARCHITECTURE_REFACTOR_API_RUNTIME.md](./ARCHITECTURE_REFACTOR_API_RUNTIME.md)
- [ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md](./ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md)

## 5. 当前阶段总览

| 对齐对象 | 当前状态 | 当前判断 | 主要依据 | 下一步 |
| --- | --- | --- | --- | --- |
| 整体方向 | `ready-for-review` | 已可进入正式评审 | `DESIGN` + `API_RUNTIME` | 做第一次方向评审 |
| Phase 0 / 0.5 contract freeze | `ready-for-review` | 文档已基本收口，可做 contract sign-off | `API_RUNTIME` + `BLUEPRINT` + `EXECUTION` | 做 contract freeze 评审 |
| Phase 1A | `pending` | 范围与门禁已清楚，但尚未进入实现证明 | `EXECUTION` + `BLUEPRINT` | 等 Phase 0.5 拍板后开工 |
| Phase 1B | `pending` | 已定义目标，但依赖 Phase 1A 收口 | `EXECUTION` | 等 Phase 1A 完成后对齐 |
| Phase 2 | `pending` | 已定义黑盒主路径目标，但不应提前展开实现细节 | `EXECUTION` | 等 Page baseline 成立后再对齐 |
| Phase 3A | `pending` | message/sender parity 需建立在 runtime foundation 之上 | `EXECUTION` | 等 Phase 2 后推进 |
| Phase 3B | `pending` | workspace/MCP parity 需建立在 page baseline 之上 | `EXECUTION` | 等 Phase 3A 后推进 |
| Phase 4 | `pending` | 稳定化、评审材料与 helper 收口属于后置阶段 | `EXECUTION` | feature parity 后推进 |

## 6. 推荐的评审序列

### 6.1 评审 A：整体方向 + 当前阶段入口

本次只评：

- 为什么要重构
- `TrChat / TrChat.Root / TrChat.Page` 的用户心智是否合理
- `TrChatConfig` 按功能域组织是否合理
- `createRuntimeFromConfig(config)` 作为官方桥接入口是否合理
- 为什么先做当前阶段，而不是直接铺开所有 feature parity

本次不评：

- 所有 slot 的逐项实现细节
- helper 最终公开面
- publish/deprecation
- 后续长期下沉到 `packages/kit` 的问题

建议输入材料：

- [ARCHITECTURE_REFACTOR_DESIGN.md](./ARCHITECTURE_REFACTOR_DESIGN.md)
- [ARCHITECTURE_REFACTOR_API_RUNTIME.md](./ARCHITECTURE_REFACTOR_API_RUNTIME.md)
- [ARCHITECTURE_REFACTOR_EXECUTION.md](./ARCHITECTURE_REFACTOR_EXECUTION.md)

预期输出：

- 是否认可整体方向
- 是否认可入口心智
- 是否认可当前阶段的拆法
- 是否允许进入 Phase 0.5 / Phase 1A contract freeze

### 6.2 评审 B：Phase 0.5 contract freeze

本次只评：

- runtime owner 是否清楚
- `messageId` 语义是否清楚
- `sender / attachments` handoff 是否清楚
- `Page` / primitives / slot props 边界是否清楚
- `createRuntimeFromConfig(config)` 的 bridge subset 是否清楚

建议输入材料：

- [ARCHITECTURE_REFACTOR_API_RUNTIME.md](./ARCHITECTURE_REFACTOR_API_RUNTIME.md)
- [ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md](./ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md)
- [ARCHITECTURE_REFACTOR_EXECUTION.md](./ARCHITECTURE_REFACTOR_EXECUTION.md)

预期输出：

- Contract freeze 是否通过
- 是否仍存在需要先拍板的问题
- 是否允许进入 Phase 1A 实现

### 6.3 评审 C：Phase 1A 汇报 + Phase 1B 对齐

本次只评：

- Phase 1A 已实现哪些 contract
- Phase 1A tests / baseline 是否证明 contract 成立
- 实现与文档是否有偏差
- Phase 1B 的 `history / models / workspace / Page shell` 范围是否合理

预期输出：

- Phase 1A 是否退出
- 是否进入 Phase 1B
- 是否需要调整后续阶段目标

### 6.4 评审 D：Phase 1B 汇报 + Phase 2 对齐

本次只评：

- `Root + Page` baseline 是否成立
- `Page` 是否仍保持 composition-only
- 黑盒 `TrChat` 如何回到新主路径
- Phase 2 的黑盒主路径 contract 是否清楚

### 6.5 评审 E：Phase 2 汇报 + Phase 3 对齐

本次只评：

- 黑盒主路径是否已经可教、可测、可演示
- `TrChat`、`Root + Page`、`Root + primitives` 三条路径是否闭环
- Phase 3A / 3B 的 parity 范围是否拆分合理

### 6.6 评审 F：Phase 3/4 收口评审

本次只评：

- feature parity 是否成立
- docs / demos / tests 是否一致
- helper / public surface 是否需要最终收口
- 是否满足稳定化与长期维护要求

## 7. 第一场评审建议只拍板的事情

为了避免第一场会过长，建议只拍板下面 6 件事：

1. 是否认同这轮重构的目标与非目标
2. 是否认同 `TrChat / TrChat.Root / TrChat.Page` 的关系
3. 是否认同 `TrChatConfig` 按功能域组织
4. 是否认同 `ui` display-only 与 runtime 按 source of truth 切分
5. 是否认同 `createRuntimeFromConfig(config)` 作为唯一官方桥接入口
6. 是否认同先做 Phase 0.5 / 1A，再推进 `Page` 和黑盒主路径

第一场不建议拍板：

- helper 最终公开面
- publish 策略
- 所有 slot 的逐项微观实现
- 所有 Phase 3/4 的细节

## 8. 当前重点关注的问题

下面这些问题当前值得持续跟踪，但不构成“整体方向不能评审”的阻塞：

### 8.1 `Footer` 的阶段落位

当前文档已统一为：

- `Footer` 是默认页面中的轻量 companion region
- Phase 0.5 只冻结 `footer-extra` augment slot
- 不提前冻结 `footer` replace slot

仍需在后续阶段决定：

- `Footer` 是否在 Phase 1B 就进入完整 page baseline
- 还是先保持轻量存在，待 page baseline 稳定后再扩充

### 8.2 contract source artifacts 与 contract tests 仍待落地

当前文档已经把 contract 写清，但真正开始实现前，仍建议把下面这些 artifact 做出来：

- slot catalog source
- page slot props source
- config bridge matrix source
- public surface intent source

同时补齐对应 contract tests。

### 8.3 阶段汇报必须使用“证据驱动”

后续每一阶段的“完成”都不应该只靠口头说明，而应至少附上：

- 通过的 targeted tests
- 最小 baseline 示例
- 与文档一致的 contract 证据
- 若有偏差，明确列出偏差与回写计划

## 9. 阶段记录模板

后续每次评审和阶段汇报都建议按下面模板记录。

### 9.1 记录模板

```md
## Review X / Phase Y

- 日期：
- 参与人：
- 本次范围：
- 本次不讨论：

### 输入材料

- ...

### 已对齐结论

- ...

### 未决问题

- ...

### 风险

- ...

### 行动项

- ...

### 证据

- tests:
- demo/example:
- docs:

### 阶段结论

- `pass`
- `pass with follow-ups`
- `blocked`
```

### 9.2 当前预置记录位

#### Review A：整体方向 + 当前阶段入口

- 状态：`pending`
- 结论：待补充

#### Review B：Phase 0.5 contract freeze

- 状态：`pending`
- 结论：待补充

#### Review C：Phase 1A 汇报 + Phase 1B 对齐

- 状态：`pending`
- 结论：待补充

#### Review D：Phase 1B 汇报 + Phase 2 对齐

- 状态：`pending`
- 结论：待补充

#### Review E：Phase 2 汇报 + Phase 3 对齐

- 状态：`pending`
- 结论：待补充

#### Review F：Phase 3/4 收口评审

- 状态：`pending`
- 结论：待补充

## 10. 阶段性进度追踪清单

### 10.1 整体方向

- [ ] 整体方向评审完成
- [ ] 入口心智评审完成
- [ ] 当前阶段拆分评审完成

### 10.2 Phase 0 / 0.5

- [ ] runtime owner tables 已冻结
- [ ] slot catalog 已冻结
- [ ] `Page` slot-provider contract 已冻结
- [ ] bridge subset 已冻结
- [ ] `messageId` 规则已冻结
- [ ] 高风险 alias / type 锚点已冻结

### 10.3 Phase 1A

- [ ] `conversation / sender / message / attachments` baseline 已实现
- [ ] `Root + createRuntimeFromConfig` baseline 已实现
- [ ] Phase 1A tests 全绿
- [ ] Phase 1A 汇报完成

### 10.4 Phase 1B

- [ ] `history / models / workspace` baseline 已实现
- [ ] `Page` baseline 已实现
- [ ] Phase 1B tests 全绿
- [ ] Phase 1B 汇报完成

### 10.5 Phase 2

- [ ] 黑盒 `TrChat` 主路径已切到新方案
- [ ] blackbox config contract tests 全绿
- [ ] `TrChat / Root + Page / Root + primitives` 对照验证完成

### 10.6 Phase 3 / 4

- [ ] message/sender parity 完成
- [ ] workspace/MCP parity 完成
- [ ] docs/demo/tests 一致性校验完成
- [ ] helper/public surface 收口完成

## 11. 维护规则

- 本文件只记录状态、结论、风险和行动项，不反向定义 contract
- 如 contract 变更，先更新 source docs，再更新本文件
- 每次评审后必须至少更新：
  - 当前状态
  - 已对齐结论
  - 未决问题
  - 下一步动作
- 每次阶段汇报后必须至少更新：
  - 当前阶段结果
  - 证据链接
  - 是否进入下一阶段

## 12. 当前建议

当前最合理的推进方式是：

1. 先用本文件组织“整体方向 + Phase 0.5 / 1A”评审
2. 评审通过后，把 Phase 0.5 contract freeze 当作开工门禁
3. Phase 1A 完成后，用 tests 和 baseline 做第一轮阶段汇报
4. 再进入 Phase 1B 与后续阶段的分段对齐

一句话总结：

规范文档负责说明“方案是什么”，本文件负责说明“现在评到哪了、已经拍板了什么、下一步做什么”。
