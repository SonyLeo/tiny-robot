import type { Component, ComputedRef, VNode } from 'vue'
import type { ConversationStorageStrategy, ChatMessage } from '@opentiny/tiny-robot-kit'
import type { UseMessagePlugin, MessageRequestBody, ChatCompletion, UseMessageOptions } from '@opentiny/tiny-robot-kit'
import type { UseConversationReturn } from '@opentiny/tiny-robot-kit'
import type {
  PromptProps,
  StructuredData,
  BubbleListProps,
  SenderProps,
  Attachment,
  AttachmentListProps,
  UploadButtonProps,
  VoiceButtonProps,
} from '@opentiny/tiny-robot'
import type { UseMcpManagerReturn } from './composables/useMcpManager'
import type { UseChatAttachmentsReturn } from './composables/useChatAttachments'

// ===== ResponseProvider =====
// 注意：实际底层签名接受 AsyncGenerator<ChatCompletion>，与设计文档中的 ReadableStream<string> 不同
// createOpenAIProvider 工厂函数负责将 SSE 流适配为 AsyncGenerator<ChatCompletion>
export type ResponseProvider = (
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
) => Promise<ChatCompletion> | AsyncGenerator<ChatCompletion> | Promise<AsyncGenerator<ChatCompletion>>

// 底层 useMessage 的 responseProvider 类型
export type UseMessageResponseProvider = UseMessageOptions['responseProvider']

// ===== ChatStatus 四态 =====
// 从底层 requestState 推导：
//   idle / completed / aborted → 'ready'
//   processing + processingState='requesting' → 'submitted'
//   processing + processingState='completing' → 'streaming'
//   error → 'error'
export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

export type ChatErrorType = 'network' | 'auth' | 'rate_limit' | 'timeout' | 'server' | 'provider' | 'unknown'

export interface ChatErrorInfo {
  type: ChatErrorType
  message: string
  retryable: boolean
  statusCode?: number
  originalError?: unknown
}

export interface ChatMessageActionPayload {
  action: string
  role?: string
  messages: ChatMessage[]
  messageIndexes: number[]
  message?: ChatMessage
  messageIndex?: number
}

export type ChatListVariant = 'bubble' | 'docs' | 'workspace'

export type ChatAppearanceMode = 'light' | 'dark' | 'system'

export interface ChatAppearanceConfig {
  mode?: ChatAppearanceMode
}

// ===== useChatKit 选项 =====
export interface UseChatKitOptions {
  responseProvider: ResponseProvider
  plugins?: UseMessagePlugin[]
  storage?: ConversationStorageStrategy
  initialMessages?: ChatMessage[]
  onFinish?: (message: ChatMessage) => void
  onError?: (error: Error) => void
}

// ===== useChatKit 返回值 =====
export interface UseChatKitReturn extends Pick<
  UseConversationReturn,
  | 'activeConversationId'
  | 'activeConversation'
  | 'createConversation'
  | 'switchConversation'
  | 'deleteConversation'
  | 'updateConversationTitle'
  | 'abortActiveRequest'
> {
  conversations: UseConversationReturn['conversations']
  messages: ComputedRef<ChatMessage[]>
  status: ComputedRef<ChatStatus>
  lastError: ComputedRef<ChatErrorInfo | null>
  sendMessage: (content: string, data?: StructuredData) => void
  startEditMessage: (messageIndex: number) => void
  cancelEditMessage: (messageIndex: number) => void
  isMessageEditing: (messageIndex: number) => boolean
  editMessage: (messageIndex: number, newContent: string) => void
  updateResponseProvider: (provider: ResponseProvider) => void
  abort: () => Promise<void>
  retry: () => Promise<boolean>
}

// ===== 品牌配置 =====
export interface BrandConfig {
  /** Header 左侧品牌标题，不传则不展示 */
  title?: string
  /** Welcome 区 Logo 图标 fallback（welcome.icon 未配置时使用） */
  logo?: VNode | Component
}

// ===== TrChat 黑盒组件 Props =====
export interface WelcomeConfig {
  title: string
  description?: string
  icon?: VNode | Component
}

export interface ChatMessages {
  header: {
    newChat: string
    openHistory: string
    closeHistory: string
    enterFullscreen: string
    exitFullscreen: string
    close: string
  }
  history: {
    newSession: string
    manage: string
    done: string
    defaultConversationTitle: string
    searchPlaceholder: string
    deleteSelected: string
    cancel: string
  }
  sender: {
    placeholder: string
  }
  feedback: {
    copy: string
    edit: string
    regenerate: string
    like: string
    dislike: string
  }
  editMessage: {
    placeholder: string
    cancel: string
    save: string
    saving: string
  }
  toolCall: {
    running: string
    success: string
    failed: string
    cancelled: string
    untitled: string
  }
  error: {
    defaultMessage: string
    retry: string
  }
}

