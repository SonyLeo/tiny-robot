# Chat UI Rendering

> Last updated: `2026-04-01`
> Status: `Current source-of-truth summary`
> Scope: `packages/chat` UI rendering and composition chain

Detailed companion: [Chat UI Rendering Code Analysis](./chat-ui-rendering-code-analysis.md)

## 1. 文档目标

这份文档只回答一个问题：`packages/chat` 的 UI 是如何从黑盒入口一路装配到最终页面的。

它重点覆盖：

- `TrChat` 黑盒入口如何进入默认渲染链
- `TrChat.Scaffold` 如何把 config 投影成 UI 可消费的 slices
- `TrChat.Root` 如何建立 UI 所依赖的上下文
- `ChatDefaultRenderer` 如何在 `workspace` 和 `stacked` 两条渲染路径之间切换
- `ChatLayout / ChatMessageList / ChatSender / ChatHistory / workspace` 这些叶子组件各自消费什么

它不展开：

- `useChatKit` 内部运行时细节
- `responseProvider` 请求链和错误归一化

这些内容见 [Chat Runtime Chain](./chat-runtime-chain.md)。

## 2. UI 主链总览

当前推荐从这条链理解 chat 包的默认 UI 装配：

```text
TrChat
  -> TrChat.Scaffold
    -> createChatAdapterFromConfig()
    -> createPresetChatProps()
    -> createPresetChatSlices()
    -> TrChat.Root
      -> ChatDefaultRenderer
        -> ChatWorkspaceLayout | ChatLayout
          -> ChatHeader
          -> ChatWelcome | ChatMessageList
          -> ChatAttachments
          -> ChatSender
          -> ModelSelector / McpTrigger
          -> ChatHistory
```

关键入口文件：

- [src/components/core/Chat.vue](../src/components/core/Chat.vue)
- [src/components/core/ChatScaffold.vue](../src/components/core/ChatScaffold.vue)
- [src/components/core/ChatRoot.vue](../src/components/core/ChatRoot.vue)
- [src/components/core/default-renderer/ChatDefaultRenderer.vue](../src/components/core/default-renderer/ChatDefaultRenderer.vue)

## 3. 从黑盒入口到默认渲染器

### 3.1 `TrChat`

[src/components/core/Chat.vue](../src/components/core/Chat.vue) 几乎不做业务逻辑。它的职责只有两个：

- 接收 `config / runtime / callbacks / presetOverrides`
- 把所有命名 slot 原样透传给 `TrChat.Scaffold`

这意味着：

- 黑盒入口和白盒入口共用同一条 scaffold 装配链
- workspace 相关 slot 也是从这里透传下去的
- 黑盒没有私有的 slot 适配层

### 3.2 `TrChat.Scaffold`

[src/components/core/ChatScaffold.vue](../src/components/core/ChatScaffold.vue) 是 UI 装配链的真正起点。

它承担 4 件事：

1. 从 `config` 创建 `adapter`
   - 调用 [src/runtime/config/configProjection.ts](../src/runtime/config/configProjection.ts) 里的 `createChatAdapterFromConfig()`
2. 管理模型选择和 `responseProvider`
   - 结合 [src/runtime/scaffold/scaffoldRuntime.ts](../src/runtime/scaffold/scaffoldRuntime.ts) 的辅助函数，决定当前模型、默认模型，以及是否需要替换 `chatKit` 的 provider
3. 把 config 投影为 UI slices
   - `createPresetChatProps()`
   - `createPresetChatSlices()`
4. 决定默认渲染路径
   - 如果用户提供了默认 slot，则 `ChatRoot` 下面直接渲染用户自己的白盒组合
   - 如果没有默认 slot，则进入 `ChatDefaultRenderer`

`TrChat.Scaffold` 同时通过 `CHAT_SCAFFOLD_KEY` 提供 scaffold context。后续很多叶子组件都不是直接接收一长串 props，而是通过这个 context 读取 `presetSlices`。

## 4. `TrChat.Root` 建立的 UI 上下文

[src/components/core/ChatRoot.vue](../src/components/core/ChatRoot.vue) 本身不渲染页面，它主要负责提供 UI 所依赖的基础上下文。

它会提供：

- `CHAT_KIT_KEY`
  - 当前 chat 运行时
- `CHAT_UI_KEY`
  - 由 [src/components/workspace/chatUiContext.ts](../src/components/workspace/chatUiContext.ts) 创建的 UI 状态
- `CHAT_MESSAGES_KEY`
  - chat copy 和多语言覆写结果
- `CHAT_HISTORY_KEY`
  - 历史面板管理态
- `CHAT_ATTACHMENTS_KEY`
  - 附件管理器和附件 feature 配置
