---
outline: deep
---

# Chat

`@opentiny/tiny-robot-chat` 是一个面向 Vue 的会话套件。  
它不是单一组件，而是一层把聊天 UI、消息状态、模型切换、会话管理、错误处理、工具调用整合起来的“组装层”。

如果你是第一次接触这个项目，可以先用一句话理解它：

> `@opentiny/tiny-robot` 负责界面，`@opentiny/tiny-robot-kit` 负责消息与会话状态，`@opentiny/tiny-robot-chat` 负责把它们组合成一个真正可用的聊天应用骨架。

---

## 为什么需要 Chat 套件

很多团队在做 AI 对话页面时，通常都会遇到这些问题：

- 已经有 `Bubble`、`Sender`、`Prompts` 这类基础 UI，但不知道怎么把它们真正串成一个完整聊天页面。
- 能把消息发出去，但会话历史、重新生成、消息编辑、流式状态、错误重试很快就会变复杂。
- 模型切换、工具调用、MCP、品牌区、欢迎页、反馈区这些能力分散在多个地方，容易出现状态不同步。
- 新项目想快速起步，老项目又希望局部定制，单纯提供一个“大组件”或“纯 hook”都不够。

`packages/chat` 的目标，就是解决这几个问题：

- 给你一个可直接使用的黑盒聊天组件。
- 同时保留白盒组合能力，让你按业务需要定制布局。
- 把消息、会话、模型、工具、错误、反馈这些常见聊天能力统一到一个稳定的 API 面上。
- 为脚手架、模板生成、后续扩展提供更清晰的接入边界。

---

## 适合谁使用

### 适合这些场景

- 你想快速做一个“能用的聊天页面”，不想从零拼装消息区、输入区、历史区。
- 你已经有自己的页面布局，但希望复用聊天状态管理、模型切换、错误重试等能力。
- 你需要做一个可配置的 chat kit，后续还要接脚手架或模板生成。
- 你要同时支持黑盒快速接入和白盒深度定制。

### 不适合直接把它理解成什么

- 它不是大模型 SDK。
- 它不是后端代理服务。
- 它不是单纯的视觉组件集合。
- 它也不是 demo 本身。demo 只是开发阶段的验证页面，不建议把 demo 代码直接当生产实现照搬。

---

## 心智模型

建议你把这个包拆成三层来理解。

### 1. UI 层

来源：`@opentiny/tiny-robot`

负责：

- `Bubble`
- `Sender`
- `Prompts`
- `History`
- 反馈按钮、图标、布局基础能力

这一层主要解决“长什么样”和“怎么渲染”。

### 2. 状态与请求层

来源：`@opentiny/tiny-robot-kit`

负责：

- 消息列表
- 会话切换
- 流式回复
- 中断请求
- 存储策略
- 工具调用的消息流

这一层主要解决“消息怎么流动”和“请求怎么管理”。

### 3. Chat 组装层

来源：`@opentiny/tiny-robot-chat`

负责：

- 黑盒组件 `TrChat`
- 白盒组合 `TrChat.Root / Layout / Header / MessageList / Sender / History`
- `useChatKit`
- `useMcpManager`
- `useModelSelector`
- Provider 工厂、Adapter、Preset

这一层主要解决“如何把 UI 和状态层真正组合成一个聊天应用”。

---

## 命名说明

你在使用这个包时，主要接触到的公共组件名仍然是：

- `TrChat`
- `TrChat.Root`
- `TrChat.Layout`
- `TrChat.Header`
- `TrChat.MessageList`
- `TrChat.Sender`
- `TrModelSelector`

这是 `packages/chat` 对外提供的稳定 API，也是文档和示例里应该使用的名字。

需要特别说明的是：从源码组织角度看，`packages/chat/src/components` 内部已经按领域拆分为 `chat / history / model-selector` 等目录，内部文件名也不再统一带 `Tr` 前缀。这是为了让源码结构更清晰、维护成本更低。

但对于组件使用者来说，这个变化**不会影响对外用法**：

- public API 仍然保留 `Tr*` 前缀
- 组件运行时名称也保持 `Tr*`
- 你不需要因为内部文件结构调整而修改已有接入代码

