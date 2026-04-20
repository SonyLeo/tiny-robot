# Chat 重构实施蓝图

状态：提议中的 Phase 0.5 实施蓝图，已结合当前评审意见优化。

本文档把当前重构方向收敛成面向实现的蓝图，用于明确：

- Phase 0.5 需要冻结的 contract
- 参考实现形态
- 第一批实现切片
- 开发阶段实现门禁与旧边界参考

它主要收敛以下文档中仍然开放或仍有冲突的部分：

- `ARCHITECTURE_REFACTOR_API_RUNTIME.md`
- `ARCHITECTURE_REFACTOR_EXECUTION.md`
- `ARCHITECTURE_REFACTOR_DESIGN.md`

若本文档与其他历史提案冲突，优先级按下面处理：

1. `ARCHITECTURE_REFACTOR_EXECUTION.md`
   负责开发阶段 phase 顺序、实现门禁、测试门禁
2. 本文档
   负责 Phase 0.5 的实现级 contract 收口
3. `ARCHITECTURE_REFACTOR_API_RUNTIME.md`
   负责对外心智与公开 contract 叙述

## 1. 优化后的目标

本蓝图在保留原始方向的前提下，围绕 6 条原则收口：

1. 保持公开心智简单
2. 保持 source of truth 唯一归属
3. 保持 `TrChat.Root` 不重新长成第二套 `Scaffold`
4. 保持 `TrChat.Page` 只是组合层，而不是 whole-runtime relay
5. 保持 slot 词汇与现有 workspace 边界语义可对照
6. 保持实现阶段可分层、可评审、可逐步验证

目标公开故事仍然是：

1. `TrChat`
2. `TrChat.Root + TrChat.Page`
3. `TrChat.Root + primitives`

但在实现上，要明确避免下面这些退化：

- `Root` 重新承担黑盒配置投影
- `ui` 变成隐藏的 page/runtime 桶
- `slot` 变成 whole-runtime bypass
- `messageIndex` 泄漏到新 public contract
- `Page` 重新拥有 runtime source of truth

## 2. Phase 0.5 必须冻结的关键决策

这一节只回答“在开工前必须先定死什么”。

### 2.1 `TrChat.Root` 只消费 `{ runtime, ui }`

`TrChat.Root` 不能：

- 直接接受原始黑盒 `config`
- 重建 `loadChatConfig -> adapter -> preset props -> preset slices`
- 读取 legacy `Scaffold` context

`TrChat.Root` 只负责：

- 把 `ChatRuntimeInput` 归一化为 `ChatRuntime`
- 通过 context 提供 runtime modules
- 通过 context 提供展示默认值 `ui`

推荐 props：

```ts
type TrChatRootProps = {
  runtime: ChatRuntimeInput
  ui?: TrChatRootUiConfig
}
```

### 2.2 `ui` 必须严格保持 display-only

当前文档的最大冲突之一，是前面把 `ui` 定义成展示默认值，后面又把 `ui.page`、`ui.messages`、`ui.slots` 塞回 `Root`。

本蓝图冻结如下规则：

- `ui` 只承载展示默认值
- page 组合默认值不放进 `ui`
- message actions / renderers / transforms 不放进 `ui`
- slot 注册不放进 `ui`

`ui` 仅限这些字段：

- `brand`
- `welcome`
- `appearance`
- `contentLayout`
- `copy`

推荐类型：

```ts
type TrChatRootUiConfig = {
  brand?: ChatBrandConfig
  welcome?: ChatWelcomeConfig
  appearance?: ChatAppearanceConfig
  contentLayout?: 'centered' | 'wide'
  copy?: ChatCopyOverrides
}
```

如果后续真的需要 page 级默认值，应增加专门的 `TrChat.Page` props，而不是回到 `ui.page`。

补充冻结规则：

- `TrChatRootUiConfig` 是 public input，允许调用方只传 partial overrides
- `TrChat.Root` 必须在入口处一次性把它归一化成内部 resolved UI，然后再提供给 `Page` 与 primitives
- `copy` 仍然是 override 输入语义，但内部消费一律使用 resolved copy；不允许各个 primitives 自己拼默认文案
- 手写 `Root` 的调用方只负责传 override input，不负责自己复刻默认文案解析逻辑

### 2.3 slots 属于组件组合，不属于 `ui`

slots 是模板组合能力，不是序列化配置，也不是 `ui`。

冻结规则：

- 黑盒模式：通过 `TrChat` 组件 slots 扩展
- `Root + Page`：通过 `TrChat.Page` 组件 slots 扩展
- `Root + primitives`：通过直接组合 primitives 扩展

明确禁止：

- `ui.slots`
- config 驱动的 slot 注册
- runtime 内部隐藏 slot registry

### 2.4 message extensions 属于 runtime contract，不属于 `ui`

下面这些能力不属于 `ui`：

- message actions
- feedback
- renderer registry
- transforms

黑盒路径：

- `config.messages.*`

Root 路径：

- `message runtime`
- `conversation runtime`
- `TrChat.Page` / primitives 的显式 props 与 slots

### 2.5 `lifecycle` 只属于黑盒桥接输入，不新增公开 runtime module

`config.lifecycle.*` 仍是黑盒模式的重要入口，但它不应变成新的公开 runtime module，也不应重新长出第二套协调中心层。

冻结规则：

- `beforeSend / afterReceive / error`
  只作为 `createRuntimeFromConfig(config)` 创建 conversation / message bridge hook 的输入
- `modelChange`
  只作为 models runtime bridge hook 输入
- `conversationChange`
  只作为 history runtime bridge hook 输入
- Root 模式调用方如果需要这些行为，应直接提供 runtime 行为，而不是再次传入 `lifecycle`

最小 bridge 规则也一并冻结：

- `beforeSend`
  在 `sender` 组装出 `ChatSendInput` 之后、`conversation.send(input)` 之前执行；可返回新的 `ChatSendInput`，也可返回 `false` 取消本次发送
- `afterReceive`
  在 transport 输出被规范化为 canonical `ChatUIMessage` 之后、`messages.transforms` 之前执行；它不能改写 `messageId`
- `messages.transforms`
  一律在 `afterReceive` 之后执行，只负责最终渲染前的消息 shaping，不改变 canonical identity
