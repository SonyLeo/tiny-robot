---
outline: deep
---

# Chat Features

`@opentiny/tiny-robot-chat` 内建了一组围绕聊天场景的 feature。

这些能力不是零散组件拼接，而是会进入同一条 preset 解析链：

```text
config.features
  -> resolveChatFeatures()
  -> presetProps
  -> presetSlices
  -> TrChat / TrChat.Scaffold / TrChat.Root descendants
```

这意味着：

- feature 不只是黑盒专属
- 但 feature 的推荐入口仍然优先是黑盒配置
- 只有在你已经进入 `Scaffold` 或白盒时，才继续消费它们的投影结果

## 这页适合什么时候看

适合：

- 你已经能把 `TrChat` 跑起来
- 你现在想打开聊天场景里的内建能力
- 你想知道哪些能力应该写进 `config.features`
- 你想区分“feature 开关”和“局部 slot/UI 定制”的边界

如果你还在第一步，建议先看：

- [Chat](./chat.md)
- [Chat 黑盒配置](./chat-config.md)

## 当前内建的 feature

| feature | 作用 | 常见入口 |
| :-- | :-- | :-- |
| `attachments` | 附件上传与附件列表 | `config.features.attachments` / `presetOverrides.attachmentsFeature` |
| `senderActions` | sender 区扩展动作，如上传、语音、字数统计 | `config.features.senderActions` / `presetOverrides.senderActionsFeature` |
| `welcomePrompts` | 欢迎区 prompts | `config.features.welcomePrompts` / `presetOverrides.prompts` |
| `history` | 历史入口与默认历史装配 | `config.features.history` / `presetOverrides.showHistory` |
| `feedback` | 默认消息反馈装配 | `config.features.feedback` / `presetOverrides.showFeedback` |
| `mcp` | MCP manager 注入与 MCP 面板能力 | `config.features.mcp` / `runtime.mcpManager` / `presetOverrides.mcpManager` |

## 当前推荐的配置顺序

建议按这个顺序理解 feature：

1. 先把稳定场景能力写进 `config.features`
2. 页面级差异再用 `presetOverrides`
3. 只有局部 UI 不适合配置描述时，再用 slots 或 `Scaffold`

简单说：

- 稳定、可复用、可配置的能力 -> feature
- 页面局部差异 -> `presetOverrides`
- 页面模板差异 -> slots / `Scaffold`

## 在哪里配置 feature

### 方式 1：写进 `config.features`

这是当前推荐方式。

适合：

- 作为场景默认值长期保留
- 希望黑盒和 `Scaffold` 都消费同一套能力描述
- 不希望能力开关散落在页面模板里

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
- 不改基础配置的前提下做局部实验
- 多个页面共享同一份基础 `config`，但局部能力展示不同

示例：

<demo vue="../../demos/chat/features-preset-overrides.vue" title="feature 页面级覆盖" description="在基础 features 配置之外，通过 presetOverrides 局部打开 history、feedback 和 senderActions。" />

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

控制默认发送区里那些“不属于消息正文”的扩展动作。

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

- 让欢迎 prompts 成为场景 feature
- 而不是页面里散落的一组静态数组

适合写进：

- `config.features.welcomePrompts`
- `presetOverrides.prompts`

如果你只是想改欢迎区渲染本身，也可以继续用：

- `welcome` slot

继续阅读：

- [Prompts 提示集](./prompts.md)
- [Chat Slots 与渲染定制](./chat-slots.md)

## `history`

控制默认历史入口与默认历史装配。

当前默认行为要特别注意：

- 如果你没有显式配置 `features.history`
- 默认历史入口和默认历史装配仍然会保持开启

如果你要显式关闭它，使用：

- `config.features.history = false`
- `presetOverrides.showHistory = false`

适合写进：

- `config.features.history`
- `presetOverrides.showHistory`
- `presetOverrides.historyProps`

如果你已经进入更高定制层，也可以直接使用：

- `TrChat.History`
- `TrChat.HistorySurface`

继续阅读：

- [History 历史](./history.md)
- [Chat Scaffold 与 Root](./chat-scaffold.md)

## `feedback`

控制默认 assistant / user 消息反馈装配。

适合写进：

- `config.features.feedback`
- `presetOverrides.showFeedback`

如果你要在更高定制页面里单独消费，也可以直接使用：

- `TrChatFeedback`

继续阅读：

- [Feedback 气泡反馈](./feedback.md)

## `mcp`

控制 MCP manager 是否进入聊天场景，以及默认 MCP 相关装配。

常见配合方式：

- 在 `runtime` 注入 `mcpManager`
- 通过 `config.features.mcp` 打开 MCP feature
- 必要时通过 `presetOverrides.mcpManager` 做页面级覆盖

如果你要做 MCP，通常不是单一 UI 开关，而是一组能力：

- `mcpManager`
- 工具调用链
- sender/footer/header 里的 MCP 入口
- 可能的 plugins

继续阅读：

- [McpServerPicker 插件选择器](./mcp-server-picker.md)
- [Chat 进阶能力](./chat-advanced.md)

## `layout.contentLayout` 不是 feature

`contentLayout` 是布局展示能力，不是独立 feature。

推荐规则：

- `config.layout.contentLayout`
  - 适合声明稳定场景默认值
- `presetOverrides.contentLayout`
  - 适合页面级、交互级、响应式覆盖

示例：

```ts
const chatConfig = {
  // ...
  layout: {
    contentLayout: 'centered',
  },
}
```

<demo vue="../../demos/chat/features-content-layout.vue" title="contentLayout 覆盖" description="把内容区布局切换留在 presetOverrides，而不是误写成 feature 配置。" />

## feature 与 slots / `Scaffold` 的分工

可以用下面这条规则判断：

### 优先写成 feature

如果某个能力满足这些条件，优先考虑写成 feature 配置：

- 它是聊天场景的通用能力
- 黑盒和 `Scaffold` 都可能要消费
- 它可以被 `config` 稳定描述

### 优先用 slots 或 `Scaffold`

如果某个能力满足这些条件，优先考虑写成 slots 或更高层页面逻辑：

- 它只属于某一页的局部 UI
- 它不适合被配置声明
- 它更像布局差异而不是场景能力

## feature 不是黑盒专属

即使你已经进入：

- `TrChat.Scaffold`
- `TrChat.Root`
- `presetSlices`

这些 feature 依然会通过 preset 解析链进入叶子组件消费层。

这也是为什么当前推荐优先把稳定场景能力写进 feature，而不是直接在页面里散落地拼按钮和开关。

## 一个实用判断标准

如果你在纠结“这到底该写成 feature 还是 slot”，可以先问自己：

- 这是聊天场景的长期能力，还是某一页的局部差异？
- 它以后是不是还会被别的页面复用？
- 它能不能被配置稳定描述？

如果答案偏“长期、可复用、可配置”，优先写成 feature。

如果答案偏“局部、模板化、页面专属”，优先用 slots 或 `Scaffold`。

## 相关页面

- [Chat](./chat.md)
- [Chat 黑盒配置](./chat-config.md)
- [Chat Slots 与渲染定制](./chat-slots.md)
- [Chat Scaffold 与 Root](./chat-scaffold.md)
- [Chat 进阶能力](./chat-advanced.md)
