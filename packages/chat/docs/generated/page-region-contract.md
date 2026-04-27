# Page Region Contract

这个文档把 `TrChat.Page` 的组合边界、region 组成、读取边界和降级规则抽出来，方便实现和评审直接对照。

它是派生索引，不替代规范源文档。

## Sources

- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/src/entry/TrChatPage.vue`
- `packages/chat/src/components/page-regions/ChatPageContent.vue`
- `packages/chat/src/components/page-regions/ChatDefaultHeaderRegion.vue`
- `packages/chat/src/components/page-regions/ChatDefaultBodyRegion.vue`
- `packages/chat/src/components/page-regions/ChatDefaultFooterRegion.vue`

## Composition-only Rules

`TrChat.Page` 是纯组合层：

- 负责官方默认页面结构和 slot contract
- 通过 `pageInputs` 消费窄化的页面输入边界（`welcome / messageList / appearance / shell / modelSelector / updateModel`）
- 将这些默认值传入最近的 primitive，而不是直接读取 whole runtime
- 不透传 whole runtime 作为 slot prop
- 不重新解析 raw config
- 将更深层的定制委托给 `Root + primitives`

## Region Composition

| Region component | 实际文件 | Default responsibility | Slots owned |
| --- | --- | --- | --- |
| `ChatDefaultHeaderRegion` | `components/page-regions/ChatDefaultHeaderRegion.vue` | header 级别的 affordances，history/model 入口，品牌 header 结构 | `header`, `header-extra` |
| `ChatDefaultBodyRegion` | `components/page-regions/ChatDefaultBodyRegion.vue` | welcome + message list 组合 | `welcome`, `message-list`, `after` (bubble slot) |
| `ChatDefaultFooterRegion` | `components/page-regions/ChatDefaultFooterRegion.vue` | sender 区域 + 轻量 footer companion region | `sender`, `footer-extra` |
| `ChatWorkspaceLayout` | `components/workspace/ChatWorkspaceLayout.vue` | workspace shell 组合和响应式侧边区域 | `left`, `left-rail`, `right`, `mobile-left`, `mobile-right` |
| `ChatPageContent` | `components/page-regions/ChatPageContent.vue` | 三个 region 的公共模板，被 TrChatPage 复用 | 所有 page slots |

## Region Read-boundary

| Region component | Allowed runtime reads |
| --- | --- |
| `ChatDefaultHeaderRegion` | `conversation + history + models + workspace + ui` |
| `ChatDefaultBodyRegion` | `conversation + message + ui` |
| `ChatDefaultFooterRegion` | `sender + attachments + mcp + ui` |
| `ChatWorkspaceLayout` | `workspace + history + models + mcp + ui` |

## TrChatPage Props

| Prop | Type | Purpose |
| --- | --- | --- |
| `messageListVariant` | `'bubble' \| 'workspace' \| 'docs'` | 覆盖默认消息列表变体 |

## TrChatPage Emits

| Emit | Payload | Purpose |
| --- | --- | --- |
| `update:show` | `boolean` | Header 关闭按钮触发 |
| `update:model` | `string` | 模型切换触发 |

## Footer Semantics

- `Footer` 当前冻结为轻量 companion region。
- `footer-extra` 是唯一冻结的 footer 级 augment slot。
- standalone `footer` replace slot 暂缓，等 page baseline 稳定后再冻结。

## Degrade Rules

| Missing module | Expected degrade behavior |
| --- | --- |
| `workspace` | 只渲染 stacked 主视图；不渲染 `left / left-rail / right / mobile-left / mobile-right` |
| `history` | 隐藏 history affordance |
| `models` | 隐藏 model selector |
| `mcp` | 隐藏 MCP affordance |
| `attachments` | sender 仍支持纯文本发送；相关 slot props 省略 `attachments` |

## Workspace Placement Rules

- `mobile-left` fallback 到 `left`（未单独提供时）
- `mobile-right` fallback 到 `right`（未单独提供时）
- `history runtime` 拥有会话列表数据；`workspace runtime` 拥有面板可见性

## Escalation Rule

如果定制需要：

- slot props contract 之外的 runtime 模块
- 跨区域重排结构
- 直接控制消息、发送或 workspace 编排

则应从 `TrChat.Page` slots 升级到 `TrChat.Root + primitives`。
