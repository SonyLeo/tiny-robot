# Slot Catalog

这个表把当前冻结的 page/workspace slot contract 抽出来，方便 Review、实现和测试直接引用。

它是派生索引，不替代规范源文档。

## Sources

- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/src/entry/TrChatPage.vue`
- `packages/chat/src/components/page-regions/ChatPageContent.vue`
- `packages/chat/src/components/workspace/ChatWorkspaceLayout.vue`

## Slot Catalog Freeze Notes

- page 区域使用无前缀直白命名。
- slot props 只暴露最小命名模块，不暴露 whole runtime。
- 超出 slot props contract 的定制，应升级到 `Root + primitives`。
- `footer-extra` 是当前唯一冻结的 footer 级 augment slot。

## TrChat.Page Replace Slots

| Slot | Kind | Purpose | Notes |
| --- | --- | --- | --- |
| `header` | replace | 替换整个默认 header 区域 | 替换后默认 header 不渲染 |
| `welcome` | replace | 替换默认欢迎区域 | 替换后默认 welcome 不渲染 |
| `message-list` | replace | 替换默认消息列表区域 | slot props: `{ messages }` |
| `sender` | replace | 替换默认 sender 区域 | slot props: `{ send, status, lastError, retry }` |
| `empty` | replace | 替换空消息状态区域 | 无消息且无 welcome 时显示 |

## TrChat.Page Augment Slots

| Slot | Kind | Purpose | Notes |
| --- | --- | --- | --- |
| `header-extra` | augment | 在 header 右侧注入额外内容 | 不替换默认 header |
| `footer-extra` | augment | 在 footer 区域注入额外内容 | 轻量 companion region |

## TrChat.Page Bubble Slots（透传到 BubbleList）

| Slot | Kind | Purpose | Notes |
| --- | --- | --- | --- |
| `prefix` | augment | 气泡前置内容 | slot props: `{ messages, role, messageIndexes }` |
| `suffix` | augment | 气泡后置内容 | slot props: `{ messages, role, messageIndexes }` |
| `content-footer` | augment | 气泡内容底部 | slot props: `{ messages, role, messageIndexes }` |
| `after` | augment | 气泡整体后置（feedback 区域） | slot props: `{ messages, role, messageIndexes }` |

## TrChat Workspace Slots（黑盒路径透传）

| Slot | Kind | Purpose | Notes |
| --- | --- | --- | --- |
| `left` | replace | 替换桌面左侧面板 | desktop only |
| `left-rail` | replace | 替换桌面左侧 rail | collapsed 状态下可见 |
| `right` | replace | 替换桌面右侧面板 | desktop only |
| `mobile-left` | replace | 替换移动端左侧 sheet | 未提供时 fallback 到 `left` |
| `mobile-right` | replace | 替换移动端右侧 sheet | 未提供时 fallback 到 `right` |

## Precedence And Escalation Rules

### Precedence

1. replace slot 禁用该区域的默认结构。
2. augment slot 不禁用默认结构。
3. `mobile-left` 未提供时 fallback 到 `left`。
4. `mobile-right` 未提供时 fallback 到 `right`。
5. page slots 属于 `TrChat.Page`；primitives 不镜像这些 page slot 名称。

### Escalation

升级到 `Root + primitives` 的时机：

- 需要跨多个区域重排结构
- 需要消费不在 slot props contract 内的 runtime 模块
- 需要自己决定消息链路、发送链路或 workspace 联动
