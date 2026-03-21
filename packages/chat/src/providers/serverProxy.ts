import type { ModelProviderFactory, ResponseProvider } from '../types'
import { matchProvider } from './factories'
import { createOpenAICompatibleSseProvider } from './shared'

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

  return createOpenAICompatibleSseProvider({
    provider: 'server_proxy',
    endpoint,
    model,
    systemPrompt,
    temperature,
    maxTokens,
    headers,
    credentials,
  })
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
