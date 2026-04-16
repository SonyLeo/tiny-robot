# Chat Dual-Mode Refactor Design

## 1. 文档状态

本文档是 `packages/chat` 下一轮重构的详细设计稿。

它和 [ARCHITECTURE_REFACTOR_PROPOSAL.md](./ARCHITECTURE_REFACTOR_PROPOSAL.md) 的关系是：

- `ARCHITECTURE_REFACTOR_PROPOSAL.md`
  用于说明为什么要重构、旧方案的问题在哪里、业界实践如何对标
- 本文档
  用于明确新架构应该怎么设计，便于评估可行性，也便于后续指导实现

本文档采用以下固定前提：

- `chat` 的产品定位不变：少量配置即可启动一个 AI 会话应用
- 同时新增“纯 UI / 自定义数据层”能力
- 新 runtime 在当前阶段仍保留在 `packages/chat`
- 当前阶段不以兼容旧 API 为首要目标
- 这轮设计要尽量具体，避免评审时出现不同人理解不同的问题

## 2. 设计目标

### 2.1 业务目标

新的 `packages/chat` 需要同时服务两种正式用法：

#### 用法 A：开箱即用

用户只提供少量配置，就可以直接启动一个聊天应用。

典型诉求：

- 快速跑通一个聊天页
- 使用官方默认 transport/runtime
- 用少量 UI 配置完成品牌、欢迎语、历史区、模型选择等定制

#### 用法 B：纯 UI / 自定义数据层

用户完全接管消息、会话、状态、请求和持久化，`packages/chat` 只提供 UI 和交互层。

典型诉求：

- 使用自有 store
- 使用自有 WebSocket / agent runtime / workflow runtime
- 使用企业内部消息 schema 或转换层
- 保留官方 UI，或者只复用部分 primitives

### 2.2 技术目标

- 让 UI 层不再直接依赖 `chatKit`
- 让 UI 层不再隐式修改用户传入的消息对象
- 让开箱即用模式和纯 UI 模式共用一套内部 UI 架构
- 让 runtime 和 UI 的边界清晰，后续如有需要可以再把 runtime 下沉到其他包
- 让消息模型、状态模型、feature 边界和公共 API 更稳定

### 2.3 非目标

- 这轮不要求保留 `ChatScaffold`、`ChatProvider`、`useChatKit` 的兼容语义
- 这轮不要求第一阶段就开放所有最细粒度内部组件
- 这轮不要求立即把 runtime 挪到 `packages/kit`
- 这轮不要求第一阶段就覆盖历史上所有 feature 的所有细节

## 3. 当前实现的关键问题

旧方案的详细分析见 [ARCHITECTURE_REFACTOR_PROPOSAL.md](./ARCHITECTURE_REFACTOR_PROPOSAL.md) 第 3 节。

这里仅保留会直接影响新设计的关键结论：

- 当前 UI 组件大量直接依赖 `CHAT_KIT_KEY`
- 当前 `ChatScaffold` 同时承担 config 归一化、runtime 构造、preset 投影、provider 装配等职责
- 当前 message render state 会通过 `chatMessageState.ts`、`chatRenderMessages.ts` 等逻辑写入消息对象
- 当前“白盒组件”虽然可以拼装，但底层仍然绑定默认 runtime 语义
- 当前 `config` 在黑盒链路中是中心入口，但对“纯 UI”用户来说并不是最自然的契约

因此，这轮重构不是加几个 props 的问题，而是要重建内部边界。

## 4. 总体方案

### 4.1 一句话方案

把 `packages/chat` 重构成一个“单包双模式”的聊天应用包：

- `TrChat`
  面向开箱即用场景，接收少量配置，内部自动创建 runtime 和默认 UI
- `TrChat.Controlled`
  面向“用户自带数据层，但仍想用默认官方 UI”的场景
- `TrChat.Root`
  面向白盒拼装场景，用户自己组合 header、消息列表、输入区、历史会话列表、workspace 等 primitives

三种入口共享同一套底层实现：

`runtime -> root providers -> primitives -> preset layout`

也就是说，新方案不再区分“黑盒组件树”和“纯 UI 组件树”。  
区别只在于 runtime 由谁创建、preset 由谁决定。

### 4.2 目标架构图

```text
TrChat(config)
  -> resolveAppConfig(config)
  -> merge integrations + events + overrides
  -> createTransportRuntime(runtimeConfig)
  -> presetUi = resolvePresetConfig(uiConfig, runtime.capabilities)
  -> TrChat.Controlled(runtime, presetUi, events, overrides)
  -> PresetLayout
  -> Header / MessageList / Sender / History / WorkspaceShell

TrChat.Controlled(runtimeInput, ui?, events?, overrides?)
  -> register events
  -> apply overrides
  -> resolveRuntimeCapabilities(runtimeInput)
  -> resolvedPreset = resolvePresetConfig(ui, capabilities)
  -> resolvedUi = resolveRootUiConfig(resolvedPreset)
  -> TrChat.Root(runtimeInput, resolvedUi)
  -> PresetLayout

TrChat.Root(runtimeInput, ui?)
  -> resolvedUi = resolveRootUiConfig(ui)
  -> resolveRuntimeDefaults(runtimeInput, { ui: resolvedUi })
  -> provide runtime and ui config
  -> whitebox primitives
```

### 4.3 设计原则

#### 原则 1：黑盒和纯 UI 共用同一套 primitives

不允许维护两套独立的聊天 UI 树。  
所有模式最终都必须进入同一套 root provider 和 primitives。

#### 原则 2：UI 只能依赖 runtime contract

下列概念不能再直接进入 UI primitives：

- `chatKit`
- `responseProvider`
- `provider factory`
- `loadChatConfig`
- `createPresetChatSlices`

这些能力只允许存在于黑盒入口、runtime factory 或 preset resolver 中。

#### 原则 3：消息对象不可被 UI 隐式修改

新的 UI 层不能再通过隐藏字段或 `message.state` 一类机制给消息打补丁。  
所有可变交互状态必须进入 runtime。

#### 原则 4：对外 API 保持简单，对内 runtime 粒度细

对用户：

- 传一个 `ChatRuntimeInput` 就够了

对内部：

- 消息列表组件读“当前会话 runtime”
- 输入区组件读“输入区 runtime”
- 单条消息交互读“message item runtime”
- 历史会话列表读“历史会话列表 runtime（`history runtime`）”
- workspace shell 读 `workspace runtime`

#### 原则 5：`config` 仅服务开箱即用模式

`config` 不再是整个包的统一入口。  
它只用于 `TrChat` 这条链路，不强加给 `Controlled` 和 `Root`。

### 4.4 数据归属总表

这张表是后续实现时最重要的边界约束。

| 数据/状态 | Source of truth | UI 是否可直接改写 |
| --- | --- | --- |
| 当前会话消息列表 | 当前会话 runtime 的 `messages` | 否 |
| 当前会话整体状态 | 当前会话 runtime 的 `status` | 否 |
| 输入框草稿 | 输入区 runtime 的 `draft` | 否，必须通过 action |
| 待发送附件 | 输入区 runtime 的 `attachments` | 否，必须通过 action |
| 每条消息编辑态 | `message item runtime.state.editing` | 否 |
| 每条消息编辑草稿 | `message item runtime.state.editDraft` | 否 |
| 历史会话列表 | 历史会话列表 runtime 的 `items` | 否 |
| 当前模型 | `model runtime.state.activeId` | 否 |
| workspace 左右栏状态 | `workspace runtime.state.*` | 否 |
| 欢迎语、布局、默认动作可见性 | `resolved ui config` | 否 |
| hover/focus/局部展开态 | 组件本地状态 | 是 |

### 4.5 最小成立方案

为了让重构可落地，不要求第一阶段所有模块都完整。

第一阶段只要求：

- “当前会话 runtime（`conversation runtime`）”
- “输入区 runtime（`sender runtime`）”
- `message runtime`
- `TrChat`
- `TrChat.Controlled`
- `TrChat.Root`
- `Header / MessageList / Sender` primitives
- 默认 preset layout

`history / model / workspace / attachments / MCP` 可以分阶段回填，但接口需要预留。

## 5. 新的公开 API 设计

### 5.1 公开出口形态

推荐同时保留 compound export 和 named export。

```ts
export { TrChat }

TrChat.Controlled
TrChat.Root
TrChat.Header
TrChat.MessageList
TrChat.Message
TrChat.Sender
TrChat.History
TrChat.WorkspaceShell
TrChat.ModelSelector
TrChat.Attachments

export {
  TrChatControlled,
  TrChatRoot,
  TrChatHeader,
  TrChatMessageList,
  TrChatMessage,
  TrChatSender,
  TrChatHistory,
  TrChatWorkspaceShell,
  TrChatModelSelector,
  TrChatAttachments,
}

export {
  createTransportRuntime,
  createExternalStoreRuntime,
  createWorkspaceRuntime,
}

export {
  useChatRuntime,
  useConversationRuntime,
  useSenderRuntime,
  useHistoryRuntime,
  useMessageItemRuntime,
  useModelRuntime,
  useWorkspaceRuntime,
}
```

### 5.2 组件级 props 设计

#### `TrChat`

黑盒入口。

```ts
type TrChatProps = {
  config: TrChatAppConfig
  integrations?: TrChatIntegrations
  events?: TrChatEvents
  overrides?: ChatUiOverrides
}
```

职责：

- 解析 `config`
- 合并 `integrations`
- 注册 `events`
- 应用 `overrides`
- 构造 transport runtime
- 解析 preset config
- 渲染 `TrChat.Controlled`

不负责：

- 直接 provide runtime
- 直接承载复杂 UI 状态
- 直接实现消息列表/输入区/header
- 让 `config / integrations / events / overrides` 互相越级覆盖到不可追踪

#### `TrChat.Controlled`

默认 UI + 外部 runtime。

```ts
type TrChatControlledProps = {
  runtime: ChatRuntimeInput
  ui?: ChatPresetConfig
  events?: TrChatEvents
  overrides?: ChatUiOverrides
}
```

职责：

- 接收外部传入的 runtime input
- 注册 `events`
- 应用 `overrides`
- 基于 `ui` 和 `resolveRuntimeCapabilities(runtime)` 解析 preset config
- 创建默认布局和默认 renderers
- 渲染 `TrChat.Root`

不负责：

- 自己构造 transport runtime
- 修改 runtime 结构

#### `TrChat.Root`

whitebox 根节点。