你可以把它理解成：

> `Tr*` 属于组件库的公共命名空间；内部源码文件则更强调领域语义和目录结构。

---

## 两种使用方式

`packages/chat` 最核心的设计，是同时支持两种接入方式。

## 1. 黑盒模式

黑盒模式最适合：

- 希望最快落地
- 先把主链路跑通
- 后续再逐步定制

你只需要传入 `responseProvider`，或者传入 `models + providerFactories`，`TrChat` 就会帮你组装：

- Header
- Welcome
- MessageList
- Sender
- History
- Feedback

最小示例：

```vue
<script setup lang="ts">
import { TrChat, createServerProxyProvider } from '@opentiny/tiny-robot-chat'

const responseProvider = createServerProxyProvider({
  endpoint: '/api/chat',
  systemPrompt: 'You are a helpful assistant.',
})
</script>

<template>
  <TrChat
    :response-provider="responseProvider"
    :brand="{ title: 'TinyRobot Chat' }"
    :welcome="{
      title: '你好，我是 TinyRobot',
      description: '可以问我任何问题。',
    }"
    :prompts="[
      { label: '解释 Vue 组合式 API', description: '解释 Vue 组合式 API' },
      { label: '帮我写一个按钮组件', description: '帮我写一个按钮组件' },
    ]"
    show-history
    show-feedback
  />
</template>
```

如果你是第一次接入，建议先用黑盒模式把链路跑通。

---

## 2. 白盒模式

白盒模式最适合：

- 你想自定义布局
- 你希望某些区块由业务自己控制
- 你已经有自己的页面结构
- 你需要更细粒度地决定哪些能力显示、哪些能力隐藏

白盒模式的核心思路是：

- `TrChat.Root` 负责注入上下文
- `TrChat.Layout` 负责聊天容器与 Bubble 环境
- 其它子组件按需组合

示例：

```vue
<script setup lang="ts">
import { TrChat, useChatKit, createServerProxyProvider } from '@opentiny/tiny-robot-chat'

const chat = useChatKit({
  responseProvider: createServerProxyProvider({
    endpoint: '/api/chat',
    systemPrompt: 'You are a helpful assistant.',
  }),
})
</script>

<template>
  <TrChat.Root :chat-kit="chat">
    <TrChat.Layout>
      <TrChat.Header title="知识库问答" show-history />

      <TrChat.Welcome
        v-if="chat.messages.value.length === 0"
        title="欢迎使用知识库问答"
        description="你可以输入问题，也可以点击下方引导词。"
        :prompts="[
          { label: '介绍一下这个项目', description: '介绍一下这个项目' },
          { label: '总结最近更新', description: '总结最近更新' },
        ]"
        @prompt-click="chat.sendMessage"
      />

      <TrChat.MessageList v-else auto-scroll />

      <TrChat.Footer>
        <TrChat.Sender placeholder="请输入你的问题" />
      </TrChat.Footer>

      <TrChat.History />
    </TrChat.Layout>
  </TrChat.Root>
</template>
```

如果你希望：

- Header 不是默认样式
- Welcome 区需要和业务卡片混排
- Sender 上方要插入模型选择器或上传区
- History 只在某些模式下显示

那白盒模式会更适合你。

---

## 推荐的上手顺序

如果你是小白，建议按这个顺序理解和使用。

1. 先理解 `ResponseProvider`
2. 再跑通一个最小黑盒页面
3. 再理解 `useChatKit`
4. 需要定制时，再切到白盒组合
5. 如果要做多模型或脚手架，再用 Adapter

这样最不容易一上来就掉进过度抽象里。

---

## 安装

通常安装 `@opentiny/tiny-robot-chat` 即可：

```bash
pnpm add @opentiny/tiny-robot-chat
```

在实际项目里，你通常还会同时使用这些包中的类型或能力：

- `@opentiny/tiny-robot`
- `@opentiny/tiny-robot-kit`

---

## 最重要的概念

## ResponseProvider

`ResponseProvider` 是整个聊天链路最核心的输入。  
你可以把它理解为：

> “当用户发送消息后，Chat 套件要调用谁来获取模型回复。”

