import type { PromptProps } from '@opentiny/tiny-robot'
import type { ChatConfig, ResponseProvider } from '@opentiny/tiny-robot-chat'

export const DEMO_PROVIDER_ENDPOINT_PLACEHOLDER = '/__tiny_robot_docs_mock__'

const defaultPrompts: PromptProps[] = [
  { label: '快速上手', description: '如何接入 TrChat？' },
  { label: '模型切换', description: '演示一下当前页面的模型切换能力。' },
]

function mergeRecord<T extends Record<string, unknown> | undefined>(base: T, patch: T): T {
  if (!base && !patch) {
    return undefined as T
  }

  return {
    ...(base ?? {}),
    ...(patch ?? {}),
  } as T
}

export function createDemoChatConfig(overrides: Partial<ChatConfig> = {}): ChatConfig {
  const baseConfig: ChatConfig = {
    models: [{ id: 'mock-model', providerId: 'mock', label: 'Mock Model' }],
    providers: {
      mock: {
        type: 'openai-compatible',
        // TrChat 的 config 校验要求 provider 至少提供 endpoint/baseURL。
        // 文档 demo 统一走本地 mock responseProvider，这里只是占位，不会发起真实请求。
        endpoint: DEMO_PROVIDER_ENDPOINT_PLACEHOLDER,
      },
    },
    defaults: {
      model: 'mock-model',
    },
    ui: {
      brand: {
        title: 'TinyRobot Chat',
      },
      welcome: {
        title: '欢迎使用 Chat 套件',
        description: '文档示例统一使用本地 mock 数据驱动，不会直接请求真实 API。',
      },
      prompts: defaultPrompts,
    },
    layout: {
      contentLayout: 'centered',
    },
  }

  const mergedUi = {
    ...(baseConfig.ui ?? {}),
    ...(overrides.ui ?? {}),
    brand: overrides.ui?.brand ? { ...(baseConfig.ui?.brand ?? {}), ...overrides.ui.brand } : baseConfig.ui?.brand,
    welcome: overrides.ui?.welcome
      ? { ...(baseConfig.ui?.welcome ?? {}), ...overrides.ui.welcome }
      : baseConfig.ui?.welcome,
    prompts: overrides.ui?.prompts ?? baseConfig.ui?.prompts,
  }

  return {
    ...baseConfig,
    ...overrides,
    providers: {
      ...baseConfig.providers,
      ...(overrides.providers ?? {}),
    },
    defaults: {
      ...(baseConfig.defaults ?? {}),
      ...(overrides.defaults ?? {}),
    },
    appearance: mergeRecord(baseConfig.appearance, overrides.appearance),
    shell: mergeRecord(baseConfig.shell, overrides.shell),
    ui: mergedUi,
    layout: mergeRecord(baseConfig.layout, overrides.layout),
    features: mergeRecord(baseConfig.features, overrides.features),
    runtime: mergeRecord(baseConfig.runtime, overrides.runtime),
  }
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export function createMockResponseProvider(prefix = '文档示例'): ResponseProvider {
  return async function* (requestBody) {
    const lastMessage = requestBody.messages[requestBody.messages.length - 1]
    const text = `${prefix}：已收到 "${lastMessage?.content ?? ''}"，下面继续返回一段流式响应。`

    for (let index = 0; index < text.length; index += 1) {
      await wait(24)
      yield {
        id: `mock_${Date.now()}_${index}`,
        object: 'chat.completion.chunk',
        created: Date.now(),
        model: 'mock-model',
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            delta: {
              content: text[index],
            },
            message: undefined,
            logprobs: null,
            finish_reason: index === text.length - 1 ? 'stop' : null,
          },
        ],
      }
    }
  }
}

export const seededMessages = [
  {
    role: 'assistant',
    content: '你好，我是文档里的演示助手，已经为你准备好一组初始消息。',
  },
  {
    role: 'user',
    content: '请展示一下当前页面的定制效果。',
  },
  {
    role: 'assistant',
    content: '没问题，我们会直接把对应的 UI 差异渲染出来。',
  },
]

export const layoutShowcaseMessages = [
  {
    role: 'assistant',
    content:
      '这是一段专门用来观察 contentLayout 的演示消息。centered 会把欢迎区、消息区和底部输入区收束在一个最大宽度内，wide 则会尽量铺满整个可用容器。',
  },
  {
    role: 'user',
    content: '请直接展示 centered 和 wide 在当前文档预览里的差别。',
  },
  {
    role: 'assistant',
    content:
      '在真实组件默认值里，centered 的上限是 1000px。为了让文档里的预览窗口也能一眼看出差异，这个示例会把演示阈值临时压到 560px；切到 wide 后，消息列和输入区会明显向两侧展开。',
  },
]
