# Chat Implementation

> Last updated: `2026-04-01`
> Status: `Current source-of-truth summary`
> Scope: `packages/chat`

## 1. 包定位

`packages/chat` 是 TinyRobot 在 `components + kit` 之上的 chat-first facade。

它当前负责：

- 提供黑盒入口 `TrChat`
- 提供白盒与半白盒入口 `TrChat.Scaffold`、`TrChat.Root`、`TrChat.Layout`
- 将 config 投影为 adapter、preset props、preset slices
- 提供 chat 级运行时 facade `useChatKit`
- 提供 workspace、history、attachments、feedback、MCP、model selector 等打包能力
- 提供 message actions、renderer registry、message transforms 等扩展面

它当前不负责：

- 完整的 provider SDK 适配层
- 后端代理服务
- 替代 `packages/kit` 成为新的底层消息引擎

## 2. 当前源码结构

当前 `src` 已经完成收口，主要保留 5 个稳定层：

```text
src/
  index.ts
  internal.ts

  types/
  shared/
    context/
    messages/
    utils/
  runtime/
    config/
    presets/
    chat-kit/
    scaffold/
  components/
    core/
    attachments/
    feedback/
    history/
    mcp/
    model-selector/
    renderers/
    workspace/
  styles/
```

对应入口可以从这些文件开始看：

- [index.ts](../src/index.ts)
- [internal.ts](../src/internal.ts)
- [types/index.ts](../src/types/index.ts)
- [runtime/config/index.ts](../src/runtime/config/index.ts)
- [runtime/presets/index.ts](../src/runtime/presets/index.ts)
- [runtime/chat-kit/index.ts](../src/runtime/chat-kit/index.ts)
- [runtime/scaffold/index.ts](../src/runtime/scaffold/index.ts)

## 3. 对外主入口

当前主入口文件是 [index.ts](../src/index.ts)。

最重要的公开 surface 包括：

- 组件入口
  - `TrChat`
  - `TrChat.Scaffold`
  - `TrChat.Root`
  - `TrChat.Layout`
  - `TrChat.WorkspaceLayout`
  - `TrChat.Header`
  - `TrChat.Welcome`
  - `TrChat.MessageList`
  - `TrChat.Footer`
  - `TrChat.Sender`
  - `TrChat.Attachments`
  - `TrChat.History`
  - `TrChat.HistorySurface`
  - `TrChat.WorkspaceShell`
  - `TrChat.WorkspaceRightSheet`
- 独立导出组件
  - `TrChatFeedback`
  - `TrMcpTrigger`
  - `TrModelSelector`
- composable / runtime facade
  - `useChatKit`
  - `useChatAttachments`
  - `useDefaultBubbleConfig`
  - `useMcpManager`
  - `useModelSelector`
  - `useChatFeedback`
  - `useFloatingDropdown`
  - `useKeyboardNavigation`
  - `useHistoryState`
  - `useSlotFilter`
- config / preset / capability
  - `loadChatConfig`
  - `createChatAdapterFromConfig`
  - `createPresetChatProps`
  - `createPresetChatSlices`
  - `createChatCliCapabilitySurface`
  - `CHAT_CAPABILITY_MANIFEST`
  - `resolveAgentPreset`
  - `createChatAdapterFromAgentPreset`
  - `createPresetConsumptionFromAgentPreset`

## 4. 黑盒与白盒主链

当前推荐从这条链理解 chat 包：

```text
TrChat
  -> TrChat.Scaffold
    -> createChatAdapterFromConfig()
    -> createPresetChatProps()
    -> createPresetChatSlices()
    -> TrChat.Root
    -> ChatDefaultRenderer
```

关键文件：

- [Chat.vue](../src/components/core/Chat.vue)
- [ChatScaffold.vue](../src/components/core/ChatScaffold.vue)
- [ChatRoot.vue](../src/components/core/ChatRoot.vue)
- [ChatDefaultRenderer.vue](../src/components/core/default-renderer/ChatDefaultRenderer.vue)

当前职责分工：

- `TrChat`
  - 作为黑盒入口
  - 透传所有命名 slot 到 `TrChat.Scaffold`
- `TrChat.Scaffold`
  - 从 `config` 创建 adapter
  - 管理默认模型、response provider 与 preset projection
  - 暴露白盒组合所需的 scaffold context 和 slot props
- `TrChat.Root`
  - 解析 `chatKit` 或 `responseProvider`
  - 提供 chat、workspace、history、attachments、messages、MCP 等 context
