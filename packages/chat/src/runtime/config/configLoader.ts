import type {
  ChatAttachmentsListConfig,
  ChatAttachmentsUploadConfig,
  ChatAppearanceConfig,
  ChatSenderActionsFeaturePreset,
  TrChatPresetOverrides,
  WelcomeConfig,
} from '@/types'
import type { SenderProps, VoiceButtonProps } from '@opentiny/tiny-robot'
import type {
  ChatAttachmentsFeatureConfig,
  ChatFeatureConfigMap,
  ChatFeedbackFeatureConfig,
  ChatHistoryFeatureConfig,
  ChatMcpFeatureConfig,
  ChatSenderActionsFeatureConfig,
  ChatWelcomePromptsFeatureConfig,
} from './featureTypes'
import { isChatFeatureExplicitlyDisabled } from './registry'
import type {
  ChatConfig,
  ChatConfigIntegrations,
  ChatConfigModel,
  ChatConfigProvider,
  ChatConfigUI,
  ChatLayoutConfig,
} from './types'
import type { ChatWorkspaceRegionConfig, ChatWorkspaceShellConfig } from '@/types/workspace'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function assertString(value: unknown, message: string): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(message)
  }
}

function normalizeModel(model: unknown, index: number): ChatConfigModel {
  if (!isRecord(model)) {
    throw new Error(`[loadChatConfig] models[${index}] must be an object`)
  }

  assertString(model.id, `[loadChatConfig] models[${index}].id is required`)
  assertString(model.providerId, `[loadChatConfig] models[${index}].providerId is required`)

  return {
    id: model.id,
    providerId: model.providerId,
    label: typeof model.label === 'string' ? model.label : undefined,
    disabled: typeof model.disabled === 'boolean' ? model.disabled : undefined,
  }
}

function normalizeProvider(providerId: string, provider: unknown): ChatConfigProvider {
  if (!isRecord(provider)) {
    throw new Error(`[loadChatConfig] providers.${providerId} must be an object`)
  }

  const type = provider.type ?? 'openai-compatible'

  if (type !== 'openai-compatible') {
    throw new Error(`[loadChatConfig] providers.${providerId}.type "${type}" is not supported`)
  }

  const normalized: ChatConfigProvider = {
    type: 'openai-compatible',
    baseURL: typeof provider.baseURL === 'string' ? provider.baseURL : undefined,
    endpoint: typeof provider.endpoint === 'string' ? provider.endpoint : undefined,
    apiPath: typeof provider.apiPath === 'string' ? provider.apiPath : undefined,
    systemPrompt: typeof provider.systemPrompt === 'string' ? provider.systemPrompt : undefined,
    temperature: typeof provider.temperature === 'number' ? provider.temperature : undefined,
    maxTokens: typeof provider.maxTokens === 'number' ? provider.maxTokens : undefined,
    headers: isRecord(provider.headers)
      ? (Object.fromEntries(
          Object.entries(provider.headers).filter(([, value]) => typeof value === 'string'),
        ) as Record<string, string>)
      : undefined,
    credentials:
      provider.credentials === 'include' || provider.credentials === 'omit' || provider.credentials === 'same-origin'
        ? provider.credentials
        : undefined,
  }

  if (!normalized.baseURL && !normalized.endpoint) {
    throw new Error(`[loadChatConfig] providers.${providerId} requires baseURL or endpoint`)
  }

  return normalized
}

function normalizeUi(rawUi: unknown): ChatConfigUI | undefined {
  if (!isRecord(rawUi)) {
    return undefined
  }

  const brand = isRecord(rawUi.brand) ? (rawUi.brand as ChatConfigUI['brand']) : undefined
  const prompts = Array.isArray(rawUi.prompts) ? (rawUi.prompts as ChatConfigUI['prompts']) : undefined

  let welcome: WelcomeConfig | undefined
  if (isRecord(rawUi.welcome)) {
    const title = typeof rawUi.welcome.title === 'string' ? rawUi.welcome.title : undefined
    if (!title) {
      throw new Error('[loadChatConfig] ui.welcome.title is required when ui.welcome is provided')
    }

    welcome = {
      title,
      description: typeof rawUi.welcome.description === 'string' ? rawUi.welcome.description : undefined,
      icon: rawUi.welcome.icon as WelcomeConfig['icon'],
    }
  }

  return {
    brand,
    welcome,
    prompts,
  }
}

