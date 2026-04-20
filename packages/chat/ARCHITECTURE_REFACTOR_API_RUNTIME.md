# Chat Refactor API And Runtime Design

Status: settled API/runtime contract draft for implementation.

This document defines the target public mental model, runtime ownership, and development-stage implementation contract.
When this file conflicts with the historical proposal, this file wins.

## 1. 文档角色

本文档回答的是：

- 新的对外 API 应该长什么样
- 用户应该如何理解 `TrChat` 与 `TrChat.Root`
- 黑盒配置应该怎样组织才能减少困惑
- runtime、消息模型、UI primitives、slots、扩展点应如何分层

它不负责 phase 与任务拆解；那部分见：

- [ARCHITECTURE_REFACTOR_EXECUTION.md](./ARCHITECTURE_REFACTOR_EXECUTION.md)

## 2. 对外心智模型

重要说明：

- 本文件描述的是重构 target surface
- 当前开发阶段应以这里冻结的 contract 作为评审与实现基线
- 现有 shipping surface 只作为能力边界与测试锚点参考，不作为当前方案的结构约束

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
import { TrChat, createRuntimeFromConfig } from '@opentiny/tiny-robot-chat'

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
    brand: { title: 'Internal Chat' },
  },
}

const { runtime, ui } = createRuntimeFromConfig(config)
</script>

<template>
  <TrChat.Root :runtime="runtime" :ui="ui">
    <TrChat.Page />
  </TrChat.Root>
</template>
```

Note:

- `createRuntimeFromConfig(config)` 是开发阶段官方推荐的 `config -> { runtime, ui }` 构造 helper，但在每个 phase 内只承诺当期 bridge subset。
- 旧 shipping helpers 只用于对照旧能力边界，不决定 `Root` 的正式 contract。

示意 B：自带 runtime，白盒拼装

```vue
<template>
  <TrChat.Root :runtime="runtime" :ui="ui">
    <TrChat.WorkspaceShell>
      <TrChat.Header />
      <TrChat.History />
      <TrChat.MessageList />
      <TrChat.Sender />
    </TrChat.WorkspaceShell>
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
2. 自带 runtime 但继续使用官方 preset page：`TrChat.Root + TrChat.Page`
3. 自己拼页面：`TrChat.Root + primitives`

这样用户不需要先理解内部的 preset、provider、scaffold 分层，先按接入深度选入口即可。

补充约束：

- `TrChat` 和 `TrChat.Root` 是两层正式入口
- `TrChat.Page` 是官方默认页面组件与 preset page layer，不是第三层独立入口

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

### 3.3 官方桥接 helper

- `createRuntimeFromConfig(config)`
  官方推荐的 `TrChat -> TrChat.Root` 过渡 helper。

建议行为：

- 输入黑盒 `TrChatConfig`
- 输出 `{ runtime, ui }`
- 只负责把稳定的 runtime / ui 默认值提取到 Root 可消费的形态
- 不替代 `TrChat.Root` 自身的 runtime contract
- 不要求用户理解内部 runtime factory 细节，就能先走通 `Root + Page`

### 3.4 公开 primitives

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

负责当前 active conversation 的初始化与恢复能力。

```ts
type ChatConversationConfig = {
  initialMessages?: ChatSeedMessage[]
  persistence?: ChatPersistenceConfig
}
```

边界补充：

- `initialMessages`
  负责首屏种子消息
- `persistence`
  只负责当前 active conversation 的 hydrate / restore
- 多会话列表、切换、标题、管理态不属于 `conversation`，统一归 `history runtime`

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

Public boundary note:

- `left-rail`, `mobile-left`, and `mobile-right` are resolved placement targets inside `workspace runtime` and `TrChat.Page`.
- In the first public contract, they are not separate top-level `config.workspace.*` keys.
- Public config stays centered on `left`, `right`, and `defaultView`; responsive fallbacks are derived by the workspace runtime.

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