类型如下：

```ts
type ResponseProvider = (
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
) =>
  | Promise<ChatCompletion>
  | AsyncGenerator<ChatCompletion>
  | Promise<AsyncGenerator<ChatCompletion>>
```

这意味着它支持两种典型返回方式：

- 一次性返回完整结果
- 以流式方式逐段返回结果

如果你已经有后端接口，最推荐的方式是用服务端代理：

```ts
import { createServerProxyProvider } from '@opentiny/tiny-robot-chat'

const responseProvider = createServerProxyProvider({
  endpoint: '/api/chat',
  systemPrompt: 'You are a helpful assistant.',
  temperature: 0.2,
})
```

### 为什么推荐 `createServerProxyProvider`

这是一个很重要的生产建议。

`createServerProxyProvider` 走的是你自己的服务端代理 / BFF，它的优势是：

- 浏览器不需要直接持有模型平台 API Key
- 更适合接入权限控制、审计、限流
- 更容易统一多模型策略
- 更适合企业应用

相对地，`createOpenAIProvider`、`createDeepSeekProvider` 这类浏览器直连 helper 更适合：

- demo
- 内网工具
- 临时验证

不建议直接作为生产默认方案。

---

## ChatStatus

聊天状态会被归一成四种：

```ts
type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'
```

你可以这样理解：

- `ready`：当前空闲，可以继续发送
- `submitted`：消息已提交，请求刚发出，还没开始回流
- `streaming`：回复正在流式生成
- `error`：本轮请求失败

这个状态在黑盒和白盒里都很重要，因为它会影响：

- 发送按钮是否切换成中断
- Feedback 是否显示
- 是否允许重试
- 是否要展示错误内容

---

## useChatKit

`useChatKit` 是 chat 层最重要的 composable。  
如果你走白盒模式，几乎一定会直接用到它。

示例：

```ts
import { useChatKit, createServerProxyProvider } from '@opentiny/tiny-robot-chat'

const chat = useChatKit({
  responseProvider: createServerProxyProvider({
    endpoint: '/api/chat',
  }),
})
```

你最常用到的返回值包括：

```ts
chat.messages
chat.status
chat.lastError
chat.sendMessage()
chat.abort()
chat.retry()
chat.createConversation()
chat.switchConversation()
chat.deleteConversation()
chat.updateResponseProvider()
```

### `useChatKit` 解决了什么

它帮你把这些问题统一处理掉了：

- 发送消息
- 流式回复
- 错误态
- 重试
- 编辑消息
- 会话历史
- optimistic 状态
- rollback

这也是为什么白盒模式下，你通常不需要再自己手写一套聊天状态机。

---

## 多模型能力

如果你希望在聊天页面中支持模型切换，通常会用到这三个概念：

- `ModelOption`
- `ModelProviderFactory`
- `useModelSelector`

### `ModelOption`

定义“页面上有哪些模型可选”。

```ts
interface ModelOption {
  value: string
  label?: string
  provider?: string
  icon?: Component
  disabled?: boolean
}
```

### `ModelProviderFactory`

定义“某个模型应该由哪个 provider 创建器来负责”。

```ts
interface ModelProviderFactory {
  match: (model: ModelOption) => boolean
  createProvider: (model: ModelOption) => ResponseProvider
}
```

### 一个简单示例

```ts
import { createServerProxyFactory } from '@opentiny/tiny-robot-chat'

const models = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai' },
  { value: 'deepseek-chat', label: 'DeepSeek Chat', provider: 'deepseek' },
]

const providerFactories = [
  createServerProxyFactory({
    provider: 'openai',
    endpoint: '/api/openai/chat',
  }),
  createServerProxyFactory({
    provider: 'deepseek',
    endpoint: '/api/deepseek/chat',
  }),
]
```

然后传给黑盒：

```vue
<TrChat
  :models="models"
  :provider-factories="providerFactories"
  default-model="gpt-4o-mini"
/>
```

---

## Adapter：更适合配置驱动和脚手架

如果你的目标不是手写每一个 `models` 和 `providerFactories`，而是：

