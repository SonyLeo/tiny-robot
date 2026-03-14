import type { Component, ComputedRef, VNode } from 'vue'
import type { ConversationStorageStrategy, ChatMessage } from '@opentiny/tiny-robot-kit'
import type { UseMessagePlugin, MessageRequestBody, ChatCompletion, UseMessageOptions } from '@opentiny/tiny-robot-kit'
import type { UseConversationReturn } from '@opentiny/tiny-robot-kit'
import type { PromptProps, StructuredData, BubbleListProps, SenderProps } from '@opentiny/tiny-robot'
import type { UseMcpManagerReturn } from './composables/useMcpManager'

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
  sendMessage: (content: string, data?: StructuredData) => void
  startEditMessage: (messageIndex: number) => void
  cancelEditMessage: (messageIndex: number) => void
  isMessageEditing: (messageIndex: number) => boolean
  editMessage: (messageIndex: number, newContent: string) => void
  updateResponseProvider: (provider: ResponseProvider) => void
  abort: () => Promise<void>
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

export interface TrChatProps {
  responseProvider?: ResponseProvider
  plugins?: UseMessagePlugin[]
  storage?: ConversationStorageStrategy
  initialMessages?: ChatMessage[]
  onFinish?: (message: ChatMessage) => void
  onError?: (error: Error) => void
  mcpManager?: UseMcpManagerReturn
  // === 品牌配置（UI-B1）===
  brand?: BrandConfig
  welcome?: WelcomeConfig
  prompts?: PromptProps[]
  placeholder?: string
  maxLength?: number
  senderMode?: 'single' | 'multiple'
  autoScroll?: boolean
  showHistory?: boolean
  showFeedback?: boolean
  fullscreen?: boolean
  enableFullscreen?: boolean
  show?: boolean
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
}

export interface TrChatSenderProps {
  mode?: 'single' | 'multiple'
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
