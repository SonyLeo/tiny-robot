# Chat Docs

当前 `packages/chat/docs` 保留 4 份文档，其中 3 份是长期主文档。

## 1. 先看这个

- [chat-implementation.md](./chat-implementation.md)
  用最新代码整理出来的实现总览，适合快速建立对包定位、主链、入口、扩展面和测试基线的整体认识。
- [chat-directory-refactor-plan.md](./chat-directory-refactor-plan.md)
  用于指导 `packages/chat` 后续目录重组与模块收口的长期文档，包含目标结构、迁移映射、分阶段步骤与注意事项。
- [chat-directory-refactor-checklist.md](./chat-directory-refactor-checklist.md)
  用于跟踪目录重组执行进度的简单 checklist 文档，适合在各阶段完成后同步更新状态。

## 2. 保留原则

当前保留在 `packages/chat/docs` 的文档应满足至少一个条件：

- 是当前实现的主视图或主索引
- 是会持续用于后续开发与重构的长期指导文档
- 对目录边界、模块职责或工程约束具有持续参考价值

当前不再保留：

- 纯阶段性进度记录
- 已被正式文档替代的草案
- 不再与当前实现对齐的旧设计说明
- 不打算继续执行的远期方案文档

如果后续新增文档，优先判断它是否值得长期保留；如果只是一次性讨论记录，尽量不要重新放回 `packages/chat/docs`。