- `error`
  只负责桥接层 side effect 或错误映射，不取得 `retry / regenerate / abort` 的 owner 身份
- `modelChange`
  只在 `models.selectModel()` 成功后触发
- `conversationChange`
  只在 `history` 成功切换或创建当前会话后触发

### 2.6 `createRuntimeFromConfig(config)` 是唯一官方桥接入口

冻结为唯一官方的黑盒到 Root 桥接 helper。

它应当：

- 接受 `TrChatConfig`
- 创建归一化 runtime modules
- 抽取展示默认值为 `ui`
- 返回 `{ runtime, ui }`
- 在每个 phase 内只承诺当期 bridge subset，不提前宣称已完整覆盖黑盒路径

它不能：

- 返回 preset slices
- 返回 scaffold 专属 helper
- 要求 `TrChat.Root` 理解黑盒 config shape

推荐返回值：

```ts
type CreateRuntimeFromConfigResult = {
  runtime: ChatRuntimeInput
  ui?: TrChatRootUiConfig
}
```

### 2.7 `TrChat.Page` 不允许透传 whole runtime

`TrChat.Page` 可以拥有官方 slot anchor，但不能因为 slots 的存在，退化成 whole-runtime relay。

冻结规则：

- `Page` 自身只负责页面结构、默认组合和 slot anchor
- slot props 只暴露该区域所需的最小 runtime modules
- 不向 slot props 透出整包 `runtime`
- 如需超出 slot props 的更深度控制，用户应升级到 `Root + primitives`

补充说明：

- 某个 slot 拿到 `conversation` 或 `sender`，不代表 `Page` 自身读取了整个 runtime
- `Page` 可以通过内部 region 组件装配 slot props
- “slot props 需要哪些模块” 必须作为 contract 明确列出
- region 组件自身允许读取哪些 runtime modules，也必须显式列出，避免 `Page` 借 region 组件退化成事实上的 runtime relay

## 3. 参考 runtime contract

这一节把目标 runtime 形状具体化到足以指导实现与测试的程度。

### 3.1 runtime 输入与归一化 runtime

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

归一化规则：

- `conversation` 必填
- `sender` 与 `message` 缺省时由 `Root` 自动补齐
- `history`、`models`、`workspace`、`attachments`、`mcp` 可选
- `history`、`models`、`workspace`、`attachments`、`mcp` 缺省时保持缺省，不允许 `Root` 为了凑 slot props 伪造 no-op runtime
- slot props 与 primitive props 对可选模块一律使用可选命名字段；缺模块时表现为省略或 `undefined`，而不是伪对象
- `Page` 在模块缺省时必须有可预测降级行为

降级规则最少包括：

- 没有 `workspace` 时，`Page` 退化为 stacked 主视图，不渲染 `left / left-rail / right / mobile-left / mobile-right`
- 没有 `history` 时，历史列表与相关 affordance 隐藏，相关 slot props 不再暴露 `history`
- 没有 `models` 时，模型选择器隐藏，`header-after / right / mobile-right` 不再暴露 `models`
- 没有 `mcp` 时，`sender-after / footer-extra / right / mobile-right` 不再暴露 `mcp`
- 没有 `attachments` 时，发送链路仍可纯文本运行，但 sender 相关 slot props 中的 `attachments` 为缺省

### 3.2 `ChatConversationRuntime`

```ts
type ChatConversationRuntime = {
  messages: ReadonlyRef<ChatUIMessage[]>
  status: ReadonlyRef<ChatConversationStatus>
  send: (input: ChatSendInput) => Promise<void> | void
  abort: () => Promise<boolean> | boolean
  retry: (messageId: string) => Promise<boolean> | boolean
  regenerate: (messageId: string) => Promise<boolean> | boolean
}
```

归属：

- 会话消息列表
- turn 级 streaming / failure / retry / regenerate / abort

不归属：

- sender draft
- message edit draft

### 3.3 `ChatSenderRuntime`

```ts
type ChatSenderRuntime = {
  draft: Ref<string>
  pendingAttachments: ReadonlyRef<ChatPendingAttachment[]>
  setDraft: (value: string) => void
  addPendingAttachments: (items: ChatPendingAttachment[]) => void
  removePendingAttachment: (id: string) => void
  clearPendingAttachments: () => void
  send: () => Promise<void> | void
}
```

归属：

- 唯一可写的提交前 draft
- 唯一可写的提交前 pending attachments
- 组装 `ChatSendInput` 并委托给 `conversation.send`

### 3.4 `ChatAttachmentsRuntime`

```ts
type ChatAttachmentsRuntime = {
  prepare: (files: File[]) => Promise<ChatPendingAttachment[]>
  preview?: (attachmentId: string) => void
  reuse?: (attachmentId: string) => Promise<ChatPendingAttachment | null>
}
```

归属：

- 上传
- 解析
- 预览
- 复用型能力

不归属：

- sender state 直接写入

显式 handoff：

1. `attachments.prepare(files)`
2. `sender.addPendingAttachments(items)`

### 3.5 `ChatMessageRuntime`

```ts
type ChatMessageRuntime = {
  getViewState: (messageId: string) => ChatMessageViewState
  getActions: (messageId: string) => ChatResolvedMessageAction[]
  startEdit: (messageId: string) => void
  cancelEdit: (messageId: string) => void
  commitEdit: (messageId: string, draft: ChatMessageEditInput) => Promise<boolean> | boolean
  copy: (messageId: string) => Promise<void> | void
  feedback?: (messageId: string, value: ChatFeedbackValue) => Promise<void> | void
  resolveRenderer?: (message: ChatUIMessage) => ChatResolvedRenderer | null
}
```

归属：

- message 级 view state
- message 级 edit draft
- message 级 actions / renderer 解析

不归属：

- canonical message array

补充：

- `retry / regenerate` 可由 message action 触发
- 但正式 owner 仍是 `conversation runtime`

### 3.6 `ChatHistoryRuntime`

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

冻结规则：

- management / search / bulk selection 属于 `history runtime`
- history 可见性属于 `workspace runtime`

### 3.7 `ChatModelRuntime`

```ts
type ChatModelRuntime = {
  models: ReadonlyRef<ModelOption[]>
  currentModelId: ReadonlyRef<string | null>
  selectModel: (modelId: string) => Promise<boolean> | boolean
}
```