bridge owner 与执行顺序冻结如下：

- `beforeSend`
  在 `sender` 组装出 `ChatSendInput` 之后、`conversation.send(input)` 之前执行；可返回新的 `ChatSendInput`，也可返回 `false` 取消发送
- `afterReceive`
  在 transport 输出被规范化成 canonical `ChatUIMessage` 之后、`messages.transforms` 之前执行；不能改写 `messageId`
- `messages.transforms`
  永远在 `afterReceive` 之后运行，只负责最终渲染前 shaping，不改变 canonical identity
- `error`
  只负责 bridge 层 side effect 或错误映射，不取得 `retry / regenerate / abort` 的 owner 身份
- `modelChange`
  只在 `models.selectModel()` 成功后触发
- `conversationChange`
  只在 `history` 成功切换或创建当前会话后触发

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

### 4.7 `config` 与 Root 的边界

补充冻结两条规则：

- `config` 在黑盒模式下仍可承载稳定的 preset 默认值与行为配置
- 但 `TrChat.Root` 不直接消费原始 `config`

推荐分工：

- `TrChat`
  直接消费 `config`
- `createRuntimeFromConfig(config)`
  只把 `config` 中与 runtime / `ui` 默认值相关的部分转换为 `{ runtime, ui }`
- `TrChat.Root`
  只消费 `{ runtime, ui }`

这样可以保留黑盒的可用性，同时避免重新长出一个新的 `Scaffold -> projection -> provider` 中心层。

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

`ui` 的输入与内部消费语义也一并冻结：

- `TrChatRootUiConfig` 是 public input，允许 partial overrides
- `Root` 必须先把它解析成 resolved UI，再交给 `Page` 与 primitives
- `copy` 在输入层仍是 overrides 语义，但内部消费一律基于 resolved copy
- 不允许 `Page`、slots 或 primitives 自己回退默认文案

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

### 5.3 官方 on-ramp

为了让 `TrChat.Root` 成为可信的升级路径，而不是高级用户重写入口，建议配套公开：

```ts
type CreateRuntimeFromConfigResult = {
  runtime: ChatRuntimeInput
  ui?: TrChatRootUiConfig
}

declare function createRuntimeFromConfig(config: TrChatConfig): CreateRuntimeFromConfigResult
```

约束：

- 它是官方推荐的黑盒能力投影到 Root/runtime 的 on-ramp
- 它不改变 `TrChat.Root` 的正式 contract
- 它不替代更细粒度的 runtime factory
- 它在每个 phase 内都只承诺当前文档与 execution 文档写明的 bridge subset
- 所有 `Root + Page` 文档示例优先使用这条桥接路径

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
- `mcp`

### 6.2 `workspace` 的阶段性定位

第一阶段明确采用下面的定位：

- `workspace` 作为 `packages/chat` 内部的公开 UI runtime module 存在
- 它是 `TrChat.Root` 可选输入的一部分
- 但它先不下沉到 `packages/kit`

原因：

- 当前 `workspace` 明显带有 responsive host、`matchMedia`、drawer/sheet 等浏览器语义
- 先把它强行塞进 `packages/kit`，只会把包边界重新搞模糊

后续如果需要更纯的 headless 抽象，再拆成：

- `WorkspaceStateRuntime`
- browser adapter

### 6.3 `ChatConversationRuntime`

```ts
type ChatConversationRuntime = {
  messages: ReadonlyRef<ChatUIMessage[]>
  status: ReadonlyRef<ChatConversationStatus>
  send(input: ChatSendInput): Promise<void> | void
  abort(): Promise<boolean> | boolean
  retry(messageId: string): Promise<boolean> | boolean
  regenerate(messageId: string): Promise<boolean> | boolean
}
```

归属规则：

- `send / abort / retry / regenerate` 属于 `conversation runtime`
- 因为它们会直接改写会话级消息链路和 turn 级状态
- 这些动作虽然经常从消息级 UI 触发，但正式 owner 不是 `message runtime`

