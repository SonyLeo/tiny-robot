import type { ChatCompletion } from '../../../../kit/src/vue/message/types'
import type { ChatConfig, ModelOption } from '@opentiny/tiny-robot-chat'
import { createMockProvider } from '../mockProvider'

export const sharedModels: ModelOption[] = [
  { value: 'openai-test', label: 'OpenAI Test', providerId: 'openai' },
  { value: 'deepseek-test', label: 'DeepSeek Test', providerId: 'deepseek' },
]

export const sharedChatModels: NonNullable<ChatConfig['models']> = [
  { id: 'openai-test', label: 'OpenAI Test', providerId: 'openai' },
  { id: 'deepseek-test', label: 'DeepSeek Test', providerId: 'deepseek' },
]

export const sharedBrand = {
  title: 'Chat Kit 测试',
}

export const sharedWelcome = {
  title: 'TinyRobot',
  description: '这里用于验证 Chat Kit 的默认渲染链和 E2E 场景。',
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

export function createMockProviders(providerIds: string[]) {
  return Object.fromEntries(
    providerIds.map((providerId) => [
      providerId,
      {
        type: 'openai-compatible' as const,
        endpoint: `/api/${providerId}`,
      },
    ]),
  )
}

export function createChatSceneConfig(
  overrides: Omit<Partial<ChatConfig>, 'models' | 'providers'> & {
    models?: NonNullable<ChatConfig['models']>
    providers?: NonNullable<ChatConfig['providers']>
  } = {},
): ChatConfig {
  const models = overrides.models ?? sharedChatModels
  const providerIds = [...new Set(models.map((model) => model.providerId))]

  return {
    models,
    providers: overrides.providers ?? createMockProviders(providerIds),
    defaults: {
      model: overrides.defaults?.model ?? models[0]?.id,
      systemPrompt: overrides.defaults?.systemPrompt,
    },
    appearance: overrides.appearance,
    ui: overrides.ui,
    layout: overrides.layout,
    features: overrides.features,
    integrations: overrides.integrations,
  }
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
