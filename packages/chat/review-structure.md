# Chat 目录结构检视与重构方案

---

## 一、当前结构的问题

### 问题 1：`components/core` 是一个混合层

`components/core/` 同时承载了三类职责完全不同的东西：

- 黑盒入口组件：`Chat.vue`（TrChat）
- 公开 primitive 组件：`ChatHeader.vue`、`ChatMessageList.vue`、`ChatSender.vue`、`ChatFooter.vue`、`ChatWelcome.vue`、`ChatLayout.vue`
- Provider 入口组件：`ChatProvider.vue`
- 内部 composable：`useDefaultBubbleConfig.ts`、`useSlotFilter.ts`
- 内部默认页面区域：`default-renderer/`

"core" 这个名字没有传达任何信息。一个新开发者看到这个目录，无法判断哪些是公开 API、哪些是内部实现。

### 问题 2：`default-renderer` 命名不准确

`default-renderer/` 里的文件不是 renderer（渲染器），而是 TrChatPage 的默认页面区域组件：

- `ChatDefaultHeaderRegion.vue` — 默认 header 区域
- `ChatDefaultBodyRegion.vue` — 默认 body 区域
- `ChatDefaultFooterRegion.vue` — 默认 footer 区域
- `ChatDefaultRenderer.vue` — 纯透传组件，只是把 slots 转发给 TrChatPage

"renderer" 这个词在项目中已经被 `components/renderers/`（bubble content renderer）占用了，这里再用会造成混淆。

### 问题 3：`page/` 和 `root/` 只有 2-3 个文件，但各占一个顶层目录

```
src/page/          → 2 个文件（TrChatPage.vue + index.ts）
src/root/          → 4 个文件（TrChatRoot.vue + RootBootstrapProvider.vue + createRootBootstrapState.ts + index.ts）
```

这两个目录的文件太少，不值得各占一个顶层位置。它们和 `Chat.vue`、`ChatProvider.vue` 一起构成了包的入口层，应该放在一起。

### 问题 4：`runtime/chat-kit` 命名是内部术语

`chat-kit` 是重构前的内部概念（对应 `@opentiny/tiny-robot-kit` 的 `useConversation` + `useMessage` 组合）。对外部开发者来说，这个名字没有意义。这个目录实际上是"会话引擎"——管理消息发送、接收、重试、编辑、状态追踪。

### 问题 5：`runtime/config` 混合了配置解析和 transport

`runtime/config/` 里同时有：
- 配置解析：`trchatConfigEntry.ts`、`useTrChatConfigRuntimeResolution.ts`
- runtime 工厂：`createRuntimeFromConfig.ts`
- transport 实现：`openaiCompatibleTransport.ts`
- feature 注册：`registry.ts`、`featureTypes.ts`

transport 和 feature registry 不属于"config"。

### 问题 6：`runtime/provider` 只有一个文件

```
src/runtime/provider/resolveProviderRuntime.ts
```

一个文件占一个目录，没有必要。

### 问题 7：`shared/context/index.ts` 是一个 400 行的巨型文件

这个文件同时包含：
- 12 个 injection key 定义
- 7 个 page input interface 定义
- `useRequiredInject` 工具函数
- `useChatPageInputs` composable
- `createChatUiContext` 的 re-export

职责过多，应该拆分。

### 问题 8：`shared/utils/` 里的文件和 chat 业务无关

- `typeGuards.ts` — 通用的 `extractProp` / `conditionalProp`
- `props.ts` — 通用的 `triStateBooleanProp`

这些是 Vue 工具函数，不是 chat 特有的 shared 逻辑。

### 问题 9：`components/workspace/chatUiContext.ts` 放错了位置

`chatUiContext.ts` 定义了整个 chat UI 的状态上下文（workspace 状态、history 可见性、响应式断点），它不只服务于 workspace 组件。它被 `shared/context/index.ts` re-export，被 `root/`、`page/`、`components/core/` 等多处使用。放在 `workspace/` 下面是历史遗留。

### 问题 10：`components/workspace/runtime.ts` 命名模糊

这个文件只有两个纯函数：`resolveWorkspaceRegionWidth` 和 `resolveWorkspaceCollapsedState`。叫 `runtime.ts` 容易和 `src/runtime/` 目录混淆。

### 问题 11：组件命名前缀不一致