- 根据配置文件生成聊天应用
- 为脚手架提供统一输入
- 让业务只关心“配置”，不关心“拼装”

那么推荐使用 Adapter。

## `createChatAdapterFromConfig`

```ts
import { createChatAdapterFromConfig } from '@opentiny/tiny-robot-chat'

const adapter = createChatAdapterFromConfig({
  models: [
    { id: 'gpt-4o-mini', provider: 'openai', label: 'GPT-4o Mini' },
    { id: 'deepseek-chat', provider: 'deepseek', label: 'DeepSeek Chat' },
  ],
  providers: {
    openai: {
      type: 'openai-compatible',
      endpoint: '/api/openai/chat',
    },
    deepseek: {
      type: 'openai-compatible',
      endpoint: '/api/deepseek/chat',
    },
  },
  defaults: {
    model: 'gpt-4o-mini',
  },
  ui: {
    brand: { title: 'TinyRobot Chat' },
    welcome: {
      title: '你好，我是 TinyRobot',
      description: '欢迎开始对话。',
    },
  },
})
```

然后你可以继续用：

- `adapter.models`
- `adapter.providerFactories`
- `adapter.defaultModel`
- `adapter.createResponseProvider()`

或者直接生成预设 props：

```ts
import { createPresetChatProps } from '@opentiny/tiny-robot-chat'

const chatPreset = createPresetChatProps(adapter, {
  showHistory: true,
  showFeedback: true,
})
```

再交给黑盒组件：

```vue
<template>
  <TrChat v-bind="chatPreset" />
</template>
```

### 什么时候该用 Adapter

如果你符合下面任意一种情况，就建议你优先考虑 Adapter：

- 你要做 chat-cli
- 你要做模板工程
- 你要让“业务配置”和“聊天实现”解耦
- 你需要给多个项目复用同一套接入协议

---

## MCP 与工具调用

`packages/chat` 已经内置了面向 MCP 的状态管理入口：`useMcpManager`。

它负责：

- 管理已安装插件
- 汇总启用中的工具
- 处理插件启停、工具启停
- 通过 bridge 把真正的工具执行交给业务层

### 最小示例

```ts
import { useMcpManager } from '@opentiny/tiny-robot-chat'

const mcpManager = useMcpManager({
  initialPlugins: [],
  bridge: {
    async getTools() {
      return []
    },
    async callTool(toolCall) {
      return JSON.stringify({
        ok: true,
        tool: toolCall.function.name,
      })
    },
  },
})
```

如果你在做白盒页面，可以把它传给 `TrChat.Root`：

```vue
<TrChat.Root :chat-kit="chat" :mcp-manager="mcpManager">
  <TrChat.Layout>
    <!-- ... -->
  </TrChat.Layout>
</TrChat.Root>
```

### 为什么这里是 bridge 设计

这也是一个很重要的设计点。

`useMcpManager` 自己管理 UI 状态和插件状态，但真正的工具能力往往来自：

- 你的后端
- 你的 MCP 网关
- 你的插件系统

所以它不直接强耦合某一个固定实现，而是通过 `bridge` 交给调用方接入。

这样做的好处是：

- 组件库保持中立
- 更适合企业项目接自己的工具体系
- 更容易做白盒扩展

---

## 黑盒组件 `TrChat`

如果你只想知道“黑盒最常用什么”，先看这几个。

## 最常用 props

| Prop | 类型 | 说明 |
|:--|:--|:--|
| `responseProvider` | `ResponseProvider` | 单模型聊天入口 |
| `models` | `ModelOption[]` | 多模型列表 |
| `providerFactories` | `ModelProviderFactory[]` | 多模型 provider 工厂 |
| `defaultModel` | `string` | 默认模型 |
| `brand` | `BrandConfig` | 头部品牌配置 |
| `welcome` | `WelcomeConfig` | 欢迎区配置 |
| `prompts` | `PromptProps[]` | 欢迎区引导词 |
| `showHistory` | `boolean` | 是否显示历史能力 |
| `showFeedback` | `boolean` | 是否显示消息反馈按钮 |
| `messageListVariant` | `'bubble' \| 'docs'` | 消息列表展示形态 |
| `roleConfigs` | `BubbleListProps['roleConfigs']` | 自定义角色渲染 |
| `groupStrategy` | `BubbleListProps['groupStrategy']` | 消息分组策略 |
| `senderProps` | `SenderProps` | 透传给 Sender |
| `bubbleListProps` | `Omit<BubbleListProps, ...>` | 透传给 MessageList |
| `storage` | `ConversationStorageStrategy` | 会话存储策略 |
| `plugins` | `UseMessagePlugin[]` | 消息插件，例如工具调用插件 |

