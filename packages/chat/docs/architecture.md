# TinyRobot Chat 套件架构方案（优化版）

## 1. 目标与边界

`@opentiny/tiny-robot-chat` 是独立的 chat 套件包，目标是交付一个可直接接入的会话应用组件，同时保留“只接 UI、复用外部数据层”的接入方式。

本方案只基于当前仓库已有能力设计：

- UI 基础能力来自 `packages/components`。
- runtime 能力来自 `packages/kit`。
- 不参考 `packages/cli` 与 CLI 模板。
- 不修改已有基础组件 props；确有必要时只能新增 props，并保持向后兼容。
- 不重新发明消息引擎、会话 store 或 transport 协议。

最终定位：`chat` 套件是 `components + kit` 之上的“装配层 + 适配层”，不是新的底层框架。

## 2. 现有能力盘点

### 2.1 `components` 可直接复用的能力

`TrLayout`：

- 提供 `left-aside / header / main / footer / right-aside` 页面区域。
- 支持 `dock / drawer / floating / resize`。
- 提供 `Layout.ProxyScrollbar`，适合消息区居中但滚动条贴主区边缘的对话页。
- 提供 `Layout.AsideToggle`，适合放在 layout 内部控制侧栏。

`TrHistory`：

- `data` 接收 `HistoryItem[]` 或分组数据。
- `selected` 按 `item.id` 匹配当前项。
- `item-click` 用于切换会话。
- `item-title-change` 用于重命名。
- `item-action` 用于菜单动作，例如 delete。
- `HistoryItem.title` 必填，`HistoryItem.id` 对 chat 场景也应视为必填。

`TrSender`：

- 使用 `modelValue` + `update:modelValue` 作为受控输入模型。
- `submit(textContent, structuredData?)` 已支持结构化数据。
- `loading` 显示停止按钮，并通过 `cancel` 取消。
- `disabled` 控制整体禁用。
- `defaultActions.submit.disabled` 控制提交按钮禁用。
- `extensions` 可继续承接 Template、Mention、Suggestion 等输入扩展。

`TrBubbleProvider + TrBubbleList`：

- `messages` 直接消费 `BubbleMessage[]`。
- 已支持分组、角色配置、内容渲染器、box/content renderer。
- 已支持 `prefix / suffix / after / content-footer` slots。
- 已支持 `autoScroll` 与 `scrollToBottom` 暴露。

`TrWelcome`：

- 可作为无消息时的默认欢迎态。

### 2.2 `kit` 可直接复用的能力

`useMessage`：

- 单会话消息引擎。
- 暴露 `messages / requestState / processingState / isProcessing`。
- 暴露 `sendMessage / send / abortRequest`。
- 负责 responseProvider、流式 chunk、插件生命周期、错误生命周期。

`useConversation`：

- 多会话管理。
- 暴露 `conversations / activeConversationId / activeConversation`。
- 暴露 `createConversation / switchConversation / deleteConversation / clear / updateConversationTitle / saveMessages`。
- `activeConversation.engine` 是当前会话实际的 `useMessage` 引擎。
- 支持 storage、加载、自动保存与非活跃 engine 清理。

结论：`kit` 可以理解为 chat 套件的 runtime core；`chat` 不应再复制一套消息、会话、stream、abort 生命周期。

## 3. 核心架构

推荐分三层：

```text
packages/kit
  -> runtime core：消息、会话、stream、abort、插件、storage

packages/chat ChatRuntime
  -> UI adapter：把 kit 或外部 runtime 适配成 chat UI 能消费的稳定协议

packages/chat TrChat
  -> UI assembly：基于 TrLayout + 原子组件组装完整会话应用
```

关键原则：

- `ChatRuntime` 是 chat 套件唯一稳定数据协议。
- `ChatParts` 是 chat 套件唯一稳定 UI 配置协议。
- `TrChat` 只依赖 `ChatRuntime`，不直接依赖 `useConversation` 返回结构。
- `useManagedChatRuntime` 基于 `kit` 产出 `ChatRuntime`。
- 外部用户只要实现 `ChatRuntime`，就可以只使用 UI 层。
- layout 状态不进入 `ChatRuntime`，由 `TrLayout` 自己管理。

## 4. Public API

`v1` 只稳定以下入口：

- `TrChat`
- `ChatRuntime`
- `useManagedChatRuntime`
- `TrChat.Root`
- `TrChat.Conversations`
- `TrChat.Messages`
- `TrChat.Composer`
- `TrChat.Header`
- `ChatParts`