冻结规则：

- disabled-model fallback 属于 models runtime
- current model state 属于 models runtime
- `conversation` 可以响应 model 变化，但不拥有 current model

### 3.8 `ChatWorkspaceRuntime`

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

冻结规则：

- workspace 拥有 shell 可见性、rail/collapse、mobile fallback 与 history 可见性语义
- history runtime 只拥有会话数据与管理态

### 3.9 `ChatMcpRuntime`

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

### 3.10 Phase 1A 还必须冻结的辅助类型

下面这些类型虽然不是顶层 runtime module，但会直接影响 bridge、fixtures、测试与 legacy adapter 的薄厚，必须在 Phase 1A 前冻结最小 contract：

```ts
type ChatSendInput = {
  text: string
  attachments?: ChatPendingAttachment[]
  modelId?: string | null
  meta?: Record<string, unknown>
}

type ChatPendingAttachment = {
  id: string
  name: string
  mimeType?: string
  size?: number
  file?: File
  source?: 'upload' | 'reuse'
  payload?: unknown
}

type ChatResolvedMessageAction = {
  id: string
  label: string
  placement?: 'action' | 'operation'
  run: () => Promise<void> | void
}

type ChatResolvedRenderer = {
  key: string
  component: Component
  props?: Record<string, unknown>
}

type ChatWorkspaceRegionRuntime = {
  visible: ReadonlyRef<boolean>
  rail: ReadonlyRef<boolean>
  open: () => void
  close: () => void
  toggle?: () => void
}
```

## 4. 消息模型与动作标识

### 4.1 canonical message model

```ts
type ChatUIMessage = {
  id: string
  role: 'system' | 'user' | 'assistant' | 'tool'
  createdAt?: number
  parts: ChatUIMessagePart[]
  meta?: {
    conversationId?: string
    parentMessageId?: string
    turnId?: string
    model?: string
  }
}
```

### 4.2 view state 不是 canonical payload

```ts
type ChatMessageViewState = {
  status?: 'pending' | 'streaming' | 'done' | 'error'
  error?: ChatMessageErrorView
  editing?: boolean
  optimistic?: boolean
  capabilities?: {
    editable?: boolean
    retryable?: boolean
    regeneratable?: boolean
    feedbackable?: boolean
  }
}
```

冻结规则：

- message actions 只以 `messageId` 为定位 key
- transforms 可以改变渲染 payload，但不能改变 message identity
- hidden state 写回 message object 只属于 legacy 行为
- `turnId` 仍是内部 metadata，不是公开 action key

### 4.3 legacy `messageIndex` coexistence 规则

`messageIndex` 只能存在于 legacy adapter 边界，不能重新进入新的 public contract。

冻结规则：

- 新 runtime、新 slot props、新 contract tests 一律只接受 `messageId`
- 如确有 legacy wrapper 仍以 index 驱动动作，只允许在 `legacy/` 目录内做一次性 `index -> messageId` 转译
- 不允许把 `messageIndex` 暴露回 `Root`、`Page`、primitives、slots 或新的 helper
- 从 Phase 1A 开始，所有 next-surface 示例与测试都必须使用 `messageId`

## 5. 黑盒 config 到 Root 的映射

这一节把 `createRuntimeFromConfig(config)` 落到实现可用程度。

### 5.1 映射表

| 黑盒 config 域 | 桥接输出 | 说明 |
| --- | --- | --- |
| `request.models`, `request.defaultModelId` | `models runtime` | 完整目标形态；Phase 1A 只允许把 `defaultModelId` 当作发送默认值桥接，不宣称已提供 `models runtime` |
| `request.transport`, `request.systemPrompt` | `conversation runtime` factory input | 不向 `Root` 透出原始 transport config |
| `conversation.initialMessages` | `conversation runtime` seed input | 负责首屏种子消息 |
| `conversation.persistence` | `conversation runtime` active-conversation hydrate/restore input | 只负责当前 active conversation 的恢复；不拥有多会话列表与切换 |
| `ui.brand`, `ui.welcome`, `ui.appearance`, `ui.contentLayout`, `ui.copy` | `ui` | 严格 display-only |
| `workspace.*` | `workspace runtime` | 负责布局语义与响应式行为 |
| `history.*` | `history runtime` + workspace defaults | 数据归 history，可见性归 workspace |
| `sender.*` | `sender runtime` | 输入默认值与行为 |
| `attachments.*` | `attachments runtime` + sender defaults | `prepare` 与 `pending` 分离 |
| `messages.actions`, `messages.feedback`, `messages.renderers` | `message runtime` | 消息扩展 contract |
| `messages.transforms` | `message runtime` extension pipeline | 只负责 render-time shaping，不改 canonical identity |
| `mcp.*` | `mcp runtime` | panel / tool bridge |
| `lifecycle.beforeSend`, `lifecycle.afterReceive`, `lifecycle.error` | conversation/message bridge hooks | 黑盒桥接输入，不形成新公开 runtime module |
| `lifecycle.modelChange` | models bridge hook | 黑盒桥接输入 |
| `lifecycle.conversationChange` | history bridge hook | 黑盒桥接输入 |

### 5.2 桥接输出必须保持最小化

`createRuntimeFromConfig(config)` 不能返回：

- preset slices
- page slots
- component props bags
- config loader 中间产物

它只返回：

- `runtime`
- `ui`

### 5.3 Phase 1A 的桥接支持范围必须显式写清

为了避免过早出现一个“官方但半成品”的 on-ramp，Phase 1A 必须把支持范围写清。

先冻结状态枚举：

- `supported`
  Phase 1A bridge 必须工作，并进入 contract tests
- `fixed-default-only`
  可以作为固定默认值被桥接，但不暴露对应 runtime module
- `deferred`
  当前阶段不进入 Phase 1A bridge 承诺，留到后续 phase 再接入

Phase 1A 字段级 bridge subset 必须写成下面这张表：