## 常用事件与回调

| 名称 | 类型 | 说明 |
|:--|:--|:--|
| `v-model:fullscreen` | `boolean` | 全屏状态 |
| `v-model:show` | `boolean` | 显示 / 隐藏状态 |
| `@update:model` | `string` | 当前模型变化 |
| `onFinish` | `(message) => void` | 回复完成 |
| `onError` | `(error) => void` | 请求失败 |
| `onModelChange` | `(model) => void` | 模型切换 |
| `onMessageAction` | `(payload) => void` | 消息操作回调 |

需要注意：

- `onMessageAction` 是 prop 回调，不是 Vue emit 事件。
- 如果你要监听它，在模板里需要写成 `:on-message-action="handleAction"`。

### 一个更完整的黑盒示例

```vue
<script setup lang="ts">
import {
  TrChat,
  createServerProxyFactory,
  type ChatMessageActionPayload,
} from '@opentiny/tiny-robot-chat'

const models = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai' },
  { value: 'deepseek-chat', label: 'DeepSeek Chat', provider: 'deepseek' },
]

const providerFactories = [
  createServerProxyFactory({
    provider: 'openai',
    endpoint: '/api/openai/chat',
  }),
  createServerProxyFactory({
    provider: 'deepseek',
    endpoint: '/api/deepseek/chat',
  }),
]

function handleMessageAction(payload: ChatMessageActionPayload) {
  console.log('message action:', payload)
}
</script>

<template>
  <TrChat
    :models="models"
    :provider-factories="providerFactories"
    default-model="gpt-4o-mini"
    :brand="{ title: '企业智能助手' }"
    :welcome="{
      title: '欢迎使用企业智能助手',
      description: '请选择一个模型并开始提问。',
    }"
    show-history
    show-feedback
    message-list-variant="bubble"
    :on-message-action="handleMessageAction"
  />
</template>
```

---

## 白盒组件体系

白盒模式下，你最常用的组件有这些：

| 组件 | 用途 |
|:--|:--|
| `TrChat.Root` | 提供聊天上下文与 MCP 上下文 |
| `TrChat.Layout` | 提供聊天容器、Bubble 环境、布局骨架 |
| `TrChat.Header` | 头部区域 |
| `TrChat.Welcome` | 欢迎页 |
| `TrChat.MessageList` | 消息列表 |
| `TrChat.Footer` | 底部区域 |
| `TrChat.Sender` | 输入发送区 |
| `TrChat.History` | 历史会话区 |

### 一个常见的白盒组合方式

```vue
<script setup lang="ts">
import {
  TrChat,
  TrModelSelector,
  useChatKit,
  useModelSelector,
  createServerProxyFactory,
} from '@opentiny/tiny-robot-chat'
import { computed, ref } from 'vue'

const models = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai' },
  { value: 'deepseek-chat', label: 'DeepSeek Chat', provider: 'deepseek' },
]

const providerFactories = [
  createServerProxyFactory({
    provider: 'openai',
    endpoint: '/api/openai/chat',
  }),
  createServerProxyFactory({
    provider: 'deepseek',
    endpoint: '/api/deepseek/chat',
  }),
]

const selectedModel = ref('gpt-4o-mini')

const chat = useChatKit({
  responseProvider: providerFactories[0].createProvider(models[0]),
})

const { selectModel } = useModelSelector({
  currentModel: selectedModel,
  models: computed(() => models),
  providerFactories: computed(() => providerFactories),
  chatKit: chat,
})
</script>

<template>
  <TrChat.Root :chat-kit="chat">
    <TrChat.Layout>
      <TrChat.Header title="研发助手" show-history />

      <TrChat.Welcome
        v-if="chat.messages.value.length === 0"
        title="你好，我是研发助手"
        description="你可以切换模型，然后开始提问。"
      />

      <TrChat.MessageList
        v-else
        auto-scroll
        variant="docs"
      />

      <TrChat.Footer>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <TrModelSelector
            v-model="selectedModel"
            :models="models"
            :provider-factories="providerFactories"
            @change="selectModel"
          />
          <TrChat.Sender placeholder="请输入你的问题" />
        </div>
      </TrChat.Footer>

      <TrChat.History />
    </TrChat.Layout>
  </TrChat.Root>
</template>
```

