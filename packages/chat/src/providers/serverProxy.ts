import { sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import type { ModelProviderFactory, ResponseProvider } from '../types'
import { matchProvider } from './factories'

export interface ServerProxyProviderOptions {
  baseURL?: string
  endpoint?: string
  apiPath?: string
  headers?: Record<string, string>
  credentials?: RequestCredentials
  model?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface ServerProxyFactoryOptions extends Omit<ServerProxyProviderOptions, 'model'> {
  provider: string
}

function resolveEndpoint(options: ServerProxyProviderOptions): string {
  if (options.endpoint) {
    return options.endpoint
  }

  if (!options.baseURL) {
    throw new Error('[createServerProxyProvider] Either endpoint or baseURL must be provided')
  }

  const baseURL = options.baseURL.replace(/\/+$/, '')
  const apiPath = options.apiPath ?? '/chat/completions'
  const normalizedApiPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`

  return `${baseURL}${normalizedApiPath}`
}

/**
 * Recommended provider for production apps. It targets an OpenAI-compatible
 * proxy/BFF endpoint and does not require browser-side API keys by default.
 *
 * NOTE: If you pass Authorization headers manually, the request becomes
 * browser-direct again and carries the same exposure risk as demo-only helpers.
 */
export function createServerProxyProvider(options: ServerProxyProviderOptions): ResponseProvider {
  const { model = 'gpt-4o-mini', systemPrompt, temperature, maxTokens, headers = {}, credentials } = options
  const endpoint = resolveEndpoint(options)

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

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...headers,
      },
      body: JSON.stringify(body),
      signal: abortSignal,
      credentials,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Server proxy error ${response.status}: ${text}`)
    }

    yield* sseStreamToGenerator(response, { signal: abortSignal })
  }
}

export function createServerProxyFactory(options: ServerProxyFactoryOptions): ModelProviderFactory {
  return {
    match: matchProvider(options.provider),
    createProvider: (model) =>
      createServerProxyProvider({
        ...options,
        model: model.value,
      }),
  }
}
