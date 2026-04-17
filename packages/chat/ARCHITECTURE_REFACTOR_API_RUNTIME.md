# Chat Refactor API And Runtime Design

## 1. 文档角色

本文档回答的是：

- 新的对外 API 应该长什么样
- 用户应该如何理解 `TrChat` 与 `TrChat.Root`
- 黑盒配置应该怎样组织才能减少困惑
- runtime、消息模型、UI primitives、slots、扩展点应如何分层

它不负责 phase 与任务拆解；那部分见：

- [ARCHITECTURE_REFACTOR_EXECUTION.md](./ARCHITECTURE_REFACTOR_EXECUTION.md)

## 2. 对外心智模型

### 2.1 正式用法 A：`TrChat`

`TrChat` 是默认接入入口。

它面向的诉求是：

- 少量配置即可跑起完整聊天页
- 使用官方默认 runtime
- 在不理解内部装配层的前提下，完成模型、消息、sender、workspace、history、MCP 等能力配置

示意：

```vue
<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'

const config = {
  request: {
    models: [
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', providerId: 'openai' },
    ],
    defaultModelId: 'gpt-4.1-mini',
    transport: {
      type: 'openai-compatible',
      endpoint: '/api/chat/completions',
    },
  },
  ui: {
    brand: { title: 'TinyRobot Chat' },
    welcome: { title: '你好，我是 AI 助手' },
  },
}
</script>

<template>
  <TrChat :config="config" />
</template>
```

### 2.2 正式用法 B：`TrChat.Root`

`TrChat.Root` 是高级定制入口。

它面向的诉求是：

- 用户自己带 runtime
- 继续使用官方默认页面
- 或者只复用官方 primitives

示意 A：自带 runtime，继续用官方页面

```vue
<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'

const runtime = createExternalRuntime()
const ui = {
  brand: { title: 'Internal Chat' },
}
</script>

<template>
  <TrChat.Root :runtime="runtime" :ui="ui">
    <TrChat.Page />
  </TrChat.Root>
</template>
```

示意 B：自带 runtime，白盒拼装

```vue
<template>
  <TrChat.Root :runtime="runtime" :ui="ui">
    <TrChat.Header />
    <TrChat.MessageList />
    <TrChat.Sender />
  </TrChat.Root>
</template>
```

### 2.3 不再作为主要用户心智的概念

以下概念不再作为主要对外使用阶段：

- `Scaffold`
- `Provider`
- `Controlled`
- `presetOverrides`
- `integrations`
- `events`
- `overrides`

可以作为内部实现概念保留，但不应成为面向接入方的主要文档入口。

### 2.4 唯一升级梯子

建议只对外讲这一条升级路径：

1. 默认接入：`TrChat`
2. 自带 runtime 但继续使用官方默认页面：`TrChat.Root + TrChat.Page`
3. 自己拼页面：`TrChat.Root + primitives`

这样用户不需要先理解内部的 preset、provider、scaffold 分层，先按接入深度选入口即可。

补充约束：

- `TrChat` 和 `TrChat.Root` 是两层正式入口
- `TrChat.Page` 是官方默认页面组件，不是第三层入口

## 3. 正式公开 API 结构

### 3.1 公开入口层

建议正式公开的高层入口如下：

- `TrChat`
  黑盒默认入口
- `TrChat.Root`
  runtime 根节点

### 3.2 官方页面组件

- `TrChat.Page`
  官方默认页面组件，用于 `TrChat.Root` 之上的默认页面组合

### 3.3 公开 primitives

建议正式公开的 whitebox primitives：

- `TrChat.Header`
- `TrChat.MessageList`
- `TrChat.Message`
- `TrChat.Sender`
- `TrChat.Footer`
- `TrChat.History`
- `TrChat.ModelSelector`
- `TrChat.WorkspaceShell`
- `TrChat.Attachments`
- `TrChat.McpTrigger`
- `TrChat.McpPanel`

说明：

- `TrChat.Page` 是“官方默认页面”的正式对外名字
- `preset` 可以继续作为内部实现词汇，但不建议作为主要用户 API 名称

## 4. 黑盒配置模型

## 4.1 设计目标

黑盒配置必须满足三件事：

- 用户只看一个主对象就能完成默认接入
- 配置按功能域组织，而不是按“阶段”组织
- 配置表达的是稳定默认值，不再把外部 runtime 或页面临时行为混进去

### 4.2 建议结构

```ts
type TrChatConfig = {
  request: ChatRequestConfig
  conversation?: ChatConversationConfig
  ui?: ChatUiConfig
  workspace?: ChatWorkspaceConfig
  messages?: ChatMessagesConfig
  sender?: ChatSenderConfig
  attachments?: ChatAttachmentsConfig
  history?: ChatHistoryConfig
  mcp?: ChatMcpConfig
  lifecycle?: ChatLifecycleConfig
}
```

