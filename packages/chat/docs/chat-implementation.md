# Chat 实现说明

## 当前边界

`packages/chat` 目前专注于构建聊天场景的组装层，活跃的路径包括：

- 黑盒入口：`TrChat`
- 组合入口：`TrChat.Scaffold`
- 白盒组合：`TrChat.Root`、`TrChat.Layout`、`TrChat.Header`、`TrChat.Welcome`、`TrChat.MessageList`、`TrChat.Footer`、`TrChat.Sender`、`TrChat.History`
- 共享运行时与状态：`useChatKit`
- 配置归一与预设输出：
  - `createChatAdapterFromConfig`
  - `createPresetChatProps`
  - `createPresetChatSlices`
  - `createPresetConsumptionFromAgentPreset`

旧有的 `ChatPresetRoot` 入口与整个 workspace 分支已经脱离当前代码。

## 包的职责

`packages/chat` 负责：

- chat 级组件组合
- 通过配置驱动的聊天组装
- scaffold 默认和叶子组件的 fallback 消费
- 模型选择集成
- MCP 管理器注入与聊天侧面板衔接
- 附件、发送器动作、历史、反馈等功能的投影
- 打包的聊天用户体验默认值

不负责：

- 除包级封装之外的 provider SDK 实现
- 后端代理服务
- 已归 `packages/kit` 的低层消息引擎原语
- workspace shell / 侧边面板布局系统

## 公开入口

### 黑盒

`TrChat` 是 `ChatScaffold` 的薄封装，公开接口：

```ts
interface TrChatProps {
  config: unknown
  runtime?: ChatScaffoldRuntimeInput
  callbacks?: ChatScaffoldCallbacks
  presetOverrides?: TrChatPresetOverrides
}
```

### Scaffold

`TrChat.Scaffold` 负责准备默认值、运行时和 scaffold 上下文。

接收：

- `config`
- `runtime`
- `callbacks`
- `presetOverrides`

提供：

- 解析后的 adapter
- `presetProps`
- `presetSlices`
- 模型状态
- provider 工厂状态

### 白盒

当前活跃的白盒构建块：

- `TrChat.Root`
- `TrChat.Layout`
- `TrChat.Header`
- `TrChat.Welcome`
- `TrChat.MessageList`
- `TrChat.Footer`
- `TrChat.Sender`
- `TrChat.History`
- `TrChat.HistorySurface`
- `TrModelSelector`
- `TrChat.Attachments`
- `TrChatFeedback`
- `TrChatMcpPanel`

其中 `TrChat.HistorySurface` 的当前约束是：

- 在 `TrChat.Root` 下使用时，可以直接消费根上下文
- 在独立白盒组合中使用时，应显式传入 `chatKit`
- 它自身会提供 history surface 所需的本地 history/UI 上下文，不再假设调用方一定使用 drawer 形态

## 运行时流程

### 1. 黑盒流程

`TrChat`：

1. 接收 `config/runtime/callbacks/presetOverrides`
2. 直接委托 `ChatScaffold`
3. 将具名插槽透传给 scaffold

文件：`packages/chat/src/components/chat/Chat.vue`

### 2. Scaffold 流程

`ChatScaffold`：

1. 使用 `createChatAdapterFromConfig` 归一化配置
2. 解析模型列表、provider 工厂、默认模型
3. 创建或复用 `chatKit`
4. 合并 `presetOverrides`
5. 生成：
   - `presetProps`
   - `presetSlices`
6. 提供 scaffold 上下文
7. 挂载 `ChatRoot`
8. 渲染：
   - 若提供 consumer 插槽则渲染之
   - 否则渲染 `ChatDefaultRenderer`

文件：`packages/chat/src/components/chat/ChatScaffold.vue`

### 3. Root 提供流程

`ChatRoot` 是纯上下文边界，提供：

- `CHAT_KIT_KEY`
- `CHAT_UI_KEY`
- `CHAT_MESSAGES_KEY`
- `MCP_MANAGER_KEY`
- `CHAT_ATTACHMENTS_KEY`
- `CHAT_SENDER_ACTIONS_KEY`

文件：`packages/chat/src/components/chat/ChatRoot.vue`

### 4. 默认渲染流程

`ChatDefaultRenderer` 是黑盒与 scaffold 共享的默认 UI 。

它组合：

1. `ChatLayout`
2. `ChatHeader`
3. welcome 或 message list
4. `ChatFooter`
5. `ChatHistory`

它从 `presetSlices` 读取默认值：

- `presetSlices.welcome`
- `presetSlices.messageList`
- `presetSlices.modelSelector`

文件：`packages/chat/src/components/chat/ChatDefaultRenderer.vue`

## 配置与预设链路

内部归一化链依然活跃：

```text
ChatConfig
  -> loadChatConfig()
  -> createChatAdapterFromConfig()
  -> createPresetChatProps()
  -> createPresetChatSlices()
  -> ChatScaffold / chat-cli / tests
```

意味着：

- adapter/预设依然是核心归一层
- 页面代码应优先使用 `TrChat` 或 `TrChat.Scaffold`

文件：

- `packages/chat/src/adapters/index.ts`
- `packages/chat/src/adapters/configLoader.ts`
- `packages/chat/src/adapters/configProjection.ts`
- `packages/chat/src/adapters/types.ts`
- `packages/chat/src/adapters/chatCli.ts`
- `packages/chat/src/presets/resolve.ts`

