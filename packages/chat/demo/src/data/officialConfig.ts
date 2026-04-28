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
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
const openaiModel = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'

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
      { id: 'qwen-plus', label: 'Qwen Plus', providerId: 'bailian' },
      { id: 'qwen-turbo', label: 'Qwen Turbo', providerId: 'bailian' },
      { id: 'qwen-max', label: 'Qwen Max', providerId: 'bailian' },
      { id: 'qwen-vl-plus', label: 'Qwen VL Plus（视觉）', providerId: 'bailian' },
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
        { id: 'deepseek-chat', label: 'DeepSeek Chat', providerId: 'deepseek' },
        { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner', providerId: 'deepseek' },
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

  if (openaiApiKey) {
    return {
      providers: {
        openai: {
          type: 'openai-compatible',
          baseURL: 'https://api.openai.com/v1',
          apiPath: '/chat/completions',
          systemPrompt: 'You are a helpful assistant.',
          headers: { Authorization: `Bearer ${openaiApiKey}` },
        },
      },
      models: [
        { id: 'gpt-4o-mini', label: 'GPT-4o Mini', providerId: 'openai' },
        { id: 'gpt-4o', label: 'GPT-4o', providerId: 'openai' },
      ],
      defaultModelId: openaiModel,
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
    availabilityNote:
      '请在 .env 中配置 VITE_BAILIAN_API_KEY（百炼）、VITE_DEEPSEEK_API_KEY 或 VITE_OPENAI_API_KEY 以启用真实回复。',
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
