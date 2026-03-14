import type { ModelOption, ResponseProvider, TrChatProps, WelcomeConfig } from '../types'
import { createServerProxyFactory } from '../providers/serverProxy'
import type {
  ChatAdapter,
  ChatConfig,
  ChatConfigProvider,
  ChatConfigModel,
  ChatConfigUI,
  ChatPresetProps,
} from './types'

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
  assertString(model.provider, `[loadChatConfig] models[${index}].provider is required`)

  return {
    id: model.id,
    provider: model.provider,
    label: typeof model.label === 'string' ? model.label : undefined,
    disabled: typeof model.disabled === 'boolean' ? model.disabled : undefined,
  }
}

function normalizeProvider(providerId: string, provider: unknown): ChatConfigProvider {
  if (!isRecord(provider)) {
    throw new Error(`[loadChatConfig] providers.${providerId} must be an object`)
  }

  assertString(provider.type, `[loadChatConfig] providers.${providerId}.type is required`)

  if (provider.type !== 'openai-compatible') {
    throw new Error(`[loadChatConfig] providers.${providerId}.type "${provider.type}" is not supported`)
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
    if (!providers[model.provider]) {
      throw new Error(`[loadChatConfig] model "${model.id}" references missing provider "${model.provider}"`)
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

  const ui = normalizeUi(raw.ui)

  return {
    models,
    providers,
    defaults,
    ui,
  }
}

export function createChatAdapterFromConfig(input: string | ChatConfig | unknown): ChatAdapter {
  const config = loadChatConfig(input)

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
    createResponseProvider,
  }
}

export function createPresetChatProps(
  adapter: ChatAdapter,
  overrides: Partial<TrChatProps> = {},
): ChatPresetProps & Partial<TrChatProps> {
  return {
    models: adapter.models,
    providerFactories: adapter.providerFactories,
    defaultModel: adapter.defaultModel,
    brand: adapter.config.ui?.brand,
    welcome: adapter.config.ui?.welcome,
    prompts: adapter.config.ui?.prompts,
    ...overrides,
  }
}