| 文件名 | 组件 name | 公开名 |
|---|---|---|
| `WorkspaceShell.vue` | `TrChatWorkspaceShell` | `TrChat.WorkspaceShell` |
| `ModelSelector.vue` | `TrModelSelector` | 内部使用 |
| `McpTrigger.vue` | `TrMcpTrigger` | `TrMcpTrigger` |
| `ChatMcpPanel.vue` | `TrChatMcpPanel` | 内部使用 |

文件名有的带 `Chat` 前缀有的不带，组件 name 有的是 `TrChat` 有的是 `Tr`，没有统一规则。

### 问题 12：types 文件的职责划分不清晰

- `core.ts` — runtime 选项、错误类型、消息动作、transport adapter、bubble config
- `root.ts` — ChatRuntime、ChatRuntimeInput、TrChatConfig、所有 runtime 子模块接口
- `ui.ts` — 组件 props/emits/slots、feature preset、welcome config

`core.ts` 和 `root.ts` 的边界模糊。`ChatStatus`、`ChatErrorInfo` 在 `core.ts`，`ChatMessageViewState` 在 `root.ts`，但它们是同一个领域的概念。

---

## 二、重构方案

### 设计原则

1. 目录名应该反映职责，不反映内部术语
2. 公开 API 和内部实现要有清晰的物理边界
3. 一个目录下的文件应该有相同的抽象层级
4. 避免只有 1-2 个文件的顶层目录

### 目标结构