---

## `messageListVariant`：气泡模式与文档模式

消息列表现在支持两种展示风格：

```ts
type ChatListVariant = 'bubble' | 'docs'
```

### `bubble`

默认聊天气泡样式，适合：

- 通用助手
- IM 风格对话
- 普通问答场景

### `docs`

更接近文档阅读的消息布局，适合：

- 知识库问答
- 长回答阅读
- 文档总结
- AI 生成内容预览

黑盒用法：

```vue
<TrChat
  :response-provider="responseProvider"
  message-list-variant="docs"
/>
```

白盒用法：

```vue
<TrChat.MessageList variant="docs" />
```

---

## 消息操作与反馈

聊天应用里常见的消息操作包括：

- 复制
- 编辑
- 重新生成
- 点赞
- 点踩

黑盒下可以通过 `onMessageAction` 统一监听：

```vue
<script setup lang="ts">
function handleMessageAction(payload) {
  console.log(payload.action)
}
</script>

<template>
  <TrChat
    :response-provider="responseProvider"
    show-feedback
    :on-message-action="handleMessageAction"
  />
</template>
```

白盒下则可以直接在 `TrChat.MessageList` 上使用：

```vue
<TrChat.MessageList :on-action-click="handleMessageAction" />
```

这个设计的好处是：

- UI 交互统一
- 埋点更容易接
- 业务扩展入口更稳定

---

## 错误、重试与 optimistic

聊天应用不是只有“发消息”和“收消息”。  
真正可用的聊天产品，还需要处理失败和过渡态。

`packages/chat` 目前已经内置这些能力：

- 结构化错误信息 `lastError`
- 失败后 `retry()`
- optimistic 状态
- 失败回滚

示例：

```ts
const chat = useChatKit({
  responseProvider,
})

chat.sendMessage('你好')

if (chat.status.value === 'error') {
  await chat.retry()
}
```

如果你是新手，可以先记住一个简单原则：

> 不要自己额外写一层“发送中 / 失败 / 重试”的本地状态，优先复用 `useChatKit` 已经提供的状态与方法。

---

## 会话历史与存储

如果你希望会话历史可切换、可恢复，就需要给聊天提供存储策略。

```ts
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'

const chat = useChatKit({
  responseProvider,
  storage: localStorageStrategyFactory(),
})
```

然后黑盒只要打开：

```vue
<TrChat
  :response-provider="responseProvider"
  show-history
  :storage="storage"
/>
```

白盒则可直接组合：

```vue
<TrChat.History />
```

---

## 文案体系

`packages/chat` 已经把 chat 自己拥有的文案集中到了 `CHAT_MESSAGES`。

这意味着当前状态是：

- 文案已经集中管理
- 便于后续整体国际化
- 但还不是完整的 runtime i18n 方案

如果你现在只是要改默认文案，可以优先从 chat 层文案资源入手，而不是直接把整个项目绑到某个国际化框架上。

---

## 推荐的生产实践

这里非常重要，尤其是第一次做 AI 对话页的同学，建议认真看。

## 1. 优先走服务端代理，不要让浏览器直接持有 API Key

推荐：

```ts
createServerProxyProvider({
  endpoint: '/api/chat',
})
```

谨慎使用：

```ts
createOpenAIProvider({
  apiKey: 'sk-xxx',
})
```

原因很简单：

- 前者更安全
- 前者更容易接企业网关
- 前者更方便做统一审计、风控和限流

