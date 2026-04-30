import type { TrChatConfig } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'

export interface DemoConfigOptions {
  storageKey: string
  welcomeTitle: string
  welcomeDescription?: string
  workspace?: boolean
  initialMessages?: NonNullable<TrChatConfig['conversation']>['initialMessages']
}

/**
 * 文档示例共用配置工厂。
 * 使用固定的 demo endpoint，不依赖环境变量。
 */
export function createDemoConfig(options: DemoConfigOptions): TrChatConfig {
  return {
    request: {
      providers: {
        deepseek: {
          type: 'openai-compatible',
          // 默认使用代理端点。如需直连 DeepSeek，替换为：
          //   baseURL: 'https://api.deepseek.com/v1',
          //   apiPath: '/chat/completions',
          //   headers: { Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY || ''}` },
          endpoint: '/api/chat/completions',
          systemPrompt: 'You are a helpful assistant.',
        },
      },
      models: [
        { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash', providerId: 'deepseek' },
        { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro', providerId: 'deepseek' },
      ],
      defaultModelId: 'deepseek-v4-flash',
    },
    conversation: {
      initialMessages: options.initialMessages,
      persistence: localStorageStrategyFactory({ key: options.storageKey }),
    },
    ui: {
      brand: { title: 'TinyRobot Chat' },
      welcome: {
        title: options.welcomeTitle,
        description: options.welcomeDescription,
      },
    },
    sender: {
      placeholder: '向 TinyRobot 提问…',
      mode: 'multiple',
      wordCount: true,
      voice: {
        enabled: true,
        tooltip: '语音输入',
        autoInsert: false,
      },
    },
    attachments: {
      enabled: true,
      upload: { enabled: true, multiple: true },
      list: { wrap: true },
    },
    history: options.workspace ? { enabled: true, defaultOpen: true } : undefined,
    workspace: options.workspace
      ? {
          enabled: true,
          defaultView: 'workspace',
          left: {
            enabled: true,
            width: 272,
            collapsible: true,
            defaultOpen: true,
            collapseMode: 'rail',
            railLabel: '历史记录',
          },
          right: {
            enabled: true,
            width: 320,
            collapsible: true,
            defaultOpen: false,
            collapseMode: 'hidden',
          },
        }
      : undefined,
    messages: {
      feedback: { enabled: true },
    },
  }
}
