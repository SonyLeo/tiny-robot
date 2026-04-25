import type { ChatTransportAdapter } from '@opentiny/tiny-robot-chat'
import type { ChatCompletion } from '../../../kit/src/vue/message/types'

export interface MockProviderOptions {
  provider?: string
  model?: string
}

export function createMockProvider(options: MockProviderOptions = {}): ChatTransportAdapter {
  const provider = options.provider ?? 'mock-provider'
  const model = options.model ?? 'mock-model'
  const failureCount = new Map<string, number>()

  return async function* (requestBody, abortSignal) {
    const userMsg = requestBody.messages?.slice(-1)[0]?.content ?? ''
    if (userMsg === 'err') {
      const currentFailureCount = failureCount.get(userMsg) ?? 0
      failureCount.set(userMsg, currentFailureCount + 1)

      if (currentFailureCount === 0) {
        throw new Error('Mock API Error: provider execution failed')
      }
    }

    const text = `[${provider}:${model}] ${userMsg}\n` + 'This is a streamed reply from the mock provider.'

    await new Promise((resolve) => setTimeout(resolve, 300))

    let isFirst = true

    for (const char of text) {
      if (abortSignal.aborted) {
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 25))

      yield {
        id: 'mock-' + Date.now(),
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model,
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: undefined,
            delta: {
              role: isFirst ? 'assistant' : undefined,
              content: char,
            },
            logprobs: null,
            finish_reason: null,
          },
        ],
      } as ChatCompletion

      isFirst = false
    }

    yield {
      id: 'mock-final',
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model,
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          message: undefined,
          delta: {},
          logprobs: null,
          finish_reason: 'stop',
        },
      ],
    } as ChatCompletion
  }
}

export function createErrorProvider(): ChatTransportAdapter {
  return async function* () {
    throw new Error('Mock API Error: provider execution failed')
  }
}
