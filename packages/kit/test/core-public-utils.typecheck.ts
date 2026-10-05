import type { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources'
import {
  AIClient,
  BaseModelProvider,
  extractTextFromResponse,
  formatMessages,
  type AIModelConfig,
  type ChatCompletionRequest,
  type ChatCompletionResponse,
  type ChatMessage,
  type FormattedMessage,
  type LegacyChatMessage,
  type StreamHandler,
} from '@opentiny/tiny-robot-kit/core'

// The no-Vue entry preserves the callable legacy signatures.
const legacyFormat: (messages: Array<LegacyChatMessage | string>) => LegacyChatMessage[] = formatMessages
const legacyExtract: (response: ChatCompletionResponse) => string = extractTextFromResponse

export function consumeOpenAIMessages(messages: ChatCompletionMessageParam[], response: ChatCompletion) {
  const coreMessages: ChatMessage[] = messages
  const normalized: FormattedMessage[] = formatMessages(coreMessages)
  const text: string = extractTextFromResponse(response)

  // A text formatter cannot supply role-specific OpenAI tool fields.
  // @ts-expect-error FormattedMessage[] must not promise valid OpenAI request messages.
  const requestMessages: ChatMessage[] = normalized

  return { normalized, text, requestMessages }
}

export function consumeLegacyClient(config: AIModelConfig, provider: BaseModelProvider, handler: StreamHandler) {
  const client = new AIClient({ ...config, provider: 'custom', providerImplementation: provider })
  const messages: LegacyChatMessage[] = legacyFormat(['question'])
  const request: ChatCompletionRequest = { messages }
  const response: Promise<ChatCompletionResponse> = client.chat(request)
  const stream: Promise<void> = client.chatStream(request, handler)

  return { response, stream, legacyExtract }
}