### 6.4 `ChatMessageRuntime`

```ts
type ChatMessageRuntime = {
  getViewState(messageId: string): ChatMessageViewState
  getActions(messageId: string): ChatResolvedMessageAction[]
  startEdit(messageId: string): void
  cancelEdit(messageId: string): void
  commitEdit(messageId: string, draft: ChatMessageEditInput): Promise<boolean> | boolean
  copy(messageId: string): Promise<void> | void
  feedback?: (messageId: string, value: ChatFeedbackValue) => Promise<void> | void
  resolveRenderer?: (message: ChatUIMessage) => ChatResolvedRenderer | null
}
```

归属规则：

- `message runtime` 拥有编辑中的草稿、action capability、inline error / busy 显示等派生 view state
- 它不拥有会话级消息列表
- `retry / regenerate` 可以由消息级 action 触发，但执行仍委托给 `conversation runtime`
- `messages.transforms` 属于同一条 message extension pipeline，只负责 render-time shaping，不改 canonical identity

### 6.5 `ChatSenderRuntime` 与 `ChatAttachmentsRuntime`

```ts
type ChatSenderRuntime = {
  draft: Ref<string>
  pendingAttachments: ReadonlyRef<ChatPendingAttachment[]>
  setDraft(value: string): void
  addPendingAttachments(items: ChatPendingAttachment[]): void
  removePendingAttachment(id: string): void
  clearPendingAttachments(): void
  send(): Promise<void> | void
}

type ChatAttachmentsRuntime = {
  prepare(files: File[]): Promise<ChatPendingAttachment[]>
  preview?: (attachmentId: string) => void
  reuse?: (attachmentId: string) => Promise<ChatPendingAttachment | null>
}
```

handoff 规则：

- `attachments runtime` 负责上传、解析、预览、复用型能力
- `sender runtime` 是“待发送附件”的唯一可写 source of truth
- `attachments runtime` 不能直接改写 `sender runtime`
- UI 通过显式 handoff 完成桥接：
  `prepare(files) -> addPendingAttachments(items)`

### 6.5A send pipeline freeze

To avoid recreating a hidden facade, the send path is frozen as:

1. `attachments.prepare(files)` only normalizes files into `ChatPendingAttachment[]`.
2. `sender runtime` owns draft text and pending attachments as the single source of truth before submit.
3. `sender.send()` assembles `ChatSendInput` from `draft + pendingAttachments` and delegates to `conversation.send(input)`.
4. `conversation runtime` owns turn creation, optimistic/streaming/error state, retry, regenerate, and abort.
5. On successful handoff, `sender runtime` clears `draft` and `pendingAttachments`.
6. On failure or abort, `sender runtime` keeps the local draft/attachments unless an explicit policy says otherwise.

This contract is intentionally single-path:

- no second implicit assembler inside `TrChat.Root`
- no direct `attachments -> conversation` shortcut
- no duplicate send semantics hidden in page or preset helpers

### 6.5B `messageId` lifecycle freeze

`messageId` is the only UI-facing message action key. The contract must stay stable across retries, edits, and restore flows.

| Scenario | `messageId` rule | Notes |
| --- | --- | --- |
| optimistic local placeholder becomes the persisted/rendered message | preserve the same `messageId` | transport/session ids may change, UI action key may not |
| streaming append on an existing assistant message | preserve the same `messageId` | partial chunks do not create a new action key |
| edit on an existing message | preserve the same edited message `messageId` | edit draft is view state, not a new message key |
| retry of a failed turn | preserve the source user message `messageId`; regenerated assistant output gets a new assistant `messageId` | retry targets the same source action anchor |
| regenerate assistant output | keep the source trigger `messageId`; regenerated output gets a new output `messageId` | no index-based targeting |
| transform or renderer-only shaping | preserve `messageId` | transforms cannot rewrite action identity |
| persistence hydration or restore | restore the previously persisted `messageId` | hydration must not synthesize a different UI key |

