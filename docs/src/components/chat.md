---
outline: deep
---

# Chat

`@opentiny/tiny-robot-chat` 是一个面向 Vue 的聊天套件。  
它不是单一组件，也不是单纯的状态 hook，而是一层把聊天 UI、消息状态、模型切换、会话管理、错误处理、工具调用和配置能力组装起来的场景层。

如果用一句话概括它的定位：

> `@opentiny/tiny-robot` 负责原子 UI，`@opentiny/tiny-robot-kit` 负责消息与会话状态，`@opentiny/tiny-robot-chat` 负责把它们组合成真正可用、可配置、可模板化的 chat kit。

它当前的目标，不只是让页面“能聊起来”，还要作为 `chat-cli` 的能力基座，让用户可以基于稳定配置快速生成聊天应用。

---

## 为什么需要它

很多团队在做聊天页面时，都会遇到类似问题：

- 已经有 `Bubble`、`Sender`、`Prompts` 等基础组件，但不知道怎样把它们真正串成一个可维护的聊天应用。
- 发送消息不难，但会话历史、模型切换、重试、流式状态、消息编辑、工具调用很快就变复杂。
- 黑盒方案落地快，但不够灵活；纯 hook 方案自由度高，但初始接入成本又太高。
- 新项目想快速起步，老项目又希望按需定制，而且后续还可能接脚手架、模板和能力扩展。

`packages/chat` 的作用，就是在这些需求之间做平衡：

- 提供一个可直接落地的黑盒聊天组件。
- 同时保留白盒组合能力，支持更深度的定制。
- 把高频聊天能力统一为稳定的场景入口，而不是让业务方自己反复手拼。
- 为 `chat-cli` 和后续模板体系提供清晰、可复用的基础能力面。

---

## 它和其他包的关系

建议把它理解成三层：

### UI 层

来源：`@opentiny/tiny-robot`

负责：

- `Bubble`
- `Sender`
- `Prompts`
- `History`
- 图标、按钮、容器、布局原子能力

这一层主要解决：

- 页面长什么样
- 组件怎么渲染

### 状态与请求层

来源：`@opentiny/tiny-robot-kit`

负责：

- 消息列表
- 会话切换
- 流式回复
- 中断请求
- 存储策略
- 工具调用消息流

这一层主要解决：

- 消息怎么流动
- 请求状态怎么管理

### Chat 组装层

来源：`@opentiny/tiny-robot-chat`

负责：

- 黑盒 `TrChat`
- 白盒 `TrChat.Root / Layout / Header / MessageList / Sender / History`
- `useChatKit`
- `useModelSelector`
- `useMcpManager`
- Adapter / Preset

这一层主要解决：

- 如何把 UI 和状态真正组合成一个聊天应用
- 如何让黑盒、白盒、配置驱动和模板生成共用同一能力底座

---

## 当前适合谁使用

它尤其适合这些场景：

- 你想快速做一个“能用的聊天页”，不想从零组装消息区、输入区、历史区。
- 你已经有自己的业务页面结构，但希望复用聊天状态管理、模型切换、错误重试、会话历史等能力。
- 你要做一个可配置的 chat kit，后续还会接入脚手架或模板系统。
- 你希望同时支持“快速接入”和“深度定制”。

不建议把它直接理解成：

- 大模型 SDK
- 后端代理服务
- 纯视觉组件集合
- demo 代码本身

`demo` 只是开发阶段的验证页面，不应该直接当成生产实现照搬。

---

## 当前能力概览

截至当前版本，`packages/chat` 已经具备这些稳定基础：

- 黑盒能力：`TrChat`
- 白盒能力：`TrChat.Root / Layout / Header / Welcome / MessageList / Footer / Sender / History`
- 配置链路：`config -> adapter -> preset -> TrChat`
- 多模型切换
- MCP 基础链路
- 结构化错误与重试
- optimistic / rollback
- docs / bubble 两种消息展示形态
- 统一消息动作入口

也就是说，当前的 `packages/chat` 已经不是“只有 demo 原型”的状态，而是已经具备一套较稳定的聊天应用骨架。

但它的扩展方向仍然很明确：后续会继续把一些高价值聊天能力沉淀为更稳定的场景能力，例如：

- attachments
- sender actions
- suggestions
- 更正式的 MCP config 化
- 更完整的 layout variant

---

## 推荐的接入路径

如果你是第一次使用，建议按这个顺序理解和接入。

### 路径 1：黑盒优先

适合：

- 想先快速跑通
- 先验证产品方向
- 还不打算自定义太多布局

推荐顺序：

