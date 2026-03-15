import type { ModelOption, ModelProviderFactory, ResponseProvider } from '@opentiny/tiny-robot-chat'

export const DEMO_RETRY_TRIGGER = '/mock-error'

const triggerState = new Map<string, 'failed-once'>()

function getLastUserMessageContent(requestBody: { messages?: Array<{ role?: string; content?: unknown }> }): string {
  const lastUserMessage = [...(requestBody.messages ?? [])]
    .reverse()
    .find((message) => message.role === 'user' && typeof message.content === 'string')

  return typeof lastUserMessage?.content === 'string' ? lastUserMessage.content.trim() : ''
}

export function wrapDemoRetryProvider(provider: ResponseProvider): ResponseProvider {
  return (requestBody, abortSignal) => {
    const userContent = getLastUserMessageContent(requestBody)

    if (userContent === DEMO_RETRY_TRIGGER) {
      const hasFailedOnce = triggerState.get(userContent) === 'failed-once'
      if (!hasFailedOnce) {
        triggerState.set(userContent, 'failed-once')
        throw new Error('Demo retry trigger: simulated provider failure. Click retry to replay the request.')
      }

      triggerState.delete(userContent)
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