```ts
type TrChatRootProps = {
  runtime: ChatRuntimeInput
  ui?: ChatRootUiConfig
}
```

职责：

- 标准化 runtime input
- 自动补齐缺省 runtime module
- 解析并 provide whitebox primitives 需要的 UI config
- provide root runtime 和 feature runtimes
- 为 whitebox primitives 提供统一上下文

### 5.3 最小受控能力要求

为了降低纯 UI 用法接入成本，`TrChat.Controlled` 不应该强制要求用户把所有模块都传齐。

受控模式和 whitebox 模式对外接收的不是完整 `ChatRuntime`，而是一个更贴近真实接入场景的 `ChatRuntimeInput`：

```ts
type ChatRuntimeInput = {
  kind?: 'transport' | 'external-store' | 'custom'
  capabilities?: Partial<ChatRuntimeCapabilities>
  conversation: ChatConversationRuntime
  sender?: ChatSenderRuntime
  message?: ChatMessageRuntime
  history?: ChatHistoryRuntime
  models?: ChatModelRuntime
  workspace?: ChatWorkspaceRuntime
  attachments?: ChatAttachmentsRuntime
}
```

`ChatRuntimeInput` 和最终 `ChatRuntime` 的区别是：

- `ChatRuntimeInput`
  允许缺少 `sender / message / workspace`
- `ChatRuntime`
  是 `Root` 内部完成标准化后的运行时对象，供 primitives 和 preset 使用

最小要求：

```ts
type MinimalControlledRuntimeInput = {
  conversation: ChatConversationRuntime
}
```

框架自动补齐：

- 输入区 runtime（`sender runtime`）
  如果用户未提供，就创建一个本地输入区 runtime，并让 `submit()` 委托给当前会话 runtime 的 `send`
- `message runtime`
  如果用户未提供，就创建一个基础 message item runtime store
- `workspace runtime`
  如果 `ui.shell.variant = 'workspace'` 而用户未提供，就创建默认 workspace runtime

可选模块：

- `history`
- `models`
- `attachments`
- `workspace`

### 5.4 `TrChat.Root` 的 UI 配置输入

`TrChat.Root` 不读取黑盒 `config`，但 whitebox primitives 仍然需要统一的 UI 配置来源。  
因此 `Root` 需要接收一个轻量的 `ui` 输入，并在内部解析成统一的 `resolved ui config`。

```ts
type ChatRootUiConfig = {
  shell?: ChatPresetConfig['shell']
  welcome?: ChatPresetConfig['welcome']
  sender?: ChatPresetConfig['sender']
  messageList?: ChatPresetConfig['messageList']
  layout?: ChatPresetConfig['layout']
  features?: ChatPresetConfig['features']
  renderers?: ChatPresetConfig['renderers']
  messages?: ChatPresetConfig['messages']
}

type ResolvedChatRootUiConfig = {
  shell: NonNullable<ChatRootUiConfig['shell']>
  welcome: NonNullable<ChatRootUiConfig['welcome']>
  sender: NonNullable<ChatRootUiConfig['sender']>
  messageList: NonNullable<ChatRootUiConfig['messageList']>
  layout: NonNullable<ChatRootUiConfig['layout']>
  features: NonNullable<ChatRootUiConfig['features']>
  renderers: NonNullable<ChatRootUiConfig['renderers']>
  messages: NonNullable<ChatRootUiConfig['messages']>
}

function resolveRootUiConfig(
  input?: ChatRootUiConfig
): ResolvedChatRootUiConfig
```

约束：

- `TrChat`
  负责从黑盒 `config.ui` 生成完整 `ChatPresetConfig`
- `TrChat.Controlled`
  负责把 `ChatPresetConfig` 解析成 `ResolvedChatRootUiConfig`
- `TrChat.Root`
  只接受 `ui?: ChatRootUiConfig`，并在内部通过 `resolveRootUiConfig(ui)` 补齐默认值

这意味着 whitebox 用法即使不走 preset layout，也仍然有稳定的 UI 配置来源：

- `TrChat.Header`
  读取 `useChatUiConfig().features`、`shell`
- `TrChat.MessageList`
  读取 `useChatUiConfig().messageList`、`welcome`
- `TrChat.Sender`
  读取 `useChatUiConfig().sender`

### 5.5 典型调用方式

#### A. 开箱即用

```vue
<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'

const config = {
  runtime: {
    provider: {
      type: 'openai-compatible',
      baseURL: '/api/chat',
      model: 'gpt-4.1',
    },
  },
  ui: {
    shell: {
      variant: 'workspace',
    },
    welcome: {
      title: '你好，我是 AI 助手',
    },
  },
}
</script>

<template>
  <TrChat :config="config" />
</template>
```

#### B. 纯 UI + 默认 preset UI

```vue
<script setup lang="ts">
import {
  TrChat,
  createExternalStoreRuntime,
} from '@opentiny/tiny-robot-chat'

const runtime = createExternalStoreRuntime({
  conversation: customConversationRuntime,
  history: customHistoryRuntime,
  models: customModelRuntime,
})
</script>

<template>
  <TrChat.Controlled :runtime="runtime" />
</template>
```

#### C. 纯 UI + whitebox

```vue
<script setup lang="ts">
import {
  TrChat,
  createExternalStoreRuntime,
} from '@opentiny/tiny-robot-chat'

const runtime = createExternalStoreRuntime({
  conversation: customConversationRuntime,
})
</script>

<template>
  <TrChat.Root :runtime="runtime">
    <div class="my-chat-page">
      <TrChat.Header />
      <TrChat.MessageList />
      <TrChat.Sender />
    </div>
  </TrChat.Root>
</template>
```

### 5.6 命名说明

正式命名建议如下：

- `TrChat`
  黑盒入口
- `TrChat.Controlled`
  受控模式
- `TrChat.Root`
  运行时根节点

不建议保留旧命名：

- `Scaffold`
- `Provider`

原因：

- `Controlled` 明确表达“数据层由外部控制”
- `Root` 明确表达“这是整个聊天 UI 的运行时根节点”
- `Scaffold/Provider` 更像内部实现术语，不适合作为新的对外心智模型

## 6. 新的配置模型

### 6.1 配置拆分目标

新的配置模型只服务 `TrChat` 黑盒模式，目标是：

- 继续支持“少量配置即可启动聊天应用”
- 把 runtime 构造配置和 UI preset 配置分开
- 避免 `config` 再次侵入 `Controlled` 和 `Root`

### 6.2 黑盒配置结构

```ts
type TrChatAppConfig = {
  runtime: ChatTransportRuntimeConfig
  defaults?: {
    model?: string | null
    systemPrompt?: string
  }
  ui?: ChatPresetConfig
}
```

其中：

- `runtime`
  负责 transport 相关能力与可持久化输入
- `defaults`
  负责黑盒模式下的默认模型和系统提示词
- `ui`
  负责默认页面结构、视觉和 feature 可见性

### 6.2.1 `TrChat` 顶层输入分层

黑盒入口最终不应该只剩一个 `config`，否则旧 `runtime / callbacks / presetOverrides` 的承接会重新变得模糊。  
建议在新方案里明确保留 4 个顶层输入层次：

```ts
type TrChatProps = {
  config: TrChatAppConfig
  integrations?: TrChatIntegrations
  events?: TrChatEvents
  overrides?: ChatUiOverrides
}

type TrChatIntegrations = {
  initialModel?: MaybeRef<string | null>
  historyRuntime?: ChatHistoryRuntime
  modelRuntime?: ChatModelRuntime
  attachmentsRuntime?: ChatAttachmentsRuntime
  workspaceRuntime?: ChatWorkspaceRuntime
  mcpManager?: unknown
}

type TrChatEvents = {
  beforeSend?: (
    payload: ChatSendPayload,
    context: { runtime: ChatRuntimeInput }
  ) => Promise<ChatSendPayload | false | void> | ChatSendPayload | false | void
  afterReceive?: (
    message: ChatUIMessage,
    context: { runtime: ChatRuntime }
  ) => Promise<void> | void
  onError?: (
    error: ChatRuntimeError,
    context: { runtime: ChatRuntimeInput | ChatRuntime }
  ) => Promise<void> | void
  onMessageAction?: (
    actionId: string,
    context: { message: ChatUIMessage; runtime: ChatRuntime }
  ) => Promise<void> | void
  onModelChange?: (
    modelId: string | null,
    context: { runtime: ChatRuntime }
  ) => Promise<void> | void
  onConversationChange?: (
    conversationId: string | null,
    context: { runtime: ChatRuntime }
  ) => Promise<void> | void
}

type ChatUiOverrides = {
  appearance?: Partial<ChatPresetConfig['appearance']>
  brand?: Partial<ChatPresetConfig['brand']>
  welcome?: Partial<ChatPresetConfig['welcome']>
  sender?: Partial<ChatPresetConfig['sender']>
  messageList?: Partial<ChatPresetConfig['messageList']>
  layout?: Partial<NonNullable<ChatPresetConfig['layout']>>
  features?: Partial<ChatPresetConfig['features']>
  renderers?: ChatPresetConfig['renderers']
  messages?: ChatPresetConfig['messages']
  primitiveProps?: {
    header?: Record<string, unknown>
    messageList?: Record<string, unknown>
    sender?: Record<string, unknown>
    history?: Record<string, unknown>
  }
}
```

边界原则：

- `config`
  放稳定默认值
- `integrations`
  放页面实例对象或外部 runtime bridge
- `events`
  放副作用回调
- `overrides`
  放页面级轻量差异

补充约束：

- `initialModel`
  只负责黑盒模式的初始化推荐值，不作为持续受控 source of truth
- 如果页面已经直接提供 `modelRuntime`
  则模型切换、当前模型和最终状态以 `modelRuntime` 为准

### 6.2.2 输入优先级规则

为了避免未来再出现“同一件事可以写在 4 个地方”的混乱，建议固定优先级：

1. `config`
2. `integrations`
3. `events`
4. `overrides`
5. `slots`
6. `Controlled / Root`

具体解释：

- `integrations`
  可以提供实例对象，但不应反向改写 `config`
- `events`
  只能参与生命周期与副作用，不改静态展示配置
- `overrides`
  只能覆盖默认 UI 表达，不应替换 runtime source of truth
- `slots`
  替换结构，不应隐式改变 runtime 能力判断

### 6.3 `ChatTransportRuntimeConfig`

