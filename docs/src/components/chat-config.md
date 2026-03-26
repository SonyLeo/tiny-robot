---
outline: deep
---

# Chat 黑盒配置

这页聚焦 `TrChat` 的黑盒入口 contract。

如果你的目标是：

- 用最少代码跑起完整聊天页
- 让模型、provider、欢迎区、布局、features 都由配置驱动
- 在不拆开页面结构的前提下做少量行为覆盖

那么你主要会接触这四层：

```ts
config + runtime + callbacks + presetOverrides
```

## `TrChat` 的正式入口

`TrChat` 当前公开 props 很少，但每一层职责都很明确：

| 字段 | 作用 | 适合放什么 |
| :-- | :-- | :-- |
| `config` | 静态配置层 | 模型、provider、UI、layout、features |
| `runtime` | 运行时注入层 | `chatKit`、`plugins`、`storage`、`initialMessages`、`mcpManager`、`selectedModel` |
| `callbacks` | 行为回调层 | `onFinish`、`onError`、`onMessageAction`、`onModelChange` |
| `presetOverrides` | 默认装配覆盖层 | `placeholder`、`messageListVariant`、`showHistory`、`roleConfigs`、`providerFactories` 等 |

## 最小配置

最小可用配置通常只需要模型和 provider：

```vue
<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'
import type { ChatConfig } from '@opentiny/tiny-robot-chat'

const chatConfig: ChatConfig = {
  models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
  providers: {
    openai: {
      type: 'openai-compatible',
      endpoint: '/api/chat',
    },
  },
  defaults: {
    model: 'gpt-4o-mini',
  },
}
</script>

<template>
  <TrChat :config="chatConfig" />
</template>
```

## `config`：静态配置层

### 顶层结构

`ChatConfig` 当前主要围绕这些顶层字段组织：

```ts
const chatConfig = {
  models: [],
  providers: {},
  defaults: {},
  appearance: {},
  ui: {},
  layout: {},
  features: {},
  runtime: {},
}
```

### `models`

用于声明可选模型列表。

常用字段：

- `id`
- `provider`
- `label`
- `disabled`

示例：

```ts
models: [
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai' },
  { id: 'deepseek-chat', label: 'DeepSeek Chat', provider: 'deepseek' },
]
```

### `providers`

当前黑盒配置主要面向 `openai-compatible` provider。

常用字段：

- `type`
- `endpoint`
- `baseURL`
- `apiPath`
- `headers`
- `credentials`
- `systemPrompt`
- `temperature`
- `maxTokens`

最常见的做法是让前端请求你自己的 `/api/chat`，由服务端代理真实 provider。

### `defaults`

当前常用字段：

- `model`
- `systemPrompt`

`defaults.model` 用来指定默认模型。

### `appearance`

用于声明场景外观。

当前常用字段：

- `mode: 'light' | 'dark' | 'system'`

### `ui`

用于声明默认文案与欢迎区内容。

常见结构：

```ts
ui: {
  brand: {
    title: 'TinyRobot Chat',
  },
  welcome: {
    title: '欢迎使用 Chat',
    description: '几行代码即可获得完整对话 UI',
  },
  prompts: [
    { label: '解释 React hooks', description: '解释 React hooks' },
  ],
}
```

适合放：

- 品牌标题
- 欢迎区标题与描述
- 默认 prompts

### `layout`

用于声明默认消息布局。

当前常用字段：

- `variant`
- `placements`

可选 `variant`：

- `bubble`
- `docs`
- `workspace`

`placements` 允许单独覆盖：

- `assistant`
- `user`

示例：

```ts
layout: {
  variant: 'docs',
  placements: {
    assistant: 'start',
    user: 'end',
  },
}
```

### `features`

用于打开聊天场景的内建能力。

当前建议优先关注：

- `attachments`
- `senderActions`
- `welcomePrompts`
- `history`
- `feedback`
- `mcp`

完整能力矩阵见：[Chat Features](./chat-features.md)

### `runtime`

`config.runtime` 适合写那些虽然属于运行时，但仍然可以静态声明的部分。

目前最典型的是：

- `mcpManager`

如果对象需要在页面 setup 中动态创建，也可以通过 `TrChat.runtime` 传入。

### `ChatConfig.runtime` vs `TrChat.runtime`

这两个名字很像，但不是同一层。

| 层级 | 入口 | 当前更适合放什么 |
| :-- | :-- | :-- |
| 配置层 | `ChatConfig.runtime` | 能被静态声明并进入配置归一化链的运行时字段。当前最典型的是 `mcpManager` |
| 组件入口层 | `TrChat.runtime` | 页面 setup 中动态创建的运行时对象，例如 `chatKit`、`plugins`、`storage`、`initialMessages`、`selectedModel` |

可以简单理解为：

- `ChatConfig.runtime` 属于配置文件的一部分
- `TrChat.runtime` 属于组件实例的运行时注入层