- `CHAT_SENDER_ACTIONS_KEY`
  - sender actions feature 配置
- `MCP_MANAGER_KEY`
  - MCP 管理器

这些 context 的定义都集中在 [src/shared/context/index.ts](../src/shared/context/index.ts)。

`ChatRoot` 的一个关键点是：它不要求上层一定传 `chatKit`。如果没有外部 `chatKit`，它会通过 [src/runtime/scaffold/resolveRootChatKit.ts](../src/runtime/scaffold/resolveRootChatKit.ts) 从 `responseProvider` 派生一个内部 `useChatKit()` 实例。这让黑盒和白盒都可以走同一套下游 UI。

## 5. `presetSlices` 如何进入叶子组件

UI 装配链不是“把所有配置一路 props drilling 到底”，而是：

1. `ChatScaffold` 生成 `presetSlices`
2. 通过 scaffold context 注入
3. 叶子组件按需读取自己关心的 slice

最典型的消费点：

- [src/components/core/ChatLayout.vue](../src/components/core/ChatLayout.vue)
  - 读取 `layout` 和 `appearance` slice
- [src/components/core/ChatHeader.vue](../src/components/core/ChatHeader.vue)
  - 读取 `header` 和 `shell` slice
- [src/components/core/ChatWelcome.vue](../src/components/core/ChatWelcome.vue)
  - 读取 `welcome` slice
- [src/components/core/ChatMessageList.vue](../src/components/core/ChatMessageList.vue)
  - 读取 `messageList` slice
- [src/components/core/ChatSender.vue](../src/components/core/ChatSender.vue)
  - 读取 `sender` slice
- [src/components/history/ChatHistory.vue](../src/components/history/ChatHistory.vue)
  - 读取 `history` 和 `appearance` slice
- [src/components/workspace/ChatWorkspaceLayout.vue](../src/components/workspace/ChatWorkspaceLayout.vue)
  - 读取 `shell` 和 `appearance` slice

这样做的结果是：

- 黑盒默认装配和白盒细粒度装配共享同一套投影结果
- UI 组件既可以吃外部 props，也可以回退到 scaffold slice
- 每个叶子组件更像“可单独摆放的装配节点”，而不是只能在默认页面里工作

## 6. `ChatDefaultRenderer` 的职责

[src/components/core/default-renderer/ChatDefaultRenderer.vue](../src/components/core/default-renderer/ChatDefaultRenderer.vue) 是默认页面骨架。

它做的核心判断只有两个：

1. 当前是不是 workspace shell
   - 通过 `shellSlice.variant === 'workspace'` 决定走 `ChatWorkspaceLayout` 还是普通 `ChatLayout`
2. 当前是不是空会话
   - 通过 `chatKit.messages.value.length === 0` 决定 body 渲染 welcome 还是 message list

它把页面拆成三个区域：

- `ChatDefaultHeaderRegion`
- `ChatDefaultBodyRegion`
- `ChatDefaultFooterRegion`

这样做的意义是：

- 默认页面可以保留明确的布局骨架
- 用户可以只覆写 header/body/footer 某一个区域，而不是重写整页
- slot contract 在黑盒和白盒之间保持一致

### 6.1 Header Region

[src/components/core/default-renderer/ChatDefaultHeaderRegion.vue](../src/components/core/default-renderer/ChatDefaultHeaderRegion.vue) 的逻辑很轻：

- 如果用户显式提供 `header` slot，就渲染用户内容
- 否则回退到 `ChatHeader`
- `header-extra` slot 会映射到 `ChatHeader` 的 `extra` 区域

[src/components/core/ChatHeader.vue](../src/components/core/ChatHeader.vue) 负责：

- 展示标题
- 新建会话按钮
- history 开关
- workspace 右侧面板开关
- 关闭按钮

它并不自行维护这些状态，而是读取：

- `CHAT_KIT_KEY` 里的会话状态
- `CHAT_UI_KEY` 里的 workspace/history UI 状态

### 6.2 Body Region

[src/components/core/default-renderer/ChatDefaultBodyRegion.vue](../src/components/core/default-renderer/ChatDefaultBodyRegion.vue) 负责在 welcome 和 message list 之间切换。

渲染顺序是：

1. 如果提供了 `message-list` slot，直接交给用户
2. 否则如果当前没有消息，进入 welcome area
   - 优先使用 `welcome` slot
   - 再回退到 `ChatWelcome`
   - 如果连 `welcomeSlice` 都没有，再回退到 `empty` slot
3. 如果当前已有消息，进入 `ChatMessageList`
   - 透传 bubble 相关 slot
   - 如果 `messageListSlice.showFeedback` 为 true，在 `after` slot 注入 `ChatFeedback`

