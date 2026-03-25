# Chat API Draft

## 前提

- 当前处于开发阶段，不考虑兼容性。
- 产品主形态以黑盒 `TrChat` 为主。
- 白盒能力保留，但定位为黑盒的中间组装层，不再作为默认接入路径。

## 目标

1. 黑盒优先：业务方优先只写配置，不写模板拼装代码。
2. 配置优先：布局、功能、文案、模型、面板都走声明式配置。
3. 组件替换优先：需要自定义时优先传组件，不让用户复制整段 template。
4. 白盒内收默认值：白盒组件自动从 scaffold context 取值，局部 props 只覆盖差异。
5. 低层逃生口保留：`Root/Layout/Header/MessageList/Footer/Sender` 仍可单独导出，但不再是主文档主路径。

## 分层

### 1. 黑盒层

面向最终产品接入。

```ts
export interface TrChatProps {
  config: ChatConfigInput
  runtime?: ChatRuntimeInput
  layout?: ChatLayoutSchema
  components?: Partial<TrChatComponentRegistry>
  appearance?: ChatAppearanceConfig
  callbacks?: ChatCallbacks
}
```

### 2. Scaffold 层

面向内部组装层，替代当前“`createPresetChatSlices + 手工透传 template`”的用法。

```ts
export interface TrChatScaffoldProps {
  config: ChatConfigInput
  runtime?: ChatRuntimeInput
  layout?: ChatLayoutSchema
  components?: Partial<TrChatComponentRegistry>
  appearance?: ChatAppearanceConfig
  callbacks?: ChatCallbacks
}
```

### 3. Low-level 层

面向极少数需要完全接管结构的场景。

- `TrChat.Root`
- `TrChat.Layout`
- `TrChat.Header`
- `TrChat.Welcome`
- `TrChat.MessageList`
- `TrChat.Footer`
- `TrChat.Sender`
- `TrChat.History`
- `TrChat.ModelSelector`
- `TrChat.WorkspaceShell`
- `TrChat.WorkspacePanelHost`

这层继续导出，但不作为默认推荐路径。

## 黑盒 API

### 顶层 props

```ts
export type ChatConfigInput = ChatConfig | ChatAdapter

export interface ChatRuntimeInput {
  chatKit?: UseChatKitReturn
  storage?: ConversationStorageStrategy
  plugins?: UseMessagePlugin[]
  initialMessages?: ChatMessage[]
  mcpManager?: UseMcpManagerReturn
  selectedModel?: string
}

export interface ChatCallbacks {
  onFinish?: (message: ChatMessage) => void
  onError?: (error: Error) => void
  onMessageAction?: (payload: ChatMessageActionPayload) => void
  onModelChange?: (model: ModelOption) => void
}
```

### 布局配置

```ts
export type ChatLayoutKind = 'default' | 'docs' | 'workspace'

export interface ChatLayoutSchema {
  kind?: ChatLayoutKind
  header?: ChatHeaderSchema
  content?: ChatContentSchema
  composer?: ChatComposerSchema
  navigation?: ChatContentNavigationSchema
  regions?: ChatWorkspaceRegionsSchema
}

export interface ChatHeaderSchema {
  visible?: boolean
  title?: string
  showNewChat?: boolean
  showHistory?: boolean
  showFullscreen?: boolean
}

export interface ChatContentSchema {
  messageListVariant?: 'bubble' | 'docs' | 'workspace'
  autoScroll?: boolean
  groupStrategy?: BubbleListProps['groupStrategy']
  showFeedback?: boolean
  emptyState?: 'welcome' | 'empty'
  fullWidth?: boolean
}

export interface ChatComposerSchema {
  visible?: boolean
  mode?: 'single' | 'multiple'
  placeholder?: string
  maxLength?: number
  showModelSelector?: boolean
  showAttachments?: boolean
}

export interface ChatContentNavigationSchema {
  enabled?: boolean
  placement?: 'left' | 'right'
  minItems?: number
  topOffset?: number
}

export interface ChatWorkspaceRegionsSchema {
  left?: ChatWorkspaceRegionSchema
  right?: ChatWorkspaceRegionSchema
}

export interface ChatWorkspaceRegionSchema {
  width?: number | 'sm' | 'md' | 'lg'
  collapsible?: boolean
  collapseMode?: 'rail' | 'hidden'
  defaultOpen?: boolean
  railLabel?: string
  defaultPanelId?: string
  panels?: ChatPanelEntry[]
}
```

### 面板配置

```ts
export type ChatBuiltInPanelId = 'history' | 'mcp' | 'outline'

export type ChatPanelEntry = ChatBuiltInPanelId | ChatCustomPanelEntry

export interface ChatCustomPanelEntry {
  id: string
  title: string
  description?: string
  component: string
}
```

`component` 不要求用户写 template 组装，只要求在 `components.panels` 里注册组件。

### 组件替换

```ts
export interface TrChatComponentRegistry {
  Header: Component
  Welcome: Component
  MessageList: Component
  Footer: Component
  Sender: Component
  Attachments: Component
  Feedback: Component
  History: Component
  ModelSelector: Component
  WorkspaceShell: Component
  WorkspacePanelHost: Component
  AssistantOutlinePanel: Component
  panels: Record<string, Component>
}
```