### 4.3 各功能域职责

#### `request`

负责模型、provider、transport、默认模型等请求相关能力。

它表达的是 AI 服务接入基础设置，不是某一次发送时临时拼装的 request payload。

```ts
type ChatRequestConfig = {
  models: ChatModelOptionInput[]
  defaultModelId?: string | null
  transport: ChatTransportConfig
  systemPrompt?: string
}
```

#### `conversation`

负责会话初始化与持久化类能力。

```ts
type ChatConversationConfig = {
  initialMessages?: ChatSeedMessage[]
  persistence?: ChatPersistenceConfig
}
```

#### `ui`

负责品牌、欢迎区、appearance、copy、内容宽度等展示默认值。

```ts
type ChatUiConfig = {
  brand?: ChatBrandConfig
  welcome?: ChatWelcomeConfig
  appearance?: ChatAppearanceConfig
  contentLayout?: 'centered' | 'wide'
  copy?: ChatCopyOverrides
}
```

#### `workspace`

负责 workspace shell 默认结构与区域配置。

```ts
type ChatWorkspaceConfig = {
  enabled?: boolean
  left?: ChatWorkspaceRegionConfig
  right?: ChatWorkspaceRegionConfig
  defaultView?: 'stacked' | 'workspace'
}
```

#### `messages`

负责消息相关扩展，包括渲染、动作、反馈、结果变换。

```ts
type ChatMessagesConfig = {
  actions?: ChatMessageActionDefinition[]
  actionMode?: 'append' | 'replace'
  renderers?: ChatMessageRendererRegistry
  feedback?: ChatFeedbackConfig
  transforms?: ChatMessageTransformHooks
}
```

#### `sender`

负责发送区输入、交互和默认动作。

```ts
type ChatSenderConfig = {
  placeholder?: string
  mode?: 'single' | 'multiple'
  maxLength?: number
  wordCount?: boolean
  voice?: ChatVoiceConfig
}
```

#### `attachments`

负责上传能力与附件列表默认表现。

```ts
type ChatAttachmentsConfig = {
  enabled?: boolean
  upload?: ChatAttachmentUploadConfig
  list?: ChatAttachmentListConfig
}
```

#### `history`

负责历史会话列表默认可见性与交互配置。

```ts
type ChatHistoryConfig = {
  enabled?: boolean
  defaultOpen?: boolean
}
```

#### `mcp`

负责 MCP bridge、面板与 trigger 的默认配置。

```ts
type ChatMcpConfig = {
  enabled?: boolean
  bridge?: ChatMcpBridge
}
```

#### `lifecycle`

负责黑盒模式下最常见的流程节点处理。

```ts
type ChatLifecycleConfig = {
  beforeSend?: ChatBeforeSendHandler
  afterReceive?: ChatAfterReceiveHandler
  error?: ChatErrorHandler
  modelChange?: ChatModelChangeHandler
  conversationChange?: ChatConversationChangeHandler
}
```

### 4.4 为什么采用 `ui / lifecycle`

这里再明确两条命名判断：

- 用 `ui`，不用 `page`
  因为 `TrChat.Page` 已经是官方默认页面组件，配置域再叫 `page` 会在用户心智里形成三层重名
- 用 `lifecycle`，不用 `handlers`
  因为这组配置承载的是流程节点处理，不是泛化的任意 handler 桶

`ui` 只负责展示默认值与文案品牌配置，不承载 workspace 壳层语义或消息行为扩展。
`workspace` 负责视图模式、左右区域、rail/sheet/mobile fallback 等壳层能力。
`messages` 负责消息动作、渲染器、反馈、变换等消息扩展。
`lifecycle` 只负责发送、接收、错误、模型变化、会话变化等流程节点处理。

### 4.5 为什么不再使用 `callbacks / presetOverrides / integrations`

旧方案的问题不是能力不够，而是同类能力被拆散到了多个阶段概念里。

新的判断规则应该是：

- 改稳定默认值：写进 `config.<domain>`
- 改局部结构：用 slot
- 自己带 runtime 或自己拼页面：进 `TrChat.Root`

### 4.6 边界速查表

| 领域 | 负责什么 | 不负责什么 |
| --- | --- | --- |
| `ui` | 品牌、欢迎区、appearance、copy、内容宽度等展示默认值 | workspace 壳层语义、消息扩展、流程节点处理 |
| `workspace` | 视图模式、左右区域、rail/sheet/mobile fallback | 品牌文案、消息渲染、发送接收流程回调 |
| `messages` | actions、renderers、feedback、transforms | 发送前后回调、模型切换回调、会话切换回调 |
| `lifecycle` | beforeSend、afterReceive、error、modelChange、conversationChange | 消息动作定义、消息渲染、workspace 区域结构 |