不稳定内容：

- 默认内部组件树。
- `kit` 的原始返回结构。
- chat 内部 adapter 实现细节。
- layout 与 chat 的内部装配细节。

推荐用法：

```vue
<script setup lang="ts">
const runtime = useManagedChatRuntime({
  useConversationOptions: {
    useMessageOptions: {
      responseProvider,
    },
  },
})
</script>

<template>
  <TrChat :runtime="runtime" />
</template>
```

`v1` 不建议把裸 `<TrChat />` 作为主路径。需要完整可用应用时，由用户显式传入 `runtime`，并按需传入 `parts`。

### 4.1 双入口与共享 `parts` 配置

chat 套件应同时支持两种接入方式：

- 黑盒入口：用户使用 `<TrChat />`，由 chat 套件完成默认布局与区域装配。
- 白盒入口：用户使用 `<TrChat.Root>` + `TrChat.*` 区域组件，自行决定布局结构。

两种入口必须共享同一套协议：

- `runtime`：数据与动作协议，负责会话如何运行。
- `parts`：组件级 UI 配置协议，负责各区域如何展示。

示例：

```vue
<!-- 黑盒：默认应用装配 -->
<TrChat :runtime="runtime" :parts="parts" />

<!-- 白盒：用户自行拼装结构 -->
<TrChat.Root :runtime="runtime" :parts="parts">
  <TrLayout v-bind="parts.layout">
    <template #left-aside>
      <TrChat.Conversations />
    </template>
    <template #header>
      <TrChat.Header />
    </template>
    <template #main>
      <TrChat.Messages />
    </template>
    <template #footer>
      <TrChat.Composer />
    </template>
  </TrLayout>
</TrChat.Root>
```

设计原则：

- 黑盒和白盒共用同一套 `runtime + parts` 协议，只是装配方式不同。
- `TrChat.*` 区域组件默认从 context 读取同一份 `runtime + parts`。
- 需要更高自由度时，可继续下沉到 `TrLayout / TrHistory / TrSender / TrBubbleList`。

推荐结构：

```ts
export interface ChatParts {
  layout?: ChatLayoutPart
  conversations?: ChatConversationsPart
  messages?: ChatMessagesPart
  composer?: ChatComposerPart
  welcome?: ChatWelcomePart
  prompts?: ChatPromptsPart
  attachments?: ChatAttachmentsPart
  feedback?: ChatFeedbackPart
}
```

`parts` 里的字段应尽量贴近原子组件文档命名：

```ts
export interface ChatConversationsPart {
  history?: Omit<HistoryProps<ChatConversationItem>, 'data' | 'selected'>
}

export interface ChatMessagesPart {
  bubbleProvider?: Omit<BubbleProviderProps, 'store'>
  bubbleList?: Omit<BubbleListProps, 'messages'>
  welcome?: WelcomeProps
}

export interface ChatComposerPart {
  sender?: Omit<SenderProps, 'modelValue' | 'defaultValue' | 'loading' | 'disabled'>
}
```

需要被 `runtime` 接管的字段不能作为普通 UI 配置开放：

- `TrHistory.data / selected`
- `TrBubbleList.messages`
- `TrSender.modelValue / defaultValue / loading / disabled`

这些字段由 `runtime` 或少量明确的 `v-model` 管理，避免同一状态出现两个来源。

## 5. ChatRuntime 协议

`ChatRuntime` 直接贴合现有组件与 kit 类型，不新增 `ChatMessage` / `ChatConversation` 公共模型。

复用关系：

- 会话项对齐 `HistoryItem`。
- 消息项对齐 `BubbleMessage`。
- 请求状态对齐 `RequestState / RequestProcessingState`。
- 输入区状态对齐 `TrSender` 的真实 props。

推荐类型：

