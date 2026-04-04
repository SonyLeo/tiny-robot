import type { Component, VNode } from 'vue'
import type {
  Attachment,
  AttachmentListProps,
  BubbleBoxRendererMatch,
  BubbleContentRendererMatch,
  BubbleListProps,
  PromptProps,
  SenderProps,
  UploadButtonProps,
  VoiceButtonProps,
} from '@opentiny/tiny-robot'
import type { UseMcpManagerReturn } from '../components/mcp/useMcpManager'
import type { UseChatAttachmentsReturn } from '../components/attachments/useChatAttachments'
import type { ChatScaffoldCallbacks, TrChatRuntimeInput } from './scaffold'
import type {
  BrandConfig,
  ChatAppearanceConfig,
  ChatContentLayout,
  ChatListVariant,
  ChatMessageActionsInput,
  ChatMessageActionsMode,
  ChatMessageActionPayload,
  UseChatKitOptions,
  UseChatKitReturn,
} from './core'
import type { ModelOption } from './model'
import type { ChatWorkspaceShellConfig } from './workspace'

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
  workspace: {
    expandLeftSidebar: string
    expandRightSidebar: string
    historyRailLabel: string
    previewRailLabel: string
    toggleRightPanel: string
    rightPanelTitle: string
    closeRightPanel: string
  }
  modelSelector: {
    triggerLabel: string
  }
  attachments: {
    uploadTooltip: string
  }
  senderActions: {
    uploadTooltip: string
    voiceTooltip: string
  }
  feedback: {
    copy: string
    edit: string
    regenerate: string
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

export type ChatMessagesOverrides = {
  [K in keyof ChatMessages]?: Partial<ChatMessages[K]>
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

export interface ChatBubbleRenderers {
  contentMatches?: BubbleContentRendererMatch[]
  boxMatches?: BubbleBoxRendererMatch[]
}

export interface TrChatPresetOverrides {
  mcpManager?: UseMcpManagerReturn
  attachmentsManager?: UseChatAttachmentsReturn
  appearance?: ChatAppearanceConfig
  shell?: ChatWorkspaceShellConfig
  brand?: BrandConfig
  welcome?: WelcomeConfig
  prompts?: PromptProps[]
  attachmentsFeature?: ChatAttachmentsFeaturePreset
  senderActionsFeature?: ChatSenderActionsFeaturePreset
  messages?: ChatMessagesOverrides
  placeholder?: string
  maxLength?: number
  senderMode?: 'single' | 'multiple'
  autoScroll?: boolean
  messageListVariant?: ChatListVariant
  contentLayout?: ChatContentLayout
  bubbleRenderers?: ChatBubbleRenderers
  showHistory?: boolean
  showFeedback?: boolean
  show?: boolean
  messageActions?: ChatMessageActionsInput
  messageActionsMode?: ChatMessageActionsMode
  onMessageAction?: (payload: ChatMessageActionPayload) => void
  roleConfigs?: BubbleListProps['roleConfigs']
  groupStrategy?: BubbleListProps['groupStrategy']
  senderProps?: SenderProps
  bubbleListProps?: Omit<BubbleListProps, 'roleConfigs' | 'groupStrategy' | 'messages'>
  historyProps?: Record<string, unknown>
  onModelChange?: (model: ModelOption) => void
}

export interface TrChatProps {
  config: unknown
  runtime?: TrChatRuntimeInput
  callbacks?: ChatScaffoldCallbacks
  presetOverrides?: TrChatPresetOverrides
}

export type TrChatProviderSharedProps = {
  mcpManager?: UseMcpManagerReturn
  attachmentsManager?: UseChatAttachmentsReturn
  attachmentsFeature?: ChatAttachmentsFeaturePreset
  senderActionsFeature?: ChatSenderActionsFeaturePreset
  messages?: ChatMessagesOverrides
  shell?: ChatWorkspaceShellConfig
}

type TrChatProviderPropsA = {
  responseProvider: UseChatKitOptions['responseProvider']
  plugins?: UseChatKitOptions['plugins']
  storage?: UseChatKitOptions['storage']
  initialMessages?: UseChatKitOptions['initialMessages']
  messageTransforms?: UseChatKitOptions['messageTransforms']
  onFinish?: UseChatKitOptions['onFinish']
  onError?: UseChatKitOptions['onError']
  chatKit?: never
}

type TrChatProviderPropsB = {
  chatKit: UseChatKitReturn
  responseProvider?: never
  plugins?: never
  storage?: never
  initialMessages?: never
  messageTransforms?: never
  onFinish?: never
  onError?: never
}

export type TrChatProviderProps = (TrChatProviderPropsA | TrChatProviderPropsB) & TrChatProviderSharedProps

export interface TrChatHeaderProps {
  showHistory?: boolean
  showNewChat?: boolean
  title?: string
}

export interface TrChatWelcomeProps {
  title?: string
  description?: string
  icon?: VNode | Component
  prompts?: PromptProps[]
}

export interface TrChatMessageListProps {
  autoScroll?: boolean
  variant?: ChatListVariant
  messageActions?: ChatMessageActionsInput
  messageActionsMode?: ChatMessageActionsMode
  onActionClick?: (payload: ChatMessageActionPayload) => void
  groupStrategy?: BubbleListProps['groupStrategy']
}

export interface TrChatHistorySurfaceProps {
  chatKit?: UseChatKitReturn
  messages?: ChatMessagesOverrides
}

export interface TrChatSenderProps {
  mode?: 'single' | 'multiple'
  placeholder?: string
  maxLength?: number
}