`meta.turnId` and transport/session identifiers remain internal runtime metadata.
They may support persistence or tracing, but they must not replace `messageId` as the public action key.

### 6.5C Root-mode UI extension contract

`TrChat.Root` must not recreate an implicit `configProjection` layer.

Root-mode extension points must stay explicit and layered:

- `ui` 只承载展示默认值
- page 组合默认值不放进 `ui`
- message actions / renderers / transforms 不放进 `ui`
- slot 注册不放进 `ui`
- runtime-owned behavior stays in `conversation / sender / message / history / models / workspace / attachments / mcp`

这意味着下面这些写法都应明确禁止：

- `ui.page`
- `ui.messages`
- `ui.slots`

`createRuntimeFromConfig(config)` is the canonical bridge that translates blackbox config into `{ runtime, ui }`.
If a caller builds `{ runtime, ui }` manually, `TrChat.Root` should consume that contract directly rather than re-reading raw config.

### 6.5D minimum slot catalog for the implementation baseline

Phase 0 must freeze a minimum slot catalog, not only slot precedence rules.

| Slot | Purpose | Minimum slot props |
| --- | --- | --- |
| `header` | replace the full default header region | `ui`, `workspace`, `history`, `models`, `conversation` |
| `welcome` | replace the default welcome region | `ui`, `conversation` |
| `message-list` | replace the default message list region | `ui`, `conversation`, `message` |
| `sender` | replace the default sender region | `ui`, `sender`, `attachments`, `mcp` |
| `header-before` | inject before the default header block | `ui`, `workspace` |
| `header-after` | inject after the default header block | `ui`, `workspace`, `models` |
| `message-before` | inject before the message list | `ui`, `conversation` |
| `message-after` | inject after the message list | `ui`, `conversation` |
| `sender-before` | inject before the sender area | `ui`, `sender`, `attachments` |
| `sender-after` | inject after the sender area | `ui`, `sender`, `attachments`, `mcp` |
| `footer-extra` | inject extra footer content | `ui`, `sender`, `attachments`, `mcp` |
| `left` | customize the desktop left workspace region | `ui`, `workspace`, `history` |
| `left-rail` | customize the desktop left rail | `ui`, `workspace`, `history` |
| `right` | customize the desktop right workspace region | `ui`, `workspace`, `models`, `mcp` |
| `mobile-left` | customize the mobile left sheet | `ui`, `workspace`, `history` |
| `mobile-right` | customize the mobile right sheet | `ui`, `workspace`, `models`, `mcp` |

The same Phase 0 freeze also fixes:

- replace vs merge precedence for each slot
- whether a slot is page-only or also available in primitives
- when users should prefer a slot over `Root + primitives`
- slot props must expose named minimal modules, not the whole `runtime`

Footer note:

- the default page may include a lightweight footer companion region
- Phase 0.5 only freezes `footer-extra` as an augment slot
- no standalone `footer` replace slot is frozen before the page baseline proves that contract is stable

### 6.5E `TrChat.Page` slot-provider contract

`TrChat.Page` 仍然是 composition-only。

因此需要额外冻结一条实现规则：

- `Page` 自身只负责页面结构、slot anchor 与默认组合关系
- 某个 slot 拿到 `conversation` 或 `sender`，不代表 `Page` 自身读取了整个 runtime
- slot props 可以由 `Page` 内部的 region 组件装配
- 如某个定制需求超出 slot props contract，应升级到 `Root + primitives`

Region read-boundary freeze:

| Region component | Allowed runtime |
| --- | --- |
| `TrChatPageHeaderRegion` | `conversation + history + models + workspace + ui` |
| `TrChatPageBodyRegion` | `conversation + message + ui` |
| `TrChatPageFooterRegion` | `sender + attachments + mcp + ui` |
| `TrChatWorkspaceShell` | `workspace + history + models + mcp + ui` |

