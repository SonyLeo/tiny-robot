import type { Ref } from 'vue'
import type { Attachment } from '@opentiny/tiny-robot'
import type { ChatMessage, ConversationStorageStrategy } from '@opentiny/tiny-robot-kit'
import type {
  BrandConfig,
  ChatAppearanceConfig,
  ChatContentLayout,
  ChatErrorInfo,
  ChatMessageActionDefinition,
  ChatMessageActionsMode,
  ChatMessageTransforms,
  ChatStatus,
} from './core'
import type { ModelOption } from './model'
import type {
  ChatAttachmentsListConfig,
  ChatAttachmentsUploadConfig,
  ChatBubbleRenderers,
  ChatMessagesOverrides,
  WelcomeConfig,
} from './ui'
import type {
  ChatShellVariant,
  ChatWorkspaceRegionCollapseMode,
  ChatWorkspaceRegionConfig,
  ChatWorkspaceRegionWidth,
} from './workspace'

export type ReadonlyRef<T> = Readonly<Ref<T>>

export type ChatUIMessageRole = 'system' | 'user' | 'assistant' | 'tool' | ''

export type ChatUIMessagePart =
  | {
      type: 'text'
      text: string
    }
  | {
      type: 'attachment'
      attachment: Attachment
    }
  | {
      type: 'unknown'
      value: unknown
    }

export interface ChatUIMessageMeta {
  conversationId?: string
  parentMessageId?: string
  turnId?: string
  model?: string
}

export interface ChatUIMessage {
  id: string
  role: ChatUIMessageRole
  createdAt?: number
  parts: ChatUIMessagePart[]
  meta?: ChatUIMessageMeta
  raw?: unknown
}

export interface ChatMessageViewState {
  status?: 'pending' | 'streaming' | 'done' | 'error'
  error?: ChatErrorInfo
  editing?: boolean
  optimistic?: boolean
  capabilities?: {
    editable?: boolean
    retryable?: boolean
    regeneratable?: boolean
    feedbackable?: boolean
  }
}

export interface ChatSendInput {
  text: string
  attachments?: Attachment[]
  modelId?: string | null
}

export type ChatBeforeSendHandler = (
  input: ChatSendInput,
) =>
  | ChatSendInput
  | Partial<ChatSendInput>
  | false
  | void
  | Promise<ChatSendInput | Partial<ChatSendInput> | false | void>

export type ChatErrorHandler = (error: ChatErrorInfo | Error) => void

export interface ChatConversationRuntime {
  messages: ReadonlyRef<ChatUIMessage[]>
  status: ReadonlyRef<ChatStatus>
  send: (input: ChatSendInput) => Promise<void> | void
  abort: () => Promise<void> | void
  retry: (messageId?: string) => Promise<boolean> | boolean
  regenerate: (messageId?: string) => Promise<boolean> | boolean
}

export interface ChatSenderRuntime {
  draft: Ref<string>
  pendingAttachments: Ref<Attachment[]>
  canSend: ReadonlyRef<boolean>
  setDraft: (value: string) => void
  send: (input?: Partial<ChatSendInput>) => Promise<void> | void
  addPendingAttachments: (attachments: Attachment[]) => void
  setPendingAttachments: (attachments: Attachment[]) => void
  removePendingAttachment: (attachment: Attachment) => void
  clearPendingAttachments: () => void
  defaults?: {
    placeholder?: string
    mode?: 'single' | 'multiple'
    maxLength?: number
    wordCount?: boolean
  }
}

export interface ChatMessageRuntime {
  getViewState: (messageId: string) => ChatMessageViewState | undefined
  getActions?: (messageId: string) => ChatMessageActionDefinition[]
  startEdit: (messageId: string) => void
  cancelEdit: (messageId: string) => void
  commitEdit: (messageId: string, nextContent: string) => Promise<boolean> | boolean
  copy: (messageId: string) => Promise<void> | void
  config?: {
    actions?: ChatMessageActionDefinition[]
    actionMode?: ChatMessageActionsMode
    renderers?: ChatBubbleRenderers
    feedback?: {
      enabled?: boolean
    }
    transforms?: ChatMessageTransforms
  }
}

export interface ChatAttachmentsRuntime {
  enabled: ReadonlyRef<boolean>
  prepareFiles: (files: File[]) => Attachment[]
  uploadConfig?: ReadonlyRef<ChatAttachmentsUploadConfig | undefined>
  listConfig?: ReadonlyRef<ChatAttachmentsListConfig | undefined>
}

export interface ChatConversationSummary {
  id: string
  title?: string
}

export interface ChatConversationCreateInput {
  title?: string
}

export interface ChatHistoryRuntime {
  conversations: ReadonlyRef<ChatConversationSummary[]>
  activeConversationId: ReadonlyRef<string | null>
  createConversation: (params?: ChatConversationCreateInput) => Promise<string> | string
  switchConversation: (id: string) => Promise<boolean> | boolean
  deleteConversation: (id: string) => Promise<boolean> | boolean
  renameConversation?: (id: string, title: string) => Promise<boolean> | boolean
}

