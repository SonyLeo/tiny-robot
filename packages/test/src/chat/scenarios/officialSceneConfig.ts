import type { ChatContentLayout, TrChatConfig } from '@opentiny/tiny-robot-chat'

type OfficialInitialMessages = NonNullable<NonNullable<TrChatConfig['conversation']>['initialMessages']>
type OfficialWelcomePrompts = NonNullable<NonNullable<NonNullable<TrChatConfig['ui']>['welcome']>['prompts']>
type OfficialAppearanceMode = NonNullable<NonNullable<TrChatConfig['ui']>['appearance']>['mode']
type OfficialModels = TrChatConfig['request']['models']
type OfficialWelcomeIcon = NonNullable<NonNullable<NonNullable<TrChatConfig['ui']>['welcome']>['icon']>

interface OfficialSceneConfigOptions {
  brandTitle: string
  welcomeTitle: string
  welcomeDescription: string
  contentLayout?: ChatContentLayout
  appearanceMode?: OfficialAppearanceMode
  workspace?: boolean
  initialMessages?: OfficialInitialMessages
  welcomePrompts?: OfficialWelcomePrompts
  messages?: TrChatConfig['messages']
  models?: OfficialModels
  defaultModelId?: string | null
  sender?: TrChatConfig['sender']
  attachments?: TrChatConfig['attachments']
  history?: TrChatConfig['history']
  welcomeIcon?: OfficialWelcomeIcon
}

const OFFICIAL_MODELS: TrChatConfig['request']['models'] = [
  {
    id: 'openai-test',
    label: 'OpenAI Test',
    providerId: 'openai',
  },
]

const OFFICIAL_PROMPTS = [
  { label: 'Explain React hooks', description: 'Explain React hooks' },
  { label: 'Write Hello World', description: 'Write Hello World' },
]

export function createOfficialSceneConfig(options: OfficialSceneConfigOptions): TrChatConfig {
  const requestModels = options.models ?? OFFICIAL_MODELS

  return {
    request: {
      models: requestModels,
      defaultModelId: options.defaultModelId ?? requestModels[0]?.id ?? null,
      providers: {
        openai: {
          type: 'openai-compatible',
          endpoint: '/api/openai',
          systemPrompt: 'You are a helpful assistant.',
        },
      },
    },
    conversation: {
      initialMessages: options.initialMessages,
    },
    ui: {
      brand: {
        title: options.brandTitle,
      },
      appearance: options.appearanceMode
        ? {
            mode: options.appearanceMode,
          }
        : undefined,
      welcome: {
        title: options.welcomeTitle,
        description: options.welcomeDescription,
        icon: options.welcomeIcon,
        prompts: options.welcomePrompts ?? OFFICIAL_PROMPTS,
      },
      contentLayout: options.contentLayout ?? 'centered',
    },
    sender: {
      placeholder: 'Ask TinyRobot anything',
      mode: 'multiple',
      maxLength: 120,
      wordCount: true,
      voice: {
        enabled: true,
        tooltip: 'Voice input',
        autoInsert: false,
      },
      ...options.sender,
    },
    attachments: {
      enabled: true,
      upload: {
        enabled: true,
        accept: '.txt,.md',
        multiple: true,
      },
      list: {
        wrap: true,
      },
      ...options.attachments,
    },
    history:
      options.history ??
      (options.workspace
        ? {
            enabled: true,
            defaultOpen: true,
          }
        : {
            enabled: true,
            defaultOpen: false,
          }),
    workspace: options.workspace
      ? {
          enabled: true,
          defaultView: 'workspace',
          left: {
            enabled: true,
            defaultOpen: true,
            collapseMode: 'rail',
            railLabel: 'History',
            width: 'md',
          },
          right: {
            enabled: true,
            defaultOpen: false,
            collapseMode: 'hidden',
            railLabel: 'Notes',
            width: 'lg',
          },
        }
      : undefined,
    messages: {
      feedback: {
        enabled: true,
      },
      ...options.messages,
    },
  }
}
