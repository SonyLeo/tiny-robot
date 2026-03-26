import type { ModelOption, ResponseProvider, TrChatPresetOverrides } from '../types'
import { createServerProxyFactory } from '../providers/serverProxy'
import { resolveChatFeatures } from '../features'
import type { ChatAdapter, ChatConfig, ChatPresetProps, ChatPresetSlices } from './types'
import { resolveChatMessages } from '../messages'
import { loadChatConfig } from './configLoader'

export function createChatAdapterFromConfig(input: string | ChatConfig | unknown): ChatAdapter {
  const config = loadChatConfig(input)
  const resolvedFeatures = resolveChatFeatures(config.features)

  const models: ModelOption[] = config.models.map((model) => ({
    value: model.id,
    label: model.label,
    provider: model.provider,
    disabled: model.disabled,
  }))

  const providerFactories = Object.entries(config.providers).map(([providerId, providerConfig]) =>
    createServerProxyFactory({
      provider: providerId,
      ...providerConfig,
      systemPrompt: providerConfig.systemPrompt ?? config.defaults?.systemPrompt,
    }),
  )

  const defaultModel = config.defaults?.model ?? models[0]?.value

  function createResponseProvider(modelId?: string): ResponseProvider {
    const targetModelId = modelId ?? defaultModel
    const model = models.find((item) => item.value === targetModelId) ?? models[0]

    if (!model) {
      throw new Error('[createChatAdapterFromConfig] No models available to create response provider')
    }

    const factory = providerFactories.find((item) => item.match(model))
    if (!factory) {
      throw new Error(`[createChatAdapterFromConfig] No provider factory matched model "${model.value}"`)
    }

    return factory.createProvider(model)
  }

  return {
    config,
    models,
    providerFactories,
    defaultModel,
    resolvedFeatures,
    createResponseProvider,
  }
}

export function createPresetChatProps(
  adapter: ChatAdapter,
  overrides: Partial<TrChatPresetOverrides> = {},
): ChatPresetProps & Partial<TrChatPresetOverrides> {
  const layoutRoleConfigs = adapter.config.layout?.placements
    ? ({
        ...(adapter.config.layout.placements.assistant
          ? {
              assistant: {
                placement: adapter.config.layout.placements.assistant,
              },
            }
          : {}),
        ...(adapter.config.layout.placements.user
          ? {
              user: {
                placement: adapter.config.layout.placements.user,
              },
            }
          : {}),
      } satisfies NonNullable<TrChatPresetOverrides['roleConfigs']>)
    : undefined

  return {
    models: adapter.models,
    providerFactories: adapter.providerFactories,
    defaultModel: adapter.defaultModel,
    appearance: adapter.config.appearance,
    brand: adapter.config.ui?.brand,
    welcome: adapter.config.ui?.welcome,
    prompts: adapter.config.ui?.prompts,
    messageListVariant: adapter.config.layout?.variant,
    roleConfigs: layoutRoleConfigs,
    ...adapter.resolvedFeatures.presetProps,
    ...(adapter.config.runtime?.mcpManager ? { mcpManager: adapter.config.runtime.mcpManager } : {}),
    ...overrides,
  }
}

export function createPresetChatSlices(preset: ChatPresetProps & Partial<TrChatPresetOverrides>): ChatPresetSlices {
  const senderProps = preset.senderProps ?? {}
  const models = preset.models
  const providerFactories = preset.providerFactories

  return {
    root: {
      mcpManager: preset.mcpManager,
      attachmentsManager: preset.attachmentsManager,
      attachmentsFeature: preset.attachmentsFeature,
      senderActionsFeature: preset.senderActionsFeature,
      messages: preset.messages,
    },
    layout: {
      show: preset.show,
      roleConfigs: preset.roleConfigs,
    },
    appearance: {
      appearance: preset.appearance,
    },
    header: {
      title: preset.brand?.title,
      showHistory: preset.showHistory ?? false,
      showClose: preset.show !== undefined,
    },
    welcome: preset.welcome
      ? {
          title: preset.welcome.title,
          description: preset.welcome.description,
          icon: preset.welcome.icon ?? preset.brand?.logo,
          prompts: preset.prompts,
        }
      : undefined,
    messageList: {
      autoScroll: preset.autoScroll ?? true,
      variant: preset.messageListVariant,
      onActionClick: preset.onMessageAction,
      groupStrategy: preset.groupStrategy,
      showFeedback: preset.showFeedback ?? false,
      ...(preset.bubbleListProps ?? {}),
    },
    sender: {
      placeholder: preset.placeholder ?? resolveChatMessages(preset.messages).sender.placeholder,
      mode: preset.senderMode ?? 'multiple',
      maxLength: preset.maxLength,
      ...senderProps,
    },
    history: {
      enabled: preset.showHistory ?? false,
      props: preset.historyProps,
    },
    modelSelector: {
      enabled: Boolean(models?.length && providerFactories?.length),
      models,
      providerFactories,
      defaultModel: preset.defaultModel,
    },
  }
}
