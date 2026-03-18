# Chat Kit Progress

> 最近更新：`2026-03-19`
> 设计文档：[docs/chat-kit-design.md](../../docs/chat-kit-design.md)
> 评审结论：[chat-kit-review-02.md](./chat-kit-review-02.md)

## 当前状态

- 当前主线：`P2 - MCP + Layout`
- 当前判断：`P1 已完成，P2 未开始`
- 当前原则：先继续做 `packages/chat` 自身能力，不提前切到 `chat-cli`

## 阶段进度

| 阶段 | 状态 | 说明 |
|:--|:--|:--|
| P0 / Registry Foundation | `已完成` | `config -> adapter -> preset` 主链路已建立 |
| P1 / High-value Features | `已完成` | `attachments / senderActions / welcomePrompts` 已收口，黑白盒默认行为已对齐 |
| P2 / MCP + Layout | `下一步` | 开始整理 `MCP config` 与 `layout variant / placement` 输入面 |
| P3 / Template / CLI Consumption | `未开始` | 等 P2 稳定后再让 `chat-cli` 正式消费 |
| P4 / Agent Preset + Skill Pack | `后置` | 不在当前主线 |
| P5 / Theme / Workspace Shell | `后置` | 不在当前主线 |

## P1 结果

- [x] `suggestions -> welcomePrompts` 命名已统一，并保留旧配置兼容
- [x] `attachments` 已进入 `features -> resolver -> preset -> TrChat`
- [x] `senderActions` 已进入 `features -> resolver -> preset -> TrChat`
- [x] `welcomePrompts` 已进入 `features -> resolver -> preset -> prompts`
- [x] `createPresetChatSlices()` 已建立，黑盒与白盒共享默认能力底座
- [x] `Sender Suggestion / Mention / Template` 边界已确定：只做 `senderProps.extensions` 透传，不进入 `chat` feature registry
- [x] `#welcome` slot、`prompts override`、`footer-right` slot 与 preset slices 的优先级已验证
- [x] sender preset slices 的默认值与 override 次序已补单测

## 当前稳定边界

- first-party feature 只包括：`attachments`、`senderActions`、`welcomePrompts`
- sender extensions 只作为：`senderProps.extensions`
- white-box 默认输入来自：`createPresetChatSlices()`
- `chat-cli` 当前只应消费稳定能力，不应反向驱动 `chat` 设计

## 下一步

1. 定义 `MCP feature config` 的最小输入面。
2. 明确 `layout variant / placement` 的边界，先收 `bubble / docs`，再看 workspace 类变体。
3. P2 稳定后，再进入 `chat-cli` 的正式 capability consumption。

## 已验证

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/welcome-prompts.spec.ts src/chat/sender-actions.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/sender-extensions.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts`