1. 先准备一个 `ResponseProvider`
2. 再用 `TrChat` 跑通最小页面
3. 如果要多模型，再补 `models + providerFactories`
4. 如果要配置驱动或接入脚手架，再使用 Adapter

### 路径 2：白盒进阶

适合：

- 已经有自己的页面结构
- 需要自定义 Header / Welcome / Sender / History 的组合方式
- 希望复用同一套状态能力，但自己控制布局

推荐顺序：

1. 使用 `useChatKit`
2. 通过 `TrChat.Root + TrChat.Layout` 建立上下文
3. 按需组合白盒子组件

### 路径 3：配置驱动 / chat-cli 基座

适合：

- 需要统一配置输入
- 想让项目通过脚手架或模板生成
- 不希望每个项目都手写 `models` 和 `providerFactories`

推荐顺序：

1. 定义 `ChatConfig`
2. 使用 `createChatAdapterFromConfig`
3. 使用 `createPresetChatProps`
4. 让 `TrChat` 消费 preset 结果

如果你的目标是 `chat-cli` 或模板生成，这条路径通常是最推荐的。

---

## 最小黑盒示例

这是最推荐的新手起步方式。

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
      title: 'Welcome to TinyRobot',
      description: 'Ask me anything.',
    }"
    :prompts="[
      { label: 'Explain Vue composables', description: 'Explain Vue composables' },
      { label: 'Write a Python function', description: 'Write a Python function' },
    ]"
    show-history
    show-feedback
  />
</template>
```

这个模式的特点是：

- 上手快
- 默认结构完整
- 适合先把主链路跑通

---

## 最小白盒示例

当你需要自定义布局时，可以用白盒模式。

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
      <TrChat.Header title="Knowledge Chat" show-history />

      <TrChat.Welcome
        v-if="chat.messages.value.length === 0"
        title="Welcome"
        description="Start with a question."
        :prompts="[
          { label: 'Introduce this project', description: 'Introduce this project' },
          { label: 'Summarize recent changes', description: 'Summarize recent changes' },
        ]"
        @prompt-click="chat.sendMessage"
      />

      <TrChat.MessageList v-else auto-scroll />

      <TrChat.Footer>
        <TrChat.Sender placeholder="Ask anything..." />
      </TrChat.Footer>

      <TrChat.History />
    </TrChat.Layout>
  </TrChat.Root>
</template>
```

白盒的价值不在于“更复杂”，而在于：

- 复用同一套 chat 状态能力
- 由你决定页面布局和业务插槽

---

## 为什么推荐 Adapter 作为长期入口

从长期维护和模板生成角度看，`Adapter` 往往比手写 `models + providerFactories` 更适合当正式入口。

原因有三点：

1. 更适合配置驱动  
   业务只需要描述模型、provider 和基础 UI，而不是自己拼装每一层对象。

2. 更适合脚手架和模板  
   `chat-cli` 需要的是稳定输入，而不是每次在模板里写很多手工逻辑。

3. 更适合能力扩展  
   未来如果 attachments、suggestions、MCP config 等能力继续进入配置层，Adapter 会成为最自然的汇聚点。

示例：

```ts
import { createChatAdapterFromConfig, createPresetChatProps } from '@opentiny/tiny-robot-chat'

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
      title: 'Welcome to TinyRobot',
      description: 'Ask anything.',
    },
  },
})

const chatPreset = createPresetChatProps(adapter, {
  showHistory: true,
  showFeedback: true,
})
```

然后直接交给 `TrChat`：

```vue
<template>
  <TrChat v-bind="chatPreset" />
</template>
```

如果你的目标是：

- 多项目复用
- 脚手架生成
- 后续模板扩展

那建议默认把 Adapter 视为主路径。

---

## 黑盒、白盒、Adapter 之间的关系

可以这样理解三者：

### 黑盒

回答的问题是：

> “我想最快获得一个完整聊天页。”

### 白盒

回答的问题是：

> “我想保留聊天状态能力，但页面布局我要自己控制。”

### Adapter

回答的问题是：

> “我不想每个项目都手写装配逻辑，我希望通过配置或模板稳定生成。”

这三者并不是互相排斥的。

最理想的使用方式通常是：

- 先用黑盒快速起步
- 有定制需求时切白盒
- 当你需要配置驱动和模板生成时，再用 Adapter 收口

---

## MCP 与工具调用

当前 `packages/chat` 已经支持 MCP 基础链路，但它的定位要讲清楚：

- `packages/chat` 负责提供聊天场景下的 MCP 入口和接入结构
- 工具能力本身应由你的业务 bridge 或服务端来承接
- UI 不应该直接承载业务工具逻辑

这也是为什么当前 MCP 采用的是 bridge 思路：  
chat 负责提供调用入口和面板基础，业务层负责把具体工具能力接进来。