| config 字段 | Phase 1A 状态 | 桥接输出 | 说明 |
| --- | --- | --- | --- |
| `request.transport`, `request.systemPrompt` | `supported` | `conversation runtime` factory input | Phase 1A baseline 必须覆盖 |
| `request.defaultModelId` | `fixed-default-only` | `ChatSendInput.modelId` 默认注入 | 只作为发送默认值；不代表已有 `models runtime` |
| `request.models` | `deferred` | none | `createRuntimeFromConfig` 在 Phase 1A 不承诺产出 model selector 语义 |
| `conversation.initialMessages` | `supported` | `conversation runtime` seed input | 作为最小首屏种子基线 |
| `conversation.persistence` | `supported` | `conversation runtime` active-conversation hydrate/restore input | 只承诺当前 active conversation 的恢复，不代表已有 `history runtime` |
| `ui.brand`, `ui.welcome`, `ui.appearance`, `ui.contentLayout`, `ui.copy` | `supported` | `ui` | 严格 display-only |
| `sender.*` | `supported` | `sender runtime` | 只承诺 draft / send / placeholder 等发送基线 |
| `attachments.*` | `supported` | `attachments runtime` + sender handoff | 只承诺 `prepare -> addPendingAttachments` |
| `messages.actions`, `messages.renderers`, `messages.feedback` | `supported` | `message runtime` | 只承诺最小 extension 链 |
| `messages.transforms` | `deferred` | none | owner 已冻结为 `message runtime` extension pipeline，但 bridge 支持延后到 message extension parity 阶段 |
| `lifecycle.beforeSend`, `lifecycle.error` | `supported` | bridge hooks | Phase 1A 明确承诺 |
| `lifecycle.afterReceive` | `deferred` | none | 承诺顺序已冻结，但不要求 Phase 1A bridge 落地 |
| `history.*`, `workspace.*`, `models.*`, `mcp.*` | `deferred` | none | Phase 1B 或之后补齐 |
| `lifecycle.modelChange`, `lifecycle.conversationChange` | `deferred` | none | 等 `models / history` baseline 建立后再接入 |

这张表是 Phase 1A 开工门禁，不允许再用“支持 `request`，但不支持 `models`”这种口头说法替代。

## 6. Page、primitives 与 slot 边界

### 6.1 `TrChat.Page` 只负责组合

`TrChat.Page` 应当：

- 组合 `Header`、`MessageList`、`Sender`、`Footer`、`History`、`ModelSelector`、`WorkspaceShell`
- 拥有官方 page slots
- 选择 stacked / workspace 两种默认页面结构
- 允许 `Footer` 作为默认页面中的轻量 companion region 存在

`TrChat.Page` 不应当：

- 拥有 canonical runtime state
- 执行 config projection
- 直接改写 message object
- 变成 whole-runtime relay

### 6.2 primitives 读取边界

冻结下面这张表：

| Primitive | 允许读取的 runtime |
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

primitives 不应读取：

- 整包 `runtime`
- 原始黑盒 `config`
- scaffold context
- preset slices

### 6.3 slot props contract

slot props 只暴露该区域所需的最小模块，不暴露整包 `runtime`。

冻结规则：

1. replace slot 拿到该区域复写默认结构所需的最小模块
2. augment slot 拿到注入点所需的最小模块
3. slot props 的存在，不代表 `Page` 自身能读取这些全部模块
4. 若 slot 需要超过 contract 的能力，应升级到 `Root + primitives`

补充 typed 规则：

- `ui` 是所有 page slots 的必填 prop，但这里拿到的是 resolved UI，而不是 raw overrides
- `conversation`、`sender`、`message` 是按 slot 需要暴露的必填业务模块
- `history`、`models`、`workspace`、`attachments`、`mcp` 一律按可选 prop 暴露；缺省时表现为省略或 `undefined`
- 缺省模块按“逐个移除对应命名字段”的方式降级，不允许顺带移除其他仍然存在的模块
- slot props 中不允许出现 `runtime`、`config`、`presetSlices`、`chatKit`

`Page` 内部的 provider owner 也必须冻结：

| region 组件 | 负责的 slot |
| --- | --- |
| `TrChatPageHeaderRegion` | `header` / `header-before` / `header-after` |
| `TrChatPageBodyRegion` | `welcome` / `message-before` / `message-list` / `message-after` |
| `TrChatPageFooterRegion` | `sender-before` / `sender` / `sender-after` / `footer-extra` |
| `TrChatWorkspaceShell` | `left` / `left-rail` / `right` / `mobile-left` / `mobile-right` |

补充冻结 region 读取边界：

| region 组件 | 允许读取的 runtime |
| --- | --- |
| `TrChatPageHeaderRegion` | `conversation + history + models + workspace + ui` |
| `TrChatPageBodyRegion` | `conversation + message + ui` |
| `TrChatPageFooterRegion` | `sender + attachments + mcp + ui` |
| `TrChatWorkspaceShell` | `workspace + history + models + mcp + ui` |

降级规则：

- 没有 `workspace` 时，workspace 区域 slot 不渲染
- 没有 `history` 时，隐藏历史 affordance；原本含 `history` 的 slot props 仅移除 `history`
- 没有 `models` 时，隐藏模型 affordance；原本含 `models` 的 slot props 仅移除 `models`
- 没有 `mcp` 时，隐藏 MCP affordance；原本含 `mcp` 的 slot props 仅移除 `mcp`
- 没有 `attachments` 时，sender 仍可纯文本运行；原本含 `attachments` 的 slot props 仅移除 `attachments`
- 如某个定制需求必须依赖“不在本 slot contract 里的模块组合”，直接升级到 `Root + primitives`

### 6.4 slot catalog

这一版采用“page 区域用直白无前缀命名，workspace 区域沿用当前 shipping 词汇”的方案，避免继续保留 `page-*` 与 `workspace-*` 双体系。

#### 6.4.1 Page replace slots

| Slot | 作用 | 最小 slot props |
| --- | --- | --- |
| `header` | 替换整个默认 header 区域 | `ui`, `workspace`, `history`, `models`, `conversation` |
| `welcome` | 替换整个默认 welcome 区域 | `ui`, `conversation` |
| `message-list` | 替换整个默认消息区 | `ui`, `conversation`, `message` |
| `sender` | 替换整个默认发送区 | `ui`, `sender`, `attachments`, `mcp` |

#### 6.4.2 Page augment slots

补充说明：

- `Footer` 在默认页面中只冻结为轻量 companion region
- Phase 0.5 只公开 `footer-extra` augment slot，不先冻结 `footer` replace slot
- 若后续 page baseline 证明需要整块替换 footer，再单独评审是否增加 `footer` replace slot

