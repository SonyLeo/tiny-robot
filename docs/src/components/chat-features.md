---
outline: deep
---

# Chat 功能配置

当页面已经跑起来后，再回来配这些功能开关。

如果你正在直接使用 `TrChat`，大多数情况下只需要记住下面这条规则：

- 稳定、可复用、希望长期保留的能力，写进 `config.features`
- 页面级临时差异，写进 `presetOverrides`
- 已经进入结构定制或渲染定制，再考虑插槽（slots）或进阶页

## 什么时候看这页

适合：

- 你已经能把 `TrChat` 跑起来
- 想知道历史、反馈、附件、MCP 这些能力该怎么配
- 想区分“写进配置”和“做页面覆盖”的边界

如果你还在第一步，建议先看：

- [Chat 快速接入](./chat.md)
- [先看这 4 个入口](./chat.md#先看这-4-个入口)

## 你最常会改的功能

| 你想改什么 | 对应字段 | 写在哪里 |
| :-- | :-- | :-- |
| 附件上传与附件列表 | `attachments` | `config.features.attachments` / `presetOverrides.attachmentsFeature` |
| 发送区扩展动作 | `senderActions` | `config.features.senderActions` / `presetOverrides.senderActionsFeature` |
| 欢迎提示词 | `welcomePrompts` | `config.features.welcomePrompts` / `presetOverrides.prompts` |
| 历史会话入口与历史区域 | `history` | `config.features.history` / `presetOverrides.showHistory` |
| 消息反馈 | `feedback` | `config.features.feedback` / `presetOverrides.showFeedback` |
| MCP 入口与面板能力 | `mcp` | `config.features.mcp` / `runtime.mcpManager` / `presetOverrides.mcpManager` |

## 先看一个页面级覆盖示例

先把稳定默认值写进 `config.features`，然后只在页面里做轻量覆盖：

```ts
const chatConfig = {
  features: {
    history: true,
    feedback: true,
  },
}

const presetOverrides = {
  showHistory: false,
}
```

<demo vue="../../demos/chat/features-preset-overrides.vue" :vueFiles="['../../demos/chat/features-preset-overrides.vue']" title="功能页面级覆盖" description="在基础 features 配置之外，通过 presetOverrides 局部打开或关闭历史、反馈和 senderActions。" />

## 常见功能该怎么配

### `history`

控制默认历史入口与默认历史区域。

最常用写法：

- 场景默认值：`config.features.history`
- 页面级覆盖：`presetOverrides.showHistory`
- 更高定制才考虑：`presetOverrides.historyProps`

继续阅读：

- [History 历史](./history.md)

### `feedback`

控制默认 assistant / user 消息反馈。

最常用写法：

- 场景默认值：`config.features.feedback`
- 页面级覆盖：`presetOverrides.showFeedback`

继续阅读：

- [Feedback 气泡反馈](./feedback.md)

### `senderActions`

控制默认发送区里那些“不属于消息正文”的扩展动作。

最常用写法：

- 场景默认值：`config.features.senderActions`
- 页面级覆盖：`presetOverrides.senderActionsFeature`

继续阅读：

- [Sender 消息输入框](./sender.md)

### `attachments`

控制聊天场景中的附件上传入口与附件列表。

最常用写法：

- 场景默认值：`config.features.attachments`
- 页面级覆盖：`presetOverrides.attachmentsFeature`

当前边界：

- 默认 `attachments` 解决的是“上传入口 + 列表展示”
- 它不等于“附件会自动进入模型请求”

继续阅读：

- [Attachments 附件卡片](./attachments.md)
- [Sender 消息输入框](./sender.md)

### `welcomePrompts`

控制欢迎态里的 prompts。

最常用写法：

- 场景默认值：`config.features.welcomePrompts`
- 页面级覆盖：`presetOverrides.prompts`

如果你只是想改欢迎区的渲染本身，继续用 `welcome` slot 就够了。

继续阅读：

- [Prompts 提示集](./prompts.md)
- [Chat 局部定制](./chat.md#局部定制)

### `mcp`

控制 MCP manager 是否进入聊天场景，以及默认 MCP 相关能力。

先记一句话：

- 默认不用专门写 `config.features.mcp`
- 需要 MCP：传 `mcpManager`
- 明确不要 MCP：写 `config.features.mcp = false`

再看细一点：

- `runtime.mcpManager` 决定当前页面有没有可用的 MCP 运行时
- `presetOverrides.mcpManager` 可以做页面级覆盖
- `config.features.mcp = false` 是更高优先级的显式关闭开关
- 一旦写了 `false`，即使同时传了 `runtime.mcpManager` 或 `presetOverrides.mcpManager`，默认 MCP 能力也不会接入

继续阅读：

- [McpServerPicker 插件选择器](./mcp-server-picker.md)
- [Chat 进阶了解](./chat-advanced.md)

## `contentLayout` 不属于功能开关

`contentLayout` 是布局配置，不属于 `features`。

推荐写法：

- 稳定默认值：`config.layout.contentLayout`
- 页面级覆盖：`presetOverrides.contentLayout`

## 哪些能力不属于 `features`

下面这些能力也经常会和“功能配置”一起被提到，但它们不属于 `config.features`：

- `messageActions`
  - 用于扩展消息下方的业务动作
- `bubbleRenderers`
  - 用于替换某一类消息的默认渲染
- `messageTransforms`
  - 用于在运行时改写模型结果
- `runtime`
  - 用于读取更细的请求状态，或访问已注入的 `chatKit`

推荐记法：

- 能力开关、稳定默认值：优先看 `config.features`
- 页面级消息动作和渲染扩展：优先看 `presetOverrides`
- 运行时消息改写：优先看 `runtime`

这些能力的详细用法，放在：

- [Chat 进阶了解](./chat-advanced.md)

## 相关页面

- [Chat 快速接入](./chat.md)
- [页面级覆盖](./chat.md#页面级覆盖)
- [局部定制](./chat.md#局部定制)
- [什么时候再看进阶内容](./chat.md#什么时候再看进阶内容)
- [Chat 进阶了解](./chat-advanced.md)
