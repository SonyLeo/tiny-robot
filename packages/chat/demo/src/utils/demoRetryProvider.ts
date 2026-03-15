import type { ModelOption, ModelProviderFactory, ResponseProvider } from '@opentiny/tiny-robot-chat'

export const DEMO_RETRY_TRIGGER = '/mock-error'
export const DEMO_OPTIMISTIC_TRIGGER = '/mock-optimistic'
const DEMO_OPTIMISTIC_DELAY = 1200

const triggerState = new Map<string, 'failed-once'>()

function createAbortError(): Error {
  const error = new Error('Demo optimistic trigger aborted before provider execution.')
  error.name = 'AbortError'
  return error
}

async function waitWithAbort(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    throw createAbortError()
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, ms)

    const handleAbort = () => {
      clearTimeout(timeout)
      signal.removeEventListener('abort', handleAbort)
      reject(createAbortError())
    }

    signal.addEventListener('abort', handleAbort, { once: true })
  })
}

function getLastUserMessageContent(requestBody: { messages?: Array<{ role?: string; content?: unknown }> }): string {
  const lastUserMessage = [...(requestBody.messages ?? [])]
    .reverse()
    .find((message) => message.role === 'user' && typeof message.content === 'string')

  return typeof lastUserMessage?.content === 'string' ? lastUserMessage.content.trim() : ''
}

export function wrapDemoRetryProvider(provider: ResponseProvider): ResponseProvider {
  return async (requestBody, abortSignal) => {
    const userContent = getLastUserMessageContent(requestBody)

    if (userContent === DEMO_RETRY_TRIGGER) {
      const hasFailedOnce = triggerState.get(userContent) === 'failed-once'
      if (!hasFailedOnce) {
        triggerState.set(userContent, 'failed-once')
        throw new Error('Demo retry trigger: simulated provider failure. Click retry to replay the request.')
      }

      triggerState.delete(userContent)
    }

    if (userContent === DEMO_OPTIMISTIC_TRIGGER) {
      await waitWithAbort(DEMO_OPTIMISTIC_DELAY, abortSignal)
    }

    return provider(requestBody, abortSignal)
  }
}

export function wrapDemoRetryProviderFactories(providerFactories: ModelProviderFactory[]): ModelProviderFactory[] {
  return providerFactories.map((factory) => ({
    match: factory.match,
    createProvider: (model: ModelOption) => wrapDemoRetryProvider(factory.createProvider(model)),
  }))
}
