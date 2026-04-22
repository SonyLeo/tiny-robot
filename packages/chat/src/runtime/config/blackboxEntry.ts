import type { ChatConfig, ChatConfigModel, ChatConfigProvider } from './types'
import type { ChatScaffoldCallbacks, TrChatConfig, TrChatProps, TrChatTransportConfig } from '@/types'
import { loadChatConfig } from './configLoader'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseSerializedConfig(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value
  }

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

const LEGACY_REQUEST_KEYS = new Set(['models', 'providers', 'defaults'])
const LEGACY_DISPLAY_KEYS = new Set([...LEGACY_REQUEST_KEYS, 'appearance', 'ui'])
const LEGACY_UI_DISPLAY_KEYS = new Set(['brand', 'welcome'])
const LEGACY_CONTENT_LAYOUT_KEYS = new Set([...LEGACY_DISPLAY_KEYS, 'layout'])
const LEGACY_LAYOUT_CONTENT_KEYS = new Set(['contentLayout'])
const LEGACY_SHELL_KEYS = new Set([...LEGACY_CONTENT_LAYOUT_KEYS, 'shell'])
const LEGACY_SHELL_CONFIG_KEYS = new Set(['variant', 'leftRegion', 'rightRegion'])
const LEGACY_SHELL_REGION_KEYS = new Set([
  'enabled',
  'collapsible',
  'defaultOpen',
  'collapseMode',
  'width',
  'railLabel',
])
const LEGACY_SHELL_FALLBACK_CONFIG_KEYS = new Set([...LEGACY_SHELL_CONFIG_KEYS, 'viewState'])
const LEGACY_SHELL_VIEW_STATE_KEYS = new Set(['fullWidth'])

function isPureLegacyRequestSubset(rawValue: Record<string, unknown>): boolean {
  return Object.keys(rawValue).every((key) => LEGACY_REQUEST_KEYS.has(key))
}

function isPureLegacyDisplaySubset(rawValue: Record<string, unknown>): boolean {
  if (!Object.keys(rawValue).every((key) => LEGACY_DISPLAY_KEYS.has(key))) {
    return false
  }

  if (rawValue.ui === undefined) {
    return true
  }

  if (!isRecord(rawValue.ui)) {
    return false
  }

  return Object.keys(rawValue.ui).every((key) => LEGACY_UI_DISPLAY_KEYS.has(key))
}

function isPureLegacyContentLayoutSubset(rawValue: Record<string, unknown>): boolean {
  if (!Object.keys(rawValue).every((key) => LEGACY_CONTENT_LAYOUT_KEYS.has(key))) {
    return false
  }

  if (rawValue.ui !== undefined) {
    if (!isRecord(rawValue.ui) || !Object.keys(rawValue.ui).every((key) => LEGACY_UI_DISPLAY_KEYS.has(key))) {
      return false
    }
  }

  if (rawValue.layout === undefined) {
    return true
  }

  if (!isRecord(rawValue.layout)) {
    return false
  }

  return Object.keys(rawValue.layout).every((key) => LEGACY_LAYOUT_CONTENT_KEYS.has(key))
}

function isPureLegacyShellRegion(rawRegion: unknown): rawRegion is Record<string, unknown> {
  return isRecord(rawRegion) && Object.keys(rawRegion).every((key) => LEGACY_SHELL_REGION_KEYS.has(key))
}

function isPureLegacyShellSubset(rawValue: Record<string, unknown>): boolean {
  if (!Object.keys(rawValue).every((key) => LEGACY_SHELL_KEYS.has(key))) {
    return false
  }

  if (rawValue.ui !== undefined) {
    if (!isRecord(rawValue.ui) || !Object.keys(rawValue.ui).every((key) => LEGACY_UI_DISPLAY_KEYS.has(key))) {
      return false
    }
  }

  if (rawValue.layout !== undefined) {
    if (
      !isRecord(rawValue.layout) ||
      !Object.keys(rawValue.layout).every((key) => LEGACY_LAYOUT_CONTENT_KEYS.has(key))
    ) {
      return false
    }
  }

  if (rawValue.shell === undefined) {
    return true
  }

  if (!isRecord(rawValue.shell) || !Object.keys(rawValue.shell).every((key) => LEGACY_SHELL_CONFIG_KEYS.has(key))) {
    return false
  }

  if (rawValue.shell.leftRegion !== undefined && !isPureLegacyShellRegion(rawValue.shell.leftRegion)) {
    return false
  }

  if (rawValue.shell.rightRegion !== undefined && !isPureLegacyShellRegion(rawValue.shell.rightRegion)) {
    return false
  }

  return true
}

