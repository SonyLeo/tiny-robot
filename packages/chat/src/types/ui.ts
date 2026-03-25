import type { Component, VNode } from 'vue'
import type {
  Attachment,
  AttachmentListProps,
  BubbleListProps,
  PromptProps,
  SenderProps,
  UploadButtonProps,
  VoiceButtonProps,
} from '@opentiny/tiny-robot'
import type { UseMcpManagerReturn } from '../composables/useMcpManager'
import type { UseChatAttachmentsReturn } from '../composables/useChatAttachments'
import type { ChatScaffoldCallbacks, ChatScaffoldRuntimeInput } from '../components/chat/scaffold'
import type {
  BrandConfig,
  ChatAppearanceConfig,
  ChatListVariant,
  ChatMessageActionPayload,
  UseChatKitOptions,
  UseChatKitReturn,
} from './core'
import type { ModelOption, ModelProviderFactory } from './model'

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

export interface TrChatPresetOverrides {
  mcpManager?: UseMcpManagerReturn
  attachmentsManager?: UseChatAttachmentsReturn
  appearance?: ChatAppearanceConfig
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
  showHistory?: boolean
  showFeedback?: boolean
  fullscreen?: boolean
  enableFullscreen?: boolean
  show?: boolean
  onMessageAction?: (payload: ChatMessageActionPayload) => void
  roleConfigs?: BubbleListProps['roleConfigs']
  groupStrategy?: BubbleListProps['groupStrategy']
  senderProps?: SenderProps
  bubbleListProps?: Omit<BubbleListProps, 'roleConfigs' | 'groupStrategy' | 'messages'>
  historyProps?: Record<string, unknown>
  models?: ModelOption[]
  defaultModel?: string
  providerFactories?: ModelProviderFactory[]
  onModelChange?: (model: ModelOption) => void
}

export interface TrChatProps {
  config: unknown
  runtime?: ChatScaffoldRuntimeInput
  callbacks?: ChatScaffoldCallbacks
  presetOverrides?: TrChatPresetOverrides
}

type TrChatRootSharedProps = {
  mcpManager?: UseMcpManagerReturn
  attachmentsManager?: UseChatAttachmentsReturn
  attachmentsFeature?: ChatAttachmentsFeaturePreset
  senderActionsFeature?: ChatSenderActionsFeaturePreset
  messages?: ChatMessagesOverrides
}

type TrChatRootPropsA = {
  responseProvider: UseChatKitOptions['responseProvider']
  plugins?: UseChatKitOptions['plugins']
  storage?: UseChatKitOptions['storage']
  initialMessages?: UseChatKitOptions['initialMessages']
  onFinish?: UseChatKitOptions['onFinish']
  onError?: UseChatKitOptions['onError']
  chatKit?: never
}

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
  onActionClick?: (payload: ChatMessageActionPayload) => void
  groupStrategy?: BubbleListProps['groupStrategy']
}

export interface TrChatSenderProps {
  mode?: 'single' | 'multiple'
  placeholder?: string
  maxLength?: number
}
