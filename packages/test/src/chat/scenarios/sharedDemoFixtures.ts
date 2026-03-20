import type { ChatCompletion } from '../../../../kit/src/vue/message/types'
import type { ModelOption, ModelProviderFactory } from '../../../../chat/src/types'
import { createMockFactory, createMockProvider } from '../mockProvider'

export const sharedModels: ModelOption[] = [
  { value: 'openai-test', label: 'OpenAI Test', provider: 'openai' },
  { value: 'deepseek-test', label: 'DeepSeek Test', provider: 'deepseek' },
]

export const sharedProviderFactories: ModelProviderFactory[] = [
  createMockFactory('openai'),
  createMockFactory('deepseek'),
]

export const sharedBrand = {
  title: 'Chat Kit 测试',
}

export const sharedWelcome = {
  title: 'TinyRobot',
  description: '这里用于验证 Chat Kit 的黑盒接入和 E2E 场景。',
}

export const sharedPrompts = [
  { label: '解释 React hooks', description: '解释 React hooks' },
  { label: '生成 Hello World', description: '请帮我写一个 Hello World' },
]

export const sharedAttachmentsFeature = {
  upload: {
    tooltip: '上传附件',
    accept: '.txt,.md',
    multiple: true,
  },
}

export const sharedSenderActionsFeature = {
  voice: {
    enabled: true,
    tooltip: '语音输入',
  },
  wordCount: true,
}

export const edgeAttachmentsFeature = {
  upload: {
    tooltip: '上传附件',
    accept: '.txt',
    multiple: true,
  },
}

export const edgeSenderActionsFeature = {
  upload: {
    enabled: false,
  },
}

export function createEdgeResponseProvider() {
  const edgeBaseProvider = createMockProvider({
    provider: 'edge-provider',
    model: 'edge-model',
  })

  return async function* (body: unknown, signal: AbortSignal): AsyncGenerator<ChatCompletion, void, unknown> {
    const stream = await edgeBaseProvider(body as never, signal)
    yield* stream as AsyncGenerator<ChatCompletion, void, unknown>
  }
}