| Slot | 作用 | 最小 slot props |
| --- | --- | --- |
| `header-before` | 注入到默认 header 内容前 | `ui`, `workspace` |
| `header-after` | 注入到默认 header 内容后 | `ui`, `workspace`, `models` |
| `message-before` | 注入到默认消息区前 | `ui`, `conversation` |
| `message-after` | 注入到默认消息区后 | `ui`, `conversation` |
| `sender-before` | 注入到默认 sender 前 | `ui`, `sender`, `attachments` |
| `sender-after` | 注入到默认 sender 后 | `ui`, `sender`, `attachments`, `mcp` |
| `footer-extra` | 注入到 footer 额外区域 | `ui`, `sender`, `attachments`, `mcp` |

#### 6.4.3 Workspace slots

沿用当前 shipping 词汇，确保旧 workspace 语义可对照：

| Slot | 作用 | 最小 slot props |
| --- | --- | --- |
| `left` | 替换桌面左侧 panel | `ui`, `workspace`, `history` |
| `left-rail` | 替换桌面左侧 rail | `ui`, `workspace`, `history` |
| `right` | 替换桌面右侧 panel | `ui`, `workspace`, `models`, `mcp` |
| `mobile-left` | 替换移动端左侧 sheet | `ui`, `workspace`, `history` |
| `mobile-right` | 替换移动端右侧 sheet | `ui`, `workspace`, `models`, `mcp` |

#### 6.4.4 slot precedence 规则

冻结规则：

1. replace slot 会关闭该区域默认结构
2. augment slot 不会关闭默认结构
3. replace slot 如需默认能力，必须通过 slot props 显式选择
4. `mobile-left` 缺省时回退到 `left`
5. `mobile-right` 缺省时回退到 `right`
6. page slots 属于 `TrChat.Page`，primitives 不镜像这些 page slot 名字

## 7. 旧导出与 helper 边界参考

本节只回答两件事：旧导出分别锚定了哪些能力边界，以及这些边界在新方案里由谁承接。它不负责发布时间线、导出翻转顺序或清理节奏。

### 7.1 长期保留组

作为长期公开 surface 保留：

- `TrChat`
- `TrChat.Root`
- `TrChat.Page`
- `TrChat.Header`
- `TrChat.MessageList`
- `TrChat.Message`
- `TrChat.Sender`
- `TrChat.Footer`
- `TrChat.History`
- `TrChat.WorkspaceShell`
- `TrChat.Attachments`
- `TrChat.ModelSelector`
- `TrChat.McpTrigger`
- `TrChat.McpPanel`

### 7.2 旧 wrapper 参考组

作为旧实现边界参考保留，不作为当前结构设计 source of truth：

- `TrChat.Scaffold`
- `TrChat.Provider`
- `TrChatProvider`
- `TrChatLayout`
- `TrChatWorkspaceLayout`
- `TrChat.Welcome`
- `TrChat.HistorySurface`
- `TrChat.WorkspaceRightSheet`
- `TrChatFeedback`

### 7.3 旧实现 helper 参考组

作为旧实现参考保留，不作为下一代推荐入口：

- `useChatKit`
- `loadChatConfig`
- `createChatAdapterFromConfig`
- `createPresetChatProps`
- `createPresetChatSlices`

### 7.4 review 组

在 Phase 3-4 复审，只有仍有明确价值才继续保留：

- `useMcpManager`
- `useChatAttachments`
- `useModelSelector`
- `useHistoryState`
- `useFloatingDropdown`
- `useKeyboardNavigation`
- `useSlotFilter`
- `useDefaultBubbleConfig`
- `useChatFeedback`
- `CHAT_MESSAGES`
- `resolveChatMessages`
- `CHAT_FEATURE_REGISTRY`
- `resolveChatFeatures`
- `KNOWN_PROVIDERS`

### 7.5 renderer contract 保留组

只要 message extension contract 仍需要它们，就继续保留：

- `MarkStreamRenderer`
- `ErrorRenderer`
- `EditInputRenderer`
- `ToolCallsRenderer`
- `ToolCallRenderer`
- `AttachmentsRenderer`

### 7.6 高风险 alias / type 边界锚点

下面这些旧导出关系必须先写成边界表，不允许边实现边改名：

| 当前导出 | 开发期角色 | 对新方案的约束 |
| --- | --- | --- |
| `TrMcpTrigger` | 旧命名锚点 | 新方案正式命名固定为 `TrChat.McpTrigger` |
| `TrChatMcpPanel` | 旧命名锚点 | 新方案正式命名固定为 `TrChat.McpPanel` |
| `TrModelSelector` | 旧命名锚点 | 新方案正式命名固定为 `TrChat.ModelSelector` |
| `ChatConfig` | 旧 type alias 锚点 | 新方案正式配置类型固定为 `TrChatConfig` |
| `TrChatRuntimeInput` | 旧 type alias 锚点 | 新方案正式 runtime 输入类型固定为 `ChatRuntimeInput` |
| `TrChatProviderProps` / `TrChatScaffoldProps` / `TrChatPresetOverrides` | 旧 surface 类型锚点 | 新方案不再围绕 `Scaffold / Provider / presetOverrides` 组织核心 contract |
| `ChatConfigIntegrations` / `ChatPreset*Slice` | 旧 config pipeline 类型锚点 | 新方案不再引入 preset-slice 风格的正式 contract |

补充要求：

- Phase 0.5 必须冻结高风险 alias / type 锚点
- `src/index.ts` 全量 value/type export 清单可作为 review appendix 持续完善，但不作为 `Root / Page / runtime` 开工门禁

### 7.7 附录：当前 `src/index.ts` 公开面参考清单

本节是 review appendix，用于盘点当前 shipping 公开面与后续收口方向。
它不是当前 `Root / Page / runtime` contract freeze 的硬门禁。

#### 7.7A value exports