function normalizeAppearance(rawAppearance: unknown): ChatAppearanceConfig | undefined {
  if (rawAppearance === undefined) {
    return undefined
  }

  if (!isRecord(rawAppearance)) {
    throw new Error('[loadChatConfig] appearance must be an object when provided')
  }

  const mode =
    rawAppearance.mode === 'light' || rawAppearance.mode === 'dark' || rawAppearance.mode === 'system'
      ? rawAppearance.mode
      : undefined

  if (!mode) {
    return undefined
  }

  return {
    mode,
  }
}

function normalizeLayout(rawLayout: unknown): ChatLayoutConfig | undefined {
  if (!isRecord(rawLayout)) {
    return undefined
  }

  const variant =
    rawLayout.variant === 'bubble' || rawLayout.variant === 'docs' || rawLayout.variant === 'workspace'
      ? rawLayout.variant
      : undefined
  const placements = isRecord(rawLayout.placements)
    ? ({
        ...(rawLayout.placements.assistant === 'start' || rawLayout.placements.assistant === 'end'
          ? { assistant: rawLayout.placements.assistant }
          : {}),
        ...(rawLayout.placements.user === 'start' || rawLayout.placements.user === 'end'
          ? { user: rawLayout.placements.user }
          : {}),
      } satisfies NonNullable<ChatLayoutConfig['placements']>)
    : undefined
  const contentLayout =
    rawLayout.contentLayout === 'centered' || rawLayout.contentLayout === 'wide' ? rawLayout.contentLayout : undefined

  if (!variant && !placements?.assistant && !placements?.user && !contentLayout) {
    return undefined
  }

  return {
    variant,
    placements,
    contentLayout,
  }
}

function normalizeShellRegion(rawRegion: unknown): ChatWorkspaceRegionConfig | undefined {
  if (!isRecord(rawRegion)) {
    return undefined
  }

  const region: ChatWorkspaceRegionConfig = {
    enabled: typeof rawRegion.enabled === 'boolean' ? rawRegion.enabled : undefined,
    collapsible: typeof rawRegion.collapsible === 'boolean' ? rawRegion.collapsible : undefined,
    defaultOpen: typeof rawRegion.defaultOpen === 'boolean' ? rawRegion.defaultOpen : undefined,
    collapseMode:
      rawRegion.collapseMode === 'rail' || rawRegion.collapseMode === 'hidden' ? rawRegion.collapseMode : undefined,
    width:
      rawRegion.width === 'sm' ||
      rawRegion.width === 'md' ||
      rawRegion.width === 'lg' ||
      typeof rawRegion.width === 'number'
        ? rawRegion.width
        : undefined,
    railLabel: typeof rawRegion.railLabel === 'string' ? rawRegion.railLabel : undefined,
  }

  if (Object.values(region).every((value) => value === undefined)) {
    return undefined
  }

  return region
}

function normalizeShell(rawShell: unknown): ChatWorkspaceShellConfig | undefined {
  if (!isRecord(rawShell)) {
    return undefined
  }

  const shell: ChatWorkspaceShellConfig = {
    variant: rawShell.variant === 'stacked' || rawShell.variant === 'workspace' ? rawShell.variant : undefined,
    leftRegion: normalizeShellRegion(rawShell.leftRegion),
    rightRegion: normalizeShellRegion(rawShell.rightRegion),
    viewState: isRecord(rawShell.viewState)
      ? {
          fullWidth: typeof rawShell.viewState.fullWidth === 'boolean' ? rawShell.viewState.fullWidth : undefined,
        }
      : undefined,
  }

  if (shell.viewState && Object.values(shell.viewState).every((value) => value === undefined)) {
    shell.viewState = undefined
  }

  if (!shell.variant && !shell.leftRegion && !shell.rightRegion && !shell.viewState) {
    return undefined
  }

  return shell
}