function isPureLegacyShellViewStateFallbackSubset(rawValue: Record<string, unknown>): boolean {
  if (!Object.keys(rawValue).every((key) => LEGACY_SHELL_KEYS.has(key))) {
    return false
  }

  if (rawValue.ui !== undefined) {
    if (!isRecord(rawValue.ui) || !Object.keys(rawValue.ui).every((key) => LEGACY_UI_DISPLAY_KEYS.has(key))) {
      return false
    }
  }

  if (rawValue.layout !== undefined) {
    if (
      !isRecord(rawValue.layout) ||
      !Object.keys(rawValue.layout).every((key) => LEGACY_LAYOUT_CONTENT_KEYS.has(key))
    ) {
      return false
    }
  }

  if (rawValue.shell === undefined) {
    return false
  }

  if (
    !isRecord(rawValue.shell) ||
    !Object.keys(rawValue.shell).every((key) => LEGACY_SHELL_FALLBACK_CONFIG_KEYS.has(key))
  ) {
    return false
  }

  if (rawValue.shell.leftRegion !== undefined && !isPureLegacyShellRegion(rawValue.shell.leftRegion)) {
    return false
  }

  if (rawValue.shell.rightRegion !== undefined && !isPureLegacyShellRegion(rawValue.shell.rightRegion)) {
    return false
  }

  if (rawValue.shell.viewState === undefined) {
    return false
  }

  if (!isRecord(rawValue.shell.viewState)) {
    return false
  }

  return Object.keys(rawValue.shell.viewState).every((key) => LEGACY_SHELL_VIEW_STATE_KEYS.has(key))
}

function mapLegacyModel(model: ChatConfigModel) {
  return {
    id: model.id,
    providerId: model.providerId,
    label: model.label,
    icon: model.icon,
    disabled: model.disabled,
  }
}

function mapLegacyProviderToTransport(provider: ChatConfigProvider): TrChatTransportConfig {
  return {
    type: provider.type,
    endpoint: provider.endpoint,
    baseURL: provider.baseURL,
    apiPath: provider.apiPath,
    systemPrompt: provider.systemPrompt,
    temperature: provider.temperature,
    maxTokens: provider.maxTokens,
    headers: provider.headers,
    credentials: provider.credentials,
  }
}

function createLegacyRequestConfig(legacyConfig: ChatConfig): TrChatConfig | null {
  const providerIds = new Set(legacyConfig.models.map((model) => model.providerId))
  if (providerIds.size !== 1) {
    return null
  }

  const [providerId] = [...providerIds]
  const provider = legacyConfig.providers[providerId]
  if (!provider) {
    return null
  }

  return {
    request: {
      models: legacyConfig.models.map(mapLegacyModel),
      defaultModelId: legacyConfig.defaults?.model ?? null,
      transport: mapLegacyProviderToTransport(provider),
      systemPrompt: legacyConfig.defaults?.systemPrompt,
    },
  }
}

function normalizeLegacyRequestSubset(rawValue: unknown): TrChatConfig | null {
  const parsedValue = parseSerializedConfig(rawValue)
  if (!isRecord(parsedValue) || !isPureLegacyRequestSubset(parsedValue)) {
    return null
  }

  let legacyConfig: ChatConfig
  try {
    legacyConfig = loadChatConfig(parsedValue)
  } catch {
    return null
  }

  return createLegacyRequestConfig(legacyConfig)
}

