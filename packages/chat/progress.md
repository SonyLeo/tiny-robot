# Chat Kit Progress

> 用于追踪 `packages/chat` 下一阶段任务进度。
> 设计背景见 [chat-kit-design.md](/d:/OpenTinyRepository/tiny-robot/docs/chat-kit-design.md)。
> 执行台账见 [chat-kit-review-02.md](/d:/OpenTinyRepository/tiny-robot/packages/chat/chat-kit-review-02.md)。

## 当前状态

- 总体进度：`0%（新一轮扩展阶段）`
- 当前阶段：`待启动`
- 当前目标：`Phase A - Registry Foundation`
- 最近更新：`2026-03-16`

## 阶段追踪

| 阶段 | 状态 | 进度 | 目标 |
|:--|:--|:--|:--|
| Phase A | 待开始 | `0%` | 建立 feature registry 基础设施，并接入 adapter / preset |
| Phase B | 待开始 | `0%` | 落地 attachments / senderActions / suggestions 三类高价值 feature |
| Phase C | 待开始 | `0%` | 完成 MCP config 化与 layout formalization |
| Phase D | 待开始 | `0%` | 让 `chat-cli` 稳定消费 feature registry 与模板变体 |

## 当前待办

### P0：Registry Foundation

- [ ] 定义 `ChatFeatureDefinition`
- [ ] 定义 `ChatFeatureResolveContext`
- [ ] 定义 `ResolvedChatFeature`
- [ ] 新增 feature registry resolver
- [ ] 在 adapter / preset 链路接入 registry
- [ ] 保持现有 `TrChatProps` 与黑白盒 API 兼容

### P1：High-value Features

- [ ] Attachments feature 配置与最小契约
- [ ] Sender Actions feature 配置与默认 actions 编排
- [ ] Suggestions feature 统一配置
- [ ] 黑盒 / 白盒接入一致化

### P2：MCP + Layout

- [ ] MCP feature 配置模型
- [ ] MCP preset 输出稳定化
- [ ] `bubble / docs / workspace` layout config 设计
- [ ] placement 配置抽象

### P3：CLI Consumption

- [ ] 梳理 feature -> template 映射
- [ ] 为 `chat-cli` 设计模板消费入口
- [ ] 增加对应测试与 smoke 验证

## 验收基线

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F @opentiny/tiny-robot-chat build`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/model-switch.spec.ts`
- `pnpm.cmd -F docs build`

## 备注

- 本文档从本轮扩展设计重新开始计数，不再重复记录上一轮已完成的基础收敛项。
- 上一轮基础能力已完成，可视为当前阶段的稳定起点，而不是本轮待办。
