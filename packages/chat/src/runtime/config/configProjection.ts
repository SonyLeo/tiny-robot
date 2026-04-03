import type { ModelOption, ResponseProvider, TrChatPresetOverrides } from '@/types'
import { isChatFeatureExplicitlyDisabled, resolveChatFeatures } from './registry'
import type { ChatAdapter, ChatConfig, ChatPresetProps, ChatPresetSlices } from './types'
import { resolveChatMessages } from '@/shared/messages'
import { loadChatConfig } from './configLoader'
import { createOpenAICompatibleResponseProvider } from './openaiCompatibleTransport'
import type { ChatWorkspaceShellConfig } from '@/types/workspace'

const DEFAULT_WORKSPACE_SHELL: ChatWorkspaceShellConfig = {
  variant: 'workspace',
  leftRegion: {
    enabled: true,
    width: 272,
    collapsible: true,
    defaultOpen: true,
    collapseMode: 'rail',
  },
  rightRegion: {
    enabled: true,
    width: 420,
    collapsible: true,
    defaultOpen: false,
    collapseMode: 'hidden',
  },
}

function mergeShellConfig(
  base: ChatWorkspaceShellConfig | undefined,
  patch: ChatWorkspaceShellConfig | undefined,
): ChatWorkspaceShellConfig | undefined {
  if (!base && !patch) {
    return undefined
  }

  const next: ChatWorkspaceShellConfig = {
    ...(base ?? {}),
    ...(patch ?? {}),
  }

  if (base?.leftRegion || patch?.leftRegion) {
    next.leftRegion = {
      ...(base?.leftRegion ?? {}),
      ...(patch?.leftRegion ?? {}),
    }
  }

  if (base?.rightRegion || patch?.rightRegion) {
    next.rightRegion = {
      ...(base?.rightRegion ?? {}),
      ...(patch?.rightRegion ?? {}),
    }
  }

  if (base?.viewState || patch?.viewState) {
    next.viewState = {
      ...(base?.viewState ?? {}),
      ...(patch?.viewState ?? {}),
    }
  }

  return next
}

export function createChatAdapterFromConfig(input: string | ChatConfig | unknown): ChatAdapter {
  const config = loadChatConfig(input)
  const resolvedFeatures = resolveChatFeatures(config.features)

  const models: ModelOption[] = config.models.map((model) => ({
    value: model.id,
    label: model.label,
    providerId: model.providerId,
    disabled: model.disabled,
  }))

  const defaultModel = config.defaults?.model ?? models[0]?.value

  function getModel(modelId?: string): ModelOption | undefined {
    const targetModelId = modelId ?? defaultModel
    return models.find((item) => item.value === targetModelId) ?? models[0]
  }

  function createResponseProvider(modelId?: string): ResponseProvider {
    const model = getModel(modelId)

    if (!model) {
      throw new Error('[createChatAdapterFromConfig] No models available to create response provider')
    }

    const providerId = model.providerId
    if (!providerId) {
      throw new Error(`[createChatAdapterFromConfig] Model "${model.value}" is missing providerId`)
    }

    const providerConfig = config.providers[providerId]
    if (!providerConfig) {
      throw new Error(`[createChatAdapterFromConfig] No provider config matched "${providerId}"`)
    }

    return createOpenAICompatibleResponseProvider({
      providerId,
      model: model.value,
      ...providerConfig,
      systemPrompt: providerConfig.systemPrompt ?? config.defaults?.systemPrompt,
    })
  }

  return {
    config,
    models,
    defaultModel,
    resolvedFeatures,
    getModel,
    createResponseProvider,
  }
}

export function createPresetChatProps(
  adapter: ChatAdapter,
  overrides: Partial<TrChatPresetOverrides> = {},
): ChatPresetProps & Partial<TrChatPresetOverrides> {
  const { shell: overrideShell, mcpManager: overrideMcpManager, ...restOverrides } = overrides
  const mcpAllowed = !isChatFeatureExplicitlyDisabled(adapter.config.features?.mcp)
  const resolvedMcpManager = mcpAllowed ? (overrideMcpManager ?? adapter.config.runtime?.mcpManager) : undefined
  const resolvedShowHistory =
    overrides.showHistory ??
    (adapter.config.features?.history === undefined
      ? true
      : (adapter.resolvedFeatures.presetProps.showHistory ?? false))

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
    defaultModel: adapter.defaultModel,
    appearance: adapter.config.appearance,
    shell: mergeShellConfig(mergeShellConfig(DEFAULT_WORKSPACE_SHELL, adapter.config.shell), overrideShell),
    brand: adapter.config.ui?.brand,
    welcome: adapter.config.ui?.welcome,
    prompts: adapter.config.ui?.prompts,
    messageListVariant:
      adapter.config.layout?.variant ??
      ((adapter.config.shell?.variant ?? DEFAULT_WORKSPACE_SHELL.variant) === 'workspace' ? 'workspace' : undefined),
    contentLayout: adapter.config.layout?.contentLayout,
    roleConfigs: layoutRoleConfigs,
    ...adapter.resolvedFeatures.presetProps,
    showHistory: resolvedShowHistory,
    ...(resolvedMcpManager ? { mcpManager: resolvedMcpManager } : {}),
    ...restOverrides,
  }
}

export function createPresetChatSlices(preset: ChatPresetProps & Partial<TrChatPresetOverrides>): ChatPresetSlices {
  const senderProps = preset.senderProps ?? {}
  const models = preset.models

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
      contentLayout: preset.contentLayout,
      bubbleRenderers: preset.bubbleRenderers,
    },
    appearance: {
      appearance: preset.appearance,
    },
    shell: {
      shell: preset.shell,
    },
    header: {
      title: preset.brand?.title,
      showHistory: preset.showHistory ?? true,
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
      messageActions: preset.messageActions,
      messageActionsMode: preset.messageActionsMode,
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
      enabled: preset.showHistory ?? true,
      props: preset.historyProps,
    },
    modelSelector: {
      enabled: Boolean(models && models.length > 1),
      models,
      defaultModel: preset.defaultModel,
    },
  }
}