function normalizeLegacyDisplaySubset(rawValue: unknown): TrChatConfig | null {
  const parsedValue = parseSerializedConfig(rawValue)
  if (!isRecord(parsedValue) || !isPureLegacyDisplaySubset(parsedValue)) {
    return null
  }

  const hasDisplayDefaults = parsedValue.appearance !== undefined || parsedValue.ui !== undefined
  if (!hasDisplayDefaults) {
    return null
  }

  let legacyConfig: ChatConfig
  try {
    legacyConfig = loadChatConfig(parsedValue)
  } catch {
    return null
  }

  const requestConfig = createLegacyRequestConfig(legacyConfig)
  if (!requestConfig) {
    return null
  }

  if (parsedValue.appearance !== undefined && !legacyConfig.appearance) {
    return null
  }

  if (isRecord(parsedValue.ui)) {
    if (parsedValue.ui.brand !== undefined && !legacyConfig.ui?.brand) {
      return null
    }

    if (parsedValue.ui.welcome !== undefined && !legacyConfig.ui?.welcome) {
      return null
    }
  }

  return {
    ...requestConfig,
    ui: {
      ...(legacyConfig.ui?.brand ? { brand: legacyConfig.ui.brand } : {}),
      ...(legacyConfig.ui?.welcome ? { welcome: legacyConfig.ui.welcome } : {}),
      ...(legacyConfig.appearance ? { appearance: legacyConfig.appearance } : {}),
    },
  }
}

function normalizeLegacyContentLayoutSubset(rawValue: unknown): TrChatConfig | null {
  const parsedValue = parseSerializedConfig(rawValue)
  if (!isRecord(parsedValue) || !isPureLegacyContentLayoutSubset(parsedValue)) {
    return null
  }

  const hasContentLayout = isRecord(parsedValue.layout) && parsedValue.layout.contentLayout !== undefined
  if (!hasContentLayout) {
    return null
  }

  let legacyConfig: ChatConfig
  try {
    legacyConfig = loadChatConfig(parsedValue)
  } catch {
    return null
  }

  const requestConfig = createLegacyRequestConfig(legacyConfig)
  if (!requestConfig) {
    return null
  }

  if (parsedValue.layout !== undefined && !legacyConfig.layout?.contentLayout) {
    return null
  }

  if (parsedValue.appearance !== undefined && !legacyConfig.appearance) {
    return null
  }

  if (isRecord(parsedValue.ui)) {
    if (parsedValue.ui.brand !== undefined && !legacyConfig.ui?.brand) {
      return null
    }

    if (parsedValue.ui.welcome !== undefined && !legacyConfig.ui?.welcome) {
      return null
    }
  }

  return {
    ...requestConfig,
    ui: {
      ...(legacyConfig.ui?.brand ? { brand: legacyConfig.ui.brand } : {}),
      ...(legacyConfig.ui?.welcome ? { welcome: legacyConfig.ui.welcome } : {}),
      ...(legacyConfig.appearance ? { appearance: legacyConfig.appearance } : {}),
      ...(legacyConfig.layout?.contentLayout ? { contentLayout: legacyConfig.layout.contentLayout } : {}),
    },
  }
}

function normalizeLegacyShellSubset(rawValue: unknown): TrChatConfig | null {
  const parsedValue = parseSerializedConfig(rawValue)
  if (!isRecord(parsedValue) || !isPureLegacyShellSubset(parsedValue)) {
    return null
  }

  const hasShellSubset =
    isRecord(parsedValue.shell) &&
    (parsedValue.shell.variant !== undefined ||
      parsedValue.shell.leftRegion !== undefined ||
      parsedValue.shell.rightRegion !== undefined)

  if (!hasShellSubset) {
    return null
  }

  let legacyConfig: ChatConfig
  try {
    legacyConfig = loadChatConfig(parsedValue)
  } catch {
    return null
  }

  const requestConfig = createLegacyRequestConfig(legacyConfig)
  if (!requestConfig) {
    return null
  }

  if (parsedValue.appearance !== undefined && !legacyConfig.appearance) {
    return null
  }

  if (isRecord(parsedValue.ui)) {
    if (parsedValue.ui.brand !== undefined && !legacyConfig.ui?.brand) {
      return null
    }

    if (parsedValue.ui.welcome !== undefined && !legacyConfig.ui?.welcome) {
      return null
    }
  }

  if (parsedValue.layout !== undefined && !legacyConfig.layout?.contentLayout) {
    return null
  }

  if (isRecord(parsedValue.shell)) {
    if (parsedValue.shell.variant !== undefined && !legacyConfig.shell?.variant) {
      return null
    }

    if (parsedValue.shell.leftRegion !== undefined && !legacyConfig.shell?.leftRegion) {
      return null
    }

    if (parsedValue.shell.rightRegion !== undefined && !legacyConfig.shell?.rightRegion) {
      return null
    }
  }

  return {
    ...requestConfig,
    ui: {
      ...(legacyConfig.ui?.brand ? { brand: legacyConfig.ui.brand } : {}),
      ...(legacyConfig.ui?.welcome ? { welcome: legacyConfig.ui.welcome } : {}),
      ...(legacyConfig.appearance ? { appearance: legacyConfig.appearance } : {}),
      ...(legacyConfig.layout?.contentLayout ? { contentLayout: legacyConfig.layout.contentLayout } : {}),
    },
    workspace: {
      ...(legacyConfig.shell?.variant ? { defaultView: legacyConfig.shell.variant } : {}),
      ...(legacyConfig.shell?.leftRegion ? { left: legacyConfig.shell.leftRegion } : {}),
      ...(legacyConfig.shell?.rightRegion ? { right: legacyConfig.shell.rightRegion } : {}),
    },
  }
}

