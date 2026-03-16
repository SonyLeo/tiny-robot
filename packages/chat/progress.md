# Chat Kit Progress

> `packages/chat` 下一阶段能力演进的实时状态页。
> 设计源见 [docs/chat-kit-design.md](../../docs/chat-kit-design.md)。
> 执行决议见 [chat-kit-review-02.md](./chat-kit-review-02.md)。

---

## 当前快照

- 当前阶段：`Phase A - Registry Foundation`
- 当前状态：`待启动`
- 最近更新：`2026-03-17`

---

## 已完成的基础

以下内容视为本轮扩展的既有基线，不再重复作为待办追踪：

- 黑盒 `TrChat` 与白盒组合链路
- `useChatKit`
- 模型切换与 provider 工厂基础链路
- MCP 基础接入
- 历史、反馈、消息动作入口
- retry / optimistic / rollback
- `ChatConfig -> Adapter -> Preset` 第一版链路
- docs variant 基础能力

---

## 当前焦点

### P0: Registry Foundation

- [ ] 明确 registry 目录与基础类型
- [ ] 建立 feature resolver
- [ ] 接入 adapter / preset
- [ ] 选定首个内建 feature 作为贯通样例
- [ ] 保持现有 `TrChatProps` 与黑白盒 API 兼容

---

## 面向 `chat-cli` 的可消费输出

这部分用于说明 `chat-cli` 当前能依赖什么、还不能依赖什么。

| 能力项 | 当前状态 | 对 `chat-cli` 的意义 |
|:--|:--|:--|
| feature registry foundation | `进行前` | template registry 还不能正式映射 chat features |
| attachments / sender actions / suggestions config | `未开始` | 还不能作为正式模板 capability 输入 |
| MCP feature config | `未开始` | `agent-mcp` 还不应建立在手工 wiring 上 |
| layout variant / placement formalization | `未开始` | `docs-chat` 暂不具备稳定 layout 依赖 |
| feature -> template consumption | `未开始` | `chat-cli` 还处在“模板先行”风险区 |

当前结论：

- `chat-cli` 可以稳定消费 `config -> adapter -> preset -> TrChat` 这条基础链路
- `chat-cli` 还不应把高频 feature 组合当成已稳定能力输入

---

## 下一步

### P1: High-value Features

- [ ] Attachments feature
- [ ] Sender Actions feature
- [ ] Suggestions feature
- [ ] 黑盒 / 白盒默认行为对齐

### P2: MCP + Layout

- [ ] MCP feature config
- [ ] layout variant 抽象
- [ ] placement 配置整理

### P3: CLI Consumption

- [ ] feature -> template mapping
- [ ] `chat-cli` 模板消费入口
- [ ] 对应 smoke 验证

---

## 风险与注意项

- 不要让新增能力重新回到 `TrChat` props 膨胀路线
- 不要把 feature resolution 分散回 demo 或页面层
- 不要让 CLI 模板分支先于底层 feature 契约扩张
- 不要在高频聊天能力收敛前优先投入 theme / workspace 壳层

---

## 验收基线

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F @opentiny/tiny-robot-chat build`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/model-switch.spec.ts`
- `pnpm.cmd -F docs build`

---

## 更新规则

这份文档是 `packages/chat` 的唯一实时状态页。

当出现下面这些变化时，应直接更新这里，而不是把状态散落到其他设计文档中：

- 当前阶段变更
- 已完成项变化
- 面向 `chat-cli` 的输出 readiness 变化
- 新增阻塞或风险
- 验收基线调整