```ts
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { BubbleMessage } from '@opentiny/tiny-robot/components/bubble'
import type { HistoryItem } from '@opentiny/tiny-robot/components/history'
import type { StructuredData } from '@opentiny/tiny-robot/components/sender'
import type { RequestProcessingState, RequestState } from '@opentiny/tiny-robot-kit/vue'

type ChatReadable<T> = Readonly<Ref<T>> | ComputedRef<T>

export type ChatConversationItem = HistoryItem & {
  id: string
  createdAt?: number
  updatedAt?: number
  metadata?: Record<string, unknown>
}

export type ChatMessageItem = BubbleMessage

export interface ChatRuntimeConversations {
  items: ChatReadable<readonly ChatConversationItem[]>
  currentId: ChatReadable<string | null>
  loading?: ChatReadable<boolean>
}

export interface ChatRuntimeMessages {
  items: ChatReadable<readonly ChatMessageItem[]>
  requestState: ChatReadable<RequestState>
  processingState: ChatReadable<RequestProcessingState | undefined>
  lastError?: ChatReadable<unknown | null>
}

export interface ChatRuntimeComposer {
  inputValue: ChatReadable<string>
  disabled: ChatReadable<boolean>
  loading: ChatReadable<boolean>
  submitDisabled: ChatReadable<boolean>
}

export interface ChatSubmitPayload {
  text: string
  structuredData?: StructuredData
}

export interface ChatRuntimeActions {
  setInputValue: (value: string) => void
  send: (payload: ChatSubmitPayload) => Promise<void> | void
  abort?: () => Promise<void> | void
  createConversation?: (payload?: { title?: string; metadata?: Record<string, unknown> }) => Promise<void> | void
  switchConversation?: (id: string) => Promise<void> | void
  renameConversation?: (id: string, title: string) => Promise<void> | void
  deleteConversation?: (id: string) => Promise<void> | void
}

export interface ChatRuntime {
  conversations?: ChatRuntimeConversations
  messages: ChatRuntimeMessages
  composer: ChatRuntimeComposer
  actions: ChatRuntimeActions
}

export const chatRuntimeKey: InjectionKey<ChatRuntime> = Symbol('chat-runtime')
```

实现约束：

- `ChatReadable` 只读，组件不得直接改 runtime state。
- 所有修改必须走 `runtime.actions`。
- `ChatConversationItem.id` 在 chat 内部必须有值，否则 `TrHistory.selected` 无法稳定工作。
- `ChatConversationItem.title` 必须在 adapter 层兜底，因为 `ConversationInfo.title` 是可选的。

## 6. Managed Runtime 设计

`useManagedChatRuntime` 是官方推荐 runtime 创建入口。

内部链路：

```text
useConversation
  -> useKitChatRuntime
  -> useManagedChatRuntime
  -> ChatRuntime
```

### 6.1 `useKitChatRuntime`

职责：纯 adapter，只做映射。

映射内容：

- `ConversationInfo[] -> ChatConversationItem[]`
- `activeConversationId -> conversations.currentId`
- `activeConversation.engine.messages -> messages.items`
- `activeConversation.engine.requestState -> messages.requestState`
- `activeConversation.engine.processingState -> messages.processingState`
- `activeConversation.engine.isProcessing -> composer.loading`

不负责：

- 输入草稿。
- 错误状态缓存。
- 首条消息前自动建会话。
- 标题兜底策略以外的 UI 行为。

### 6.2 `useManagedChatRuntime`

职责：补齐 chat 应用层行为。

负责内容：

- 创建并持有 `useConversation`。
- 管理 `inputValue`。
- 维护 `lastError`。
- 首条消息发送前自动 `createConversation()`。
- 标题归一化：`ConversationInfo.title ?? defaultConversationTitle`。
- 组合最终 `ChatRuntime`。

推荐行为：

- `loading = activeConversation.engine.isProcessing`。
- `submitDisabled = disabled || loading || inputValue.trim().length === 0`。
- `send(payload)` 成功触发后清空输入。
- `send(payload)` 在无 active conversation 时先创建会话。
- `send(payload)` 在 managed v1 中只消费 `payload.text`。
- `structuredData` 保留在协议里，交给 external runtime 或上层事件观察使用。
- `abort()` 调用 `abortActiveRequest()` 或当前 engine 的 `abortRequest()`。

错误策略：

- `kit` 当前没有稳定 `error ref`，只有 `requestState === 'error'` 与 `onError`。
- managed runtime 用内部 `lastError` 保存最近一次错误。
- `lastError` 仅用于展示与观测，不替代 `requestState`。
- `runtime-error` 是观测事件，不参与状态驱动。

## 7. External Runtime 设计

外部 runtime 只需要满足 `ChatRuntime` 协议。

适用场景：

- 用户已有 tiny-robot 基础组件 runtime。
- 用户已有 Pinia / composable / 自研请求层。
- 用户只想复用 `TrChat` UI 与区域组件。

约束：

