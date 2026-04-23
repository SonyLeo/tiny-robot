import type { ChatContentLayout, TrChatConfig } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import { BRAND_CONFIG, WELCOME_CONFIG } from '../constants'

type DemoInitialMessages = NonNullable<TrChatConfig['conversation']>['initialMessages']

interface OfficialDemoConfigOptions {
  storageKey: string
  contentLayout: ChatContentLayout
  brandTitle: string
  welcomeTitle: string
  welcomeDescription: string
  workspace?: boolean
  initialMessages?: DemoInitialMessages
}

interface OfficialRequestPreset {
  modelId: string
  modelLabel: string
  providerId: string
  transport: TrChatConfig['request']['transport']
  availabilityNote?: string
}

const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || ''

function resolveOfficialRequestPreset(): OfficialRequestPreset {
  if (deepseekApiKey) {
    return {
      modelId: 'deepseek-chat',
      modelLabel: 'DeepSeek Chat',
      providerId: 'deepseek',
      transport: {
        type: 'openai-compatible',
        baseURL: 'https://api.deepseek.com/v1',
        apiPath: '/chat/completions',
        systemPrompt: 'You are a helpful assistant.',
        headers: {
          Authorization: `Bearer ${deepseekApiKey}`,
        },
      },
    }
  }

  if (openaiApiKey) {
    return {
      modelId: 'gpt-4o-mini',
      modelLabel: 'GPT-4o Mini',
      providerId: 'openai',
      transport: {
        type: 'openai-compatible',
        baseURL: 'https://api.openai.com/v1',
        apiPath: '/chat/completions',
        systemPrompt: 'You are a helpful assistant.',
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
        },
      },
    }
  }

  return {
    modelId: 'demo-model',
    modelLabel: 'Demo Model',
    providerId: 'demo',
    transport: {
      type: 'openai-compatible',
      endpoint: '/api/chat/completions',
      systemPrompt: 'You are a helpful assistant.',
    },
    availabilityNote: 'Set VITE_DEEPSEEK_API_KEY or VITE_OPENAI_API_KEY to enable live replies.',
  }
}

export function createOfficialDemoConfig(options: OfficialDemoConfigOptions): TrChatConfig {
  const requestPreset = resolveOfficialRequestPreset()
  const welcomeDescription = [options.welcomeDescription, requestPreset.availabilityNote].filter(Boolean).join(' ')

  return {
    request: {
      models: [
        {
          id: requestPreset.modelId,
          label: requestPreset.modelLabel,
          providerId: requestPreset.providerId,
        },
      ],
      defaultModelId: requestPreset.modelId,
      transport: requestPreset.transport,
    },
    conversation: {
      initialMessages: options.initialMessages,
      persistence: localStorageStrategyFactory({
        key: options.storageKey,
      }),
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
      contentLayout: options.contentLayout,
    },
    sender: {
      placeholder: 'Ask TinyRobot anything',
      mode: 'multiple',
      wordCount: true,
      voice: {
        enabled: true,
        tooltip: 'Voice input',
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
    history: options.workspace
      ? {
          enabled: true,
          defaultOpen: true,
        }
      : undefined,
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
            railLabel: 'History',
          },
          right: {
            enabled: true,
            width: 320,
            collapsible: true,
            defaultOpen: false,
            collapseMode: 'hidden',
            railLabel: 'Notes',
          },
        }
      : undefined,
    messages: {
      feedback: {
        enabled: true,
      },
    },
  }
}
