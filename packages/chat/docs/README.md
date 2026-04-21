# Chat Docs Map

这个目录用于承接 `packages/chat` 的包内知识层。

它不替代已有的重构长文档，也不替代根目录下的用户文档；它负责把这些知识按用途重新组织成一个更容易路由、更容易维护的入口层。

## 1. 这个目录解决什么问题

- 帮人和 agent 先判断“应该去哪个文件找答案”
- 让当前 shipping surface 与 target refactor surface 并存时仍然可读
- 为实现切片、历史记录和高频 contract artifact 预留固定位置
- 避免把所有长期知识继续堆回 `packages/chat/AGENTS.md`

## 2. 快速阅读路径

### 如果你在做重构设计、评审或对齐

先读：

1. `packages/chat/docs/SOURCE_OF_TRUTH.md`
2. `packages/chat/ARCHITECTURE_REFACTOR_DESIGN.md`
3. `packages/chat/ARCHITECTURE_REFACTOR_API_RUNTIME.md`
4. `packages/chat/ARCHITECTURE_REFACTOR_EXECUTION.md`
5. `packages/chat/ARCHITECTURE_REFACTOR_ALIGNMENT_TRACKER.md`

### 如果你在做当前 phase 的实现

先读：

1. `packages/chat/docs/SOURCE_OF_TRUTH.md`
2. `packages/chat/ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md`
3. `packages/chat/ARCHITECTURE_REFACTOR_ALIGNMENT_TRACKER.md`
4. 当前实现切片对应的 `packages/chat/docs/exec-plans/active/*.md`

### 如果你在更新用户文档或解释当前对外用法

先读：

1. `packages/chat/docs/CURRENT_VS_TARGET_SURFACE.md`
2. `docs/src/components/chat.md`
3. `docs/src/components/chat-features.md`
4. `docs/src/components/chat-advanced.md`

## 3. 文档分类

- `SOURCE_OF_TRUTH.md`
  说明什么知识该写进哪个文件。
- `CURRENT_VS_TARGET_SURFACE.md`
  说明 shipping surface 与 target refactor surface 的边界。
- `exec-plans/`
  当前实现切片和阶段性执行计划。
- `histories/`
  已落地代码任务的结果记录。
- `generated/`
  从长文档抽出的高频 contract artifact 和派生索引。
  当前包括：
  `runtime-owner-table.md`
  `config-bridge-matrix.md`
  `slot-catalog.md`
  `page-region-contract.md`

## 4. 现有主文档入口

- 规范源文档：
  `ARCHITECTURE_REFACTOR_DESIGN.md`
  `ARCHITECTURE_REFACTOR_API_RUNTIME.md`
  `ARCHITECTURE_REFACTOR_EXECUTION.md`
  `ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md`
- 方法文档：
  `ARCHITECTURE_REFACTOR_REVIEW_SCHEME.md`
- 过程文档：
  `ARCHITECTURE_REFACTOR_ALIGNMENT_TRACKER.md`
- 评审材料：
  `review-packets/`
- 用户文档：
  `docs/src/components/chat.md`
  `docs/src/components/chat-features.md`
  `docs/src/components/chat-advanced.md`

## 5. 维护原则

- 规范结论先更新规范源文档，再回写 tracker 和 review packet。
- `review-packets/` 只服务当前评审，不取代长期规范。
- `generated/` 只放高频派生表，不重新定义 contract。
- 当知识路由发生变化时，同步更新这里和 `packages/chat/AGENTS.md`。