### 黑盒用法

```vue
<TrChat
  :config="chatConfig"
  :layout="{
    kind: 'workspace',
    navigation: { enabled: true },
    regions: {
      left: { railLabel: 'History', panels: ['history'] },
      right: {
        railLabel: 'Tools',
        panels: ['outline', 'mcp', { id: 'notes', title: 'Notes', component: 'notesPanel' }],
      },
    },
  }"
  :components="{ panels: { notesPanel: NotesPanel } }"
/>
```

## Scaffold API

### 组件职责

`TrChat.Scaffold` 负责：

- 解析 `config`
- 创建 adapter
- 创建或接管 `chatKit`
- 解析 layout / feature / component registry
- 提供统一的 scaffold context

### 草案接口

```ts
export interface ChatScaffoldContextValue {
  chatKit: UseChatKitReturn
  adapter: ChatAdapter
  config: ChatConfig
  layout: ResolvedChatLayoutSchema
  appearance?: ChatAppearanceConfig
  callbacks?: ChatCallbacks
  components: ResolvedTrChatComponentRegistry
  slices: {
    root: ChatPresetRootSlice
    layout: ChatPresetLayoutSlice
    header: ChatPresetHeaderSlice
    welcome: ChatPresetWelcomeSlice
    messageList: ChatPresetMessageListSlice
    sender: ChatPresetSenderSlice
    history: ChatPresetHistorySlice
    modelSelector: ChatPresetModelSelectorSlice
  }
}
```

### 关键规则

- 叶子组件默认从 scaffold context 取值。
- 叶子组件本地 props 只做覆盖。
- 覆盖优先级：
  `local props > scaffold context > component default`

### 白盒推荐用法

```vue
<TrChat.Scaffold
  :config="chatConfig"
  :layout="workspaceLayout"
  :components="{ panels: { notesPanel: NotesPanel } }"
>
  <TrChat.WorkspaceShell>
    <TrChat.Layout>
      <TrChat.Header />
      <TrChat.Welcome />
      <TrChat.MessageList />
      <TrChat.Footer>
        <TrChat.Attachments />
        <TrChat.ModelSelector />
        <TrChat.Sender />
      </TrChat.Footer>
    </TrChat.Layout>
  </TrChat.WorkspaceShell>
</TrChat.Scaffold>
```

这里不再要求外层手写：

- `shellSlices.layout.show`
- `shellSlices.header.title`
- `shellSlices.messageList.variant`
- `shellSlices.sender.placeholder`
- `shellSlices.modelSelector.models`

这些默认值都由 scaffold context 自动提供。

## 低层组件收敛原则

### 保留但不推荐外部传大量 props 的组件

- `TrChat.Layout`
- `TrChat.Header`
- `TrChat.Welcome`
- `TrChat.MessageList`
- `TrChat.Footer`
- `TrChat.Sender`
- `TrChat.History`
- `TrChat.ModelSelector`

### 每个组件只保留必要覆盖项

```ts
export interface TrChatLayoutProps {
  fullscreen?: boolean
  appearance?: ChatAppearanceConfig
}

export interface TrChatHeaderProps {
  title?: string
  showHistory?: boolean
  showNewChat?: boolean
  showFullScreen?: boolean
  showClose?: boolean
}

export interface TrChatWelcomeProps {
  title?: string
  description?: string
  icon?: VNode | Component
  prompts?: PromptProps[]
}

export interface TrChatMessageListProps {
  variant?: ChatListVariant
  autoScroll?: boolean
  groupStrategy?: BubbleListProps['groupStrategy']
}

export interface TrChatSenderProps {
  placeholder?: string
  mode?: 'single' | 'multiple'
  maxLength?: number
}
```

叶子组件不再承担“preset slice 搬运工”的角色。

## 内部实现建议

### 新增 context

- `CHAT_SCAFFOLD_KEY`
- `CHAT_LAYOUT_KEY`
- `CHAT_COMPONENTS_KEY`

### 调整现有路径

1. `TrChat` 内部直接走 `Scaffold -> default renderer`
2. `ChatPresetRoot` 升级或替换为 `TrChat.Scaffold`
3. `createPresetChatProps/createPresetChatSlices` 退到内部实现和测试辅助，不再作为主文档主路径
4. `WorkspaceShell` 支持直接读取 layout schema，不再要求 demo 自己传左右 region slice

## Demo 组织

demo 首页只保留两个案例：

1. `BlackboxDemo`
   - 展示最终产品形态
   - 展示 layout + components 替换后的效果
2. `WhiteboxDemo`
   - 展示中间组装层
   - 展示默认值来自 scaffold context，而不是外层手工透传

`P5ShellPreview` 不再放在 demo 首页；若保留，放到内部参考或 examples。

## 直接执行顺序

1. 先做 `demo` 收敛，只保留黑盒和白盒。
2. 增加 `Scaffold context`，让叶子组件自动吃默认值。
3. 将 `WorkspaceShell` 接到 `layout schema`。
4. 最后再收窄 `TrChat` 顶层 props，形成新的黑盒 public API。