这一设计也符合 MCP 官方思路：UI 是协议和能力面的消费层，不是协议本身。

参考：

- <https://modelcontextprotocol.io/docs/getting-started/intro>

---

## 生产环境建议

这是最重要的一部分之一。

### 1. 优先走服务端代理，不要让浏览器直接持有模型 API Key

最推荐的生产方式是：

- 前端通过 `createServerProxyProvider()` 调用你自己的 `/api/chat`
- 服务端再去访问真实模型平台

这样做的好处：

- 浏览器不直接暴露 API Key
- 更容易做权限、审计、限流
- 更容易接入多模型与企业内部策略

这和 Vercel AI SDK 官方教程强调的前后端分层思路是一致的。

参考：

- <https://vercel.com/academy/ai-sdk/basic-chatbot>
- <https://sdk.vercel.ai/docs/getting-started/vue>

### 2. 先黑盒，后白盒

对于大多数项目来说，先用黑盒跑通主链路，再按需拆成白盒，会比一开始就手工装配更稳。

### 3. 配置驱动优先于散落式手写

如果你的项目会长期维护、会复制到多个业务、会接脚手架或模板，那么尽量优先：

- `ChatConfig`
- `Adapter`
- `Preset`

而不是让每个页面都手写一份装配逻辑。

### 4. 不要把 demo 当成生产规范

demo 主要用于：

- 验证组件行为
- 验证能力边界
- 验证交互链路

它不是生产默认实现。

---

## 当前对 chat-cli 的价值

`packages/chat` 当前之所以重要，不只是因为它能渲染一个聊天页面，而是因为它正在形成一个适合 `chat-cli` 消费的稳定基座。

当前已经具备的基础包括：

- 黑盒与白盒的统一能力底座
- `config -> adapter -> preset` 链路
- 多模型与 provider 工厂
- MCP 基础接入
- retry / optimistic / rollback
- docs / bubble 形态切换

这意味着 `chat-cli` 不需要再把主要精力放在手工拼装聊天能力上，而可以逐步转向：

- 基于配置生成项目
- 基于能力组合生成模板
- 基于稳定 preset 输出生成页面

从这个角度说，`packages/chat` 当前最重要的价值，不只是“组件库”，而是：

> 作为 `chat-cli` 的功能基座，提供稳定、声明式、可模板化的 chat 能力面。

---

## 当前边界与后续方向

当前已经稳定的，是聊天应用的核心骨架。  
接下来更值得继续沉淀的方向包括：

- attachments
- sender actions
- suggestions
- 更正式的 MCP config 化
- 更完整的 layout variant

这些方向的共同特点是：

- 都是聊天场景高频能力
- 都不适合只停留在 demo 手工拼装层
- 都适合进入 `config / adapter / preset` 这条正式链路

也正因为如此，`packages/chat` 后续的重点不再是“继续补基础”，而是：

> 把已有运行时能力进一步系统化升级为稳定的 feature 契约。

---

## 常见问题

### 我应该先用黑盒还是白盒？

如果你只是想快速跑通，先用黑盒。  
如果你明确知道自己要自定义布局、控制插槽和区块编排，再用白盒。

### 什么情况下应该优先用 Adapter？

当你遇到这些需求时：

- 不想手写 `models + providerFactories`
- 需要统一配置输入
- 希望接入 `chat-cli`
- 希望未来做模板或多项目复用

通常就应该优先用 Adapter。

### `packages/chat` 和 `@opentiny/tiny-robot` 是什么关系？

`@opentiny/tiny-robot` 是原子 UI 层。  
`packages/chat` 不替代它，而是在聊天场景下把这些 UI 组件系统化组合起来。

### `packages/chat` 和 `@opentiny/tiny-robot-kit` 是什么关系？

`@opentiny/tiny-robot-kit` 更偏状态与请求能力。  
`packages/chat` 则把这些状态能力与 TinyRobot UI 结合成聊天场景层。

---

## 总结

`@opentiny/tiny-robot-chat` 当前最重要的意义，不只是提供一个 `TrChat` 组件，而是提供一条稳定的聊天应用组装链路：

```text
ChatConfig
  -> Adapter
  -> Preset
  -> TrChat / White-box Composition
```

如果你是新手，建议先从黑盒开始。  
如果你要深度定制，就使用白盒。  
如果你要做长期维护、模板生成或 `chat-cli` 集成，就尽量把 Adapter 当成正式入口。

这也是它和普通聊天 demo 最大的区别：  
它不是只让页面“能聊起来”，而是试图成为一个真正可复用、可扩展、可生成的 chat kit 基座。
