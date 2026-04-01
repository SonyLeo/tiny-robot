# Chat Implementation

> Last updated: `2026-04-01`
> Status: `Current source-of-truth summary`
> Scope: `packages/chat`
> Related:
> - [README](./README.md)

## 1. 包定位

`packages/chat` 是 TinyRobot 在 `kit` 之上的 chat-first facade。

它负责：

- `TrChat` 黑盒接入
- `TrChat.Scaffold` / `TrChat.Root` 白盒与半白盒接入
- config -> adapter -> preset props / slices 投影
- chat 级运行时封装 `useChatKit`
- workspace shell、history、attachments、feedback、MCP、model selector 等打包 UI 能力
- 消息级扩展面：
  - `runtime`
  - `messageActions`
  - `bubbleRenderers`
  - `messageTransforms`

它不负责：

- provider SDK 的完整协议适配层
- 后端代理服务
- 替代 `packages/kit` 成为新的底层消息引擎

## 2. 当前主链

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

运行时主链：

```text
useChatKit
  -> useChatConversation
    -> kit.useConversation
      -> kit.useMessage
  -> useChatRequest
  -> useChatMessages
```

## 3. 对外主入口

入口文件： [index.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/index.ts)

当前最重要的公开 surface：

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
- `TrChatFeedback`
- `TrMcpTrigger`
- `TrModelSelector`

## 4. 运行时 contract

核心类型定义在： [core.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/types/core.ts)

当前 `useChatKit` 的定位不是完整兼容 `kit`，而是 chat-first facade。  
它当前稳定提供：

- chat 级状态：
  - `messages`
  - `status`
  - `lastError`
  - `retry`
  - edit / optimistic 相关接口
- runtime bridge：
  - `runtime.activeEngine`
  - `runtime.requestState`
  - `runtime.processingState`
  - `runtime.isProcessing`
  - `runtime.clear()`
  - `runtime.saveMessages()`
- 扩展面：
  - `messageActions`
  - `bubbleRenderers`
  - `messageTransforms`

## 5. config / adapter / preset 链路

关键文件：

- [configLoader.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/adapters/configLoader.ts)
- [configProjection.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/adapters/configProjection.ts)
- [types.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/adapters/types.ts)

当前职责分工：

- `loadChatConfig`
  - 归一化 `ChatConfig`
  - 校验 `models / providers / features / appearance / shell`
- `createChatAdapterFromConfig`
  - 创建 adapter
  - 解析默认模型
  - 生成 response provider
- `createPresetChatProps`
  - 将 config + overrides 投影为页面级 props
- `createPresetChatSlices`
  - 将 preset props 切成白盒叶子组件可消费的 slices

## 6. 当前扩展能力

### 6.1 Message Actions

当前已经支持：

- `messageActions`
- `messageActionsMode`
- built-in actions definition 化
- `actions / operations` 两个 placement

主要实现：

- [useChatFeedback.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/composables/useChatFeedback.ts)
- [ChatFeedback.vue](D:/OpenTinyRepository/tiny-robot/packages/chat/src/components/chat/ChatFeedback.vue)
- [ChatMessageList.vue](D:/OpenTinyRepository/tiny-robot/packages/chat/src/components/chat/ChatMessageList.vue)

### 6.2 Renderer Registry

当前已经支持：

- `bubbleRenderers.contentMatches`
- `bubbleRenderers.boxMatches`

主要实现：

- [ChatLayout.vue](D:/OpenTinyRepository/tiny-robot/packages/chat/src/components/chat/ChatLayout.vue)
- [useDefaultBubbleConfig.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/composables/useDefaultBubbleConfig.ts)

### 6.3 Message Transforms

当前已经支持：

- `messageTransforms.onChunk`
- `messageTransforms.onFinish`

主要实现：