```ts
type ChatTransportRuntimeConfig = {
  provider: ChatProviderConfig
  initialConversation?: {
    id?: string
    messages?: ChatUIMessage[]
  }
  models?: {
    items: ModelOption[]
    activeId?: string | null
  }
  persistence?: {
    enabled?: boolean
    adapter?: ChatPersistenceAdapter
    restoreOnMount?: boolean
  }
  hooks?: {
    beforeSend?: ChatBeforeSendHook
    afterReceive?: ChatAfterReceiveHook
    onError?: ChatOnErrorHook
  }
  transforms?: {
    toRequestMessages?: ChatToRequestMessages
    fromResponseChunk?: ChatFromResponseChunk
    fromResponseComplete?: ChatFromResponseComplete
  }
  features?: {
    history?: boolean
    models?: boolean
    attachments?: boolean
    feedback?: boolean
    mcp?: boolean
  }
}
```

字段职责：

- `provider`
  负责真正的请求/流式响应
- `initialConversation`
  用于首屏恢复或预置消息
- `models`
  用于黑盒模式下的模型选择
- `persistence`
  用于 transport runtime 自己做恢复和持久化
- `hooks`
  用于发送前、接收后、错误处理等 runtime 生命周期回调
- `transforms`
  用于模型输入输出与 `ChatUIMessage` 之间的转换
- `features`
  只决定 runtime 是否创建对应能力，不直接决定 UI 是否展示

### 6.4 `ChatPresetConfig`

```ts
type ChatPresetConfig = {
  preset?: 'default' | 'workspace'
  shell?: {
    variant?: 'stacked' | 'workspace'
    title?: string
  }
  appearance?: ChatAppearanceConfig
  brand?: BrandConfig
  welcome?: {
    title?: string
    description?: string
    prompts?: PromptProps[]
  }
  layout?: {
    variant?: 'bubble' | 'plain'
    contentLayout?: 'default' | 'centered' | 'wide'
    placements?: {
      assistant?: 'start' | 'stretch'
      user?: 'end' | 'stretch'
      system?: 'center'
    }
  }
  sender?: {
    placeholder?: string
    mode?: 'single' | 'multiple'
    maxLength?: number
  }
  messageList?: {
    autoScroll?: boolean
    groupStrategy?: 'none' | 'role' | 'time'
  }
  features?: {
    history?: boolean
    models?: boolean
    attachments?: boolean
    feedback?: boolean
    mcp?: boolean
  }
  renderers?: {
    partRenderers?: ChatPartRendererRegistration[]
    messageActions?: ChatActionRendererRegistration[]
  }
  messages?: ChatMessagesOverrides
}
```

字段职责：

- `preset`
  选择默认页面组织方式
- `shell`
  定义页面壳和 workspace 布局结构
- `appearance` / `brand`
  定义视觉和品牌
- `welcome`
  定义默认欢迎区内容
- `layout`
  定义消息区版式、内容宽度和各角色 placement
- `sender`
  定义输入区文案和交互模式
- `messageList`
  定义消息列表的滚动和分组策略
- `features`
  是 UI 可见性偏好，不是 runtime 能力定义；其中不包含 `workspace`
- `renderers`
  扩展默认消息和动作渲染
- `messages`
  覆盖内置 copy

### 6.5 配置解析规则

`TrChat` 的配置解析顺序固定为：

1. `normalizeTransportRuntimeConfig(config.runtime)`
2. `createTransportRuntime(runtimeConfig)`
3. `resolvePresetConfig(config.ui, runtime.capabilities)`
4. 渲染 `TrChat.Controlled`

解析约束：

- `config.ui.features.xxx = true` 不能强行打开 runtime 不支持的功能
- `config.runtime.features.xxx = false` 会让 runtime 不创建对应能力
- preset 解析要同时看：
  - `config.ui.features`
  - `runtime.capabilities`
  - 当前 preset 类型
- `workspace` 是否启用，不从 `runtime.capabilities` 推导，而是只从：
  - `ui.preset === 'workspace'`
  - 或 `ui.shell.variant === 'workspace'`
  这类 UI 配置推导

最终是否展示某功能，统一由：

`runtime capability && preset visibility`

但 `workspace` 是例外：

`workspace shell enabled by ui config`

### 6.6 默认值规则

默认值建议：

- `ui.preset`
  默认 `default`
- `ui.shell.variant`
  跟随 `preset`
- `ui.features.history`
  仅当 runtime 有 `history` 能力时默认开启
- `ui.features.models`
  仅当 runtime 有 `models` 能力时默认开启
- `sender.mode`
  默认 `multiple`
- `messageList.autoScroll`
  默认 `true`

## 7. 新的 runtime 设计

### 7.1 根 runtime 结构

新的 UI 内部只使用一种统一的、已补齐的 runtime 契约：

```ts
type ChatRuntime = {
  kind: 'transport' | 'external-store' | 'custom'
  capabilities: Readonly<ChatRuntimeCapabilities>
  conversation: ChatConversationRuntime
  sender: ChatSenderRuntime
  message: ChatMessageRuntime
  history?: ChatHistoryRuntime
  models?: ChatModelRuntime
  workspace?: ChatWorkspaceRuntime
  attachments?: ChatAttachmentsRuntime
}
```

其中：

- `conversation`
  必填
- `sender`
  对内部 `ChatRuntime` 来说必填；外部输入缺失时由 `Root` 自动补齐
- `message`
  对内部 `ChatRuntime` 来说必填；外部输入缺失时由 `Root` 自动补齐默认实现
- 其他模块
  选填

实现上应明确区分两类类型：

- `ChatRuntimeInput`
  组件 props 和 factory 输入使用
- `ChatRuntime`
  `resolveRuntimeDefaults()` 之后得到的标准化 runtime，供内部消费

### 7.2 runtime capability 设计

```ts
type ChatRuntimeCapabilities = {
  abort: boolean
  retry: boolean
  regenerate: boolean
  editMessage: boolean
  history: boolean
  modelSelection: boolean
  attachments: boolean
  feedback: boolean
  mcp: boolean
}
```

规则：

- capability 是 runtime 的客观能力
- preset feature 是 UI 想不想展示
- message meta capability 是单条消息是否允许执行
- `workspace` 不属于 runtime capability，它是 UI shell 的结构选择

最终按钮可见性公式：

`runtime capability && preset feature visible && message capability`

### 7.3 基础共享类型

```ts
type ChatConversationStatus =
  | 'idle'
  | 'submitting'
  | 'streaming'
  | 'aborting'
  | 'switching-conversation'
  | 'error'

type ChatRuntimeError = {
  code: string
  message: string
  retryable?: boolean
  scope: 'conversation' | 'sender' | 'message' | 'history' | 'model'
  cause?: unknown
}

type ChatSendPayload = {
  text: string
  attachments: ChatAttachmentItem[]
  metadata?: Record<string, unknown>
}
```

### 7.4 `ChatConversationRuntime`（当前会话运行时）

```ts
type ChatConversationRuntime = {
  state: {
    conversationId: Ref<string | null>
    status: Ref<ChatConversationStatus>
    messages: ShallowRef<readonly ChatUIMessage[]>
    error: Ref<ChatRuntimeError | null>
  }
  actions: {
    send: (payload: ChatSendPayload) => Promise<void> | void
    abort?: () => Promise<void> | void
    retry?: (messageId?: string) => Promise<void> | void
    regenerate?: (messageId?: string) => Promise<void> | void
    clear?: () => void
    replaceMessages?: (messages: readonly ChatUIMessage[]) => void
  }
}
```

实现约束：

- `messages` 必须通过 immutable update 更新
- `status` 只表达“当前会话整体状态”
- 当前会话级错误只写入 `state.error`
- 不能在 `send()` 内直接依赖任何具体 UI 组件

### 7.5 `ChatSenderRuntime`（输入区运行时）

```ts
type ChatSenderRuntime = {
  state: {
    draft: Ref<string>
    attachments: ShallowRef<readonly ChatAttachmentItem[]>
    disabled: Ref<boolean>
    submitting: Ref<boolean>
    error: Ref<ChatRuntimeError | null>
  }
  actions: {
    setDraft: (value: string) => void
    submit: () => Promise<void> | void
    reset: () => void
    addAttachments?: (items: ChatAttachmentItem[]) => Promise<void> | void
    removeAttachment?: (id: string) => void
  }
}
```

实现约束：

- `submit()` 可以委托给 `conversation.actions.send`
- 但 `submit()` 负责决定发送后是否清空 draft/attachments
- 输入区 runtime 自己管理输入区错误，不把所有错误都抛到当前会话 runtime

默认补齐策略：

- 如果 controlled runtime 没有提供 sender，`Root` 创建一个默认本地输入区 runtime
- 默认输入区 runtime 的 `submit()` 会：
  - 读取 `draft`
  - 读取 `attachments`
  - 调用 `conversation.actions.send(payload)`
  - 成功后清空输入

### 7.6 `ChatHistoryRuntime`（历史会话列表运行时）

```ts
type ChatHistoryRuntime = {
  state: {
    items: ShallowRef<readonly ChatConversationSummary[]>
    activeId: Ref<string | null>
    loading: Ref<boolean>
    error: Ref<ChatRuntimeError | null>
  }
  actions: {
    create?: () => Promise<void> | void
    select: (id: string) => Promise<void> | void
    rename?: (id: string, title: string) => Promise<void> | void
    remove?: (id: string) => Promise<void> | void
  }
}
```

实现约束：

- `select()` 必须是切换会话的唯一正式入口
- transport runtime 下，`select()` 需要同步更新：
  - `history.state.activeId`
  - `conversation.state.conversationId`
  - `conversation.state.messages`
- UI 不直接操作 `conversation.state.conversationId`

### 7.7 `ChatModelRuntime`

```ts
type ChatModelRuntime = {
  state: {
    items: ShallowRef<readonly ModelOption[]>
    activeId: Ref<string | null>
    loading: Ref<boolean>
    error: Ref<ChatRuntimeError | null>
  }
  actions: {
    select: (id: string) => Promise<void> | void
  }
}
```

实现约束：

- `select()` 是唯一切模型入口
- transport runtime 下，切模型不应直接修改已存在消息
- 模型切换只影响后续发送和 regenerate

### 7.8 `ChatMessageRuntime`

`ChatMessageRuntime` 不直接存放消息内容，只存局部交互态。

