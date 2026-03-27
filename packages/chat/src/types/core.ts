import type { Component, ComputedRef, VNode } from 'vue'
import type {
  ChatCompletion,
  ChatMessage,
  ConversationStorageStrategy,
  MessageRequestBody,
  UseConversationReturn,
  UseMessageOptions,
  UseMessagePlugin,
} from '@opentiny/tiny-robot-kit'
import type { StructuredData } from '@opentiny/tiny-robot'

export type ResponseProvider = (
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
) => Promise<ChatCompletion> | AsyncGenerator<ChatCompletion> | Promise<AsyncGenerator<ChatCompletion>>

export type UseMessageResponseProvider = UseMessageOptions['responseProvider']

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

export type ChatErrorType = 'network' | 'auth' | 'rate_limit' | 'timeout' | 'server' | 'provider' | 'unknown'

export interface ChatErrorInfo {
  type: ChatErrorType
  message: string
  retryable: boolean
  httpStatus?: number
  statusCode?: number
  code?: string
  providerId?: string
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
export type ChatContentLayout = 'centered' | 'wide'

export type ChatAppearanceMode = 'light' | 'dark' | 'system'

export interface ChatAppearanceConfig {
  mode?: ChatAppearanceMode
}

export interface UseChatKitOptions {
  responseProvider: ResponseProvider
  plugins?: UseMessagePlugin[]
  storage?: ConversationStorageStrategy
  initialMessages?: ChatMessage[]
  onFinish?: (message: ChatMessage) => void
  onError?: (error: Error) => void
}

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

export interface BrandConfig {
  title?: string
  logo?: VNode | Component
}