如果你已经在页面里自己创建了对象，优先考虑放到 `TrChat.runtime`，而不是继续往 `ChatConfig.runtime` 里塞。

## `runtime`：运行时注入层

`runtime` 适合放不能仅靠静态配置描述的对象。

当前支持：

| 字段 | 说明 |
| :-- | :-- |
| `chatKit` | 直接复用现成聊天运行时 |
| `plugins` | 注入消息插件 |
| `storage` | 注入会话存储策略 |
| `initialMessages` | 注入初始消息 |
| `mcpManager` | 注入 MCP manager |
| `selectedModel` | 指定初始选中模型 |

示例：

```vue
<script setup lang="ts">
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'

const chatKit = useChatKit({
  responseProvider: async function* () {
    // ...
  },
})
</script>

<template>
  <TrChat :config="chatConfig" :runtime="{ chatKit }" />
</template>
```

什么时候用 `runtime.chatKit`：

- 你已经在页面里自己管理 `useChatKit`
- 你需要和现有业务状态共享同一个聊天运行时

什么时候只传 `plugins / storage / initialMessages`：

- 你仍然希望保留 `TrChat` 内部默认初始化链
- 只是想给默认 chatKit 增加插件、存储或初始消息

## `callbacks`：行为回调层

当前支持：

| 字段 | 触发时机 |
| :-- | :-- |
| `onFinish` | assistant 消息完成时 |
| `onError` | 请求或 provider 报错时 |
| `onMessageAction` | 消息操作被点击时 |
| `onModelChange` | 模型切换时 |

示例：

```vue
<script setup lang="ts">
const callbacks = {
  onFinish(message) {
    console.log('finish', message)
  },
  onError(error) {
    console.error('error', error)
  },
  onMessageAction(payload) {
    console.log('action', payload.action)
  },
  onModelChange(model) {
    console.log('model', model.value)
  },
}
</script>

<template>
  <TrChat :config="chatConfig" :callbacks="callbacks" />
</template>
```

## `presetOverrides`：默认装配覆盖层

这层不是重新定义整套 `TrChat`，而是对默认 preset 做轻量覆盖。

### 常见 UI 覆盖

| 字段 | 作用 |
| :-- | :-- |
| `appearance` | 覆盖颜色模式 |
| `brand` | 覆盖品牌标题 |
| `welcome` | 覆盖欢迎区 |
| `prompts` | 覆盖欢迎 prompts |
| `messages` | 覆盖内置文案 |

### 常见交互覆盖

| 字段 | 作用 |
| :-- | :-- |
| `placeholder` | 覆盖发送框占位文案 |
| `maxLength` | 覆盖最大输入长度 |
| `senderMode` | 控制单行 / 多行输入 |
| `autoScroll` | 覆盖消息列表自动滚动 |

### 常见场景覆盖

| 字段 | 作用 |
| :-- | :-- |
| `messageListVariant` | 覆盖消息列表变体 |
| `showHistory` | 开关历史抽屉 |
| `showFeedback` | 开关反馈入口 |
| `show` | 当前场景显隐状态 |

### 常见运行时覆盖

| 字段 | 作用 |
| :-- | :-- |
| `models` | 覆盖模型列表 |
| `defaultModel` | 覆盖默认模型 |
| `providerFactories` | 覆盖模型匹配到的 provider 工厂 |
| `mcpManager` | 覆盖 MCP manager |

### 常见渲染覆盖

| 字段 | 作用 |
| :-- | :-- |
| `roleConfigs` | 覆盖 assistant / user 的 placement 等配置 |
| `groupStrategy` | 覆盖消息分组策略 |
| `senderProps` | 透传到底层 `TrChat.Sender` |
| `bubbleListProps` | 透传到底层 `TrChat.MessageList` |
| `historyProps` | 透传历史区相关 props |
| `attachmentsFeature` | 覆盖附件 feature preset |
| `senderActionsFeature` | 覆盖 sender actions feature preset |

## 推荐的覆盖顺序

建议按下面顺序思考：

1. 先用 `config` 声明稳定默认值
2. 再用 `runtime` 注入真正的运行时对象
3. 用 `callbacks` 接行为
4. 最后用 `presetOverrides` 做页面级轻量覆盖

只有当你发现“默认页面结构本身不合适”时，再进入：

- [Chat Scaffold 与 Root](./chat-scaffold.md)
- [Chat Slots 与渲染定制](./chat-slots.md)

## 推荐接入习惯

- 先把 `TrChat` 跑通，再决定是否切到 `Scaffold`
- 不要把黑盒入口重新退回“散装 props 堆叠”模式
- 如果你的模型切换不生效，优先检查：
  - `models`
  - `defaultModel`
  - `providerFactories`
- 如果你已经要手工消费 `presetProps / presetSlices`，说明你大概率应该改用 `TrChat.Scaffold` 或 `TrChat.Root`