```
src/
  index.ts                              # 公开 API 入口
  internal.ts                           # 内部 API 入口

  # ── 入口层：包的 4 个官方入口组件 ──
  entry/
    TrChat.vue                          # ← 原 components/core/Chat.vue
    TrChatRoot.vue                      # ← 原 root/TrChatRoot.vue
    TrChatPage.vue                      # ← 原 page/TrChatPage.vue
    TrChatProvider.vue                  # ← 原 components/core/ChatProvider.vue
    RootBootstrapProvider.vue           # ← 原 root/RootBootstrapProvider.vue（内部）
    createRootBootstrapState.ts         # ← 原 root/createRootBootstrapState.ts（内部）
    index.ts

  # ── 公开 primitive 组件 ──
  components/
    ChatLayout.vue                      # ← 原 components/core/ChatLayout.vue
    ChatHeader.vue                      # ← 原 components/core/ChatHeader.vue
    ChatMessageList.vue                 # ← 原 components/core/ChatMessageList.vue
    ChatSender.vue                      # ← 原 components/core/ChatSender.vue
    ChatFooter.vue                      # ← 原 components/core/ChatFooter.vue
    ChatWelcome.vue                     # ← 原 components/core/ChatWelcome.vue
    ChatAttachments.vue                 # ← 原 components/attachments/ChatAttachments.vue
    ChatFeedback.vue                    # ← 原 components/feedback/ChatFeedback.vue
    ChatHistory.vue                     # ← 原 components/history/ChatHistory.vue
    ModelSelector.vue                   # ← 原 components/model-selector/ModelSelector.vue
    McpTrigger.vue                      # ← 原 components/mcp/McpTrigger.vue
    index.ts

    # 公开 primitive 的内部子组件和 composable
    history/
      ChatHistoryContent.vue
      ChatHistoryList.vue
      ChatHistoryManageButton.vue
      ChatHistoryNewSession.vue
      ChatHistoryPanel.vue
      ChatHistorySearch.vue
      ChatHistoryToolbar.vue
      useHistoryState.ts

    feedback/
      useChatFeedback.ts

    model-selector/
      useModelSelector.ts
      useFloatingDropdown.ts
      useKeyboardNavigation.ts

    mcp/
      ChatMcpPanel.vue
      useMcpManager.ts

    attachments/
      useChatAttachments.ts

    # 默认页面区域组件（TrChatPage 的内部实现）
    page-regions/                       # ← 原 default-renderer/，改名
      ChatDefaultHeaderRegion.vue
      ChatDefaultBodyRegion.vue
      ChatDefaultFooterRegion.vue
      index.ts
      # 注：ChatDefaultRenderer.vue 删除（纯透传，无价值）

    # bubble content renderer
    renderers/                          # ← 原 components/renderers/，保持
      AttachmentsRenderer.vue
      EditInputRenderer.vue
      ErrorRenderer.vue
      MarkStreamRenderer.vue
      ToolCallRenderer.vue
      ToolCallsRenderer.vue
      index.ts

    # workspace shell 和布局
    workspace/                          # ← 原 components/workspace/，保持
      WorkspaceShell.vue
      ChatWorkspaceLayout.vue
      ChatWorkspaceSidebar.vue
      ChatWorkspaceSidebarShell.vue
      ChatWorkspaceSidebarRail.vue
      ChatWorkspaceLeftSheet.vue
      ChatWorkspaceRightPanel.vue
      ChatWorkspaceRightSheet.vue
      ChatWorkspaceRightEmpty.vue
      useWorkspaceRegion.ts
      workspaceUtils.ts                 # ← 原 runtime.ts，改名
      index.ts

  # ── 运行时层 ──
  runtime/
    # 会话引擎（消息发送、接收、重试、编辑、状态追踪）
    engine/                             # ← 原 chat-kit/，改名
      useChatKit.ts
      useChatConversation.ts
      useChatMessages.ts
      useChatRequest.ts
      chatMessageState.ts
      chatRenderMessages.ts
      index.ts

    # 配置解析和 runtime 工厂
    config/
      createRuntimeFromConfig.ts
      trchatConfigEntry.ts
      useTrChatConfigRuntimeResolution.ts
      resolveProviderRuntime.ts         # ← 原 provider/resolveProviderRuntime.ts，合入
      index.ts

    # transport 实现
    transport/                          # ← 从 config/ 中拆出
      openaiCompatibleTransport.ts
      index.ts

    # feature 注册
    features/                           # ← 从 config/ 中拆出
      registry.ts
      featureTypes.ts
      index.ts

    # 核心工具
    core/
      messageIdentity.ts
      normalizeRuntime.ts
      index.ts

  # ── 共享层 ──
  shared/
    # 注入 key 和上下文
    context/
      injectionKeys.ts                  # ← 从原 index.ts 拆出：12 个 key 定义
      pageInputTypes.ts                 # ← 从原 index.ts 拆出：7 个 page input interface
      chatUiContext.ts                  # ← 从 workspace/ 移入
      index.ts

    # 国际化文案
    messages/
      index.ts

    # 通用工具
    utils/
      iconMap.ts
      props.ts
      typeGuards.ts
      index.ts

  # ── 类型层 ──
  types/
    runtime.ts                          # ← 原 root.ts，改名（ChatRuntime 等 runtime 接口）
    config.ts                           # ← 从 root.ts 拆出（TrChatConfig 等配置类型）
    message.ts                          # ← 从 core.ts + root.ts 拆出（ChatUIMessage、ChatMessageViewState 等）
    component.ts                        # ← 原 ui.ts，改名（组件 props/emits/slots）
    workspace.ts                        # 保持
    model.ts                            # 保持
    core.ts                             # 精简：只保留 ResponseProvider、ChatStatus、ChatErrorInfo 等基础类型
    index.ts

  # ── 样式层 ──
  styles/                               # 保持不变
    index.css
    tokens.css
    layout.css
    drawer.css
    mcp-trigger.css
    model-selector.css
```

---

## 三、变更说明

### 3.1 新增 `entry/` 目录

把包的 4 个官方入口组件（`TrChat`、`TrChat.Root`、`TrChat.Page`、`TrChat.Provider`）和它们的内部支撑文件（`RootBootstrapProvider`、`createRootBootstrapState`）集中到一个目录。

理由：
- 这 4 个组件是用户接触的第一层 API，应该在物理位置上突出
- 原来分散在 `components/core/`、`root/`、`page/` 三个地方，新开发者需要跳转多处才能理解入口层
- `RootBootstrapProvider` 和 `createRootBootstrapState` 只被 `TrChatRoot` 使用，放在一起合理

### 3.2 `components/` 扁平化公开 primitive

把原来分散在 `core/`、`attachments/`、`feedback/`、`history/`、`mcp/`、`model-selector/` 下的公开组件提升到 `components/` 根目录。

理由：
- 公开 primitive 是用户在 `TrChat.Root + primitives` 路径下直接使用的组件
- 扁平化后，用户看到的就是 `ChatHeader`、`ChatSender`、`ChatAttachments` 等，和 `index.ts` 导出的名字一一对应
- 每个 primitive 的内部子组件和 composable 仍然保留在子目录中