function isLegacyShellViewStateFallbackSubset(rawValue: unknown): boolean {
  const parsedValue = parseSerializedConfig(rawValue)
  return isRecord(parsedValue) && isPureLegacyShellViewStateFallbackSubset(parsedValue)
}

export function isTargetTrChatConfig(value: unknown): value is TrChatConfig {
  const parsedValue = parseSerializedConfig(value)

  if (!isRecord(parsedValue) || !isRecord(parsedValue.request)) {
    return false
  }

  return Array.isArray(parsedValue.request.models) && isRecord(parsedValue.request.transport)
}

export function hasUnsupportedBlackboxCallbacks(callbacks?: ChatScaffoldCallbacks): boolean {
  return Boolean(callbacks?.onBeforeSend || callbacks?.onMessageAction || callbacks?.onModelChange)
}

function chainHandlers<T>(primary?: ((payload: T) => void) | null, compatibility?: ((payload: T) => void) | null) {
  if (!primary) {
    return compatibility ?? undefined
  }

  if (!compatibility) {
    return primary
  }

  return (payload: T) => {
    primary(payload)
    compatibility(payload)
  }
}

function normalizeCompatibilityError(error: unknown) {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return new Error(String((error as { message?: unknown }).message ?? 'Unknown chat error'))
  }

  return new Error(String(error))
}

export function mergeLifecycleCompatibleCallbacks(
  config: TrChatConfig,
  callbacks?: Pick<ChatScaffoldCallbacks, 'onFinish' | 'onError'>,
): TrChatConfig {
  if (!callbacks?.onFinish && !callbacks?.onError) {
    return config
  }

  return {
    ...config,
    lifecycle: {
      ...config.lifecycle,
      afterReceive: chainHandlers(config.lifecycle?.afterReceive, callbacks.onFinish),
      error: chainHandlers(
        config.lifecycle?.error,
        callbacks.onError ? (error) => callbacks.onError?.(normalizeCompatibilityError(error)) : undefined,
      ),
    },
  }
}

export function resolveRootPageBlackboxConfig(
  props: Pick<TrChatProps, 'config' | 'runtime' | 'callbacks' | 'presetOverrides'>,
): TrChatConfig | null {
  const resolvedConfig = parseSerializedConfig(props.config)

  if (props.runtime || props.presetOverrides || hasUnsupportedBlackboxCallbacks(props.callbacks)) {
    return null
  }

  if (isTargetTrChatConfig(resolvedConfig)) {
    return mergeLifecycleCompatibleCallbacks(resolvedConfig, props.callbacks)
  }

  const promotedLegacyContentLayoutConfig = normalizeLegacyContentLayoutSubset(props.config)
  if (promotedLegacyContentLayoutConfig) {
    return mergeLifecycleCompatibleCallbacks(promotedLegacyContentLayoutConfig, props.callbacks)
  }

  const promotedLegacyShellConfig = normalizeLegacyShellSubset(props.config)
  if (promotedLegacyShellConfig) {
    return mergeLifecycleCompatibleCallbacks(promotedLegacyShellConfig, props.callbacks)
  }

  if (isLegacyShellViewStateFallbackSubset(props.config)) {
    return null
  }

  const promotedLegacyDisplayConfig = normalizeLegacyDisplaySubset(props.config)
  if (promotedLegacyDisplayConfig) {
    return mergeLifecycleCompatibleCallbacks(promotedLegacyDisplayConfig, props.callbacks)
  }

  const promotedLegacyConfig = normalizeLegacyRequestSubset(props.config)
  if (promotedLegacyConfig) {
    return mergeLifecycleCompatibleCallbacks(promotedLegacyConfig, props.callbacks)
  }

  return null
}