```ts
type ChatMessageRuntime = {
  get: (messageId: string) => ChatMessageItemRuntime
  prune?: (messageIds: readonly string[]) => void
}

type ChatMessageItemRuntime = {
  state: {
    editing: Ref<boolean>
    editDraft: Ref<string>
    busy: Ref<boolean>
    error: Ref<ChatRuntimeError | null>
  }
  actions: {
    startEdit?: () => void
    cancelEdit?: () => void
    setEditDraft?: (value: string) => void
    saveEdit?: () => Promise<void> | void
    retry?: () => Promise<void> | void
    regenerate?: () => Promise<void> | void
    copy?: () => void
    submitFeedback?: (value: 'up' | 'down') => Promise<void> | void
  }
}
```

实现约束：

- `get(messageId)` 必须稳定返回同一个 item runtime 实例
- `prune()` 在消息列表变化后清理无用 state，避免 map 无限增长
- 编辑草稿和忙碌态只存在于 item runtime 中

### 7.9 `ChatWorkspaceRuntime`

```ts
type ChatWorkspaceRuntime = {
  state: {
    leftOpen: Ref<boolean>
    rightOpen: Ref<boolean>
    historyOpen: Ref<boolean>
    mobile: Ref<boolean>
  }
  actions: {
    openLeft: () => void
    closeLeft: () => void
    openRight: () => void
    closeRight: () => void
    openHistory: () => void
    closeHistory: () => void
    setMobile: (value: boolean) => void
  }
}
```

实现约束：

- 当前阶段主要由官方 workspace shell 消费
- 如果外部 controlled runtime 不提供该模块，`Root` 可根据 preset 自动补齐

### 7.10 `ChatAttachmentsRuntime`

第一阶段可以只做轻量实现，但接口建议先冻结：

```ts
type ChatAttachmentsRuntime = {
  state: {
    items: ShallowRef<readonly ChatAttachmentItem[]>
    uploading: Ref<boolean>
    error: Ref<ChatRuntimeError | null>
  }
  actions: {
    add: (items: ChatAttachmentItem[]) => Promise<void> | void
    remove: (id: string) => void
    clear: () => void
  }
}
```

### 7.11 runtime factory 设计

```ts
function createTransportRuntime(config: ChatTransportRuntimeConfig): ChatRuntime

function resolveRuntimeCapabilities(
  input: ChatRuntimeInput
): ChatRuntimeCapabilities

function createExternalStoreRuntime(
  input: ChatRuntimeInput & Pick<ChatRuntimeInput, 'conversation'>
): ChatRuntime

type ChatWorkspaceRuntimeInit = {
  leftOpen?: boolean
  rightOpen?: boolean
  historyOpen?: boolean
  mobile?: boolean
}

function createWorkspaceRuntime(
  initial?: ChatWorkspaceRuntimeInit
): ChatWorkspaceRuntime
```

工厂行为要求：

- `createTransportRuntime`
  创建完整或半完整的官方 runtime
- `resolveRuntimeCapabilities`
  根据 `input.capabilities`、已提供的模块和默认规则，生成一份完整 capability 对象
- `createExternalStoreRuntime`
  标准化外部传入模块，并至少补齐缺省的 sender/message
- `createWorkspaceRuntime`
  只负责 workspace 本地状态，不依赖 transport；入参是普通布尔初始值，不是 `Ref`

## 8. 新的消息模型设计

### 8.1 设计目标

`ChatUIMessage` 是新 UI 体系唯一认可的消息类型。  
transport runtime、external store runtime、未来任何自定义 runtime，都必须最终输出这套结构。

这意味着：

- 消息列表只接受 `ChatUIMessage[]`
- message renderer 只接受 `ChatUIMessage`
- 所有来自 provider 的 chunk/result，都要先归一化成 `ChatUIMessage`

### 8.2 推荐结构

```ts
type ChatUIMessage = {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  createdAt?: number
  status?: 'pending' | 'streaming' | 'done' | 'error'
  parts: ChatUIMessagePart[]
  meta?: {
    conversationId?: string
    model?: string
    error?: {
      message: string
      retryable?: boolean
    }
    capabilities?: {
      editable?: boolean
      retryable?: boolean
      regeneratable?: boolean
      feedbackable?: boolean
      copyable?: boolean
    }
    raw?: unknown
  }
}

type ChatUIMessagePart =
  | { type: 'text'; id: string; text: string }
  | { type: 'markdown'; id: string; text: string }
  | { type: 'attachment'; id: string; attachment: ChatAttachmentItem }
  | { type: 'tool-call'; id: string; toolCall: ChatToolCall }
  | { type: 'tool-result'; id: string; toolResult: ChatToolResult }
  | { type: 'error'; id: string; message: string }
  | { type: 'custom'; id: string; kind: string; payload: unknown }
```

推荐补充的配套类型：

```ts
type ChatConversationSummary = {
  id: string
  title: string
  updatedAt?: number
  preview?: string
}

type ChatAttachmentItem = {
  id: string
  name: string
  mimeType?: string
  size?: number
  url?: string
  status?: 'ready' | 'uploading' | 'error'
}
```

### 8.3 状态归属规则

必须严格遵守如下归属：

- 消息内容、消息角色、消息 parts、基础 `status`
  属于 `ChatUIMessage`
- 单条消息编辑态、编辑草稿、消息级 busy/error
  属于 `ChatMessageItemRuntime`
- 当前会话整体发送状态、会话级错误
  属于 `ChatConversationRuntime`
- 输入区草稿和待发送附件
  属于 `ChatSenderRuntime`

禁止出现：

- 把 `editing` 直接写入 `ChatUIMessage`
- 通过 `Object.assign(message, ...)` 方式修改外部消息对象
- 用隐藏属性给消息增加“渲染标记”

### 8.4 归一化流程

所有 runtime 最终都必须走同一套归一化边界：

`provider result / external store message -> normalizeToChatUIMessage -> 消息列表`

推荐拆成三步：

1. 原始数据转换成 `ChatUIMessage` 基础结构
2. 规范化 `parts`
3. 补齐 `meta.capabilities` 和 `status`

建议新增统一 helper：

```ts
function normalizeChatUIMessage(input: unknown): ChatUIMessage
function normalizeChatUIMessagePart(input: unknown): ChatUIMessagePart
```

### 8.5 渲染规则

renderers 必须只依赖：

- `message.role`
- `message.status`
- `message.parts`
- `message.meta`

renderers 不得依赖：

- provider-specific 字段
- runtime-specific 中间对象
- 注入到原始 message 上的额外状态

## 9. Root 与 UI 结构设计

### 9.1 新的 UI 分层

推荐目录结构：

```text
src/components/
  root/
    TrChatRoot.vue
  presets/
    TrChat.vue
    TrChatControlled.vue
    DefaultChatPreset.vue
    WorkspaceChatPreset.vue
  primitives/
    TrChatHeader.vue
    TrChatMessageList.vue
    TrChatMessage.vue
    TrChatSender.vue
    TrChatHistory.vue
    TrChatModelSelector.vue
  renderers/
    part/
    message-actions/
  workspace/
    TrChatWorkspaceShell.vue
    TrChatWorkspaceSidebar.vue
    TrChatWorkspaceSheet.vue
```

### 9.2 `TrChat.Root` 的职责

`TrChat.Root` 是新的运行时根节点，必须只做四件事：

1. 接收 `runtime`
2. 接收 `ui`
3. 对 runtime input 做标准化和缺省补齐
4. provide root runtime、feature runtime 和 ui config
5. 渲染 slot

它不负责：

- 创建 transport runtime
- 解析黑盒 config
- 决定默认页面布局
- 做黑盒场景下的大规模 preset 投影

### 9.3 `TrChat.Root` 初始化步骤

`TrChat.Root` 的 setup 流程固定如下：

1. 校验 `props.runtime.conversation`
2. 调用 `resolveRootUiConfig(props.ui)`
3. 根据解析后的 ui config 推导：
   - 是否使用 workspace shell
   - 哪些 feature 默认可见
4. 调用 `resolveRuntimeDefaults(props.runtime, { ui: resolvedUiConfig })`
5. 拿到标准化 runtime：
   - 补齐输入区 runtime（`sender`）
   - 补齐 `message`
   - 若 `resolvedUiConfig.shell.variant === 'workspace'` 且用户未提供 `workspace`，则补齐 `workspace`
6. provide 以下 injection keys：
   - `CHAT_RUNTIME_KEY`
   - `CHAT_CONVERSATION_RUNTIME_KEY`
   - `CHAT_SENDER_RUNTIME_KEY`
   - `CHAT_MESSAGE_RUNTIME_KEY`
   - `CHAT_HISTORY_RUNTIME_KEY`
   - `CHAT_MODEL_RUNTIME_KEY`
   - `CHAT_WORKSPACE_RUNTIME_KEY`
   - `CHAT_ATTACHMENTS_RUNTIME_KEY`
   - `CHAT_UI_CONFIG_KEY`
7. 渲染 `slots.default`

推荐新增的实现文件：

```text
src/runtime/core/keys.ts
src/runtime/core/resolveRuntimeDefaults.ts
src/runtime/core/resolveRootUiConfig.ts
src/runtime/core/composables.ts
src/components/root/TrChatRoot.vue
```

### 9.4 composable 设计

推荐对外暴露的 composable 行为如下：

```ts
function useChatRuntime(): ChatRuntime
function useConversationRuntime(): ChatConversationRuntime
function useSenderRuntime(): ChatSenderRuntime
function useHistoryRuntime(optional?: true): ChatHistoryRuntime | undefined
function useModelRuntime(optional?: true): ChatModelRuntime | undefined
function useWorkspaceRuntime(optional?: true): ChatWorkspaceRuntime | undefined
function useMessageRuntime(): ChatMessageRuntime
function useMessageItemRuntime(messageId: MaybeRef<string>): ChatMessageItemRuntime
function useChatUiConfig(): ResolvedChatRootUiConfig
```

规则：

- 非 optional hook 在缺失时直接抛错
- optional hook 返回 `undefined`
- `useMessageItemRuntime(messageId)` 只是对 `messageRuntime.get(messageId)` 的包装
- `useChatUiConfig()` 始终返回经过 `resolveRootUiConfig()` 补齐默认值后的对象

### 9.5 primitives 的职责划分

#### `TrChatHeader`

读取：

- 历史会话列表 runtime
- `model runtime`
- `workspace runtime`
- `resolved ui config`

负责：

- 新建会话按钮
- 打开历史按钮
- 模型选择入口
- workspace 面板开关

#### `TrChatMessageList`（消息列表）

读取：

- 当前会话 runtime 的 `messages`
- 当前会话 runtime 的 `status`
- `message runtime`
- `resolved ui config`