- [useChatConversation.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/composables/useChatConversation.ts)
- [useChatKit.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/composables/useChatKit.ts)
- [resolveRootChatKit.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/helpers/resolveRootChatKit.ts)
- [ChatScaffold.vue](D:/OpenTinyRepository/tiny-robot/packages/chat/src/components/chat/ChatScaffold.vue)

### 6.4 内部 Render Message Normalization

当前内部已经补了一层 render-message normalization，但仍未 public 化为跨包消息类型。

主要实现：

- [chatRenderMessages.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/composables/chatRenderMessages.ts)

当前作用：

- 为 renderer / actions / transforms 提供统一的内部 render message 入口
- 保持 source message identity，不破坏 edit / retry / action 链路

## 7. workspace shell

当前默认黑盒 `TrChat` 已经走 workspace shell 主线。

关键文件：

- [workspace.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/types/workspace.ts)
- [chatUiContext.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/chatUiContext.ts)
- [ChatWorkspaceLayout.vue](D:/OpenTinyRepository/tiny-robot/packages/chat/src/components/chat/ChatWorkspaceLayout.vue)
- [WorkspaceShell.vue](D:/OpenTinyRepository/tiny-robot/packages/chat/src/components/workspace/WorkspaceShell.vue)

当前语义：

- 桌面端默认两栏：左开右关
- 左侧支持 rail
- 右侧工作区是正式区域，但默认隐藏
- 黑盒和白盒已经统一到同一套面板级 slot contract

## 8. 推荐阅读顺序

如果要快速理解当前实现，建议按这个顺序看源码：

1. [index.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/index.ts)
2. [types/core.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/types/core.ts)
3. [types/ui.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/types/ui.ts)
4. [adapters/configProjection.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/adapters/configProjection.ts)
5. [components/chat/ChatScaffold.vue](D:/OpenTinyRepository/tiny-robot/packages/chat/src/components/chat/ChatScaffold.vue)
6. [components/chat/ChatRoot.vue](D:/OpenTinyRepository/tiny-robot/packages/chat/src/components/chat/ChatRoot.vue)
7. [composables/useChatKit.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/composables/useChatKit.ts)
8. [composables/useChatConversation.ts](D:/OpenTinyRepository/tiny-robot/packages/chat/src/composables/useChatConversation.ts)
9. [components/chat/ChatLayout.vue](D:/OpenTinyRepository/tiny-robot/packages/chat/src/components/chat/ChatLayout.vue)
10. [components/chat/ChatMessageList.vue](D:/OpenTinyRepository/tiny-robot/packages/chat/src/components/chat/ChatMessageList.vue)

## 9. 当前测试入口

包内 unit：

- [packages/chat/tests](D:/OpenTinyRepository/tiny-robot/packages/chat/tests)

E2E：

- [packages/test/src/chat](D:/OpenTinyRepository/tiny-robot/packages/test/src/chat)

当前这几条链路最值得作为回归基线：

- `feedback.spec.ts`
- `surface-api.spec.ts`
- `layout-config.spec.ts`
- `renderer-registry.spec.ts`
- `message-transforms.spec.ts`

## 10. 当前边界结论

截至当前代码状态，建议把 `packages/chat` 理解为：

- 一个稳定的 chat-first facade
- 一个带 runtime bridge 的产品层运行时
- 一个已经具备通用扩展能力的 UI 组装层

而不是：

- `tiny-robot-kit` 的完整替代品
- 某个特定 schema / artifact / GenUI 协议的专用容器

如果后续需要继续扩展，优先判断是否能通过现有四层能力接入：

- `runtime`
- `messageActions`
- `bubbleRenderers`
- `messageTransforms`

当前不计划继续推进跨包消息模型统一。

也就是说，现阶段不打算进入：

- `packages/kit` 公共消息类型升级
- `packages/components` / `packages/chat` 的跨包内容模型统一

后续只有在这四层扩展面明显无法承接真实业务场景时，才值得重新评估是否要进入跨包公共消息模型改造。