export interface TrChatProps {
  responseProvider?: ResponseProvider
  plugins?: UseMessagePlugin[]
  storage?: ConversationStorageStrategy
  initialMessages?: ChatMessage[]
  onFinish?: (message: ChatMessage) => void
  onError?: (error: Error) => void
  mcpManager?: UseMcpManagerReturn
  attachmentsManager?: UseChatAttachmentsReturn
  appearance?: ChatAppearanceConfig
  // === 品牌配置（UI-B1）===
  brand?: BrandConfig
  welcome?: WelcomeConfig
  prompts?: PromptProps[]
  attachmentsFeature?: ChatAttachmentsFeaturePreset
  senderActionsFeature?: ChatSenderActionsFeaturePreset
  placeholder?: string
  maxLength?: number
  senderMode?: 'single' | 'multiple'
  autoScroll?: boolean
  messageListVariant?: ChatListVariant
  showHistory?: boolean
  showFeedback?: boolean
  fullscreen?: boolean
  enableFullscreen?: boolean
  show?: boolean
  onMessageAction?: (payload: ChatMessageActionPayload) => void
  // 补充缺失的 props
  roleConfigs?: BubbleListProps['roleConfigs']
  groupStrategy?: BubbleListProps['groupStrategy']
  senderProps?: SenderProps
  bubbleListProps?: Omit<BubbleListProps, 'roleConfigs' | 'groupStrategy' | 'messages'>
  // TODO: @opentiny/tiny-robot 暂未导出 HistoryProps，故保持 Record 类型
  historyProps?: Record<string, unknown>
  // === 模型选择相关 ===
  models?: ModelOption[]
  defaultModel?: string
  providerFactories?: ModelProviderFactory[]
  onModelChange?: (model: ModelOption) => void
}

type TrChatRootSharedProps = {
  mcpManager?: UseMcpManagerReturn
  attachmentsManager?: UseChatAttachmentsReturn
  attachmentsFeature?: ChatAttachmentsFeaturePreset
  senderActionsFeature?: ChatSenderActionsFeaturePreset
}

// ===== 白盒组件 Props 类型 =====
// 模式 A：必须有 responseProvider，不能有 chatKit
type TrChatRootPropsA = {
  responseProvider: UseChatKitOptions['responseProvider']
  plugins?: UseChatKitOptions['plugins']
  storage?: UseChatKitOptions['storage']
  initialMessages?: UseChatKitOptions['initialMessages']
  onFinish?: UseChatKitOptions['onFinish']
  onError?: UseChatKitOptions['onError']
  chatKit?: never
}

// 模式 B：必须有 chatKit，不能有其他选项
type TrChatRootPropsB = {
  chatKit: UseChatKitReturn
  responseProvider?: never
  plugins?: never
  storage?: never
  initialMessages?: never
  onFinish?: never
  onError?: never
}

export type TrChatRootProps = (TrChatRootPropsA | TrChatRootPropsB) & TrChatRootSharedProps

export interface TrChatHeaderProps {
  showHistory?: boolean
  showNewChat?: boolean
  /** Header 左侧品牌标题 */
  title?: string
}

export interface TrChatWelcomeProps {
  title: string
  description?: string
  icon?: VNode | Component
  prompts?: PromptProps[]
}

export interface TrChatMessageListProps {
  autoScroll?: boolean
  variant?: ChatListVariant
  onActionClick?: (payload: ChatMessageActionPayload) => void
}

export interface TrChatSenderProps {
  mode?: 'single' | 'multiple'
  placeholder?: string
}

export interface ChatAttachmentsUploadConfig extends Pick<
  UploadButtonProps,
  'accept' | 'multiple' | 'maxCount' | 'maxSize' | 'tooltip' | 'tooltipPlacement'