| 当前导出 | 开发期角色 | 新方案归属 / 约束 |
| --- | --- | --- |
| `TrChat` | 目标 surface | 正式黑盒入口；内部实现应逐步走 `createRuntimeFromConfig + Root + Page` |
| `TrChat.Root` | 目标 surface | next-surface 正式入口 |
| `TrChat.Page` | 目标 surface | next-surface 正式页面组合组件 |
| `TrChat.Header`, `TrChat.MessageList`, `TrChat.Message`, `TrChat.Footer`, `TrChat.Attachments`, `TrChat.Sender`, `TrChat.History`, `TrChat.ModelSelector`, `TrChat.WorkspaceShell`, `TrChat.McpTrigger`, `TrChat.McpPanel` | 目标 surface | `Root + primitives` 正式公开能力面 |
| `TrChat.Welcome` | 旧实现边界锚点 | 其旧职责由 `welcome` slot / page welcome region 承接 |
| `TrChat.Scaffold`, `TrChat.Provider`, `TrChat.Layout`, `TrChat.WorkspaceLayout`, `TrChat.HistorySurface`, `TrChat.WorkspaceRightSheet` | 旧实现边界锚点 | 其旧职责由 `TrChat.Root + TrChat.Page` 或 `TrChat.Root + primitives` 吸收 |
| `TrChatProvider`, `TrChatScaffold`, `TrChatLayout`, `TrChatWorkspaceLayout`, `TrChatAttachments`, `TrChatHistorySurface`, `TrChatWorkspaceShell`, `TrChatWorkspaceRightSheet`, `TrChatFeedback` | 旧 named export 锚点 | 只用于识别旧 surface 边界，不反向约束新命名与目录分层 |
| `TrMcpTrigger`, `TrChatMcpPanel`, `TrModelSelector` | 旧命名锚点 | 对应 next-surface 正式命名固定为 `TrChat.McpTrigger` / `TrChat.McpPanel` / `TrChat.ModelSelector` |
| `useChatKit` | 旧 helper 锚点 | 新方案应由 runtime factory / inspector helpers 承接其合理职责 |
| `useChatAttachments`, `useMcpManager`, `useModelSelector`, `useChatFeedback` | 待收口 helper | 只有存在清晰稳定 owner 才继续公开 |
| `useDefaultBubbleConfig`, `useFloatingDropdown`, `useKeyboardNavigation`, `useHistoryState`, `useSlotFilter` | 内部化候选 | 优先下沉为实现细节，确有稳定价值再回到公开 helper |
| `MarkStreamRenderer`, `ErrorRenderer`, `EditInputRenderer`, `ToolCallsRenderer`, `ToolCallRenderer`, `AttachmentsRenderer` | renderer contract 锚点 | 继续作为 message extension renderer contract 的公开组成 |
| `loadChatConfig`, `createChatAdapterFromConfig`, `createPresetChatProps`, `createPresetChatSlices` | 旧黑盒装配 helper 锚点 | 新方案以 `TrChatConfig` + `createRuntimeFromConfig(config)` 承接 |
| `CHAT_FEATURE_REGISTRY`, `resolveChatFeatures` | 旧 feature pipeline 锚点 | 优先视为内部实现细节，Phase 4 再决定是否保留任何公开入口 |
| `CHAT_MESSAGES`, `resolveChatMessages` | copy contract 锚点 | 与未来 `copy` contract 对齐后决定最终公开形态 |
| `KNOWN_PROVIDERS` | provider metadata 锚点 | 暂保留为 provider 元数据 helper，Phase 4 复核 |

#### 7.7B type exports

| 当前 type export | 开发期角色 | 新方案归属 / 约束 |
| --- | --- | --- |
| `TrChatRuntimeInput` | 旧 type alias 锚点 | 正式 runtime 输入类型固定为 `ChatRuntimeInput` |
| `ChatConfig` | 旧 type alias 锚点 | 正式配置类型固定为 `TrChatConfig` |
| `BrandConfig`, `WelcomeConfig`, `ChatMessages`, `ChatMessagesOverrides` | 旧 UI/copy alias 锚点 | 新方案对应 `ChatBrandConfig` / `ChatWelcomeConfig` / `ChatCopy*` 一组类型 |
| `ChatConfigDefaults`, `ChatConfigIntegrations`, `ChatLayoutConfig`, `ChatLayoutPlacementsConfig`, `ChatConfigModel`, `ChatConfigProvider`, `ChatConfigUI`, `OpenAICompatibleProviderConfig` | 旧 config pipeline 类型锚点 | 新方案不再围绕旧 blackbox config pipeline 组织正式类型层 |
| `ChatPresetProps`, `ChatPresetProviderSlice`, `ChatPresetLayoutSlice`, `ChatPresetAppearanceSlice`, `ChatPresetShellSlice`, `ChatPresetHeaderSlice`, `ChatPresetWelcomeSlice`, `ChatPresetMessageListSlice`, `ChatPresetSenderSlice`, `ChatPresetHistorySlice`, `ChatPresetModelSelectorSlice`, `ChatPresetSlices` | 旧 preset-slice 类型锚点 | 新方案不引入 preset-slice 风格的正式 public types |
| `TrChatProviderProps`, `TrChatScaffoldProps`, `TrChatProviderSharedProps`, `TrChatPresetOverrides`, `TrChatScaffoldContextValue`, `ChatScaffoldCallbacks` | 旧 surface 类型锚点 | 新方案不再以 `Scaffold / Provider / presetOverrides` 作为核心公开 contract |
| `UseChatKitOptions`, `UseChatKitRuntimeBridge`, `UseChatKitReturn` | 旧 helper 类型锚点 | 与 `useChatKit` 的职责一起重分配到 runtime helper / inspector helpers |
| `UseMcpManagerBridge`, `UseMcpManagerOptions`, `UseMcpManagerReturn`, `UseChatAttachmentsOptions`, `UseChatAttachmentsReturn`, `UseModelSelectorOptions`, `UseDefaultBubbleConfigOptions` | 待收口 helper 类型 | 按 helper 是否继续公开决定最终去向 |
| `TrChatProps`, `TrChatHeaderProps`, `TrChatWelcomeProps`, `TrChatMessageListProps`, `TrChatHistorySurfaceProps`, `TrChatSenderProps`, `TrChatWorkspaceShellProps` | 旧 surface 类型锚点 | 用于对照现有边界；新方案按对应 primitive/page/runtime contract 重新命名与拆分 |
| `ChatAppearanceConfig`, `ChatContentLayout`, `ChatAppearanceMode`, `ChatListVariant`, `ChatShellVariant`, `ChatWorkspaceRegionCollapseMode`, `ChatWorkspaceRegionConfig`, `ChatWorkspaceRegionWidth`, `ChatWorkspaceShellConfig`, `ChatWorkspaceViewStateConfig` | 可复用 contract 候选 | 作为 display 或 workspace contract 复用，必要时仅做命名整形 |
| `ChatMessageActionContext`, `ChatMessageActionDefinition`, `ChatMessageActionPlacement`, `ChatMessageActionsInput`, `ChatMessageActionsMode`, `ChatMessageActionRole`, `ChatMessageActionPayload`, `ChatMessageTransformChunkContext`, `ChatMessageTransformFinishContext`, `ChatMessageTransforms`, `ChatBubbleRenderers` | message extension 类型锚点 | 并入 message extension contract 的 next-surface types |
| `ChatStatus`, `ChatErrorType`, `ChatErrorInfo`, `ResponseProvider`, `ModelOption` | runtime / request 类型锚点 | 进入 runtime / request contract 的 next-surface type 层 |
| `ChatAttachmentsFeaturePreset`, `ChatAttachmentsListConfig`, `ChatAttachmentsUploadConfig`, `ChatSenderActionsFeaturePreset`, `ChatSenderActionUploadConfig`, `ChatSenderActionVoiceConfig`, `ChatAttachmentsFeatureConfig`, `ChatAttachmentsFeatureResolution`, `ChatMcpFeatureConfig`, `ChatMcpFeatureResolution`, `ChatFeedbackFeatureConfig`, `ChatFeedbackFeatureResolution`, `ChatHistoryFeatureConfig`, `ChatHistoryFeatureOptions`, `ChatHistoryFeatureResolution`, `ChatSenderActionsFeatureConfig`, `ChatSenderActionsFeatureResolution`, `ChatWelcomePromptsFeatureConfig`, `ChatWelcomePromptsFeatureOptions`, `ChatWelcomePromptsFeatureResolution`, `ChatFeatureConfigMap`, `ChatFeatureInput`, `ChatFeaturePresetProps`, `ResolvedChatFeatures`, `BuiltInChatFeatureKey` | 旧 feature pipeline 类型锚点 | 新方案不复刻当前 feature-resolve pipeline 的 public type 结构，必要能力按新 owner 重建 |
| `KnownProvider` | provider metadata 类型锚点 | 跟随 `KNOWN_PROVIDERS` 一起复核其最终公开形态 |

