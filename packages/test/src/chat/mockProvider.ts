import type { ResponseProvider } from '../../../chat/src/types'
import type { ChatCompletion } from '../../../kit/src/vue/message/types'

/**
 * Mock Provider：模拟流式输出，无需 API Key
 * 供 E2E 测试 demo 页面使用
 */
export function createMockProvider(): ResponseProvider {
  return async function* (_requestBody, abortSignal) {
    const userMsg = _requestBody.messages?.slice(-1)[0]?.content ?? ''
    const text = `收到消息：「${userMsg}」\n\n这是 Mock Provider 的自动回复，用于测试流式输出和状态流转。\n- 消息发送 ✅\n- 流式输出 ✅\n- 中断功能 ✅`

    // 模拟请求延迟（300ms），确保 submitted 态能被观测
    await new Promise((r) => setTimeout(r, 300))

      let isFirst = true

      // 逐字流式输出
      for (const char of text) {
        if (abortSignal.aborted) return
        await new Promise((r) => setTimeout(r, 25))

        yield {
          id: 'mock-' + Date.now(),
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: 'mock-model',
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

    // 最终 chunk
    yield {
      id: 'mock-final',
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: 'mock-model',
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

/**
 * ErrorProvider：模拟请求失败
 */
export function createErrorProvider(): ResponseProvider {
  return async function* () {
    throw new Error('Mock API Error: 模拟请求失败')
  }
}
