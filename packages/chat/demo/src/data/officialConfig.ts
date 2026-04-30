import type { TrChatConfig, TrChatTransportConfig } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import { BRAND_CONFIG, WELCOME_CONFIG } from '../constants'

type DemoInitialMessages = NonNullable<TrChatConfig['conversation']>['initialMessages']

export interface OfficialDemoConfigOptions {
  storageKey: string
  brandTitle: string
  welcomeTitle: string
  welcomeDescription: string
  workspace?: boolean
  initialMessages?: DemoInitialMessages
}

interface RequestPreset {
  providers: Record<string, TrChatTransportConfig>
  models: TrChatConfig['request']['models']
  defaultModelId: string
  availabilityNote?: string
}

const bailianApiKey = import.meta.env.VITE_BAILIAN_API_KEY || ''
const bailianModel = import.meta.env.VITE_BAILIAN_MODEL || 'qwen-plus'
const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const deepseekModel = import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat'

function resolveRequestPreset(): RequestPreset {
  if (bailianApiKey) {
    const providers: Record<string, TrChatTransportConfig> = {
      bailian: {
        type: 'openai-compatible',
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        apiPath: '/chat/completions',
        systemPrompt: 'You are a helpful assistant.',
        headers: { Authorization: `Bearer ${bailianApiKey}` },
      },
    }

    const models: RequestPreset['models'] = [
      { id: 'qwen3.6-plus', label: 'Qwen Plus(全模态)', providerId: 'bailian' },
      { id: 'qwen-vl-plus', label: 'Qwen VL Plus（视觉）', providerId: 'bailian' },
      { id: 'qwen3.5-omni-plus', label: 'Qwen Omini Plus(全模态)', providerId: 'bailian' },
    ]

    if (deepseekApiKey) {
      providers.deepseek = {
        type: 'openai-compatible',
        baseURL: 'https://api.deepseek.com/v1',
        apiPath: '/chat/completions',
        systemPrompt: 'You are a helpful assistant.',
        headers: { Authorization: `Bearer ${deepseekApiKey}` },
      }
      models.push(
        { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash', providerId: 'deepseek' },
        { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro', providerId: 'deepseek' },
      )
    }

    return { providers, models, defaultModelId: bailianModel }
  }

  if (deepseekApiKey) {
    return {
      providers: {
        deepseek: {
          type: 'openai-compatible',
          baseURL: 'https://api.deepseek.com/v1',
          apiPath: '/chat/completions',
          systemPrompt: 'You are a helpful assistant.',
          headers: { Authorization: `Bearer ${deepseekApiKey}` },
        },
      },
      models: [
        { id: 'deepseek-chat', label: 'DeepSeek Chat', providerId: 'deepseek' },
        { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner', providerId: 'deepseek' },
      ],
      defaultModelId: deepseekModel,
    }
  }

  return {
    providers: {
      demo: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
        systemPrompt: 'You are a helpful assistant.',
      },
    },
    models: [{ id: 'demo-model', label: 'Demo Model', providerId: 'demo' }],
    defaultModelId: 'demo-model',
    availabilityNote: '请在 .env 中配置 VITE_BAILIAN_API_KEY（百炼）或 VITE_DEEPSEEK_API_KEY 以启用真实回复。',
  }
}

export function createOfficialDemoConfig(options: OfficialDemoConfigOptions): TrChatConfig {
  const preset = resolveRequestPreset()
  const welcomeDescription = [options.welcomeDescription, preset.availabilityNote].filter(Boolean).join(' ')

  return {
    request: {
      providers: preset.providers,
      models: preset.models,
      defaultModelId: preset.defaultModelId,
    },
    conversation: {
      initialMessages: options.initialMessages,
      persistence: localStorageStrategyFactory({ key: options.storageKey }),
    },
    ui: {
      brand: {
        ...BRAND_CONFIG,
        title: options.brandTitle,
      },
      welcome: {
        ...WELCOME_CONFIG,
        title: options.welcomeTitle,
        description: welcomeDescription,
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
      upload: {
        enabled: true,
        multiple: true,
      },
      list: {
        wrap: true,
      },
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
            railLabel: '备注',
          },
        }
      : undefined,
    messages: {
      feedback: { enabled: true },
    },
  }
}