## 5. `TrChat.Root` 合同

### 5.1 Root props

```ts
type TrChatRootProps = {
  runtime: ChatRuntimeInput
  ui?: TrChatRootUiConfig
}
```

说明：

- `runtime` 是 source of truth
- `ui` 是展示默认值
- `Root` 不负责 transport 配置解析
- `Root` 不负责黑盒配置投影

### 5.2 `ui` 的作用

`ui` 只服务这两类场景：

- `TrChat.Page` 读取品牌、欢迎区、copy、appearance 等默认展示配置
- whitebox primitives 读取必要的展示默认值

`ui` 不能替代 runtime source of truth。

`ui` 也不能承载这类能力：

- `workspace.defaultView`
- `workspace.left`
- `workspace.right`
- `workspace.mobile-left`
- `workspace.mobile-right`

这些壳层能力统一归 `workspace`。

`ui` 也不能承载这类行为级能力：

- `messages.actions`
- `messages.renderers`
- `messages.feedback`
- `messages.transforms`
- `lifecycle.beforeSend`
- `lifecycle.afterReceive`
- `lifecycle.error`

这些能力在黑盒模式下归 `config.messages.*` 或 `config.lifecycle.*`，在 Root 模式下归 runtime + primitives / slots。

例如：

- 当前模型来自 `model runtime`
- 当前消息列表来自 `conversation runtime`
- 当前 sender draft 来自 `sender runtime`

## 6. runtime 模型

### 6.1 总原则

runtime 只按 source of truth 切分，不按“页面上有没有一个按钮”切分。

优先冻结的一级 runtime modules：

- `conversation`
- `sender`
- `message`
- `history`
- `models`
- `workspace`
- `attachments`

### 6.2 `ChatRuntimeInput`

```ts
type ChatRuntimeInput = {
  conversation: ChatConversationRuntime
  sender?: ChatSenderRuntime
  message?: ChatMessageRuntime
  history?: ChatHistoryRuntime
  models?: ChatModelRuntime
  workspace?: ChatWorkspaceRuntime
  attachments?: ChatAttachmentsRuntime
}
```

### 6.3 `ChatRuntime`

```ts
type ChatRuntime = {
  conversation: ChatConversationRuntime
  sender: ChatSenderRuntime
  message: ChatMessageRuntime
  history?: ChatHistoryRuntime
  models?: ChatModelRuntime
  workspace?: ChatWorkspaceRuntime
  attachments?: ChatAttachmentsRuntime
}
```

说明：

- `ChatRuntimeInput`
  用户输入，可缺省部分模块
- `ChatRuntime`
  `Root` 补齐后的标准化 runtime，供内部消费

### 6.4 capability 的定位

`capability` 仍然有价值，但建议降级为内部推导结果，而不是主要用户输入。

原因：

- 对用户来说，“有没有这个 runtime / 有没有这个 action”已经足够表达能力
- 对内部来说，按钮显隐和行为判断仍然需要能力推导

因此推荐：

- `ChatRuntimeInput` 不要求用户自己写 capability
- `resolveRuntimeCapabilities(runtime)` 作为内部 helper 存在

## 7. 消息模型

### 7.1 最小硬约束

新的消息模型必须满足：

- 每条消息有稳定 `id`
- UI 不再依赖 message 对象 identity
- UI 不再依赖 index 作为正式动作定位依据
- UI 交互状态不再写回消息对象

### 7.2 建议结构

```ts
type ChatUIMessage = {
  id: string
  role: 'system' | 'user' | 'assistant' | 'tool'
  parts: ChatUIMessagePart[]
  meta?: ChatUIMessageMeta
}
```

### 7.3 message-level action 规则

所有消息级动作都以 `messageId` 为正式定位入口。

例如：

- `edit`
- `retry`
- `regenerate`
- `copy`
- `feedback`

都不再依赖：

- `message === sourceMessage`
- `messageIndex`
- 隐藏属性

## 8. source of truth 规则

### 8.1 必须唯一归属的数据

| 数据 | 唯一 source of truth |
| --- | --- |
| 当前会话消息列表 | `conversation runtime` |
| 当前会话整体状态 | `conversation runtime` |
| 输入框草稿 | `sender runtime` |
| 待发送附件 | `sender runtime` |
| 单条消息编辑态 / 错误态 / busy 态 | `message runtime` |
| 历史会话列表与当前选中会话 | `history runtime` |
| 当前模型 | `model runtime` |
| workspace 左右栏 / history open state / mobile state | `workspace runtime` |

