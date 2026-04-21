# Current Shipping Surface Vs Target Refactor Surface

这个文件用于处理 `packages/chat` 当前最容易混淆的一件事：

- 一边是已经对外存在的 shipping surface
- 一边是当前重构推进中的 target refactor surface

这两个世界在 publish stage 前会并存，因此必须明确谁在什么场景下说了算。

## 1. 当前 shipping surface

当前 shipping surface 是：

- blackbox:
  `TrChat`
- whitebox / compound composition:
  `TrChat.Scaffold`
  `TrChat.Provider`
  `TrChat.Layout`
  `TrChat.WorkspaceLayout`
  `TrChat.Header`
  `TrChat.MessageList`
  `TrChat.Sender`
  等

当前用户说明主要看：

- `docs/src/components/chat.md`
- `docs/src/components/chat-features.md`
- `docs/src/components/chat-advanced.md`

如果任务是：

- 修当前用户接入问题
- 修 shipping docs
- 修现有 demo 对外示例
- 判断当前 public surface 行为

优先以 shipping surface 为准。

## 2. Target refactor surface

当前 refactor target surface 是：

- blackbox:
  `TrChat`
- advanced runtime entry:
  `TrChat.Root`
- official preset page layer:
  `TrChat.Page`

当前 target refactor 规范主要看：

- `ARCHITECTURE_REFACTOR_DESIGN.md`
- `ARCHITECTURE_REFACTOR_API_RUNTIME.md`
- `ARCHITECTURE_REFACTOR_EXECUTION.md`
- `ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md`

如果任务是：

- 做 refactor 设计、review、alignment
- 实现 next-surface runtime / root / page / primitives
- 冻结新的 API、slot、owner、phase gate

优先以 target refactor surface 为准。

## 3. 冲突时怎么判断

### 场景 A：修当前对外问题

如果目标是修当前已发布/已展示行为：

- current code 和 tests 优先
- shipping docs 跟着修
- refactor docs 只作为未来方向参考，不反向改写当前用户语义

### 场景 B：推进重构设计和实现

如果目标是推进重构中的 next surface：

- target refactor docs 优先
- shipping surface 主要作为能力边界和测试锚点
- 不让旧导出结构反向限定新 contract

### 场景 C：同时触及两边

如果任务同时改到 shipping docs 和 target refactor docs：

- 明确标注“current shipping surface”与“target refactor surface”
- 不在用户文档里假装 target surface 已经正式发布
- 不在 refactor docs 里让旧 shipping guide 成为决策来源

## 4. 进入 publish stage 前的维护规则

- shipping docs 继续服务当前用户。
- refactor docs 继续服务设计、评审和实现。
- 两边可以互相引用，但不能互相替代。
- 当两边的知识路由发生变化时，同时更新：
  - `packages/chat/AGENTS.md`
  - `packages/chat/docs/README.md`
  - `packages/chat/docs/SOURCE_OF_TRUTH.md`

## 5. 一张快速判断表

| 你现在在做什么 | 先看什么 |
| --- | --- |
| 当前用户怎么接入 `TrChat` | `docs/src/components/chat.md` |
| 当前配置层边界怎么解释 | `docs/src/components/chat-features.md` |
| 当前 whitebox / compound API 怎么解释 | `docs/src/components/chat-advanced.md` |
| 新的 `TrChat / Root / Page` 合同怎么冻结 | `ARCHITECTURE_REFACTOR_API_RUNTIME.md` |
| 新的 phase gate 和测试矩阵怎么判断 | `ARCHITECTURE_REFACTOR_EXECUTION.md` |
| 当前 review 到哪了、结论是什么 | `ARCHITECTURE_REFACTOR_ALIGNMENT_TRACKER.md` |
| 某场评审怎么讲 | `review-packets/*` |
