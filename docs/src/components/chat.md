---
outline: [2, 3]
---

# Chat 快速开始

`@opentiny/tiny-robot-chat` 提供三种官方接入方式：

1. `TrChat`
2. `TrChat.Root + TrChat.Page`
3. `TrChat.Root + primitives`

如果只需要快速启动一个聊天页，优先从 `TrChat` 开始。

## 什么时候看这一页

适合：

- 第一次接入 `@opentiny/tiny-robot-chat`
- 快速搭建一个完整聊天页
- 想先知道应该选哪条接入路径

如果你更关心：

- `TrChat` 能配置什么
- `TrChatConfig` 每个字段负责什么

继续看：

- [Chat 配置](./chat-features.md)

如果你更关心：

- 想自己创建 runtime
- 自定义页面结构
- 想保留我们的 UI 和聊天行为，但自己接 transport

继续看：

- [Chat 自定义](./chat-advanced.md)

## 如何选择入口

| 你的目标 | 推荐入口 | 示例 |
| :-- | :-- | :-- |
| 快速启动完整聊天页 | `TrChat` | [基础示例](#trchat-最小示例) · [全量用法](/examples/chat-trchat) |
| 自己创建 runtime，继续用官方页面 | `TrChat.Root + TrChat.Page` | [Root + Page 示例](/examples/chat-root-page) |
| 完全控制页面结构 | `TrChat.Root + primitives` | [手动组合示例](/examples/chat-root-primitives) |

如果你想保留我们的 UI 和聊天行为，但需要自己接 transport / data-access，请看 [Chat 自定义](./chat-advanced.md) 里的 `TrChat.Provider(transportAdapter)`。

## `TrChat` 最小示例

<demo vue="../../demos/chat/basic.vue" :vueFiles="['../../demos/chat/basic.vue']" title="默认接入" description="使用 TrChatConfig 直接跑起完整聊天页。" />

## `TrChat` 接受什么输入

`TrChat` 现在只接受两种 `config` 形态：

- `TrChatConfig` 对象
- `TrChatConfig` 的序列化 JSON 字符串

如果需要自行创建 runtime、自定义页面结构或对接 transport，不建议在 `TrChat` 上添加更多顶层参数，请直接升级到以下路径。

## 最常改的配置

大多数场景里，最常修改的配置域：

- [`request`](./chat-features.md#request) — 模型、transport
- [`conversation`](./chat-features.md#conversation) — 初始消息、持久化
- [`ui`](./chat-features.md#ui) — 品牌、欢迎区、主题、文案
- [`sender`](./chat-features.md#sender) — 输入区行为
- [`attachments`](./chat-features.md#attachments) — 附件上传
- [`history`](./chat-features.md#history) — 历史会话
- [`workspace`](./chat-features.md#workspace) — 左右分栏布局
- [`messages`](./chat-features.md#messages) — 消息动作、渲染、反馈
- [`lifecycle`](./chat-features.md#lifecycle) — 发送前后钩子

完整字段参考见 [Chat 配置](./chat-features.md)。

## 什么时候升级到 `Root + Page`

适合这些情况：

- 你想自己决定 runtime 的创建时机
- 你想把聊天页包在业务容器里
- 你仍然想继续用官方页面结构

适合需要自行管理状态、但希望保留官方页面结构的场景。查看完整示例：[Root + Page 示例](/examples/chat-root-page)

如果还需要自定义 workspace 的左右侧边栏内容，`TrChat.Page` 在 workspace 模式下支持 `#left`、`#right`、`#left-rail` slots，直接替换即可。查看示例：[自定义布局示例](/examples/chat-custom-layout)

## 什么时候升级到 `Root + primitives`

适合这些情况：

- 你要自己排 `Header / MessageList / Footer / History / Workspace`
- 你要在页面里插入自定义区域
- 你要单独使用 `TrChat.Sender`、`TrChat.MessageList`、`TrChat.McpTrigger` 等叶子组件

适合需要完全控制页面组合的场景。查看完整示例：[手动组合示例](/examples/chat-root-primitives)

## 下一步看哪里

- 想继续用 `TrChat`，先看 [Chat 配置](./chat-features.md)
- 想升级到 `Root + Page`、`Root + primitives` 或 `Provider`，看 [Chat 自定义](./chat-advanced.md)