[src/components/core/ChatWelcome.vue](../src/components/core/ChatWelcome.vue) 是一个很标准的 slice consumer：

- `title / description / icon / prompts` 可以显式传
- 否则回退到 scaffold 的 `welcomeSlice`
- 点击 prompt 后直接调用 `chatKit.sendMessage()`

### 6.3 Footer Region

[src/components/core/default-renderer/ChatDefaultFooterRegion.vue](../src/components/core/default-renderer/ChatDefaultFooterRegion.vue) 负责默认 footer 的装配。

默认组合是：

```text
ChatFooter
  -> ChatAttachments
  -> ChatSender
    -> footer tools
      -> ModelSelector
      -> McpTrigger
```

几处关键判断：

- 如果用户提供了 `sender` slot，则整块 sender 区域交给用户
- `showFooterTools` 决定是否渲染 footer tools
- `showModelSelector` 决定是否显示模型切换
- `showMcpTrigger` 取决于是否存在 `mcpManager`

[src/components/core/ChatSender.vue](../src/components/core/ChatSender.vue) 负责把运行时状态投影到 `TrSender`：

- `chatKit.status` 控制 loading
- `chatKit.abort()` 作为取消
- `chatKit.sendMessage()` 作为提交
- 如果启用了附件功能或 sender actions，会自动补上 `UploadButton / VoiceButton`

[src/components/attachments/ChatAttachments.vue](../src/components/attachments/ChatAttachments.vue) 则只在存在附件上下文且附件列表非空时渲染。

## 7. `ChatLayout` 和消息渲染

[src/components/core/ChatLayout.vue](../src/components/core/ChatLayout.vue) 是默认和白盒 UI 都会经过的布局底座。

它承担两件关键工作：

1. 建立主题边界
   - 根据 `appearance.mode` 决定是否使用局部 `ThemeProvider`
2. 建立 Bubble 渲染边界
   - 通过 `BubbleProvider` 注册 content/box renderer matches
   - 通过 `BUBBLE_CONFIG_KEY` 提供合并后的 `roleConfigs`

renderer 链的来源有两部分：

- 用户或 `presetSlices.layout` 提供的 `bubbleRenderers`
- [src/components/core/useDefaultBubbleConfig.ts](../src/components/core/useDefaultBubbleConfig.ts) 内置的默认 renderer matches

内置 renderer 主要覆盖：

- 错误消息
- 编辑态消息
- tool calls
- attachment 内容
- optimistic turn 外框

### 7.1 `ChatMessageList`

[src/components/core/ChatMessageList.vue](../src/components/core/ChatMessageList.vue) 把 `chatKit.messages` 交给 `TrBubbleList` 之前，会先做两件事：

1. 用 [src/runtime/chat-kit/chatRenderMessages.ts](../src/runtime/chat-kit/chatRenderMessages.ts) 做 render-message normalization
2. 通过 `MESSAGE_ACTIONS_KEY` 和 `MESSAGE_ACTION_KEY` 暴露 message actions 配置和回调

这一步很关键，因为：

- bubble 层消费的是 render messages
- feedback / renderer / action 仍然需要稳定拿到原始 source message
- `chatRenderMessages.ts` 会把 source message identity 和 message index 作为隐藏属性挂回 message 对象

`ChatMessageList` 还会处理 `docs` 变体的 role configs 覆写，比如 assistant 去掉 avatar、user 调整 placement 和 shape。

### 7.2 `ChatFeedback`

[src/components/feedback/ChatFeedback.vue](../src/components/feedback/ChatFeedback.vue) 负责把 message actions 转成 `TrFeedback` 可消费的 action/operation。

它会综合：

- 组件显式 props
- `ChatMessageList` 通过 context 注入的 actions 配置
- `useChatFeedback()` 生成的内置 action

内置 action 主要包括：

- user: `copy`、`edit`
- assistant: `copy`、`refresh`

同时它还会根据运行时状态决定是否显示 feedback：

- assistant 正在 streaming 时不显示
- assistant 消息带 error 时不显示
- user 气泡默认 hover/focus 后才显示

## 8. `workspace` 渲染链

### 8.1 UI 状态来源

[src/components/workspace/chatUiContext.ts](../src/components/workspace/chatUiContext.ts) 是 workspace UI 状态机。

它统一管理：

- 当前是否启用 workspace shell
- 当前是不是移动端
- left/right region 的 visible / collapsed / width / collapseMode
- history 的显示方式和开关

这意味着 workspace 相关组件本身并不各自持有一份状态，它们都从 `CHAT_UI_KEY` 读取共享状态。

