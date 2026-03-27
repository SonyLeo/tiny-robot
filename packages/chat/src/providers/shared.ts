import { sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import type { MessageRequestBody } from '@opentiny/tiny-robot-kit'
import type { ResponseProvider } from '../types'

export interface ChatProviderErrorOptions {
  provider?: string
  message: string
  httpStatus?: number
  code?: string
  retryable?: boolean
  cause?: unknown
}

export class ChatProviderError extends Error {
  provider?: string
  httpStatus?: number
  statusCode?: number
  code?: string
  retryable?: boolean
  cause?: unknown

  constructor(options: ChatProviderErrorOptions) {
    super(options.message)
    this.name = 'ChatProviderError'
    this.provider = options.provider
    this.httpStatus = options.httpStatus
    this.statusCode = options.httpStatus
    this.code = options.code
    this.retryable = options.retryable
    if (options.cause !== undefined) {
      this.cause = options.cause
    }
  }
}

export interface OpenAICompatibleSseProviderOptions {
  endpoint: string
  provider: string
  model: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  headers?: Record<string, string>
  credentials?: RequestCredentials
}

function buildOpenAICompatibleRequestBody(
  options: OpenAICompatibleSseProviderOptions,
  requestBody: MessageRequestBody,
) {
  const { messages: requestMessages, ...extraRequestFields } = requestBody
  const messages = options.systemPrompt
    ? [{ role: 'system', content: options.systemPrompt }, ...requestMessages]
    : requestMessages

  const body: Record<string, unknown> = {
    ...extraRequestFields,
    model: options.model,
    messages,
    stream: true,
  }

  if (options.temperature !== undefined) {
    body.temperature = options.temperature
  }

  if (options.maxTokens !== undefined) {
    body.max_tokens = options.maxTokens
  }

  return body
}

async function parseProviderErrorResponse(response: Response) {
  const text = await response.text()
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    try {
      const payload = JSON.parse(text) as
        | {
            error?: {
              message?: string
              code?: string
            }
            message?: string
            code?: string
          }
        | undefined

      return {
        message: payload?.error?.message ?? payload?.message ?? text,
        code: payload?.error?.code ?? payload?.code,
      }
    } catch {
      return {
        message: text,
        code: undefined,
      }
    }
  }

  return {
    message: text,
    code: undefined,
  }
}

function inferRetryable(httpStatus?: number, code?: string) {
  if (httpStatus === 401 || httpStatus === 403 || code === 'invalid_api_key') {
    return false
  }

  if (httpStatus === 429 || code === 'rate_limit_exceeded') {
    return true
  }

  if (httpStatus && httpStatus >= 500) {
    return true
  }

  return true
}

export function createOpenAICompatibleSseProvider(options: OpenAICompatibleSseProviderOptions): ResponseProvider {
  const { endpoint, headers = {}, credentials } = options

  return async function* (requestBody, abortSignal) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...headers,
      },
      body: JSON.stringify(buildOpenAICompatibleRequestBody(options, requestBody)),
      signal: abortSignal,
      credentials,
    })

    if (!response.ok) {
      const parsed = await parseProviderErrorResponse(response)

      throw new ChatProviderError({
        provider: options.provider,
        message: `${options.provider} API error ${response.status}: ${parsed.message}`,
        httpStatus: response.status,
        code: parsed.code,
        retryable: inferRetryable(response.status, parsed.code),
      })
    }

    yield* sseStreamToGenerator(response, { signal: abortSignal })
  }
}
