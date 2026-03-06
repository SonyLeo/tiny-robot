import { createOpenAIProvider } from './openai'
import type { ResponseProvider, DeepSeekProviderOptions } from '../types'

export function createDeepSeekProvider(options: DeepSeekProviderOptions): ResponseProvider {
  return createOpenAIProvider({
    ...options,
    model: options.model ?? 'deepseek-chat',
    baseURL: 'https://api.deepseek.com/v1',
  })
}