## 8. 参考目录图

为降低与当前 shipping 代码的相互污染，下一代实现建议采用“新 surface 单独目录 + legacy adapter 单独目录”的方式。

```text
src/
  root/
    TrChatRoot.vue
    rootContext.ts
    normalizeRuntime.ts
  page/
    TrChatPage.vue
    TrChatPageHeaderRegion.vue
    TrChatPageBodyRegion.vue
    TrChatPageFooterRegion.vue
  primitives/
    TrChatHeader.vue
    TrChatMessageList.vue
    TrChatMessage.vue
    TrChatSender.vue
    TrChatFooter.vue
    TrChatHistory.vue
    TrChatModelSelector.vue
    TrChatWorkspaceShell.vue
    TrChatAttachments.vue
    TrChatMcpTrigger.vue
    TrChatMcpPanel.vue
  runtime/
    core/
      types.ts
      keys.ts
      normalizeRuntime.ts
      resolveRuntimeCapabilities.ts
    config/
      createRuntimeFromConfig.ts
      normalizeTrChatConfig.ts
      mapLifecycleHooks.ts
    conversation/
      createConversationRuntime.ts
      messageId.ts
      transforms.ts
    message/
      createMessageRuntime.ts
      actionRegistry.ts
      rendererRegistry.ts
      viewState.ts
    sender/
      createSenderRuntime.ts
    attachments/
      createAttachmentsRuntime.ts
    history/
      createHistoryRuntime.ts
    models/
      createModelRuntime.ts
    workspace/
      createWorkspaceRuntime.ts
    mcp/
      createMcpRuntime.ts
  legacy/
    createLegacyScaffoldBridge.ts
    createLegacyProviderBridge.ts
```

## 9. 现状到目标的实现边界映射

| 当前文件 | 目标角色 |
| --- | --- |
| `components/core/Chat.vue` | 黑盒 wrapper，内部走 `createRuntimeFromConfig + Root + Page` |
| `components/core/ChatScaffold.vue` | legacy bridge，不再作为未来 runtime owner |
| `components/core/ChatProvider.vue` | legacy bridge 或内部 adapter |
| `components/core/default-renderer/ChatDefaultRenderer.vue` | 被 `page/TrChatPage.vue` 取代 |
| `runtime/config/*` | 收缩为黑盒 config bridge 输入与 legacy 适配层 |
| `runtime/chat-kit/useChatKit.ts` | 被 conversation/message/sender/attachments runtimes 拆分，并保留 legacy adapter |
| `components/workspace/chatUiContext.ts` | 被 `runtime/workspace/createWorkspaceRuntime.ts` 吸收 |
| `components/history/*` 状态逻辑 | 拆成 `history runtime` + `TrChat.History` primitive |

### 9.1 旧 wrapper 的开发期处理原则

这张表明确“什么时候允许 old wrapper 开始内转 new runtime”，避免边实现边猜。

| wrapper / 入口 | Phase 0.5 | Phase 1A | Phase 1B | Phase 2 | Phase 3-4 |
| --- | --- | --- | --- | --- | --- |
| `Chat.vue` / `TrChat` | 继续 shipping legacy 路径 | 保持 legacy | 保持 legacy | 切到 `createRuntimeFromConfig + Root + Page` | 继续作为 blackbox 正式入口 |
| `ChatScaffold.vue` / `TrChat.Scaffold` | 继续 shipping legacy 路径 | 保持 legacy | 保持 legacy | 变成 legacy adapter，可选内部复用 `Root` | 进入 deprecation / removal 轨道 |
| `ChatProvider.vue` / `TrChat.Provider` | 继续 shipping legacy 路径 | 保持 legacy | 保持 legacy | 变成 legacy adapter，可选内部复用 `Root` | 进入 deprecation / removal 轨道 |

冻结规则：

- 在 Phase 1A / 1B，不允许为了“提早复用新 runtime”而让 shipping wrappers 半迁不迁
- 当前阶段只把这些 wrapper 当作旧边界参考，不把它们当作新的实现门禁或命名约束

