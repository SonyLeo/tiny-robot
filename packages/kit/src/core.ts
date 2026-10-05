export * from './message/adapters/native'
export * from './message/core'
export * from './message/plugins'
export * from './message/types'
export { combineDeltaData, normalizeToAsyncGenerator } from './message/utils'
export * from './skills'
export * from './conversation'

// Framework-neutral transport, provider, and browser persistence helpers.
// The Vue-bound root entry remains unchanged; these exports make the helpers
// consumable from the no-Vue core entry used by Angular applications.
export { BaseModelProvider } from './providers/base'
export { OpenAIProvider } from './providers/openai'
export { AIClient } from './client'
// AIClient and the legacy providers keep their existing types. ChatMessage has
// a different OpenAI-based shape in core, so its legacy counterpart is named explicitly.
export {
  ErrorType,
  StreamEventType,
  type AIAdapterError,
  type AIModelConfig,
  type AIProvider,
  type ChatCompletionOptions,
  type ChatCompletionRequest,
  type ChatCompletionResponse,
  type ChatCompletionResponseChoice,
  type ChatCompletionResponseMessage,
  type ChatCompletionResponseUsage,
  type ChatCompletionStreamResponse,
  type ChatCompletionStreamResponseChoice,
  type ChatCompletionStreamResponseDelta,
  type ChatHistory as LegacyChatHistory,
  type ChatMessage as LegacyChatMessage,
  type MessageMetadata as LegacyMessageMetadata,
  type MessageRole as LegacyMessageRole,
  type StreamHandler,
  type ToolCall as LegacyToolCall,
} from './types'
export {
  extractTextFromResponse,
  formatMessages,
  handleSSEStream,
  sseStreamToGenerator,
  type FormatMessageInput,
  type FormattedMessage,
  type TextExtractionResponse,
} from './utils'
export {
  IndexedDBStrategy,
  LocalStorageStrategy,
  indexedDBStorageStrategyFactory,
  localStorageStrategyFactory,
  type CoreConversationStorageStrategy as ConversationStorageStrategy,
} from './storage/core'