### 3.3 `default-renderer/` → `page-regions/`

理由：
- 这些组件是 TrChatPage 的默认页面区域，不是 bubble renderer
- "renderer" 在项目中已经被 `renderers/` 占用
- `ChatDefaultRenderer.vue` 是纯透传组件，建议删除

### 3.4 `runtime/chat-kit/` → `runtime/engine/`

理由：
- "chat-kit" 是内部术语，对外部开发者没有意义
- "engine" 准确描述了这个模块的职责：会话引擎

### 3.5 从 `runtime/config/` 拆出 `transport/` 和 `features/`

理由：
- `openaiCompatibleTransport.ts` 是 transport 实现，不是配置解析
- `registry.ts` + `featureTypes.ts` 是 feature 注册系统，不是配置解析
- 拆分后 `config/` 只负责"配置 → runtime"的转换

### 3.6 `runtime/provider/` 合入 `runtime/config/`

理由：
- 只有一个文件 `resolveProviderRuntime.ts`
- 它的职责是"从 Provider props 创建 runtime"，和 `createRuntimeFromConfig` 是同一层的工厂逻辑

### 3.7 `chatUiContext.ts` 从 `workspace/` 移到 `shared/context/`

理由：
- 它定义了整个 chat UI 的状态上下文，不只服务于 workspace
- 它被 `shared/context/index.ts` re-export，被多处使用
- 放在 `workspace/` 下面是历史遗留

### 3.8 `shared/context/index.ts` 拆分

拆为：
- `injectionKeys.ts` — 12 个 injection key
- `pageInputTypes.ts` — 7 个 page input interface
- `chatUiContext.ts` — UI 状态上下文
- `index.ts` — re-export

### 3.9 `workspace/runtime.ts` → `workspace/workspaceUtils.ts`

理由：
- 只有两个纯函数，不是 runtime
- 避免和 `src/runtime/` 目录混淆

### 3.10 types 重新划分

| 原文件 | 新文件 | 内容 |
|---|---|---|
| `core.ts` | `core.ts`（精简） | ResponseProvider、ChatStatus、ChatErrorInfo、ChatTransportAdapter |
| `root.ts` 的 runtime 部分 | `runtime.ts` | ChatRuntime、ChatRuntimeInput、所有 runtime 子模块接口 |
| `root.ts` 的 config 部分 | `config.ts` | TrChatConfig、TrChatRequestConfig 等配置类型 |
| `core.ts` + `root.ts` 的消息部分 | `message.ts` | ChatUIMessage、ChatMessageViewState、ChatSendInput、ChatMessageTransforms |
| `ui.ts` | `component.ts` | 组件 props/emits/slots |
| `workspace.ts` | `workspace.ts` | 保持 |
| `model.ts` | `model.ts` | 保持 |

---

## 四、不动的部分

以下结构保持不变：

- `styles/` — 样式文件结构清晰，不需要改
- `components/renderers/` — 命名准确，结构合理
- `components/workspace/` 的内部结构 — 文件多但职责清晰
- `runtime/core/` — 只有两个核心工具文件
- `index.ts` / `internal.ts` — 入口文件保持

---

## 五、迁移策略

建议分 3 步执行，每步都保持可编译：

1. 第一步：创建 `entry/`，移动入口组件
   - 移动 `Chat.vue`、`TrChatRoot.vue`、`TrChatPage.vue`、`ChatProvider.vue`
   - 移动 `RootBootstrapProvider.vue`、`createRootBootstrapState.ts`
   - 更新 `index.ts` 的 import 路径
   - 删除空的 `root/`、`page/` 目录

2. 第二步：重组 `runtime/`
   - `chat-kit/` → `engine/`
   - 从 `config/` 拆出 `transport/` 和 `features/`
   - `provider/` 合入 `config/`
   - 更新所有 import

3. 第三步：重组 `components/` 和 `shared/`
   - 公开 primitive 提升到 `components/` 根目录
   - `default-renderer/` → `page-regions/`，删除 `ChatDefaultRenderer.vue`
   - `chatUiContext.ts` 移到 `shared/context/`
   - 拆分 `shared/context/index.ts`
   - types 重新划分