### 8.2 `sender` 与 `attachments` 的关系

这组边界必须明确写死：

- `sender runtime`
  拥有“待发送附件”的 source of truth
- `attachments runtime`
  只拥有上传、解析、预览、复用型附件能力

也就是说：

- 待发送附件只能有一个权威归属
- 不能同时让 `sender` 和 `attachments` 两边都成为可写 source of truth

## 9. primitives 读取边界

为了避免重新退化成“大 runtime 注入”，建议冻结一张 primitive 读取边界表。

| Primitive | 允许读取的运行时 |
| --- | --- |
| `TrChat.Page` | `workspace + ui` |
| `TrChat.Header` | `conversation + history + models + workspace + ui` |
| `TrChat.MessageList` | `conversation + message + ui` |
| `TrChat.Message` | `message item runtime + ui` |
| `TrChat.Sender` | `sender + attachments + ui` |
| `TrChat.History` | `history + workspace + ui` |
| `TrChat.ModelSelector` | `models + ui` |
| `TrChat.WorkspaceShell` | `workspace + ui` |

原则：

- `TrChat.Page` 只负责官方页面结构、slot 编排和默认组合关系
- primitive 不直接读“整个 runtime”
- 读不到的能力，就不能顺手消费

## 10. slots 与扩展路径

### 10.1 用户如何判断从哪一层扩展

推荐唯一扩展路由如下：

| 需求 | 正式入口 |
| --- | --- |
| 改稳定默认值 | `TrChat.config.<domain>` |
| 改品牌、文案、appearance、内容宽度 | `config.ui` |
| 改 workspace 视图、左右区域、mobile fallback | `config.workspace` |
| 响应发送、接收、错误、模型切换、会话切换 | `config.lifecycle` |
| 替换默认页面局部区域 | `slot` |
| 自己带 runtime 但继续用默认页面 | `TrChat.Root + TrChat.Page` |
| 自己拼页面 | `TrChat.Root + primitives` |
| 扩展消息动作 / renderer / transform | 黑盒：`config.messages.*`；Root：`message runtime + primitives / slots` |

### 10.2 slot 优先级规则

必须冻结下面的规则：

- 替换型 slot 一旦出现，对应区域的默认结构停止生效
- 对应区域的配置项如果还要继续生效，必须显式通过 slot props 透出
- 不允许出现“slot 替换了结构，但 overrides 还在背后部分生效”的隐式混合状态

## 11. message extension contract

这组能力在当前实现里已经形成完整链路，必须作为正式 contract 冻结：

- `messageActions`
- `feedback`
- `bubbleRenderers`
- `messageTransforms`
- 默认 renderer 注册顺序

建议正式冻结的约束：

- action merge / replace 规则
- operation / action 两类 placement
- action 去重规则
- action 执行回调归 action 定义自身，不再通过顶层 `lifecycle` 二次承接
- error / editing / optimistic / tool_calls / attachments 的默认 renderer 命中顺序
- transform 后的消息仍然能继续进入 renderer / action 链

## 12. workspace 与 history contract

workspace 不是单纯的壳层视觉能力，而是当前产品的真实交互主路径。

必须冻结的 contract：

- `left`
- `left-rail`
- `right`
- `mobile-left`
- `mobile-right`

以及这些行为：

- stacked / workspace / mobile 下 history 的 open / close / collapse 语义
- left/right region 的 rail / hidden 模式
- workspace 默认 sidebar / right panel / mobile sheet 的 fallback 规则

## 13. 仍需评审拍板的点

下面这些点仍然值得继续评审，但它们不应该阻塞前述边界冻结：

- runtime 是否未来下沉到 `packages/kit`
- `TrChat.Page` 内部是否拆成多个实现组件
- 哪些 helper 最终公开，哪些仅内部保留
- inspector/debug API 是否正式公开

## 14. 推荐结论

推荐的新 API 结论如下：

- 正式对外只讲 `TrChat` 和 `TrChat.Root`
- `TrChat.Page` 作为官方默认页面组件公开
- 黑盒只保留一个主配置对象，并按功能域组织
- `config.ui` 和 `config.lifecycle` 作为正式命名
- `ui` 只负责展示默认值；`workspace` 负责壳层与区域语义；`messages` 负责消息扩展；`lifecycle` 负责流程节点处理
- runtime 按 source of truth 切分
- capabilities 降级为内部派生结果，不再成为主要用户输入
- slot、runtime、message extension、workspace/history 的边界先冻结，再进入实现