function normalizeFeedbackFeature(rawFeature: unknown): ChatFeedbackFeatureConfig | undefined {
  if (rawFeature === undefined) {
    return undefined
  }

  if (typeof rawFeature === 'boolean') {
    return rawFeature
  }

  if (!isRecord(rawFeature)) {
    throw new Error('[loadChatConfig] features.feedback must be a boolean or an object')
  }

  return {
    enabled: typeof rawFeature.enabled === 'boolean' ? rawFeature.enabled : undefined,
  }
}

function normalizeHistoryFeature(rawFeature: unknown): ChatHistoryFeatureConfig | undefined {
  if (rawFeature === undefined) {
    return undefined
  }

  if (typeof rawFeature === 'boolean') {
    return rawFeature
  }

  if (!isRecord(rawFeature)) {
    throw new Error('[loadChatConfig] features.history must be a boolean or an object')
  }

  const props = rawFeature.props
  if (props !== undefined && !isRecord(props)) {
    throw new Error('[loadChatConfig] features.history.props must be an object when provided')
  }

  return {
    enabled: typeof rawFeature.enabled === 'boolean' ? rawFeature.enabled : undefined,
    props: props as TrChatPresetOverrides['historyProps'],
  }
}

function normalizeAttachmentsFeature(rawFeature: unknown): ChatAttachmentsFeatureConfig | undefined {
  if (rawFeature === undefined) {
    return undefined
  }

  if (typeof rawFeature === 'boolean') {
    return rawFeature
  }

  if (!isRecord(rawFeature)) {
    throw new Error('[loadChatConfig] features.attachments must be a boolean or an object')
  }

  const upload = isRecord(rawFeature.upload)
    ? ({
        enabled: typeof rawFeature.upload.enabled === 'boolean' ? rawFeature.upload.enabled : undefined,
        accept: typeof rawFeature.upload.accept === 'string' ? rawFeature.upload.accept : undefined,
        multiple: typeof rawFeature.upload.multiple === 'boolean' ? rawFeature.upload.multiple : undefined,
        maxCount: typeof rawFeature.upload.maxCount === 'number' ? rawFeature.upload.maxCount : undefined,
        maxSize: typeof rawFeature.upload.maxSize === 'number' ? rawFeature.upload.maxSize : undefined,
        tooltip: typeof rawFeature.upload.tooltip === 'string' ? rawFeature.upload.tooltip : undefined,
        tooltipPlacement:
          typeof rawFeature.upload.tooltipPlacement === 'string'
            ? (rawFeature.upload.tooltipPlacement as ChatAttachmentsUploadConfig['tooltipPlacement'])
            : undefined,
      } satisfies ChatAttachmentsUploadConfig)
    : undefined

  const list = isRecord(rawFeature.list)
    ? ({
        variant:
          rawFeature.list.variant === 'auto' ||
          rawFeature.list.variant === 'card' ||
          rawFeature.list.variant === 'picture'
            ? rawFeature.list.variant
            : undefined,
        wrap: typeof rawFeature.list.wrap === 'boolean' ? rawFeature.list.wrap : undefined,
        actions: Array.isArray(rawFeature.list.actions)
          ? (rawFeature.list.actions as ChatAttachmentsListConfig['actions'])
          : undefined,
        fileIcons: isRecord(rawFeature.list.fileIcons)
          ? (rawFeature.list.fileIcons as ChatAttachmentsListConfig['fileIcons'])
          : undefined,
        fileMatchers: Array.isArray(rawFeature.list.fileMatchers)
          ? (rawFeature.list.fileMatchers as ChatAttachmentsListConfig['fileMatchers'])
          : undefined,
        disabled: typeof rawFeature.list.disabled === 'boolean' ? rawFeature.list.disabled : undefined,
      } satisfies ChatAttachmentsListConfig)
    : undefined

  return {
    enabled: typeof rawFeature.enabled === 'boolean' ? rawFeature.enabled : undefined,
    upload,
    list,
  }
}