## 功能投影

功能注册仍解析如下内置 feature：

- `attachments`
- `senderActions`
- `welcomePrompts`
- `mcp`
- `history`
- `feedback`

Registry 输出驱动 `presetProps`，再流向 `presetSlices` 。

文件：

- `packages/chat/src/features/types.ts`
- `packages/chat/src/features/registry.ts`

## 叶子组件优先级

叶子组件遵循：

```text
局部 props
  > scaffold 默认
  > 组件缺省
```

目前例子：

- `ChatHeader`
- `ChatWelcome`
- `ChatMessageList`
- `ChatSender`
- `ChatHistory`
- `ModelSelector`

这也说明白盒组合不再需要被动传递整套 slice。

## 运行时 / 状态职责

### `useChatKit`

负责：

- 会话
- 活跃消息
- 请求状态
- 错误归一
- 重试流程
- 乐观转标记
- 编辑/回滚行为

文件：

- `packages/chat/src/composables/useChatKit.ts`
- `packages/chat/src/composables/useChatConversation.ts`
- `packages/chat/src/composables/useChatRequest.ts`
- `packages/chat/src/composables/useChatMessages.ts`

### `useMcpManager`

负责：

- MCP 插件状态
- 工具暴露桥
- 工具调用桥
- 插件/工具生命周期

文件：`packages/chat/src/composables/useMcpManager.ts`

### `useModelSelector`

负责：

- 模型备选选择
- provider 工厂匹配
- 在 `chatKit` 中替换 provider

文件：`packages/chat/src/composables/useModelSelector.ts`

## 渲染组件

### 布局层

- `ChatLayout.vue`
- `ChatHeader.vue`
- `ChatFooter.vue`
- `ChatWelcome.vue`
- `ChatMessageList.vue`
- `ChatSender.vue`
- `ChatAttachments.vue`
- `ChatFeedback.vue`
- `ChatMcpPanel.vue`

### 历史层

- `ChatHistory.vue`
- `ChatHistoryNewSession.vue`
- `ChatHistoryToolbar.vue`
- `ChatHistoryManageButton.vue`
- `ChatHistorySearch.vue`
- `ChatHistoryList.vue`
- `ChatHistoryPanel.vue`
- `ChatHistorySurface.vue`

### 渲染工具

- `MarkStreamRenderer.vue`
- `ErrorRenderer.vue`
- `EditInputRenderer.vue`
- `ToolCallsRenderer.vue`
- `ToolCallRenderer.vue`
- `AttachmentsRenderer.vue`

## Demo 对齐

目前 demo 只保留：

- `BlackboxDemo.vue`
- `WhiteboxDemo.vue`

黑盒页面使用：

- `TrChat`
- `config/runtime/callbacks/presetOverrides`

白盒页面使用：

- `TrChat.Scaffold`
- 白盒组合 + 叶子默认

## 已移除分支

当前不在活跃实现的有：

- `ChatPresetRoot.vue`
- `src/components/workspace/**`
- `src/types/workspace.ts`

未来若需要 workspace/页面 shell 行为，应显式创建新分支，而不是隐式复刻旧树。

## 校验命令

推荐局部校验：

```powershell
pnpm -F @opentiny/tiny-robot-chat type-check
pnpm.cmd -F @opentiny/tiny-robot-chat test:unit
pnpm.cmd -F @opentiny/tiny-robot-chat-demo type-check
pnpm.cmd -F @opentiny/tiny-robot-chat-demo build
```

## Theme Responsibility Split

To keep light/dark switching consistent across runtime and styles, the chat package follows a two-layer token model:

- `components` owns reusable theme tokens (`--tr-*`) and their light/dark values.
- `chat` owns scene-level tokens (`--chat-*`) for layout-specific surfaces such as header, panel, docs/workspace overlays, and history shell controls.

Guidelines:

- Do not re-introduce a parallel dark palette for reusable `--tr-*` tokens in `packages/chat/src/styles/variables.css`.
- If a visual requirement is reusable across component surfaces, add or update `--tr-*` in `packages/components`.
- If a visual requirement is chat-scene-only, keep it in `--chat-*`.

## Appearance Runtime Flow

`appearance.mode` remains part of the config and preset contract and supports:

- `light`
- `dark`
- `system`

Runtime behavior:

- `ChatLayout` bridges `appearance.mode` through `ThemeProvider` instead of writing `data-tr-color-mode` directly.
- `system` maps to ThemeProvider auto resolution.
- Runtime consumers that rely on `useTheme().resolvedColorMode` (for example tool/code renderers) read from the same source as CSS token switching.

This keeps DOM theme attributes and runtime theme state aligned, so style rendering and renderer-level dark-mode logic cannot drift.

## Layout Content Flow

`layout.contentLayout` is now part of the layout presentation contract and supports:

- `centered`
- `wide`

Contract behavior:

- `config.layout.contentLayout` defines declarative scene defaults.
- `presetOverrides.contentLayout` is the runtime override point for page-level reactive control.
- `createPresetChatSlices()` exposes the resolved value in `presetSlices.layout.contentLayout` for white-box composition.

This keeps width switching inside the existing `config -> adapter -> preset props -> preset slices` path instead of introducing a parallel UI-only contract.
