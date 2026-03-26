---
outline: deep
---

# Chat Features

`@opentiny/tiny-robot-chat` 内建了一组围绕聊天场景的 feature。

这些能力不是零散组件拼接，而是可以通过 `config` 或 `presetOverrides` 进入同一条 preset 解析链。

## 目前内建的 feature

| feature | 作用 | 常见入口 |
| :-- | :-- | :-- |
| `attachments` | 附件上传与附件列表 | `config.features.attachments` / `presetOverrides.attachmentsFeature` |
| `senderActions` | 上传按钮、语音输入、字数统计等 sender 扩展 | `config.features.senderActions` / `presetOverrides.senderActionsFeature` |
| `welcomePrompts` | 欢迎区 prompts | `config.features.welcomePrompts` / `presetOverrides.prompts` |
| `history` | 历史抽屉 / 历史入口 | `config.features.history` / `presetOverrides.showHistory` |
| `feedback` | 气泡反馈入口 | `config.features.feedback` / `presetOverrides.showFeedback` |
| `mcp` | MCP manager 注入与面板能力 | `config.features.mcp` / `runtime.mcpManager` / `presetOverrides.mcpManager` |

## 在哪里配置 feature

### 方式 1：写进 `config.features`

适合：

- 作为场景默认值长期保留
- 希望模板、CLI、配置工具链也能消费这些能力

示例：

```ts
const chatConfig = {
  // ...
  features: {
    attachments: true,
    senderActions: {
      voice: {
        enabled: true,
      },
      wordCount: true,
    },
    history: true,
    feedback: true,
  },
}
```

### 方式 2：写进 `presetOverrides`

适合：

- 页面级轻量覆盖
- 在不改 `config` 的前提下做局部实验
- 不同页面共享同一个基础配置，但 UI 细节不同

示例：

```vue
<TrChat
  :config="chatConfig"
  :preset-overrides="{
    showHistory: true,
    showFeedback: true,
    senderActionsFeature: {
      voice: {
        enabled: true,
      },
      wordCount: true,
    },
  }"
/>
```

## `attachments`

控制聊天场景中的附件上传入口与附件列表。

常见能力：

- 上传按钮
- 允许上传的类型与数量
- 附件列表布局
- 与 `TrChat.Attachments` 配合渲染

适合写进：

- `config.features.attachments`
- `presetOverrides.attachmentsFeature`

继续阅读：

- [Attachments 附件卡片](./attachments.md)
- [Sender 消息输入框](./sender.md)

## `senderActions`

控制默认发送区里那些“不是消息正文本身”的扩展动作。

当前常见能力：

- 上传按钮
- 语音输入按钮
- 字数统计
- `defaultActions`

适合写进：

- `config.features.senderActions`
- `presetOverrides.senderActionsFeature`

继续阅读：

- [Sender 消息输入框](./sender.md)

## `welcomePrompts`

控制欢迎态里的 prompts。

这一层的意义在于：

- 让欢迎 prompts 成为场景 feature，而不是页面里散落的一组静态数组
- 允许配置层统一描述欢迎态内容

如果你还想做页面级覆盖，也可以直接用：

- `presetOverrides.prompts`
- `welcome` slot

继续阅读：

- [Prompts 提示集](./prompts.md)
- [Chat Slots 与渲染定制](./chat-slots.md)

## `history`

控制是否启用历史抽屉，以及历史入口在默认 header 中是否可见。

适合写进：

- `config.features.history`
- `presetOverrides.showHistory`
- `presetOverrides.historyProps`

如果你已经进入白盒模式，也可以直接使用：

- `TrChat.History`
- `TrChat.HistorySurface`

继续阅读：

- [History 历史](./history.md)
- [Chat 进阶能力](./chat-advanced.md)

## `feedback`

控制 assistant / user 气泡反馈入口是否进入默认装配链。

适合写进：

- `config.features.feedback`
- `presetOverrides.showFeedback`

如果你要白盒消费，也可以直接使用：

- `TrChatFeedback`

继续阅读：

- [Feedback 气泡反馈](./feedback.md)

## `mcp`

控制 MCP manager 是否进入聊天场景上下文。

常见配合方式：

- 在 `runtime` 或 `presetOverrides` 注入 `mcpManager`
- 默认 renderer 会在 sender footer 自动渲染 `TrMcpTrigger`
- 配合 `TrMcpTrigger` 或 `TrChatMcpPanel` 提供 MCP 面板入口

如果你要做 MCP，通常不只是一处 UI 开关，而是：

- `mcpManager`
- 工具调用链
- 面板入口
- 可能的 `plugins`

继续阅读：

- [McpServerPicker 插件选择器](./mcp-server-picker.md)
- [Chat 进阶能力](./chat-advanced.md)

## feature 与白盒组合的关系

feature 并不是黑盒专属。

即使你已经进入：

- `TrChat.Scaffold`
- `TrChat.Root`
- `presetSlices`

这些 feature 依然会通过 preset 解析链进入叶子组件消费层。

这也是为什么推荐优先把“稳定的场景能力”写进 feature，而不是直接在页面里散落地拼按钮和开关。

## 一个实用判断标准

如果某个能力满足以下条件，优先考虑写成 feature 配置：

- 它是聊天场景的通用能力
- 黑盒和白盒都可能要消费
- 它可以被 `config` 稳定描述

如果某个能力满足以下条件，优先考虑写成 slot 或白盒页面逻辑：

- 它只属于某一页的局部 UI
- 它不适合被配置声明
- 它更像是布局或模板层的差异

## 相关页面

- [Chat](./chat.md)
- [Chat 黑盒配置](./chat-config.md)
- [Chat Scaffold 与 Root](./chat-scaffold.md)
- [Chat 进阶能力](./chat-advanced.md)