负责：

- 渲染消息列表
- 应用 `layout.contentLayout` 和 `layout.placements`
- auto-scroll
- 空态/欢迎态切换
- 为每条消息注入 item runtime

#### `TrChatMessage`

读取：

- `message`
- `message item runtime`
- `resolved ui config.renderers`

负责：

- part 渲染
- message actions
- 编辑态展示
- 错误态展示

#### `TrChatSender`（输入区）

读取：

- 输入区 runtime
- `resolved ui config`

负责：

- 输入框
- 发送按钮
- 附件列表
- 输入区错误展示

#### `TrChatHistory`（历史会话列表）

读取：

- 历史会话列表 runtime
- `resolved ui config.features`

负责：

- 列出会话
- 切换/删除/重命名/新建

### 9.6 preset 的职责划分

#### `TrChat`

- 黑盒入口
- `config -> runtime + preset`

#### `TrChat.Controlled`

- `runtime -> preset`

#### `DefaultChatPreset`

- 使用标准聊天页布局
- 串起 `Header -> MessageList -> Sender`

#### `WorkspaceChatPreset`

- 使用 workspace 壳
- 串起 `WorkspaceShell -> Header / MessageList / Sender / History`

### 9.7 默认 preset 的 slot contracts

为了替代旧方案里大量依赖 `presetOverrides + slots` 的轻量定制路径，默认 preset 必须提供一组稳定的 slot contracts。

推荐最小集合：

| slot | 作用 | 建议 scoped props |
| --- | --- | --- |
| `header` | 完整替换 header | `{ runtime, ui }` |
| `header-extra` | 给默认 header 增补右侧区域 | `{ runtime, ui }` |
| `welcome` | 替换欢迎区 | `{ ui, sendPrompt }` |
| `message-list` | 替换消息区主体 | `{ messages, status, runtime, ui }` |
| `sender` | 替换输入区主体 | `{ draft, submit, abort, error, runtime, ui }` |
| `footer-extra` | 给 sender 上方或下方补充内容 | `{ runtime, ui }` |
| `left` | workspace 左侧主体 | `{ runtime, ui, workspace }` |
| `left-rail` | workspace 左侧 rail | `{ runtime, ui, workspace }` |
| `right` | workspace 右侧主体 | `{ runtime, ui, workspace }` |
| `mobile-left` | 移动端左侧 drawer / sheet | `{ runtime, ui, workspace }` |
| `mobile-right` | 移动端右侧 drawer / sheet | `{ runtime, ui, workspace }` |

约束：

- slot props 只暴露稳定 runtime 和 ui 数据
- 不暴露 transport 内部 request 对象
- 不暴露 provider-specific 中间结果
- 如果 slot 只是补充区域，默认节点仍负责布局与可访问性

## 10. 详细数据流设计

这部分是后续实现时最重要的参考。  
所有实现都应对齐下面这些流程。

### 10.1 黑盒模式初始化流

```text
TrChat(config)
  -> merge config + integrations + events + overrides
  -> normalize transport config
  -> createTransportRuntime(config.runtime)
  -> resolvePresetConfig(config.ui, runtime.capabilities)
  -> render TrChat.Controlled(runtime, ui, events, overrides)
  -> resolveRootUiConfig(ui)
  -> TrChat.Root(runtime, resolvedUi)
  -> resolveRuntimeDefaults(runtime, { ui: resolvedUi })
  -> provide feature runtimes + ui config
  -> preset/primitives 消费 runtime 和 ui config
```

详细步骤：

1. `TrChat` 接收 `config`
2. 合并 `integrations / events / overrides`
3. 调用 `normalizeTransportRuntimeConfig`
4. 调用 `createTransportRuntime`
5. runtime 创建完成后，读出 `runtime.capabilities`
6. 调用 `resolvePresetConfig(ui, capabilities)`
7. 渲染 `TrChat.Controlled`
8. `TrChat.Controlled` 先应用 `overrides`
9. `TrChat.Controlled` 调用 `resolveRootUiConfig`
10. `TrChat.Controlled` 渲染 `TrChat.Root`
11. `TrChat.Root` 补齐缺省模块并 provide
12. preset 和 primitives 开始渲染

### 10.2 Controlled 模式初始化流

```text
user runtime
  -> createExternalStoreRuntime(optional)
  -> TrChat.Controlled(runtime, ui?, events?, overrides?)
  -> resolveRuntimeCapabilities(runtimeInput)
  -> resolvePresetConfig(ui, capabilities)
  -> resolveRootUiConfig(resolvedPreset)
  -> TrChat.Root(runtime, resolvedUi)
  -> resolveRuntimeDefaults(runtime, { ui: resolvedUi })
  -> provide feature runtimes + ui config
  -> preset/primitives
```

详细步骤：

1. 用户传入最少包含 `conversation` 的 runtime
2. 如使用 `createExternalStoreRuntime`，先做标准化
3. `TrChat.Controlled` 注册 `events` 并应用 `overrides`
4. `TrChat.Controlled` 先通过 `resolveRuntimeCapabilities()` 取得有效 capability
5. `TrChat.Controlled` 解析 preset config
6. `TrChat.Controlled` 解析 root ui config
7. `TrChat.Root` 补齐 sender/message
8. 若 `resolvedUi.shell.variant = 'workspace'` 且缺少 `workspace runtime`，由 `Root` 补齐
9. primitives 开始消费 feature runtimes 和 ui config

### 10.3 Whitebox 模式初始化流

```text
user runtime
  -> TrChat.Root(runtime, ui?)
  -> resolveRootUiConfig(ui)
  -> resolveRuntimeDefaults(runtime, { ui: resolvedUi })
  -> provide feature runtimes + ui config
  -> user-composed primitives
```

特点：

- 不经过 preset layout
- 不经过黑盒 config
- 只依赖 root provider、ui config provider 和 primitives

### 10.4 发送流

这个流程需要同时适用于 transport runtime 和 external store runtime。

统一行为链路：

```text
TrChatSender submit
  -> sender.actions.submit()
  -> snapshot draft + attachments
  -> build ChatSendPayload
  -> conversation.actions.send(payload)
  -> runtime 更新 conversation.messages / status
  -> 输入区 reset
```

transport runtime 详细步骤：

1. 输入区 runtime 读取 `draft` 和 `attachments`
2. 若输入无效，更新输入区 runtime 的 `error`，流程结束
3. 调用 `conversation.actions.send(payload)`
4. 当前会话 runtime 追加 user message：
   - `role = 'user'`
   - `status = 'done'`
5. 当前会话 runtime 追加 assistant placeholder：
   - `role = 'assistant'`
   - `status = 'streaming'`
6. `conversation.state.status = 'submitting'`
7. 发起 provider 请求
8. 首个 chunk 到来后，`conversation.state.status = 'streaming'`
9. 每次 chunk 到来都 immutable 更新 assistant message 的 `parts`
10. 完成后：
   - assistant message `status = 'done'`
   - `conversation.state.status = 'idle'`
   - `conversation.state.error = null`
11. 输入区 runtime 清空 draft 和 attachments

external store runtime 详细步骤：

1. UI 仍然只触发输入区 runtime 的 `submit()`
2. 其余全部交给用户 runtime 自己实现
3. UI 只要求：
   - `conversation.state.messages` 能正确变化
   - `conversation.state.status` 能正确变化
   - `conversation.state.error` 能正确更新

### 10.5 流式更新流

transport runtime 下的 chunk 更新链路：

```text
provider chunk
  -> fromResponseChunk(chunk)
  -> normalizeChatUIMessagePart(part)
  -> patch assistant placeholder
  -> messages.value = nextMessages
  -> 消息列表重新渲染
```

实现要求：

- 不能直接原地 `push` 到旧消息对象中的 `parts`
- 必须生成新的 message 对象和新的 messages 数组

### 10.6 中止流

```text
Header/Sender click abort
  -> conversation.actions.abort()
  -> conversation.state.status = 'aborting'
  -> cancel request/stream
  -> assistant message status = 'error' | 'done'
  -> conversation.state.status = 'idle'
```

建议行为：

- 如果中止后保留当前已生成文本，assistant message 可标记为 `done`
- 如果中止视为异常结束，可标记为 `error`
- 二者择一，需在实现前拍板

### 10.7 编辑流

```text
Message action: edit
  -> itemRuntime.actions.startEdit()
  -> itemRuntime.state.editing = true
  -> itemRuntime.state.editDraft = current text
  -> user edit
  -> itemRuntime.actions.saveEdit()
  -> runtime updates conversation.messages
  -> itemRuntime.state.editing = false
```

实现要求：

- 编辑草稿不写回消息对象
- transport runtime 下，`saveEdit()` 可以重新提交后续消息上下文
- external store runtime 下，保存逻辑完全由用户自定义

### 10.8 重试与重新生成流

重试：

```text
Message action: retry
  -> itemRuntime.actions.retry()
  -> conversation/actions.retry(messageId)
  -> runtime 更新 conversation.status
  -> 更新相关 assistant message
```

重新生成：

```text
Message action: regenerate
  -> itemRuntime.actions.regenerate()
  -> conversation/actions.regenerate(messageId)
  -> 生成新的 assistant 内容
```

实现要求：

- 是否支持 retry/regenerate 先看 runtime capability
- 再看 message capability
- 最后看 preset 是否启用该动作

### 10.9 切会话流

```text
History click item
  -> history.actions.select(conversationId)
  -> history.state.activeId update
  -> conversation.state.status = 'switching-conversation'
  -> load target conversation messages
  -> conversation.state.conversationId update
  -> conversation.state.messages replace
  -> conversation.state.status = 'idle'
```

实现要求：

- UI 不允许直接改 `conversation.state.conversationId`
- transport runtime 下，切换逻辑由历史会话列表 runtime 驱动
- external store runtime 下，只要求对外行为一致

### 10.10 切模型流

```text
ModelSelector select model
  -> model.actions.select(modelId)
  -> model.state.activeId update
```

实现要求：

- 切模型默认不改已有消息
- 后续 send/regenerate 使用新模型
- 若切模型失败，错误只写入 `model.state.error`

### 10.11 workspace 流

```text
Workspace trigger click
  -> workspace.actions.openLeft/openRight/openHistory
  -> workspace.state update
  -> shell rerender
```

实现要求：

- workspace 只负责布局和面板状态
- 不承接当前会话/message/输入区 数据

## 11. 目录与实现组织建议

### 11.1 建议目录