### 6.5F `ChatHistoryRuntime`

```ts
type ChatHistoryRuntime = {
  conversations: ReadonlyRef<ChatConversationSummary[]>
  activeConversationId: ReadonlyRef<string | null>
  createConversation: (params?: ChatConversationCreateInput) => Promise<string> | string
  switchConversation: (id: string) => Promise<boolean> | boolean
  deleteConversation: (id: string) => Promise<boolean> | boolean
  renameConversation?: (id: string, title: string) => Promise<boolean> | boolean
  management?: {
    enabled: ReadonlyRef<boolean>
    searchQuery: Ref<string>
    selectedIds: ReadonlyRef<string[]>
    setManagementEnabled: (value: boolean) => void
    toggleSelection: (id: string) => void
    clearSelection: () => void
    selectAllVisible?: () => void
  }
}
```

### 6.5G `ChatModelRuntime`

```ts
type ChatModelRuntime = {
  models: ReadonlyRef<ModelOption[]>
  currentModelId: ReadonlyRef<string | null>
  selectModel: (modelId: string) => Promise<boolean> | boolean
}
```

### 6.5H `ChatWorkspaceRuntime`

```ts
type ChatWorkspaceRuntime = {
  enabled: ReadonlyRef<boolean>
  variant: ReadonlyRef<'stacked' | 'workspace'>
  isMobile: ReadonlyRef<boolean>
  left: ChatWorkspaceRegionRuntime
  right: ChatWorkspaceRegionRuntime
  historyVisible: ReadonlyRef<boolean>
  openHistory: () => void
  closeHistory: () => void
  toggleHistory: () => void
  setResponsiveHost: (el: HTMLElement | null) => void
}
```

### 6.5I `ChatMcpRuntime`

```ts
type ChatMcpRuntime = {
  enabled: ReadonlyRef<boolean>
  tools?: ReadonlyRef<ChatMcpToolSummary[]>
  openPanel?: () => void
  closePanel?: () => void
  togglePanel?: () => void
  callTool?: (input: ChatMcpToolCallInput) => Promise<ChatMcpToolCallResult>
}
```

### 6.6 `ChatRuntimeInput`

```ts
type ChatRuntimeInput = {
  conversation: ChatConversationRuntime
  sender?: ChatSenderRuntime
  message?: ChatMessageRuntime
  history?: ChatHistoryRuntime
  models?: ChatModelRuntime
  workspace?: ChatWorkspaceRuntime
  attachments?: ChatAttachmentsRuntime
  mcp?: ChatMcpRuntime
}
```

### 6.7 `ChatRuntime`

```ts
type ChatRuntime = {
  conversation: ChatConversationRuntime
  sender: ChatSenderRuntime
  message: ChatMessageRuntime
  history?: ChatHistoryRuntime
  models?: ChatModelRuntime
  workspace?: ChatWorkspaceRuntime
  attachments?: ChatAttachmentsRuntime
  mcp?: ChatMcpRuntime
}
```

说明：

- `ChatRuntimeInput`
  用户输入，可缺省部分模块
- `ChatRuntime`
  `Root` 补齐后的标准化 runtime，供内部消费

补充冻结规则：

- `sender` 与 `message` 缺省时由 `Root` 自动补齐
- `history`、`models`、`workspace`、`attachments`、`mcp` 缺省时保持缺省；`Root` 不得为了 slot props 伪造 no-op runtime
- slot props 对这些可选模块使用可选命名字段；缺模块时表现为省略或 `undefined`
- `Page` 与 primitives 必须基于缺省模块给出可预测降级，而不是各自偷偷兜底

最低降级要求：

- 无 `workspace` 时只渲染 stacked 主视图，不渲染 workspace slots
- 无 `history` 时隐藏历史 affordance；原本含 `history` 的 slot props 只移除 `history`
- 无 `models` 时隐藏模型 affordance；原本含 `models` 的 slot props 只移除 `models`
- 无 `mcp` 时隐藏 MCP affordance；原本含 `mcp` 的 slot props 只移除 `mcp`
- 无 `attachments` 时 sender 仍可纯文本运行；原本含 `attachments` 的 slot props 只移除 `attachments`

