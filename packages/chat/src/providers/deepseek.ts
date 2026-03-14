import { createOpenAIProvider } from './openai'
import type { ResponseProvider, DeepSeekProviderOptions } from '../types'

/**
 * SECURITY: This helper inherits the browser-side key exposure model
 * from createOpenAIProvider. Prefer a server-side proxy in production.
 */
export function createDeepSeekProvider(options: DeepSeekProviderOptions): ResponseProvider {
  return createOpenAIProvider({
    ...options,
    model: options.model ?? 'deepseek-chat',
    baseURL: 'https://api.deepseek.com/v1',
  })
}