```text
src/
  components/
    root/
      TrChatRoot.vue
    presets/
      TrChat.vue
      TrChatControlled.vue
      DefaultChatPreset.vue
      WorkspaceChatPreset.vue
    primitives/
      TrChatHeader.vue
      TrChatMessageList.vue
      TrChatMessage.vue
      TrChatSender.vue
      TrChatHistory.vue
      TrChatModelSelector.vue
    renderers/
      part/
      actions/
    workspace/
      TrChatWorkspaceShell.vue
      TrChatWorkspaceRail.vue
      TrChatWorkspaceSheet.vue
  runtime/
    core/
      types.ts
      keys.ts
      composables.ts
      resolveRuntimeDefaults.ts
    config/
      types.ts
      normalizeTransportRuntimeConfig.ts
      resolvePresetConfig.ts
    transport/
      createTransportRuntime.ts
      normalizeChatUIMessage.ts
      updateConversationMessages.ts
      createTransportConversationRuntime.ts
      createTransportModelRuntime.ts
    external-store/
      createExternalStoreRuntime.ts
    workspace/
      createWorkspaceRuntime.ts
    message/
      createMessageRuntime.ts
  shared/
    context/
    messages/
  types/
```

### 11.2 旧文件到新结构的映射

| 当前文件 | 新职责建议 |
| --- | --- |
| `components/core/Chat.vue` | 重做为 `components/presets/TrChat.vue` |
| `components/core/ChatScaffold.vue` | 删除，职责拆到 `TrChat.vue` + runtime/config helpers |
| `components/core/ChatProvider.vue` | 删除，重做为 `components/root/TrChatRoot.vue` |
| `components/core/ChatHeader.vue` | 重做为 `components/primitives/TrChatHeader.vue` |
| `components/core/ChatMessageList.vue` | 重做为 `components/primitives/TrChatMessageList.vue` |
| `components/core/ChatSender.vue` | 重做为 `components/primitives/TrChatSender.vue` |
| `components/core/default-renderer/*` | 重做为 `components/presets/*` |
| `runtime/chat-kit/useChatKit.ts` | 重构为 `runtime/transport/createTransportRuntime.ts` |
| `runtime/chat-kit/chatMessageState.ts` | 删除，替换为 `runtime/message/createMessageRuntime.ts` |
| `runtime/chat-kit/chatRenderMessages.ts` | 删除，替换为 `runtime/transport/normalizeChatUIMessage.ts` |
| `components/workspace/chatUiContext.ts` | 重构为 `runtime/workspace/createWorkspaceRuntime.ts` |
| `runtime/config/configProjection.ts` | 收缩为 `resolvePresetConfig.ts` |

## 12. 关键实现设计

### 12.1 transport runtime 的内部结构

transport runtime 建议由以下内部 store 组成：

- `conversationStore`
  保存 `conversationId/status/messages/error`
- `senderStore`
  保存输入区的 `draft/attachments/submitting/error`
- `modelStore`
  保存 `items/activeId/loading/error`
- `historyStore`
  保存 `items/activeId/loading/error`
- `messageItemStore`
  `Map<messageId, ChatMessageItemRuntime>`

推荐实现方式：

- 每个 store 使用 `ref` / `shallowRef`
- 通过工厂函数组合成 `ChatRuntime`
- 所有 messages 更新都走统一 helper：
  - `replaceMessageById`
  - `appendMessage`
  - `patchMessageParts`

### 12.2 external store runtime 的实现要求

`createExternalStoreRuntime` 不应该复制用户数据，只做适配层。

它的职责：

- 校验最少输入
- 根据缺失模块补齐默认输入区 runtime 和 message runtime
- 生成标准化 `capabilities`
- 返回统一 `ChatRuntime`

它不负责：

- 替用户维护真正的消息 source of truth
- 擅自持久化外部数据
- 根据页面布局擅自创建 `workspace runtime`

建议按下面的顺序实现：

```ts
function createExternalStoreRuntime(input: ChatRuntimeInput): ChatRuntime {
  assert(input.conversation)

  const sender =
    input.sender ??
    createDefaultSenderRuntime({
      conversation: input.conversation,
      attachments: input.attachments,
    })

  const message = input.message ?? createMessageRuntime()

  const normalized: ChatRuntimeInput = {
    kind: input.kind ?? 'external-store',
    conversation: input.conversation,
    sender,
    message,
    history: input.history,
    models: input.models,
    workspace: input.workspace,
    attachments: input.attachments,
    capabilities: input.capabilities,
  }

  return {
    ...normalized,
    kind: normalized.kind ?? 'external-store',
    sender,
    message,
    capabilities: resolveRuntimeCapabilities(normalized),
  }
}
```

实现细则：

- 不要新建一份 `messages` 副本
- 不要包一层新的 conversation store 再同步回用户 store
- 只能补齐“局部 UI runtime”，不能替换用户的当前会话 source of truth
- `workspace` 仍交给 `Root` 根据 `ui.shell.variant` 决定是否补齐

### 12.3 message item runtime store 的实现要求

建议实现为：

```ts
const itemStore = new Map<string, ChatMessageItemRuntime>()
```

`get(messageId)` 的行为：

- 如果已有实例，直接返回
- 如果没有，创建默认 item runtime
- 默认 item runtime 仅包含：
  - `editing = false`
  - `editDraft = ''`
  - `busy = false`
  - `error = null`

`prune(messageIds)` 的行为：

- 移除已不在消息列表中的 messageId

### 12.4 `resolveRuntimeDefaults` 的实现要求

该 helper 是 `Root` 的核心。

职责：

- 补齐缺省输入区 runtime
- 补齐缺省 message runtime
- 读取 `resolved ui config`
- 在使用 workspace shell 且未提供 `workspace runtime` 时补齐 workspace runtime
- 重新推导 `runtime.capabilities`

不负责：

- 创建 transport runtime
- 解析黑盒 config

推荐函数签名：

```ts
function resolveRuntimeDefaults(
  input: ChatRuntimeInput,
  options: {
    ui: ResolvedChatRootUiConfig
  }
): ChatRuntime
```

建议实现顺序：

1. 读取 `input.conversation`
2. 若缺少 `sender`，调用 `createDefaultSenderRuntime({ conversation, attachments })`
3. 若缺少 `message`，调用 `createMessageRuntime()`
4. 若 `options.ui.shell.variant === 'workspace'` 且缺少 `workspace`，调用 `createWorkspaceRuntime()`
5. 组装一份 `normalizedInput`
6. 调用 `resolveRuntimeCapabilities(normalizedInput)`
7. 返回最终 `ChatRuntime`

边界约束：

- 必须是幂等的
  同一个已标准化 runtime 多次进入该 helper，不应反复创建新模块
- 不允许替换用户已经传入的 `Ref` / `ShallowRef`
- 默认补齐只发生在缺失模块上，不覆盖用户实现
- capability 的最终值以 `resolveRuntimeCapabilities()` 为准

### 12.5 `resolveRuntimeCapabilities` 的实现要求

这个 helper 负责把“不完整的 capability 描述”收敛成完整对象。

推荐函数签名：

```ts
function resolveRuntimeCapabilities(
  input: ChatRuntimeInput
): ChatRuntimeCapabilities
```

推荐推导顺序：

1. 先读取 `input.capabilities?.xxx`
2. 若调用方显式给了布尔值，直接采用
3. 否则根据已提供模块和 action 自动推导
4. 若无法可靠推导，默认 `false`

推荐默认规则：

```ts
abort = input.capabilities?.abort ?? !!input.conversation.actions.abort
retry = input.capabilities?.retry ?? !!input.conversation.actions.retry
regenerate =
  input.capabilities?.regenerate ?? !!input.conversation.actions.regenerate
editMessage = input.capabilities?.editMessage ?? false
history = input.capabilities?.history ?? !!input.history?.actions.select
modelSelection =
  input.capabilities?.modelSelection ?? !!input.models?.actions.select
attachments =
  input.capabilities?.attachments ??
  (!!input.attachments || !!input.sender?.actions.addAttachments)
feedback = input.capabilities?.feedback ?? false
mcp = input.capabilities?.mcp ?? false
```

说明：

- `editMessage`
  第一阶段默认不自动推导，避免把“局部 message action 存在”误判成“全局支持编辑”
- `feedback`
  第一阶段默认只接受显式声明
- `mcp`
  第一阶段默认只接受 transport/runtime 显式声明
- `workspace`
  不属于 runtime capability，不在这里推导

### 12.6 可见性计算 helper

建议新增统一 helper：

```ts
function canShowFeature(
  capability: boolean | undefined,
  visible: boolean | undefined
): boolean

function canShowMessageAction(
  runtimeCapability: boolean | undefined,
  presetVisible: boolean | undefined,
  messageCapability: boolean | undefined
): boolean
```

所有 header / message / sender 按钮都通过 helper 统一判断，避免每个组件自己拼条件。

## 13. 能力覆盖目标与阶段范围

### 13.1 总体约束

这轮重构虽然不以兼容旧 API 为首要目标，但最终必须满足一个更高层的约束：

- 原有 `packages/chat` 的能力族，最终都要在新方案里找到明确承接点
- 如果某项能力不再挂在原来的入口或属性名上，必须给出新的正式入口
- 任何旧能力都不能处于“旧入口没了，新入口也没有正式定义”的悬空状态

这里的“覆盖旧方案”指的是覆盖能力，不要求保留旧名字，也不要求所有能力继续挂在 `TrChat` 单一入口上。

### 13.2 旧能力族到新能力族的覆盖目标