- 外部 runtime 自己负责消息、会话、请求、stream、abort 生命周期。
- chat 套件不关心外部 runtime 内部实现。
- external runtime 的 `send(payload)` 可以消费 `structuredData`。
- external runtime 必须保证传给 UI 的数据已经符合 `HistoryItem / BubbleMessage` 契约。

## 8. Vue 数据流与 context

遵循 Vue 设计：

- props down。
- events up。
- provide/inject 只用于深层依赖共享。
- state 只读暴露，mutation 通过 actions。
- derived state 用 `computed`，副作用用 `watch`。

`TrChat.Root` 只提供：

- `runtime`
- `parts`
- 解析后的 chat props

不提供：

- 所有基础组件最终 props。
- 所有区域渲染数据。
- layout 内部状态。

原因：

- `TrChat.Root` 是 provider，不是巨型映射层。
- 区域组件应就近完成映射。
- slot 内容运行在父作用域，不能假设能直接 inject 到 `TrChat.Root` 的 context。

## 9. 区域组件设计

### 9.1 `TrChat`

职责：默认完整应用装配。

默认结构：

```text
TrChat
  -> TrChat.Root
    -> TrLayout
      -> TrChat.Conversations
      -> TrChat.Header
      -> TrChat.Messages
      -> TrChat.Composer
```

建议 props：

```ts
export interface ChatProps {
  runtime: ChatRuntime
  parts?: ChatParts
  title?: string
}
```

建议 emits：

```ts
export interface ChatEmits {
  ready: []
  runtimeError: [error: unknown]
  send: [payload: ChatSubmitPayload]
  conversationChange: [id: string | null]
}
```

emits 只做观测，不替代 runtime actions。

### 9.2 `TrChat.Root`

职责：provider。

只做：

- 校验 runtime 是否存在。
- provide chat context（runtime + parts）。
- 透传默认 slot。

不做：

- 不内置 `TrLayout`。
- 不创建 managed runtime。
- 不做区域 props 巨型映射。

### 9.3 `TrChat.Conversations`

职责：把 `runtime.conversations` 映射到 `TrHistory`。

映射：

```text
runtime.conversations.items         -> TrHistory.data
runtime.conversations.currentId     -> TrHistory.selected
runtime.actions.switchConversation  -> item-click
runtime.actions.renameConversation  -> item-title-change
runtime.actions.deleteConversation  -> item-action(delete)
```

实现细节：

- `runtime.conversations` 不存在时不渲染或渲染空容器。
- `menuItems` 根据 actions 自动生成。
- 有 `renameConversation` 才显示 rename。
- 有 `deleteConversation` 才显示 delete。
- `createConversation` 不塞进 `TrHistory`，默认放 Header 或 slot。

### 9.4 `TrChat.Messages`

职责：把 `runtime.messages` 映射到消息区。

默认结构：

```text
TrChat.Messages
  -> scroll host
    -> TrBubbleProvider
      -> TrBubbleList
    -> TrWelcome
  -> TrLayout.ProxyScrollbar
```

映射：

```text
runtime.messages.items             -> TrBubbleList.messages
runtime.messages.requestState      -> 状态展示判断
runtime.messages.processingState   -> 滚动策略判断
runtime.messages.lastError         -> 错误展示或 slot props
parts.messages.welcome             -> TrWelcome props
```

实现细节：

- 有消息时渲染 `TrBubbleList`。
- 无消息时渲染 `TrWelcome`。
- `TrBubbleList.autoScroll` 默认开启。
- `Layout.ProxyScrollbar.scrollTarget` 指向真实 scroll host。
- 不新增消息 renderer 协议，继续使用 `TrBubbleProvider` 与 `TrBubbleList` 既有能力。

### 9.5 `TrChat.Composer`

职责：把 `runtime.composer` 映射到 `TrSender`。

映射：

```text
runtime.composer.inputValue       -> TrSender.modelValue
runtime.composer.disabled         -> TrSender.disabled
runtime.composer.loading          -> TrSender.loading
runtime.composer.submitDisabled   -> TrSender.defaultActions.submit.disabled
runtime.actions.setInputValue     -> update:modelValue
runtime.actions.send              -> submit(text, structuredData)
runtime.actions.abort             -> cancel
```

实现细节：

- 不新增 `canSend / canAbort`。
- 不绕开 `TrSender` 的受控模型。
- `structuredData` 原样进入 `runtime.actions.send(payload)`。
- `extensions` 等输入扩展通过 `parts.composer.sender` 透传给 `TrSender`。

### 9.6 `TrChat.Header`