- `ChatDefaultRenderer`
  - 将黑盒默认页面拼成 header / body / footer 三个区域
  - 在 workspace shell 和普通 layout 之间切换

## 5. config / adapter / preset 链路

关键文件：

- [configLoader.ts](../src/runtime/config/configLoader.ts)
- [configProjection.ts](../src/runtime/config/configProjection.ts)
- [types.ts](../src/runtime/config/types.ts)
- [featureTypes.ts](../src/runtime/config/featureTypes.ts)
- [registry.ts](../src/runtime/config/registry.ts)
- [chatCli.ts](../src/runtime/config/chatCli.ts)
- [capabilities.ts](../src/runtime/config/capabilities.ts)

当前链路是：

```text
loadChatConfig
  -> resolveChatFeatures
  -> createChatAdapterFromConfig
  -> createPresetChatProps
  -> createPresetChatSlices
```

当前职责：

- `loadChatConfig`
  - 归一化 `models / providers / defaults / appearance / shell / ui / layout / features / runtime`
  - 校验配置形状
- `resolveChatFeatures`
  - 将 declarative feature config 投影为稳定的 preset 输入
- `createChatAdapterFromConfig`
  - 生成 chat adapter
  - 解析默认模型
  - 提供 `createResponseProvider()`
- `createPresetChatProps`
  - 把 config 和 overrides 合成为黑盒消费的页面级 props
- `createPresetChatSlices`
  - 将 props 投影成白盒叶子组件可直接消费的 slices
- `createChatCliCapabilitySurface` / `CHAT_CAPABILITY_MANIFEST`
  - 暴露给 chat-cli 和外部工具使用的稳定能力元数据

## 6. runtime / chat-kit

关键文件：

- [useChatKit.ts](../src/runtime/chat-kit/useChatKit.ts)
- [useChatConversation.ts](../src/runtime/chat-kit/useChatConversation.ts)
- [useChatRequest.ts](../src/runtime/chat-kit/useChatRequest.ts)
- [useChatMessages.ts](../src/runtime/chat-kit/useChatMessages.ts)
- [chatMessageState.ts](../src/runtime/chat-kit/chatMessageState.ts)
- [chatRenderMessages.ts](../src/runtime/chat-kit/chatRenderMessages.ts)

当前运行时主链：

```text
useChatKit
  -> useChatConversation
  -> useChatRequest
  -> useChatMessages
  -> chatMessageState / chatRenderMessages
```

`useChatKit` 的定位不是完整暴露 `kit`，而是 chat-first facade。它当前稳定提供：

- 会话与消息能力
  - `conversations`
  - `activeConversationId`
  - `activeConversation`
  - `messages`
  - `sendMessage`
  - `createConversation`
  - `switchConversation`
  - `deleteConversation`
  - `updateConversationTitle`
- 请求状态
  - `status`
  - `lastError`
  - `abort`
  - `retry`
- 编辑与 optimistic turn
  - `startEditMessage`
  - `cancelEditMessage`
  - `isMessageEditing`
  - `editMessage`
- runtime bridge
  - `runtime.activeEngine`
  - `runtime.requestState`
  - `runtime.processingState`
  - `runtime.isProcessing`
  - `runtime.clear()`
  - `runtime.saveMessages()`

其中：

- `chatMessageState.ts` 负责 message runtime annotations
- `chatRenderMessages.ts` 负责 render-message normalization，保证 renderer / action / transform 链路能稳定拿到 source message identity

## 7. shared 层

当前 `shared` 只保留跨 runtime 与 UI 的共享基础设施：

- [shared/context/index.ts](../src/shared/context/index.ts)
  - injection keys
  - `useRequiredInject`
  - scaffold / workspace / history / messages 相关上下文入口
- [shared/messages/index.ts](../src/shared/messages/index.ts)
  - chat 包自带 copy
  - `resolveChatMessages`
- [shared/utils/index.ts](../src/shared/utils/index.ts)
  - `iconMap`
  - `props`
  - `typeGuards`

这里已经不再承载 feature-local composable。

## 8. UI feature 层

### 8.1 core

关键文件：

- [ChatLayout.vue](../src/components/core/ChatLayout.vue)
- [ChatMessageList.vue](../src/components/core/ChatMessageList.vue)
- [ChatHeader.vue](../src/components/core/ChatHeader.vue)
- [ChatSender.vue](../src/components/core/ChatSender.vue)
- [useDefaultBubbleConfig.ts](../src/components/core/useDefaultBubbleConfig.ts)
- [useSlotFilter.ts](../src/components/core/useSlotFilter.ts)

