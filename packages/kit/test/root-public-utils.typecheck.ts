import {
  extractTextFromResponse,
  formatMessages,
  type ChatCompletionResponse,
  type ChatMessage,
} from '@opentiny/tiny-robot-kit'

// Existing Vue consumers keep the original parameter and result types.
export const legacyFormat: (messages: Array<ChatMessage | string>) => ChatMessage[] = formatMessages
export const legacyExtract: (response: ChatCompletionResponse) => string = extractTextFromResponse
