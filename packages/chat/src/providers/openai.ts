import { sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import type { ResponseProvider, OpenAIProviderOptions } from '../types'

export function createOpenAIProvider(options: OpenAIProviderOptions): ResponseProvider {
  const {
    apiKey,
    model = 'gpt-4o-mini',
    baseURL = 'https://api.openai.com/v1',
    systemPrompt,
    temperature,
    maxTokens,
  } = options

  return async function* (requestBody, abortSignal) {
    const messages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...requestBody.messages]
      : requestBody.messages

    const body: Record<string, unknown> = {
      model,
      messages,
      stream: true,
    }
    if (temperature !== undefined) body.temperature = temperature
    if (maxTokens !== undefined) body.max_tokens = maxTokens

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
      signal: abortSignal,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`OpenAI API error ${response.status}: ${text}`)
    }

    // 复用 kit 中已有的 sseStreamToGenerator，产出 ChatCompletion chunk
    yield* sseStreamToGenerator(response, { signal: abortSignal })
  }
}