| 旧能力族 | 旧入口示例 | 新方案最终承接方式 | 目标阶段 |
| --- | --- | --- | --- |
| 黑盒默认接入 | `TrChat + config` | `TrChat + TrChatAppConfig + preset UI` | Phase 2 |
| 配置驱动的模型 / provider / 默认模型 / UI / layout / shell / features | `config.models/providers/defaults/ui/layout/shell/features` | `TrChatAppConfig.runtime + TrChatAppConfig.ui` | Phase 2-4 |
| 页面实例级输入 | 顶层 `runtime` 中的 `storage`、`initialMessages`、`selectedModel`、`mcpManager`、`messageTransforms` | 拆分到 `ChatTransportRuntimeConfig.persistence/transforms`、专用 feature runtime、黑盒 `integrations.initialModel / mcpManager` | Phase 2-5 |
| 黑盒行为回调 | `callbacks.onBeforeSend/onFinish/onError/onMessageAction/onModelChange` | 新的 `events` 能力族 + transport `hooks` | Phase 2 |
| 页面级轻量覆盖 | `presetOverrides` | 新的 `overrides` 能力族，拆成 `ui overrides + renderer overrides + primitive prop overrides` | Phase 2-3 |
| 默认结构上的局部替换 | `header-extra`、`footer-extra`、`sender`、`message-list`、workspace panel slots | 新的 preset slot contracts + `Root` whitebox | Phase 2-3 |
| 结构重排但仍复用默认能力 | `TrChat.Scaffold` | `TrChat.Controlled + preset slots` 或 `TrChat.Root + preset components` | Phase 3 |
| 自己接 runtime / 自己拼装页面 | `TrChat.Provider` | `TrChat.Root` | Phase 3 |
| whitebox 复合组件族 | `Layout`、`WorkspaceLayout`、`Header`、`Welcome`、`Footer`、`HistorySurface`、`WorkspaceShell` 等 | 以 `Root` 为中心重建 compound/named exports | Phase 3-4 |
| 消息扩展 | `messageActions`、`bubbleRenderers`、`messageTransforms` | `message runtime + renderers + transport transforms` | Phase 2-4 |
| 业务 feature | `history`、`feedback`、`attachments`、`senderActions`、`welcomePrompts`、`mcp` | 独立 feature runtime + primitive + preset 接入 | Phase 4 |
| workspace 能力 | `shell.leftRegion/rightRegion/viewState`、workspace slots、sheet/rail | `workspace runtime + workspace preset + slot contracts` | Phase 4 |
| 低层 runtime 观测与调试 | `chatKit.runtime.requestState/isProcessing/saveMessages/clear` | 新的 runtime inspector / transport state composables | Phase 5 |
| helper / public surface | `useChatKit`、`useMcpManager`、`useChatAttachments` 等 | 重新评估后保留稳定 helper，其余迁到 feature runtime/composable | Phase 5 |

### 13.3 新方案最终应形成的正式入口层次

为了避免能力分散，最终建议形成这 6 类正式入口：

- `config`
  黑盒稳定默认值
- `integrations`
  黑盒模式下的页面实例对象和桥接对象
- `events`
  黑盒和 controlled 模式的副作用回调
- `overrides`
  页面级轻量覆盖
- `slots`
  默认 preset 的结构替换
- `Controlled / Root`
  进入自定义数据层和 whitebox 的正式入口

其中：

- 旧 `presetOverrides` 不再直接保留原形，而是拆到 `overrides + slots + renderers`
- 旧 `callbacks` 不再散落在多个入口上，而是收口到 `events + transport hooks`
- 旧 `Provider` / `Scaffold` 不再作为主心智模型，而是由 `Controlled / Root` 承接

### 13.4 当前阶段的范围控制原则

虽然最终目标是覆盖旧方案全部能力，但实现上必须分阶段：

- Phase 1 必须先打通 runtime 主干和 `Root`
- Phase 2 必须先恢复黑盒主路径和页面级轻量定制路径
- Phase 3 必须恢复 whitebox 和公开组件族
- Phase 4 必须补齐 feature parity
- Phase 5 必须补齐高级 runtime 能力、辅助 hooks、调试与文档

不允许出现以下情况：

- 只打通 `conversation + sender + message`，但没有后续 phase 去承接原有 feature
- 只保留黑盒路径，不给旧白盒/自定义 runtime 场景新入口
- 只迁移 UI，不迁移消息扩展、MCP、attachments、history 等真实产品能力

## 14. 实施计划建议

### 14.1 Phase 0：冻结契约与能力迁移表

这一阶段只允许讨论和修订文档，不开始具体 Vue 组件迁移。

必须冻结：

- `runtime/core/types.ts`
- `runtime/config/types.ts`
- `ChatUIMessage`
- `ChatRuntimeInput`
- `ChatRuntime`
- `ChatConversationRuntime`
- `ChatSenderRuntime`
- `ChatRootUiConfig`
- `ResolvedChatRootUiConfig`
- `TrChatProps`
- `TrChatControlledProps`
- `TrChatRootProps`

必须同时产出：

- 旧能力族 -> 新能力族的正式映射表
- 公开入口分层草案：
  - `config`
  - `integrations`
  - `events`
  - `overrides`
  - `slots`
  - `Controlled / Root`
- public surface 盘点清单：
  - 保留
  - 改名
  - 下沉
  - 删除

### 14.2 Phase 1：搭 runtime 主干和 Root 基线

目标：

- 先把“纯 UI + 官方 UI”真正做成立
- 让 UI 在技术上脱离 `chatKit`
- 打通消息模型、运行时模型、Root provider 主链

新增：

- `runtime/core/types.ts`
- `runtime/core/keys.ts`
- `runtime/core/composables.ts`
- `runtime/core/resolveRootUiConfig.ts`
- `runtime/core/resolveRuntimeDefaults.ts`
- `runtime/core/resolveRuntimeCapabilities.ts`
- `runtime/message/createMessageRuntime.ts`
- `runtime/transport/createTransportRuntime.ts`
- `runtime/transport/normalizeChatUIMessage.ts`
- `runtime/workspace/createWorkspaceRuntime.ts`
- `runtime/external-store/createExternalStoreRuntime.ts`
- `components/root/TrChatRoot.vue`
- `components/primitives/TrChatHeader.vue`
- `components/primitives/TrChatMessageList.vue`
- `components/primitives/TrChatMessage.vue`
- `components/primitives/TrChatSender.vue`

这一阶段覆盖的旧能力：

- `Provider` 的底层运行时根能力
- `chatKit` 驱动的核心消息链路
- 发送 / streaming / abort / retry / regenerate / edit 主语义
- whitebox 最小组合页

这一阶段明确不要求：

- 完整 feature parity
- 完整黑盒配置能力
- 完整 public surface

验收标准：

- controlled 模式可接外部当前会话 runtime
- whitebox 模式可独立组合 `Header + MessageList + Sender`
- 不再通过消息对象隐藏字段承载编辑态或错误态
- UI 中不存在对 `chatKit` 的直接依赖

### 14.3 Phase 2：恢复黑盒主路径与轻量定制路径

目标：

- 让新的 `TrChat` 真正可替代今天的大多数黑盒接入
- 让旧 `callbacks` 和 `presetOverrides` 有更清晰的新承接方式
- 让默认 preset 上的局部替换重新成立

新增或冻结：

- `components/presets/TrChat.vue`
- `components/presets/TrChatControlled.vue`
- `components/presets/DefaultChatPreset.vue`
- `runtime/config/normalizeTransportRuntimeConfig.ts`
- `runtime/config/resolvePresetConfig.ts`
- `TrChatEvents`
- `TrChatIntegrations`
- `ChatUiOverrides`
- 默认 preset 的 slot contracts

这一阶段必须覆盖的旧能力：

- `TrChat + config`
- 常见 `config` 能力：
  - `models`
  - `providers`
  - `defaults`
  - `ui`
  - `appearance`
  - `layout`
  - 常见 `features`
- 常见 `callbacks`
- 常见 `presetOverrides`
- 通用区域 slots：
  - `header`
  - `header-extra`
  - `welcome`
  - `message-list`
  - `sender`
  - `footer-extra`

这一阶段建议的新分层：

- 稳定默认值进入 `config`
- 页面实例对象进入 `integrations`
- 副作用回调进入 `events`
- 页面级轻量差异进入 `overrides`
- 局部结构替换进入 `slots`

验收标准：

- 黑盒模式可发送并流式展示
- 黑盒模式可通过 `events` 替代旧主要 `callbacks`
- 页面级轻量差异不必进入 `Root` 也能完成
- 默认 preset 的常见 slots 可替换

### 14.4 Phase 3：恢复 whitebox、公用组件族与结构重排能力

目标：

- 把旧 `Scaffold / Provider` 能承接的结构定制场景，收口到 `Controlled / Root`
- 恢复 compound components 和 named exports 的主要使用面
- 让 workspace 与页面结构重排重新可做

新增或重建：

- `components/primitives/TrChatWelcome.vue`
- `components/primitives/TrChatFooter.vue`
- `components/primitives/TrChatHistory.vue`
- `components/presets/WorkspaceChatPreset.vue`
- `components/workspace/TrChatWorkspaceShell.vue`
- `components/workspace/TrChatWorkspaceRail.vue`
- `components/workspace/TrChatWorkspaceSheet.vue`
- `components/history/TrChatHistorySurface.vue`
- 重新设计的 compound/named exports

这一阶段必须覆盖的旧能力：

- `TrChat.Scaffold`
- `TrChat.Provider`
- `Layout / WorkspaceLayout`
- `Welcome / Footer`
- `History / HistorySurface`
- `WorkspaceShell / WorkspaceRightSheet`
- workspace panel slots：
  - `left`
  - `left-rail`
  - `right`
  - `mobile-left`
  - `mobile-right`

验收标准：

- “改结构但仍复用默认能力”的场景不需要退回旧 API
- workspace 页可用新 `Root + preset + slots` 组合完成
- 主要 whitebox 公开组件恢复可用

### 14.5 Phase 4：补齐 feature parity

目标：

- 把旧方案中真正被用户感知到的 feature 完整迁入新 runtime/UI 体系
- 不再留下“主干很新，但外围 feature 还停留在旧方案”的双轨状态

必须完成：

- 历史会话列表 runtime + primitive + preset 接入
- `model runtime + selector primitive + model switch flow`
- `workspace preset + region config + mobile sheet/rail`
- `attachments runtime + sender attachment flow`
- `feedback` 动作与 UI
- `MCP` runtime / panel / trigger
- `senderActions`
- `welcomePrompts`
- `message actions`
- `renderer registrations`

这一阶段必须覆盖的旧能力：

- `history`
- `feedback`
- `attachments`
- `senderActions`
- `welcomePrompts`
- `mcp`
- `bubbleRenderers`
- `messageActions`
- workspace 区域配置和 panel 定制

验收标准：

- 新方案下的 feature 组合能力不弱于旧方案
- 这些 feature 都通过新 runtime / preset / primitive 落地，而不是临时回接旧 `chatKit`

### 14.6 Phase 5：补齐高级 runtime、helper 与工具链能力

目标：

- 把旧方案中不属于“主界面”但对高级接入非常重要的能力收口
- 给长期维护保留一个稳定、可测试的高级接口层

必须完成：