### 8.2 `ChatWorkspaceLayout`

[src/components/workspace/ChatWorkspaceLayout.vue](../src/components/workspace/ChatWorkspaceLayout.vue) 是 workspace 模式下的页面外壳。

它会组合：

- `WorkspaceShell`
  - 桌面端左右栏与中间聊天主区
- `ChatWorkspaceLeftSheet`
  - 移动端左侧 drawer
- `ChatWorkspaceRightSheet`
  - 移动端右侧 sheet

slot contract 统一为：

- `left`
- `left-rail`
- `right`
- `mobile-left`
- `mobile-right`

这也是 [tests/contracts/workspace-slot-contract.test.mjs](../tests/contracts/workspace-slot-contract.test.mjs) 保护的契约之一。

### 8.3 `WorkspaceShell`

[src/components/workspace/WorkspaceShell.vue](../src/components/workspace/WorkspaceShell.vue) 是桌面端 workspace 外壳。

它负责：

- 根据 left/right region config 决定 region 是否显示
- 使用 [src/components/workspace/useWorkspaceRegion.ts](../src/components/workspace/useWorkspaceRegion.ts) 统一处理 collapse mode、宽度和 collapsed state
- 根据 `appearance.mode` 决定局部 `ThemeProvider`
- 把 center 区域留给聊天主体

### 8.4 移动端 fallback

[src/components/workspace/ChatWorkspaceLeftSheet.vue](../src/components/workspace/ChatWorkspaceLeftSheet.vue) 和 [src/components/workspace/ChatWorkspaceRightSheet.vue](../src/components/workspace/ChatWorkspaceRightSheet.vue) 不是简单地把 slot 套进一个 drawer/sheet。

它们还会做一层“结构识别”：

- 如果 slot 里已经传入了 `ChatWorkspaceSidebar` / `ChatWorkspaceSidebarShell`
  - 直接渲染用户提供的结构
- 否则
  - 自动用默认的 `ChatWorkspaceSidebar` 或 `ChatWorkspaceRightPanel` 包一层

这保证了：

- 用户既可以传完整的 panel 组件
- 也可以只传局部内容
- 移动端仍然能退化成一套完整的面板壳

## 9. `stacked` 与 `workspace` 两条 UI 路径如何汇合

默认渲染链虽然有两条视觉路径，但它们最终共用的是同一套核心叶子组件：

- header 仍然是 `ChatHeader`
- body 仍然是 `ChatWelcome` / `ChatMessageList`
- footer 仍然是 `ChatAttachments` + `ChatSender`

差异主要体现在外围壳层：

- `workspace`
  - `ChatWorkspaceLayout` + `WorkspaceShell`
  - 右侧面板默认存在但可隐藏
  - history 常驻在左 region 或移动 drawer
- `stacked`
  - 直接走 `ChatLayout`
  - `ChatHistory` 作为独立 drawer 渲染在页面下方

也就是说，`packages/chat` 当前的 UI 设计不是两套页面完全分离，而是：

- 一套共享的 chat 内核 UI
- 两种不同的壳层承载方式

## 10. 阅读源码的推荐顺序

如果要继续深挖 UI 渲染链，推荐按这个顺序读：

1. [src/components/core/Chat.vue](../src/components/core/Chat.vue)
2. [src/components/core/ChatScaffold.vue](../src/components/core/ChatScaffold.vue)
3. [src/components/core/ChatRoot.vue](../src/components/core/ChatRoot.vue)
4. [src/components/core/default-renderer/ChatDefaultRenderer.vue](../src/components/core/default-renderer/ChatDefaultRenderer.vue)
5. [src/components/core/ChatLayout.vue](../src/components/core/ChatLayout.vue)
6. [src/components/core/ChatMessageList.vue](../src/components/core/ChatMessageList.vue)
7. [src/components/core/ChatSender.vue](../src/components/core/ChatSender.vue)
8. [src/components/workspace/chatUiContext.ts](../src/components/workspace/chatUiContext.ts)
9. [src/components/workspace/ChatWorkspaceLayout.vue](../src/components/workspace/ChatWorkspaceLayout.vue)
10. [src/components/feedback/ChatFeedback.vue](../src/components/feedback/ChatFeedback.vue)

## 11. 当前 UI 边界结论

截至当前代码状态，`packages/chat` 的 UI 层应理解为：

- 一条由 scaffold slices 驱动的装配链
- 一套可在黑盒和白盒之间共享的 slot/context 契约
- 一个以 `ChatLayout` 为渲染底座、以 `workspace` 为壳层扩展的页面系统

而不是：

- 一组彼此独立、互不共享状态的 UI 组件
- 一套和运行时脱节的纯展示层