### 6.8 capability 的定位

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
- 同一条消息在 chunk 追加、render normalize、storage 恢复时保持同一个 `id`
- `status / error / capabilities` 这类派生 UI 状态不直接成为 canonical message payload

### 7.2 建议结构

```ts
type ChatUIMessage = {
  id: string
  role: 'system' | 'user' | 'assistant' | 'tool'
  createdAt?: number
  parts: ChatUIMessagePart[]
  meta?: ChatUIMessageMeta
}

type ChatUIMessageMeta = {
  conversationId?: string
  parentMessageId?: string
  turnId?: string
  model?: string
}

type ChatMessageViewState = {
  status?: 'pending' | 'streaming' | 'done' | 'error'
  error?: ChatMessageErrorView
  capabilities?: {
    editable?: boolean
    retryable?: boolean
    regeneratable?: boolean
    feedbackable?: boolean
  }
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

补充归属：

- `edit` 由 `message runtime` 承接
- `retry / regenerate` 由 `conversation runtime` 承接
- UI 可以统一以 `messageId` 发起动作，但不能再反向推导“到底该改哪段数组”

### 7.4 legacy `messageIndex` coexistence 规则

`messageIndex` 只允许留在 legacy adapter 边界，不能再次进入 next surface。

冻结规则：

- 新 runtime、新 public helpers、新 slots、新 contract tests 一律只接受 `messageId`
- 如 legacy wrapper 仍依赖 index，只允许在 `legacy/` 内部做一次 `index -> messageId` 转译
- 不允许把 `messageIndex` 重新暴露回 `Root`、`Page`、primitives、slot props 或新的 helper

## 8. source of truth 规则

### 8.1 必须唯一归属的数据

| 数据 | 唯一 source of truth |
| --- | --- |
| 当前会话消息列表 | `conversation runtime` |
| 当前会话整体状态 / turn-level streaming / turn-level failure | `conversation runtime` |
| 输入框草稿 | `sender runtime` |
| 待发送附件 | `sender runtime` |
| 单条消息编辑态 / action capability / inline error-busy view state | `message runtime` |
| 历史会话列表与当前选中会话 | `history runtime` |
| 当前模型 | `model runtime` |
| workspace 左右栏 / history open state / mobile state | `workspace runtime (packages/chat local)` |
| MCP panel 可见性 / tools / tool call bridge | `mcp runtime` |

### 8.2 `sender` 与 `attachments` 的关系

这组边界必须明确写死：

- `sender runtime`
  拥有“待发送附件”的 source of truth
- `attachments runtime`
  只拥有上传、解析、预览、复用型附件能力

也就是说：

- 待发送附件只能有一个权威归属
- 不能同时让 `sender` 和 `attachments` 两边都成为可写 source of truth
- handoff 必须显式可追踪，不能通过共享对象或隐式注入偷偷改写

## 9. primitives 读取边界

为了避免重新退化成“大 runtime 注入”，建议冻结一张 primitive 读取边界表。

| Primitive | 允许读取的运行时 |
| --- | --- |
| `TrChat.Page` | `workspace + ui` |
| `TrChat.Header` | `conversation + history + models + workspace + ui` |
| `TrChat.MessageList` | `conversation + message + ui` |
| `TrChat.Message` | `message + ui` |
| `TrChat.Sender` | `sender + attachments + ui` |
| `TrChat.Footer` | `sender + attachments + mcp + ui` |
| `TrChat.Attachments` | `sender + attachments + ui` |
| `TrChat.History` | `history + workspace + ui` |
| `TrChat.ModelSelector` | `models + ui` |
| `TrChat.WorkspaceShell` | `workspace + ui` |
| `TrChat.McpTrigger` | `mcp + ui` |
| `TrChat.McpPanel` | `mcp + workspace + ui` |

原则：

- `TrChat.Page` 只负责官方页面结构、slot 编排和默认组合关系
- primitive 不直接读“整个 runtime”
- 读不到的能力，就不能顺手消费
- slot props 的装配不应被视为 `Page` 直接读取整包 runtime

## 10. slots 与扩展路径

### 10.1 用户如何判断从哪一层扩展

推荐唯一扩展路由如下：

| 需求 | 正式入口 |
| --- | --- |
| 改稳定默认值 | `config.<domain>` |
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

### 10.3 slot catalog 与扩展判断表

本轮 contract 已经把下面三件事冻结到位：

- slot 名称清单
- 每个 slot 的 slot props
- “用 slot 还是直接进 `Root + primitives`” 的判断表

下面这张表是当前评审与实现都应直接遵守的判断表：

| 需求 | 正式入口 |
| --- | --- |
| 只改某个默认区域的局部 UI，且所需数据已经在该 slot props contract 内 | slot |
| 需要替换整块默认区域，但仍接受官方页面结构与生命周期 | replace 型 slot |
| 需要跨多个区域重排结构 | `Root + primitives` |
| 需要消费不在该 slot props contract 内的 runtime 模块 | `Root + primitives` |
| 需要自行决定消息链路、发送链路、workspace 联动 | `Root + primitives` |

## 11. message extension contract

这组能力在当前实现里已经形成完整链路，必须作为正式 contract 冻结：

- `messageActions`
- `feedback`
- `bubbleRenderers`
- `messageTransforms`
- 默认 renderer 注册顺序

正式冻结的约束：

- action merge / replace 规则
- operation / action 两类 placement
- action 去重规则
- action 执行回调归 action 定义自身，不再通过顶层 `lifecycle` 二次承接
- error / editing / optimistic / tool_calls / attachments 的默认 renderer 命中顺序
- transform 后的消息仍然能继续进入 renderer / action 链

## 12. workspace 与 history contract

workspace 不是单纯的壳层视觉能力，而是当前产品的真实交互主路径。

跨模块 owner 规则补充冻结如下：

- `history runtime`
  只拥有会话列表与当前会话选择；`workspace runtime` 只拥有面板开关。成功切换会话后是否自动收起 mobile history，是 `Page / WorkspaceShell` 的 UI 策略，不改变 owner 归属
- `conversation.persistence`
  只拥有当前 active conversation 的 hydrate / restore；它不拥有多会话列表、当前会话选择、标题或管理态
- `models runtime`
  只拥有当前模型与模型切换；当 `sender.send()` 或调用方未显式传 `ChatSendInput.modelId` 时，由桥接层把 `models.currentModelId` 注入到 `conversation.send(input)` 的 `modelId`
- `mcp runtime`
  只拥有 MCP panel / tool bridge；任何 tool call 产出的消息回写，都必须通过 `conversation runtime` 完成，而不是由 `mcp runtime` 直接改写消息列表

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
- `TrChat.Page` 作为官方默认页面组件与 preset page layer 公开
- 配套公开 `createRuntimeFromConfig(config)` 作为带显式 bridge subset 的官方 Root 桥接入口
- 黑盒只保留一个主配置对象，并按功能域组织
- `config.ui` 和 `config.lifecycle` 作为正式命名
- `ui` 只负责展示默认值；`workspace` 负责壳层与区域语义；`messages` 负责消息扩展；`lifecycle` 负责流程节点处理
- runtime 按 source of truth 切分
- `conversation runtime` 拥有 `send / abort / retry / regenerate`
- `message runtime` 拥有消息级 edit/view-state 能力
- `workspace` 第一阶段保持为 `packages/chat` 内部的公开 UI runtime module
- capabilities 降级为内部派生结果，不再成为主要用户输入
- slot、runtime、message extension、workspace/history 的边界先冻结，再进入实现