- transport `hooks`
- transport `transforms`
- `persistence`
- runtime inspector composables
- `clear / save / restore / processing state` 这类高级能力的正式入口
- 高级 helper 的保留/重命名/删除决策
- demo、docs、tests 全量迁移

这一阶段必须覆盖的旧能力：

- `messageTransforms`
- `storage`
- `initialMessages`
- 旧 `selectedModel`
- `chatKit.runtime.*`
- `useMcpManager`
- `useChatAttachments`
- `useChatFeedback`
- 其他仍有价值的 helper / composable

验收标准：

- 高级接入场景不再依赖旧 `useChatKit`
- 文档里的所有正式能力都能落到新入口上
- public surface 完成最终收口，不再保留两套平行心智模型

## 15. 测试策略

### 15.1 runtime contract tests

重点验证：

- `createTransportRuntime()` 输出的模块是否齐全
- `resolveRuntimeCapabilities()` 是否能根据输入模块正确推导 capability
- `createExternalStoreRuntime()` 是否正确补齐输入区/message
- `resolveRuntimeDefaults()` 是否会在 workspace shell 下按预期补齐 `workspace runtime`
- `resolveRootUiConfig()` 是否能稳定补齐 whitebox 所需默认值

### 15.2 message model tests

重点验证：

- `normalizeChatUIMessage()`
- chunk 合并后 message parts 是否正确
- `status` 更新是否符合预期

### 15.3 primitive UI tests

重点验证：

- `TrChatMessageList` 是否只依赖 runtime
- `TrChatSender` 是否通过输入区 runtime 发送
- `TrChatMessage` 是否通过 item runtime 进入编辑态

### 15.4 preset tests

重点验证：

- `TrChat` 能否从 config 启动
- `TrChat.Controlled` 能否直接接 runtime
- feature 可见性是否遵守 capability + preset visibility
- `events` 是否能承接主要黑盒回调
- `overrides` 是否能承接主要页面级轻量覆盖
- 默认 preset slots 是否按约定工作

### 15.5 integration tests

至少覆盖这些最小集成：

- transport 黑盒模式
- external store controlled 模式
- whitebox `Root + Header + MessageList + Sender`
- workspace preset + panel slots
- history / model / attachments / feedback / MCP 的最小 feature 组合

### 15.6 能力覆盖回归测试

每个 phase 结束前，都要回到第 13 节的能力覆盖表做一轮回归检查。

至少要保证：

- 被标记为当前 phase 覆盖的旧能力族，都已经有测试或 demo 证明
- 不再出现“主链路可用，但旧扩展点无新入口”的空档
- 文档中的正式推荐路径，和当前可运行实现一致

## 16. 这份设计相对旧方案的关键变化

最重要的变化不是“多一个纯 UI 入口”，而是下面这几个结构性变化：

- 黑盒入口不再直接支配整套内部 UI 架构
- runtime 成为 UI 的唯一数据来源
- `config` 降级为黑盒模式的输入，而不是所有模式的中心
- message 不再被 UI 侧隐式修改
- `chat` 继续保留“开箱即用”的定位，但内部实现不再和这个定位强绑定

## 17. 需要评审拍板的点

以下问题在实现前需要明确。

### P1. `TrChatControlled` 是否作为正式公开入口

我的建议：

- 是

原因：

- 它能清晰区分“黑盒模式”和“纯 UI + 默认官方 UI”模式

### P2. `TrChatRoot` 是否正式替代当前 `Provider`

我的建议：

- 是

原因：

- `Root` 比 `Provider` 更容易表达“这是新的运行时根节点”

### P3. `workspace` 是否第一阶段就暴露为 runtime module

我的建议：

- 内部先按 runtime module 设计
- 第一阶段外部可以不主推

### P4. `config.ui` 是否保留较多 preset 配置

我的建议：

- 保留，但只服务黑盒模式

原因：

- 这符合 `chat` 开箱即用的产品定位
- 也能保留当前“少量配置可启动聊天应用”的优势

### P5. `ChatUIMessage` 是否从第一天就采用 part-based 结构

我的建议：

- 是

原因：

- 这是长期最稳的消息模型
- 如果第一天不这样做，后续很容易再次返工

### P6. runtime 是否现在就下沉到 `packages/kit`

我的建议：

- 否

原因：

- 当前阶段应该先把 `packages/chat` 内部边界稳定下来
- 等 runtime contract 稳定后，再评估是否下沉

### P7. `integrations / events / overrides` 的精确边界怎么切

推荐拍板方案：

- `integrations`
  只承接页面实例对象和 bridge
- `events`
  只承接副作用与生命周期
- `overrides`
  只承接 UI 表达覆盖

推荐口径：

`对象进 integrations，副作用进 events，展示差异进 overrides`

例子：

- 页面传一个 `mcpManager`
  这是实例对象，进 `integrations`
- 页面想在发送完成后打日志
  这是副作用，进 `events`
- 页面只想把输入框 placeholder 改掉
  这是展示差异，进 `overrides`

剩余待定点：

- `mcpManager` 这种 bridge 对象，后续是否统一改成 `mcpRuntime` 或 `mcpBridge`
- `primitiveProps` 是否继续留在 `overrides`，还是单独作为更低层 escape hatch

### P8. 模型默认值与当前选中值的优先级怎么定

推荐拍板方案：

- `config.defaults.model`
  只负责黑盒模式的初始化默认值
- `integrations.initialModel`
  作为页面实例级初始化覆盖
- `modelRuntime.state.activeId`
  作为真正运行时 source of truth

推荐口径：

`默认值只管初始化，运行态只认 runtime 当前值`

推荐规则：

1. 如果有 `modelRuntime`
   最终以 `modelRuntime.state.activeId` 为准
2. 如果没有 `modelRuntime`，但有 `integrations.initialModel`
   用它初始化当前模型
3. 如果两者都没有，再回退到 `config.defaults.model`
4. 初始化完成后，不再通过 `initialModel` 持续控制当前模型

例子：

- `config.defaults.model = 'gpt-4o-mini'`
- `integrations.initialModel = 'gpt-4.1'`
- 用户进入页面后又切成 `deepseek-chat`

最终规则应该是：

- 初始化时优先 `gpt-4.1`
- 运行中当前模型是 `deepseek-chat`
- 后续 UI 和请求都只认 runtime 当前值

剩余待定点：

- 黑盒模式下，如果 `initialModel` 指向不存在的模型，是否直接告警
- controlled 模式是否完全不接受顶层 `initialModel`，而要求直接提供 `modelRuntime`

### P9. `overrides` 和 `slots` 的优先级是否要严格冻结

推荐拍板方案：

- `overrides`
  先于默认 preset 生效
- 替换型 `slots`
  最终接管结构
- 补充型 `slots`
  只做增量扩展

推荐口径：

`整块替换看 slot，轻量调整看 overrides`

明确规则：

- `sender`、`message-list`、`header`
  这类整块替换 slot 一旦出现，就默认完全接管对应区域
- `header-extra`、`footer-extra`
  这类补充 slot 只在默认结构上增补内容
- `renderers`
  暂时归在 `overrides`，但语义上单独视作“渲染扩展轨道”

例子：

- 页面写了 `overrides.sender.placeholder = '问点什么'`
- 同时又写了 `#sender` slot

推荐结果应是：

- `#sender` 整块接管输入区
- `overrides.sender.placeholder` 不再继续影响这个自定义 slot

剩余待定点：

- 是否允许某些 `overrides` 继续透传到 slot props 中，作为默认建议值

### P10. 默认 preset 的 scoped slots 要暴露多宽的上下文

推荐拍板方案：

- 只暴露稳定 runtime 和 ui config
- 按任务导向暴露最小上下文
- 不暴露 transport 内部 request 对象和 provider-specific 中间结果

推荐口径：

`暴露能完成任务的能力，不暴露整套内部实现`

例子：

- `sender` slot
  推荐暴露 `draft / setDraft / submit / abort / error / disabled`
- `message-list` slot
  推荐暴露 `messages / status / runtime / ui`
- `header-extra` slot
  推荐只暴露 `runtime / ui`，不额外透出底层 request 细节

剩余待定点：

- `message-list` slot 是否需要直接暴露 `messageRuntime`
- `sender` slot 是否需要直接暴露附件相关 action
- `header-extra` / `footer-extra` 是否需要比 `runtime + ui` 更窄的上下文

### P11. `senderActions` 和 `welcomePrompts` 应该继续作为 feature，还是下沉回 UI 配置

推荐拍板方案：

- `welcomePrompts`
  回到 `welcome` UI 配置
- `senderActions`
  拆成两层：
  - capability 决定能不能用
  - sender UI config 决定怎么显示

推荐口径：

`一个更像内容，一个更像能力加展示，不建议继续用同一种建模方式`

例子：

- `welcomePrompts`
  本质上更像欢迎区默认内容，适合进入 `ui.welcome.prompts`
- `senderActions`
  里的语音、附件入口更像 capability
- `senderActions`
  里的字数统计、按钮顺序更像 UI config

剩余待定点：

- `senderActions` 是否最终要演进成 sender 子插件体系
- `welcomePrompts` 是否还需要保留单独的 feature 开关来做显式关闭

### P12. 高级 helper 和 runtime inspector 要公开到什么程度

推荐拍板方案：

- 正式公开只保留稳定 runtime contract 对应的 composable
- debug / inspector 能力单独分组
- 不再把 `chatKit.runtime.*` 一类内部实现细节当主公共接口

推荐口径：

`公开稳定能力，调试能力单独收口`

例子：

- `useConversationRuntime()`、`useSenderRuntime()`
  这类与稳定 contract 一一对应的 composable，适合正式公开
- `requestState`、`processingState`、底层 active engine
  这类调试与观测能力，更适合进入 inspector 或 experimental 分组

剩余待定点：

- `useMcpManager`、`useChatAttachments`、`useChatFeedback`
  是保留独立 helper，还是收回 feature runtime/composable
- runtime inspector 是正式 API，还是仅供调试/测试使用

## 18. 推荐结论

当前最合理的方向不是“在现有 `TrChat` 上加一个纯 UI 特例”，而是：

- 保持 `chat` 作为“少量配置即可启动 AI 会话应用”的产品定位
- 在 `packages/chat` 内部重建成“runtime modules + UI primitives + preset UI”的双模式架构
- 让 `TrChat` 和纯 UI 用法共享同一套底层实现

如果一句话概括新设计，就是：

`packages/chat` 仍然是聊天应用包，但它的内部实现要从“黑盒组件中心”变成“runtime 驱动的双模式 UI 体系”。 