function normalizeSenderActionsFeature(rawFeature: unknown): ChatSenderActionsFeatureConfig | undefined {
  if (rawFeature === undefined) {
    return undefined
  }

  if (typeof rawFeature === 'boolean') {
    return rawFeature
  }

  if (!isRecord(rawFeature)) {
    throw new Error('[loadChatConfig] features.senderActions must be a boolean or an object')
  }

  const upload = isRecord(rawFeature.upload)
    ? {
        enabled: typeof rawFeature.upload.enabled === 'boolean' ? rawFeature.upload.enabled : undefined,
        accept: typeof rawFeature.upload.accept === 'string' ? rawFeature.upload.accept : undefined,
        multiple: typeof rawFeature.upload.multiple === 'boolean' ? rawFeature.upload.multiple : undefined,
        maxCount: typeof rawFeature.upload.maxCount === 'number' ? rawFeature.upload.maxCount : undefined,
        maxSize: typeof rawFeature.upload.maxSize === 'number' ? rawFeature.upload.maxSize : undefined,
        tooltip: typeof rawFeature.upload.tooltip === 'string' ? rawFeature.upload.tooltip : undefined,
        tooltipPlacement:
          typeof rawFeature.upload.tooltipPlacement === 'string'
            ? (rawFeature.upload.tooltipPlacement as ChatAttachmentsUploadConfig['tooltipPlacement'])
            : undefined,
      }
    : undefined

  const voice = isRecord(rawFeature.voice)
    ? ({
        enabled: typeof rawFeature.voice.enabled === 'boolean' ? rawFeature.voice.enabled : undefined,
        tooltip: typeof rawFeature.voice.tooltip === 'string' ? rawFeature.voice.tooltip : undefined,
        tooltipPlacement:
          typeof rawFeature.voice.tooltipPlacement === 'string'
            ? (rawFeature.voice.tooltipPlacement as NonNullable<
                NonNullable<ChatSenderActionsFeaturePreset['voice']>['tooltipPlacement']
              >)
            : undefined,
        size:
          rawFeature.voice.size === 'small' || rawFeature.voice.size === 'normal' ? rawFeature.voice.size : undefined,
        speechConfig: isRecord(rawFeature.voice.speechConfig)
          ? (rawFeature.voice.speechConfig as NonNullable<
              NonNullable<ChatSenderActionsFeaturePreset['voice']>['speechConfig']
            >)
          : undefined,
        autoInsert: typeof rawFeature.voice.autoInsert === 'boolean' ? rawFeature.voice.autoInsert : undefined,
        onButtonClick:
          typeof rawFeature.voice.onButtonClick === 'function'
            ? (rawFeature.voice.onButtonClick as VoiceButtonProps['onButtonClick'])
            : undefined,
        icon: rawFeature.voice.icon as NonNullable<ChatSenderActionsFeaturePreset['voice']>['icon'],
        recordingIcon: rawFeature.voice.recordingIcon as NonNullable<
          ChatSenderActionsFeaturePreset['voice']
        >['recordingIcon'],
      } satisfies NonNullable<ChatSenderActionsFeaturePreset['voice']>)
    : undefined

  return {
    enabled: typeof rawFeature.enabled === 'boolean' ? rawFeature.enabled : undefined,
    upload,
    voice,
    wordCount: typeof rawFeature.wordCount === 'boolean' ? rawFeature.wordCount : undefined,
    defaultActions: isRecord(rawFeature.defaultActions)
      ? (rawFeature.defaultActions as SenderProps['defaultActions'])
      : undefined,
  }
}

function normalizeWelcomePromptsFeature(rawFeature: unknown): ChatWelcomePromptsFeatureConfig | undefined {
  if (rawFeature === undefined) {
    return undefined
  }

  if (typeof rawFeature === 'boolean') {
    return rawFeature
  }

  if (!isRecord(rawFeature)) {
    throw new Error('[loadChatConfig] features.welcomePrompts must be a boolean or an object')
  }

  const welcome = Array.isArray(rawFeature.welcome) ? (rawFeature.welcome as ChatConfigUI['prompts']) : undefined

  return {
    enabled: typeof rawFeature.enabled === 'boolean' ? rawFeature.enabled : undefined,
    welcome,
  }
}

function normalizeMcpFeature(rawFeature: unknown): ChatMcpFeatureConfig | undefined {
  if (rawFeature === undefined) {
    return undefined
  }

  if (typeof rawFeature === 'boolean') {
    return rawFeature
  }

  if (!isRecord(rawFeature)) {
    throw new Error('[loadChatConfig] features.mcp must be a boolean or an object')
  }

  return {
    enabled: typeof rawFeature.enabled === 'boolean' ? rawFeature.enabled : undefined,
  }
}