export interface ChatModelRuntime {
  models: ReadonlyRef<ModelOption[]>
  currentModelId: ReadonlyRef<string | null>
  selectModel: (modelId: string) => Promise<boolean> | boolean
}

export interface ChatWorkspaceRegionRuntime {
  enabled: ReadonlyRef<boolean>
  visible: Ref<boolean>
  collapsed: Ref<boolean>
  width: Ref<ChatWorkspaceRegionWidth | undefined>
  collapseMode: ReadonlyRef<ChatWorkspaceRegionCollapseMode>
  collapsible: ReadonlyRef<boolean>
  railLabel: ReadonlyRef<string | undefined>
  open: () => void
  close: () => void
  toggle: () => void
  collapse: () => void
  expand: () => void
  setWidth: (width: number) => void
}

export interface ChatWorkspaceRuntime {
  enabled: ReadonlyRef<boolean>
  variant: ReadonlyRef<ChatShellVariant>
  isMobile: ReadonlyRef<boolean>
  left: ChatWorkspaceRegionRuntime
  right: ChatWorkspaceRegionRuntime
  historyVisible: ReadonlyRef<boolean>
  openHistory: () => void
  closeHistory: () => void
  toggleHistory: () => void
  setResponsiveHost: (element: HTMLElement | null) => void
}

export interface ChatMcpRuntime {
  enabled: ReadonlyRef<boolean>
  openPanel?: () => void
  closePanel?: () => void
  togglePanel?: () => void
  callTool?: (input: unknown) => Promise<unknown>
}

export interface ChatRuntimeInput {
  conversation: ChatConversationRuntime
  sender?: ChatSenderRuntime
  message?: ChatMessageRuntime
  history?: ChatHistoryRuntime
  models?: ChatModelRuntime
  workspace?: ChatWorkspaceRuntime
  attachments?: ChatAttachmentsRuntime
  mcp?: ChatMcpRuntime
}

export interface ChatRuntime {
  conversation: ChatConversationRuntime
  sender: ChatSenderRuntime
  message: ChatMessageRuntime
  history?: ChatHistoryRuntime
  models?: ChatModelRuntime
  workspace?: ChatWorkspaceRuntime
  attachments?: ChatAttachmentsRuntime
  mcp?: ChatMcpRuntime
}

export interface TrChatRootUiConfig {
  brand?: BrandConfig
  welcome?: WelcomeConfig
  appearance?: ChatAppearanceConfig
  contentLayout?: ChatContentLayout
  copy?: ChatMessagesOverrides
}

export interface TrChatRootProps {
  runtime: ChatRuntimeInput
  ui?: TrChatRootUiConfig
}

export interface TrChatRequestModel {
  id: string
  providerId: string
  label?: string
  icon?: ModelOption['icon']
  disabled?: boolean
}

export interface TrChatTransportConfig {
  type?: 'openai-compatible'
  endpoint?: string
  baseURL?: string
  apiPath?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  headers?: Record<string, string>
  credentials?: RequestCredentials
}

export interface TrChatRequestConfig {
  models: TrChatRequestModel[]
  defaultModelId?: string | null
  transport: TrChatTransportConfig
  systemPrompt?: string
}

export interface TrChatConversationConfig {
  initialMessages?: ChatMessage[]
  persistence?: ConversationStorageStrategy
}

export type TrChatUiConfig = TrChatRootUiConfig

export interface TrChatSenderConfig {
  placeholder?: string
  mode?: 'single' | 'multiple'
  maxLength?: number
  wordCount?: boolean
}

export interface TrChatAttachmentsConfig {
  enabled?: boolean
  upload?: ChatAttachmentsUploadConfig
  list?: ChatAttachmentsListConfig
}

export interface TrChatHistoryConfig {
  enabled?: boolean
  defaultOpen?: boolean
}

export interface TrChatWorkspaceConfig {
  enabled?: boolean
  left?: ChatWorkspaceRegionConfig
  right?: ChatWorkspaceRegionConfig
  defaultView?: ChatShellVariant
}

export interface TrChatMessagesConfig {
  actions?: ChatMessageActionDefinition[]
  actionMode?: ChatMessageActionsMode
  renderers?: ChatBubbleRenderers
  feedback?: {
    enabled?: boolean
  }
  transforms?: ChatMessageTransforms
}

export interface TrChatLifecycleConfig {
  beforeSend?: ChatBeforeSendHandler
  error?: ChatErrorHandler
}

export interface TrChatConfig {
  request: TrChatRequestConfig
  conversation?: TrChatConversationConfig
  ui?: TrChatUiConfig
  workspace?: TrChatWorkspaceConfig
  sender?: TrChatSenderConfig
  attachments?: TrChatAttachmentsConfig
  history?: TrChatHistoryConfig
  messages?: TrChatMessagesConfig
  lifecycle?: TrChatLifecycleConfig
}

export interface CreateRuntimeFromConfigResult {
  runtime: ChatRuntimeInput
  ui: TrChatRootUiConfig
}