职责：展示标题与少量默认操作。

建议：

- `title` 来自 `TrChat` props。
- 新建会话按钮可调用 `runtime.actions.createConversation`。
- layout 侧栏开关使用 `Layout.AsideToggle` 或 layout slot props，不进入 `ChatRuntime`。

## 10. Slot 设计

`TrChat` 区域 slot 只暴露最小 props，不直接暴露完整 runtime。

`header`：

- `title`
- `requestState`
- `processingState`
- `lastError`
- `createConversation`

`left-aside`：

- `items`
- `currentId`
- `switchConversation`
- `renameConversation`
- `deleteConversation`
- `createConversation`

`main`：

- `messages`
- `requestState`
- `processingState`
- `lastError`

`footer`：

- `inputValue`
- `setInputValue`
- `send`
- `abort`
- `disabled`
- `loading`
- `submitDisabled`

定制边界：

- 轻定制：`<TrChat>` 区域 slots。
- 中度定制：`<TrChat.Root>` + `TrChat.*` 区域组件。
- 深度定制：直接使用 `TrLayout / TrHistory / TrSender / TrBubbleList / kit`。

## 11. 文件结构建议

```text
packages/chat/
  package.json
  src/
    index.ts
    Chat.vue
    Root.vue
    types.ts
    context.ts
    composables/
      useChatContext.ts
      useKitChatRuntime.ts
      useManagedChatRuntime.ts
    components/
      Header.vue
      Conversations.vue
      Messages.vue
      Composer.vue
```

导出形态：

```ts
export { default as TrChat } from './Chat.vue'
export { useManagedChatRuntime } from './composables/useManagedChatRuntime'
export type { ChatRuntime, ChatRuntimeActions, ChatSubmitPayload } from './types'
```

命名空间组件建议挂到 `TrChat`：

```ts
TrChat.Root = Root
TrChat.Header = Header
TrChat.Conversations = Conversations
TrChat.Messages = Messages
TrChat.Composer = Composer
```

同时保留具名导出，方便按需使用。

## 12. 实现顺序

1. 补包级脚手架：`package.json`、构建入口、类型入口、样式入口。
2. 实现 `types.ts / context.ts / useChatContext.ts`。
3. 实现 `useKitChatRuntime`，只做 kit 到 ChatRuntime 的映射。
4. 实现 `useManagedChatRuntime`，补输入、错误、首消息建会话、标题归一化。
5. 实现 `Composer.vue`，先打通发送与取消。
6. 实现 `Messages.vue`，打通消息展示、欢迎态、滚动条。
7. 实现 `Conversations.vue`，打通切换、重命名、删除。
8. 实现 `Header.vue`。
9. 实现 `Root.vue`。
10. 实现 `Chat.vue` 默认布局与区域 slots。

## 13. v1 不做内容

`v1` 不做：

- 独立 `ChatTransport` 协议。
- 新消息模型 `ChatMessage`。
- 新会话模型 `ChatConversation`。
- 新 renderer 体系。
- 把 layout 状态塞进 runtime。
- 直接暴露 `kit` 内部返回结构。
- 完整 assistant-ui primitives 翻版。

## 14. 测试与验证

基础验证：

- type check 能通过。
- chat 包能独立 build。
- managed runtime 能完成首条消息自动建会话并发送。
- external runtime 能只接 UI 层。
- `TrSender` 的 submit/cancel 与 runtime actions 对齐。
- `TrHistory` 的 selected、rename、delete 与 runtime actions 对齐。
- `TrBubbleList` 能消费 runtime messages。

E2E 注意：

- 任何 e2e / Playwright 测试前必须先构建 components 包。
- 重新构建 components 后，最好重启测试服务，避免旧服务复用缓存影响判断。

推荐流程：

```text
pnpm build:components
重启测试服务
pnpm -F tiny-robot-test test
```

## 15. 最终结论

推荐方案是：用 `ChatRuntime` 做唯一稳定 UI 协议，用 `packages/kit` 做 managed runtime core，用 `TrChat` 做基于现有原子组件的应用装配。

这样可以同时满足两类用户：

- 想低成本接入完整对话应用的用户，使用 `useManagedChatRuntime + TrChat`。
- 已有数据层或 runtime 的用户，实现 `ChatRuntime` 后只接 chat UI。

这不是 assistant-ui 的 Vue 翻版，而是吸收其“runtime 与 UI 解耦”思想后，严格落在当前 `components + kit` 能力上的实现方案。