## 10. Phase 0.5 交付物

在 Phase 1 开始前，至少要产出下面这些成果：

1. 最终版 `TrChatRootUiConfig`
   并明确为严格 display-only
2. 最终版 `ChatRuntimeInput` / `ChatRuntime`
   包含 `mcp`
3. 最终版辅助类型
   `ChatSendInput` / `ChatPendingAttachment` / `ChatResolvedMessageAction` / `ChatResolvedRenderer` / `ChatWorkspaceRegionRuntime`
4. 最终版 `ChatUIMessage` 与 `messageId` 生命周期规则
5. 最终版 `sender / attachments` handoff contract
6. 最终版 `history / models / workspace / mcp` owner 定义
7. 最终版 `TrChat.Page` slot-provider contract
8. 最终版 slot catalog 与 precedence 规则
9. 最终版 `TrChatConfig -> { runtime, ui }` 映射表
   包含 `lifecycle` 的桥接 owner
10. 最终版 Phase 1A bridge 支持范围说明
11. 最终版高风险 alias / type 锚点表
   `src/index.ts` 全量公开面清单作为 review appendix 持续维护
12. 最终版目录图与 ownership 边界
13. 最终版 `messageIndex -> messageId` 边界说明

Phase 0.5 退出条件：

- 运行时、slots、exports、目录、phase 叙述已经一致
- `DESIGN / API_RUNTIME / EXECUTION / IMPLEMENTATION_BLUEPRINT / AGENTS` 不再互相打架
- 高风险 alias / type 锚点已经冻结；其余公开面清单已有 review appendix
- 不再存在需要靠口头解释补上的 contract 空洞

## 11. 第一批实现切片

推荐从最小、最能锁边界的切片开始：

1. 新建 `runtime/core/types.ts`
   放入顶层 runtime 与辅助类型
2. 新建 `messageId` utilities 与生命周期测试
3. 实现 `createConversationRuntime`
4. 实现 `createSenderRuntime`
5. 实现 `createAttachmentsRuntime`
6. 实现 `createMessageRuntime`
7. 实现 `normalizeRuntime`
8. 新增 `TrChat.Root`
9. 新增 `createRuntimeFromConfig`
   但必须显式写清 Phase 1A 支持子集
10. 让 `TrChat.Message` / `TrChat.MessageList` / `TrChat.Sender` 跑在新 runtime 上
11. 新增 next-surface contract tests
   先锁 `messageId`、sender/attachments handoff、bridge subset、slot catalog、高风险 alias/type 锚点

这一阶段不要先做：

- `TrChat.Page`
- 对外 public guidance 翻转
- 旧导出清理
- 完整黑盒 parity 承诺

## 12. 开发期实现门禁

冻结下面的开发阶段推进顺序：

1. `contract freeze ready`
2. `Root baseline runnable`
3. `Page baseline runnable`
4. `feature parity runnable`
5. `hardening ready`

附加门禁：

- 当 next contract 已存在后，不允许再为同一能力新增第二个 public 写入口
- 不允许再新增 `messageIndex` 风格的 public helper
- 不允许再次引入 `ui.page`、`ui.messages`、`ui.slots`
- 一旦最终 slot catalog 冻结，不允许再并行维护 `page-*` 与无前缀 slot 双体系

## 13. 测试蓝图

### 13.0 Phase 0 contract tests

在 runtime 实现前，先补下面这些 contract 级测试：

这批测试不能只依赖 prose 文档，必须先有最小 contract source artifact。

推荐最小产物：

- `src/runtime/contracts/slotCatalog.ts`
- `src/runtime/contracts/pageSlotProps.ts`
- `src/runtime/contracts/configBridgeMatrix.ts`
- `src/runtime/contracts/publicSurfaceMatrix.ts`

Phase 0 contract tests 应优先断言这些 artifact，而不是仅靠 grep 文档或源码字符串。

- slot catalog source contract tests
- slot precedence contract tests
- `config -> { runtime, ui }` bridge mapping tests
- `TrChat.Page` slot-provider contract tests
- old export / helper boundary reference tests

### 13.1 Phase 1A tests

- `conversation / sender / message / attachments` runtime contract tests
- `messageId` lifecycle tests
- sender/attachments handoff tests
- `Root + createRuntimeFromConfig` 最小 baseline tests

### 13.2 Phase 1B tests

- workspace/history/models contract tests
- primitive UI tests：`Header / History / ModelSelector / WorkspaceShell`
- `Root + Page` baseline integration tests

### 13.3 Phase 2 tests

- `TrChat` 黑盒 config contract tests
- `TrChat vs Root + Page vs Root + primitives` 对照测试
- 黑盒实践示例验证

### 13.4 开发期边界安全测试

- 旧 `Scaffold` / `Provider` 行为边界对照测试
- 旧 workspace / history 语义锚点对照测试
- contract source artifacts 一致性测试

## 14. 开工前复核清单

在批准实现开始前，至少逐项确认：

1. `Root` 不消费原始 `config`
2. `ui` 严格保持 display-only
3. `mcp` 已进入 `ChatRuntimeInput / ChatRuntime`
4. `lifecycle` 只作为黑盒 bridge 输入，不形成新 runtime module
5. slot 是组件组合，不属于 `ui`
6. slot props 不暴露整包 `runtime`
7. `Page` 不是 whole-runtime relay
8. message actions 只以 `messageId` 为 key
9. primitives 不读取 scaffold context
10. `createRuntimeFromConfig` 只返回 `{ runtime, ui }`
11. Phase 1A bridge 支持范围已写清
12. `src/index.ts` 的所有 value/type exports 都已分类
13. 旧实现只作为边界参考，不作为当前结构设计 source of truth
14. 每个 phase gate 都有对应测试

## 15. 建议的下一步

在接受这份蓝图后，推荐下一步按下面顺序推进：

1. 先把本文档中的 Phase 0.5 决策同步回 `API_RUNTIME`、`EXECUTION`、`AGENTS`
2. 先补 contract tests
   尤其是 slot catalog、bridge mapping、高风险 alias/type 锚点、`messageId`
3. 再实现 Phase 1A runtime foundation
4. 等 runtime foundation 稳定后，再进入 `Page`、黑盒 `TrChat` 与 export flip
