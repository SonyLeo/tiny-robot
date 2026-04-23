---
outline: [2, 3]
---

# Chat 配置与能力

这一页只讲当前黑盒 `TrChat` 的正式配置合同，也就是 target `TrChatConfig`。

如果你还没开始接入，先看：

- [Chat 接入与入口](./chat.md)

如果你要做白盒页面、Provider、MCP 或叶子级扩展，继续看：

- [Chat 定制与进阶](./chat-advanced.md)

## 先记住这 8 个配置域

| 配置域 | 负责什么 | 典型内容 |
| :-- | :-- | :-- |
| `request` | 模型、默认模型、transport | `models`、`defaultModelId`、`transport` |
| `conversation` | 首屏种子消息与持久化恢复 | `initialMessages`、`persistence` |
| `ui` | display-only 默认值 | `brand`、`welcome`、`appearance`、`contentLayout`、`copy` |
| `sender` | 发送区默认输入行为 | `placeholder`、`mode`、`maxLength`、`wordCount`、`voice` |
| `attachments` | 附件开关与默认上传/列表配置 | `enabled`、`upload`、`list` |
| `history` | 历史区默认开关与默认打开状态 | `enabled`、`defaultOpen` |
| `workspace` | workspace 壳层默认结构 | `enabled`、`left`、`right`、`defaultView` |
| `messages` | 消息扩展链 | `actions`、`actionMode`、`renderers`、`feedback`、`transforms` |
| `lifecycle` | 流程节点 hook | `beforeSend`、`afterReceive`、`error` |

## 不再属于黑盒 `TrChat` 配置的内容

下面这些已经不属于当前黑盒官方合同：

- 顶层 `runtime`
- 顶层 `callbacks`
- 顶层 `presetOverrides`
- `config.integrations`
- `TrChat.Scaffold`

如果需求落在这些能力上，说明你已经该从黑盒升级到：

- `TrChat.Root + TrChat.Page`
- `TrChat.Root + primitives`
- 或 `TrChat.Provider`

## `request`

`request` 解决的是：

- 当前有哪些模型可选
- 默认选哪个模型
- 请求往哪里发

最小示例：

```ts
const config = {
  request: {
    models: [
      { id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' },
    ],
    defaultModelId: 'gpt-4.1-mini',
    transport: {
      type: 'openai-compatible',
      endpoint: '/api/chat/completions',
      systemPrompt: 'You are a helpful assistant.',
    },
  },
}
```

## `conversation`

`conversation` 只负责 active conversation 的初始化语义。

最常见的是：

- `initialMessages`
- `persistence`

其中 `initialMessages` 的语义已经是：

- 首屏 eager baseline
- 不是等第一次发送时才补进来的旧 seed 逻辑

## `ui`

`ui` 是 display-only 层。

它负责：

- `brand`
- `welcome`
- `appearance`
- `contentLayout`
- `copy`

它不负责：

- workspace 结构
- 消息动作与渲染扩展
- 运行时对象

## `sender`

`sender` 负责发送区默认行为。

当前 target config 支持的核心项：

```ts
sender: {
  placeholder: 'Ask TinyRobot anything',
  mode: 'multiple',
  maxLength: 200,
  wordCount: true,
  voice: {
    enabled: true,
    tooltip: 'Voice input',
  },
}
```

这层已经是正式 owner path，不需要再靠旧的 `senderActionsFeature` 或页面级 helper 覆盖去打开。

## `attachments`

`attachments` 负责：

- 是否启用附件
- 上传按钮默认配置
- 列表显示默认配置

最常见的是：

```ts
attachments: {
  enabled: true,
  upload: {
    enabled: true,
    accept: '.txt,.md',
    multiple: true,
  },
  list: {
    wrap: true,
  },
}
```

## `history`

`history` 负责默认历史能力是否打开，以及默认是否展开。

```ts
history: {
  enabled: true,
  defaultOpen: false,
}
```

## `workspace`

`workspace` 负责 workspace 壳层结构，而不是文案或消息行为。

最常见的是：

```ts
workspace: {
  enabled: true,
  defaultView: 'workspace',
  left: {
    enabled: true,
    defaultOpen: true,
    collapseMode: 'rail',
  },
  right: {
    enabled: true,
    defaultOpen: false,
    collapseMode: 'hidden',
  },
}
```

## `messages`

`messages` 是消息扩展链。

它负责：

- `actions`
- `actionMode`
- `renderers`
- `feedback`
- `transforms`

也就是说：

- message actions 不再走 `presetOverrides.messageActions`
- bubble renderers 不再走 `presetOverrides.bubbleRenderers`
- transforms 不再走顶层 `runtime.messageTransforms`

这些都已经收口到 `config.messages`

## `lifecycle`

`lifecycle` 只放流程节点 hook。

当前正式合同是：

- `beforeSend`
- `afterReceive`
- `error`

它不再承载旧 scaffold 语义的泛 callbacks 桶。

## MCP 在哪里

MCP 不再属于黑盒 `TrChat` 的 target config 域。

如果你要接 MCP：

- 用 `TrChat.Provider` 的 `mcpManager`
- 或走 `TrChat.Root` runtime 输入

不要再把它理解成：

- 顶层 `runtime.mcpManager` 的黑盒合同
- `config.integrations.mcpManager`

## 下一步看哪里

- 想继续用黑盒，但理解入口梯子：看 [Chat 接入与入口](./chat.md)
- 想升级到 `Root + Page`、`Root + primitives` 或 `Provider`：看 [Chat 定制与进阶](./chat-advanced.md)