这也是业界常见做法。Vercel 的 AI SDK 文档和其课程材料都强调，实际应用通常要通过服务端 route / proxy 来保护密钥并统一处理请求。Vue 官方文档也长期推荐通过 `provide/inject` 组合上下文，而不是把状态和 UI 硬耦合在一个超大组件里。[Vercel AI SDK docs](https://sdk.vercel.ai/docs/getting-started/vue) [Vercel AI Academy](https://vercel.com/academy/ai-sdk/basic-chatbot) [Vue provide/inject](https://vuejs.org/guide/components/provide-inject)

## 2. 先黑盒，后白盒

如果你的目标是尽快交付，建议：

1. 先用 `TrChat`
2. 把 provider、欢迎页、模型切换、历史跑通
3. 确认交互没有问题后，再逐步切白盒

这样做通常比“一上来就全白盒自定义”更稳。

## 3. 配置驱动优先于散落式手写

如果项目后面会有：

- 多个聊天页面
- 模板生成
- 不同团队复用

那尽量把模型和 provider 接入收敛为配置，再通过 Adapter 生成，而不是每个页面都各自手写一套模型工厂。

## 4. 把 MCP bridge 当成业务接入层，不要把工具逻辑塞进 UI

UI 组件负责展示和交互；
真正的工具执行、插件管理、权限控制，应该尽量留在业务桥接层。

## 5. 不要把 demo 当成生产规范

这一点也很重要。

demo 的价值是：

- 方便调试
- 验证 API
- 回归测试

但生产项目更应该以：

- `createServerProxyProvider`
- `createChatAdapterFromConfig`
- `createPresetChatProps`
- `useChatKit`

这些稳定 API 为准。

---

## 常见问题

## 我应该选黑盒还是白盒？

先问自己两个问题：

1. 我是不是只是想尽快把聊天页面做出来？
2. 我是不是已经明确要自定义布局和交互？

如果第一个问题回答“是”，优先黑盒。  
如果第二个问题回答“是”，优先白盒。

## 什么时候该用 Adapter？

当你需要：

- 配置驱动
- 脚手架生成
- 多项目复用
- 降低手写接入复杂度

就应该优先用 Adapter。

## `packages/chat` 和 `@opentiny/tiny-robot` 是什么关系？

可以理解成：

- `@opentiny/tiny-robot` 提供基础聊天 UI 组件
- `@opentiny/tiny-robot-chat` 提供“如何把这些组件和聊天状态真正组装起来”的能力

## `packages/chat` 和 `@opentiny/tiny-robot-kit` 是什么关系？

可以理解成：

- `@opentiny/tiny-robot-kit` 负责消息、会话、请求这些底层能力
- `@opentiny/tiny-robot-chat` 在此基础上封装出面向页面开发的聊天套件

---

## 导出清单

当前这个包对外最常用的导出包括：

### 组件

- `TrChat`
- `TrChat.Root`
- `TrChat.Layout`
- `TrChat.Header`
- `TrChat.Welcome`
- `TrChat.MessageList`
- `TrChat.Footer`
- `TrChat.Sender`
- `TrChat.History`
- `TrModelSelector`
- `TrChatFeedback`
- `TrChatMcpPanel`

### Composables

- `useChatKit`
- `useMcpManager`
- `useModelSelector`
- `useChatFeedback`
- `useDefaultBubbleConfig`

### Provider / Factory

- `createServerProxyProvider`
- `createServerProxyFactory`
- `createOpenAIProvider`
- `createDeepSeekProvider`
- `createOpenAIFactory`
- `createDeepSeekFactory`

### Adapter

- `loadChatConfig`
- `createChatAdapterFromConfig`
- `createPresetChatProps`

---

## 结语

如果你只想快速开始，记住下面这条路线就够了：

1. 先准备一个 `ResponseProvider`
2. 先用黑盒 `TrChat`
3. 需要多模型时接 `models + providerFactories`
4. 需要配置驱动时接 Adapter
5. 需要深度定制时切白盒 `Root + Layout + MessageList + Sender`

这样你既不会一开始就陷入过度设计，也能在后续平滑演进到更复杂的聊天应用。