> {
  enabled?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ChatAttachmentsListConfig extends Pick<
  AttachmentListProps,
  'variant' | 'wrap' | 'actions' | 'fileIcons' | 'fileMatchers' | 'disabled'
> {}

export interface ChatAttachmentsFeaturePreset {
  enabled?: boolean
  upload?: ChatAttachmentsUploadConfig
  list?: ChatAttachmentsListConfig
}

export interface ChatSenderActionUploadConfig extends Pick<
  UploadButtonProps,
  'accept' | 'multiple' | 'maxCount' | 'maxSize' | 'tooltip' | 'tooltipPlacement'
> {
  enabled?: boolean
}

export interface ChatSenderActionVoiceConfig extends Pick<
  VoiceButtonProps,
  'tooltip' | 'tooltipPlacement' | 'size' | 'speechConfig' | 'autoInsert' | 'onButtonClick'
> {
  enabled?: boolean
  icon?: VoiceButtonProps['icon']
  recordingIcon?: VoiceButtonProps['recordingIcon']
}

export interface ChatSenderActionsFeaturePreset {
  enabled?: boolean
  upload?: ChatSenderActionUploadConfig
  voice?: ChatSenderActionVoiceConfig
  wordCount?: boolean
  defaultActions?: SenderProps['defaultActions']
}

export interface UseChatAttachmentsOptions {
  initialItems?: Attachment[]
}

// ===== Provider 工厂函数选项 =====
export interface OpenAIProviderOptions {
  apiKey: string
  model?: string
  baseURL?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface DeepSeekProviderOptions {
  apiKey: string
  model?: string
  systemPrompt?: string
  temperature?: number
}

export interface ModelOption {
  value: string // 模型 ID
  label?: string // 显示名称，fallback 到 value
  provider?: string // 用于图标匹配，如 'openai' | 'deepseek'，支持已知 provider 或自定义
  icon?: Component
  disabled?: boolean
}

export interface ModelProviderFactory {
  match: (model: ModelOption) => boolean // 匹配规则
  createProvider: (model: ModelOption) => ResponseProvider // 按需创建，内部可缓存
}

/**
 * Provider 工厂帮助函数类型
 * 用于简化 ModelProviderFactory 的创建
 */
export type ProviderFactoryCreator<T extends Record<string, unknown>> = (options: T) => ModelProviderFactory

// ===== P5-B Workspace Shell types =====

export type ChatWorkspaceRegionKey = 'left' | 'right'

/** Region panel width preset or explicit pixel value */
export type ChatWorkspacePanelWidth = 'sm' | 'md' | 'lg' | number

/** Built-in panel kinds with first-class runtime support */
export type ChatWorkspaceBuiltInPanelKind = 'history' | 'mcp' | 'notebook' | 'outline' | 'sources' | 'custom'

export type ChatWorkspaceComposerDockMode = 'bottom' | 'floating-bottom'

/** Definition of a single panel registered in a region */
export interface ChatWorkspacePanelDefinition {
  /** Unique identifier used for activation and event payloads */
  id: string
  /** Optional built-in kind; enables first-class rendering when supported */
  kind?: ChatWorkspaceBuiltInPanelKind
  /** Short display label shown in the tab bar */
  label?: string
  /** Subtitle shown below the label in the tab */
  description?: string
  /** Full title rendered inside the panel body header */
  title?: string
  /** Whether the panel can be closed by the user (not yet implemented) */
  closable?: boolean
  /** Whether the panel starts open by default (not yet implemented) */
  defaultOpen?: boolean
}

/** Configuration for a collapsible side region (left or right) */
export interface ChatWorkspaceRegionConfig {
  /** Set to false to hide the region entirely. Default: true */
  enabled?: boolean
  /**
   * Whether the region can be collapsed by the user.
   * When false the region is always visible and no toggle/rail is rendered.
   * Default: true
   */
  collapsible?: boolean
  /**
   * Initial open state for uncontrolled mode.
   * Ignored when the parent controls collapse via `leftCollapsed`/`rightCollapsed`.
   * Default: true (open)
   */
  defaultOpen?: boolean
  /**
   * Controls the visual behavior when the region is collapsed.
   * - `'rail'` (default): shrinks to a 44px strip showing the rail label; user can click to restore.
   * - `'hidden'`: region is removed from layout entirely (width → 0, no rail rendered);
   *   center area expands to fill the space. Restore requires an external trigger
   *   (e.g. a button in the `toolbar-actions` slot).
   */
  collapseMode?: 'rail' | 'hidden'
  /**
   * Width of the region when expanded.
   * Accepts a preset ('sm' = 220px, 'md' = 248px, 'lg' = 286px) or an explicit pixel number.
   * Default: 'md' for left, 'lg' for right.
   */
  width?: ChatWorkspacePanelWidth
  /** Ordered list of panels available in this region */
  panels?: ChatWorkspacePanelDefinition[]
  /**
   * Controlled active panel ID.
   * When provided the region operates in controlled panel mode;
   * emit `update:leftActivePanelId` / `update:rightActivePanelId` to update it.
   * When omitted the region manages active panel state internally.
   */
  activePanelId?: string
}

export interface ChatWorkspaceShellTopBarConfig {
  enabled?: boolean
}

export interface ChatWorkspaceCenterLayoutConfig {
  header?: boolean
  composerDock?: ChatWorkspaceComposerDockMode
}

export interface ChatWorkspaceViewStateConfig {
  /** When true the center chat area expands to full width (removes max-width constraints) */
  fullWidth?: boolean
}

export interface ChatWorkspaceShellConfig {
  appearance?: ChatAppearanceConfig
  leftRegion?: ChatWorkspaceRegionConfig
  rightRegion?: ChatWorkspaceRegionConfig
  topBar?: ChatWorkspaceShellTopBarConfig
  centerLayout?: ChatWorkspaceCenterLayoutConfig
  viewState?: ChatWorkspaceViewStateConfig
}

/**
 * Props for `TrChatWorkspaceShell`.
 *
 * ## Collapse — controlled vs uncontrolled
 * - **Uncontrolled** (default): omit `leftCollapsed`/`rightCollapsed`.
 *   The shell manages collapse state internally; listen to `left-toggle`/`right-toggle` for side-effects.
 * - **Controlled**: bind `v-model:leftCollapsed` / `v-model:rightCollapsed`.
 *   The shell emits `update:leftCollapsed` / `update:rightCollapsed` on every toggle request
 *   but will not change state until the prop is updated by the parent.
 *
 * ## Panel active state — controlled vs uncontrolled
 * - **Uncontrolled** (default): omit `leftRegion.activePanelId` / `rightRegion.activePanelId`.
 * - **Controlled**: set `activePanelId` inside the region config and handle
 *   `update:leftActivePanelId` / `update:rightActivePanelId` to keep it in sync.
 *
 * ## Slots
 * | Name | Scope | Description |
 * |---|---|---|
 * | `default` | — | Center content area (typically `TrChat`) |
 * | `toolbar-actions` | `{ leftCollapsed, rightCollapsed, toggleLeft, toggleRight }` | Buttons rendered in the top-right toolbar |
 * | `meta` | — | Chip/tag row rendered below the toolbar |
 * | `left` | `{ collapsed, toggle, region, panels, panelItems, activePanelId, setActivePanel }` | Left region content |
 * | `right` | `{ collapsed, toggle, region, panels, panelItems, activePanelId, setActivePanel }` | Right region content |
 *
 * ## Emits
 * | Event | Payload | Description |
 * |---|---|---|
 * | `update:leftCollapsed` | `boolean` | v-model sync for left collapse state |
 * | `update:rightCollapsed` | `boolean` | v-model sync for right collapse state |
 * | `update:leftActivePanelId` | `string` | v-model sync for left active panel |
 * | `update:rightActivePanelId` | `string` | v-model sync for right active panel |
 * | `left-toggle` | `boolean` | Fires after every left collapse/expand (collapsed = true) |
 * | `right-toggle` | `boolean` | Fires after every right collapse/expand (collapsed = true) |
 * | `left-panel-change` | `ChatWorkspacePanelDefinition \| undefined` | Fires when the active left panel changes |
 * | `right-panel-change` | `ChatWorkspacePanelDefinition \| undefined` | Fires when the active right panel changes |
 */
export interface TrChatWorkspaceShellProps extends ChatWorkspaceShellConfig {
  /** Short badge text displayed in the top-left brand area (e.g. "P5") */
  badge?: string
  /** Brand title shown next to the badge */
  title?: string
  /** Brand subtitle shown below the title */
  description?: string
  /**
   * Controlled left collapse state.
   * Omit to use uncontrolled mode. Use with `v-model:leftCollapsed`.
   */
  leftCollapsed?: boolean
  /**
   * Controlled right collapse state.
   * Omit to use uncontrolled mode. Use with `v-model:rightCollapsed`.
   */
  rightCollapsed?: boolean
  /** Label shown in the left rail when the region is collapsed */
  leftRailLabel?: string
  /** Label shown in the right rail when the region is collapsed */
  rightRailLabel?: string
}

export interface ChatWorkspacePanelHostItem {
  id: string
  label: string
  description?: string
}

export interface TrChatWorkspacePanelHostProps {
  title?: string
  subtitle?: string
  items: ChatWorkspacePanelHostItem[]
  modelValue?: string
  activePanelId?: string
  defaultActivePanelId?: string
}