当前 `components/core` 只保留主骨架和默认组合链。

### 8.2 workspace

关键文件：

- [chatUiContext.ts](../src/components/workspace/chatUiContext.ts)
- [ChatWorkspaceLayout.vue](../src/components/workspace/ChatWorkspaceLayout.vue)
- [WorkspaceShell.vue](../src/components/workspace/WorkspaceShell.vue)
- [ChatWorkspaceSidebarShell.vue](../src/components/workspace/ChatWorkspaceSidebarShell.vue)

当前 workspace shell 语义：

- 桌面端默认两栏，左开右关
- 左侧支持 rail
- 右侧是正式工作区区域，但默认隐藏
- 移动端通过 drawer / sheet 退化
- 黑盒与白盒共享同一套 workspace slot contract

### 8.3 history / attachments / feedback / mcp / model-selector

关键文件：

- [history/index.ts](../src/components/history/index.ts)
- [attachments/index.ts](../src/components/attachments/index.ts)
- [feedback/index.ts](../src/components/feedback/index.ts)
- [mcp/index.ts](../src/components/mcp/index.ts)
- [model-selector/index.ts](../src/components/model-selector/index.ts)

当前这些 feature 都已经形成 feature-local 目录，状态与 UI 不再分散在顶层技术目录里。

### 8.4 renderers

关键文件：

- [renderers/index.ts](../src/components/renderers/index.ts)
- [AttachmentsRenderer.vue](../src/components/renderers/AttachmentsRenderer.vue)
- [ErrorRenderer.vue](../src/components/renderers/ErrorRenderer.vue)
- [EditInputRenderer.vue](../src/components/renderers/EditInputRenderer.vue)
- [MarkStreamRenderer.vue](../src/components/renderers/MarkStreamRenderer.vue)
- [ToolCallsRenderer.vue](../src/components/renderers/ToolCallsRenderer.vue)
- [ToolCallRenderer.vue](../src/components/renderers/ToolCallRenderer.vue)

当前 renderer registry 已统一收口到 `components/renderers`。

## 9. 当前扩展面

### 9.1 Message Actions

当前支持：

- `messageActions`
- `messageActionsMode`
- built-in actions definition 化
- `actions / operations` 两个 placement

主要实现：

- [useChatFeedback.ts](../src/components/feedback/useChatFeedback.ts)
- [ChatFeedback.vue](../src/components/feedback/ChatFeedback.vue)
- [ChatMessageList.vue](../src/components/core/ChatMessageList.vue)

### 9.2 Renderer Registry

当前支持：

- `bubbleRenderers.contentMatches`
- `bubbleRenderers.boxMatches`

主要实现：

- [ChatLayout.vue](../src/components/core/ChatLayout.vue)
- [useDefaultBubbleConfig.ts](../src/components/core/useDefaultBubbleConfig.ts)

### 9.3 Message Transforms

当前支持：

- `messageTransforms.onChunk`
- `messageTransforms.onFinish`

主要实现：

- [useChatConversation.ts](../src/runtime/chat-kit/useChatConversation.ts)
- [useChatKit.ts](../src/runtime/chat-kit/useChatKit.ts)
- [resolveRootChatKit.ts](../src/runtime/scaffold/resolveRootChatKit.ts)
- [ChatScaffold.vue](../src/components/core/ChatScaffold.vue)

## 10. 测试基线

当前测试入口：

- unit
  - [packages/chat/tests](../../chat/tests)
- e2e
  - [packages/test/src/chat](../../test/src/chat)

这轮实现收口后，已验证通过：

- `pnpm.cmd -F @opentiny/tiny-robot-chat test`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/`

当前最值得作为回归基线的链路包括：

- `feedback.spec.ts`
- `surface-api.spec.ts`
- `layout-config.spec.ts`
- `renderer-registry.spec.ts`
- `message-transforms.spec.ts`
- `workspace-slots.spec.ts`

## 11. 当前边界结论

截至当前代码状态，`packages/chat` 应被理解为：

- 一个稳定的 chat-first facade
- 一个带 runtime bridge 的产品层运行时
- 一个已经具备通用扩展面的 UI 组装层

而不是：

- `packages/kit` 的完整替代品
- 某个特定 schema / artifact / GenUI 协议的专用容器

如果后续继续扩展，优先判断是否能沿当前 4 条稳定扩展面承接：

- `runtime`
- `messageActions`
- `bubbleRenderers`
- `messageTransforms`