function normalizeIntegrations(rawIntegrations: unknown, rawFeatures: unknown): ChatConfigIntegrations | undefined {
  if (rawIntegrations !== undefined && !isRecord(rawIntegrations)) {
    throw new Error('[loadChatConfig] integrations must be an object when provided')
  }

  const integrationsRecord = isRecord(rawIntegrations) ? rawIntegrations : undefined
  const rawMcpFeature = isRecord(rawFeatures) ? rawFeatures.mcp : undefined

  if (isChatFeatureExplicitlyDisabled(rawMcpFeature as ChatMcpFeatureConfig | undefined)) {
    return undefined
  }

  const mcpManager =
    (integrationsRecord?.mcpManager as TrChatPresetOverrides['mcpManager'] | undefined) ??
    (isRecord(rawMcpFeature) ? (rawMcpFeature.manager as TrChatPresetOverrides['mcpManager'] | undefined) : undefined)

  if (!mcpManager) {
    return undefined
  }

  return {
    mcpManager,
  }
}

function normalizeFeatures(rawFeatures: unknown): ChatFeatureConfigMap | undefined {
  if (rawFeatures === undefined) {
    return undefined
  }

  if (!isRecord(rawFeatures)) {
    throw new Error('[loadChatConfig] features must be an object when provided')
  }

  const rawWelcomePrompts = rawFeatures.welcomePrompts ?? rawFeatures.suggestions

  const normalized: ChatFeatureConfigMap = {
    attachments: normalizeAttachmentsFeature(rawFeatures.attachments),
    senderActions: normalizeSenderActionsFeature(rawFeatures.senderActions),
    welcomePrompts: normalizeWelcomePromptsFeature(rawWelcomePrompts),
    mcp: normalizeMcpFeature(rawFeatures.mcp),
    history: normalizeHistoryFeature(rawFeatures.history),
    feedback: normalizeFeedbackFeature(rawFeatures.feedback),
  }

  if (Object.values(normalized).every((value) => value === undefined)) {
    return undefined
  }

  return normalized
}

export function loadChatConfig(input: string | ChatConfig | unknown): ChatConfig {
  const raw = typeof input === 'string' ? JSON.parse(input) : input

  if (!isRecord(raw)) {
    throw new Error('[loadChatConfig] config must be an object')
  }

  if (!Array.isArray(raw.models) || raw.models.length === 0) {
    throw new Error('[loadChatConfig] models must be a non-empty array')
  }

  if (!isRecord(raw.providers) || Object.keys(raw.providers).length === 0) {
    throw new Error('[loadChatConfig] providers must be a non-empty object')
  }

  const models = raw.models.map(normalizeModel)
  const providers = Object.fromEntries(
    Object.entries(raw.providers).map(([id, provider]) => [id, normalizeProvider(id, provider)]),
  )

  for (const model of models) {
    if (!providers[model.providerId]) {
      throw new Error(`[loadChatConfig] model "${model.id}" references missing provider "${model.providerId}"`)
    }
  }

  const defaults = isRecord(raw.defaults)
    ? {
        model: typeof raw.defaults.model === 'string' ? raw.defaults.model : undefined,
        systemPrompt: typeof raw.defaults.systemPrompt === 'string' ? raw.defaults.systemPrompt : undefined,
      }
    : undefined

  if (defaults?.model && !models.some((model) => model.id === defaults.model)) {
    throw new Error(`[loadChatConfig] defaults.model "${defaults.model}" is not declared in models`)
  }

  const appearance = normalizeAppearance(raw.appearance)
  const shell = normalizeShell(raw.shell)
  const ui = normalizeUi(raw.ui)
  const layout = normalizeLayout(raw.layout)
  const features = normalizeFeatures(raw.features)
  const integrations = normalizeIntegrations(raw.integrations, raw.features)

  return {
    models,
    providers,
    defaults,
    appearance,
    shell,
    ui,
    layout,
    features,
    integrations,
  }
}
