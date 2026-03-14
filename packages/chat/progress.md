# Chat Kit Progress

> 用于跟踪 `packages/chat` 会话套件重构与 chat-cli 对接进度  
> 基线文档：`packages/chat/chat-kit-review.md`

## 当前状态

- 阶段：Planning
- 当前目标：完成 Phase 1 基座修复设计，等待确认后开始实现
- 最近更新：2026-03-14

## 里程碑

| 里程碑 | 状态 | 说明 |
|:-------|:-----|:-----|
| M1 文档收敛 | 已完成 | review 文档已整理为项目推进结构 |
| M2 Phase 1 实现 | 未开始 | Layout、MCP 单实例、模型 owner、导出面修复 |
| M3 Phase 1 验收 | 未开始 | demo 黑盒 / 白盒统一验证 |
| M4 Phase 2 契约设计 | 未开始 | BFF / adapter / manifest 方案落地 |
| M5 Phase 2 增强 | 未开始 | 状态分片、乐观更新、重试等优化 |

## Phase 1 Checklist

| 编号 | 事项 | 状态 | 备注 |
|:-----|:-----|:-----|:-----|
| F1 | 新增 `TrChat.Layout` | Todo | `Root + Layout` 双层模型 |
| F2 | Root 参数校验 | Todo | 防止 `responseProvider` 缺失 |
| F3 | MCP 单实例 | Todo | 面板与 toolPlugin 使用同一实例 |
| F4 | 模型切换 owner 唯一化 | Todo | 避免双重 `updateResponseProvider` |
| F5 | Feedback 样式 scoped | Todo | 去掉全局泄漏 |
| F6 | Slot 过滤逻辑提取 | Todo | `useSlotFilter` |
| F7 | Sender 动态 slot 透传 | Todo | 降低维护成本 |
| F8 | `useChatFeedback` 参数化 | Todo | 去 inject 强耦合 |
| F9 | 删除冗余类型 | Todo | 精简 types |
| F10 | Injection Key 内部化 | Todo | 需注意发布策略 |
| F11 | providers 安全标注 | Todo | 明确 demo-only 边界 |
| F12 | Demo 对齐验证 | Todo | 黑盒 / 白盒统一 |

## Phase 2 Checklist

| 编号 | 事项 | 状态 | 备注 |
|:-----|:-----|:-----|:-----|
| S1 | `useModelSelector` composable | Todo | UI 与逻辑继续拆分 |
| S2 | icons 迁移 | Todo | 收敛职责 |
| S3 | `useMcpManager` 去 mock 化 | Todo | 最小 callback 契约 |
| S4 | provider 回归测试 | Todo | 覆盖更新后发送路径 |
| S5 | Less -> CSS | Todo | 与主包风格统一 |
| S6 | i18n 机制 | Todo | 文案外置 |
| S7 | Provider 安全分层 | Todo | BFF / ServerProxyProvider |
| S8 | manifest/config 契约 | Todo | chat-cli 稳定入口 |
| B1 | 状态分片 | Backlog | `useChatMessages` 等 |
| B2 | 乐观更新 + 回滚 | Backlog | 体验增强 |
| B3 | 统一消息操作入口 | Backlog | 扩展能力 |
| B4 | 结构化错误 + 重试 | Backlog | 生产可用性 |
| B5 | `docs` variant | Backlog | 远期场景扩展 |

## 风险记录

| 日期 | 风险 | 状态 | 说明 |
|:-----|:-----|:-----|:-----|
| 2026-03-14 | Injection Key 内部化属于破坏性变更 | Open | 需 deprecate 后再 major 发布 |
| 2026-03-14 | 前端直连 provider 有 Key 暴露风险 | Open | chat-cli 默认应走 BFF |
| 2026-03-14 | MCP 真实桥接接口未定 | Open | 先修单实例，再定义 callback 契约 |

## 下一步

等待确认后，按以下顺序开始实现：

1. F1 `TrChat.Layout`
2. F3 MCP 单实例
3. F4 模型切换 owner 唯一化
4. 同步更新 demo 与导出面
