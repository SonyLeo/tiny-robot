import type { ResponseProvider, OpenAIProviderOptions } from '../types'
import { createOpenAICompatibleSseProvider } from './shared'

/**
 * SECURITY: This helper sends the API key from the browser runtime.
 * Use it for demos or trusted internal tools only. Production apps
 * should prefer a server-side proxy / BFF adapter.
 */
export function createOpenAIProvider(options: OpenAIProviderOptions): ResponseProvider {
  const {
    apiKey,
    model = 'gpt-4o-mini',
    baseURL = 'https://api.openai.com/v1',
    systemPrompt,
    temperature,
    maxTokens,
  } = options

  return createOpenAICompatibleSseProvider({
    provider: 'openai',
    endpoint: `${baseURL}/chat/completions`,
    model,
    systemPrompt,
    temperature,
    maxTokens,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
}
