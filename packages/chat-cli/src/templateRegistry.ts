export type ChatCliSupportedProvider = 'openai' | 'deepseek' | 'custom'
export type ChatCliTemplateStatus = 'stable' | 'planned'
export type ChatCliTemplateConsumptionMode = 'blackbox-props' | 'whitebox-slices'

export const CHAT_CLI_SUPPORTED_PROVIDERS = ['openai', 'deepseek', 'custom'] as const
export const CHAT_CLI_TEMPLATE_STATUSES = ['stable', 'planned'] as const
export const CHAT_CLI_TEMPLATE_CONSUMPTION_MODES = ['blackbox-props', 'whitebox-slices'] as const
export const CHAT_CLI_REQUIRED_FEATURE_KEYS = [
  'attachments',
  'senderActions',
  'welcomePrompts',
  'mcp',
  'history',
  'feedback',
] as const
export const CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS = [
  'attachmentsFeature',
  'senderActionsFeature',
  'prompts',
  'mcpManager',
  'messageListVariant',
  'roleConfigs',
  'showHistory',
  'historyProps',
  'showFeedback',
] as const
export const CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS = [
  'root',
  'layout',
  'header',
  'welcome',
  'messageList',
  'sender',
  'history',
  'modelSelector',
] as const

export type ChatCliRequiredFeatureKey = (typeof CHAT_CLI_REQUIRED_FEATURE_KEYS)[number]
export type ChatCliConsumablePresetPropKey = (typeof CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS)[number]
export type ChatCliConsumablePresetSliceKey = (typeof CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS)[number]

export interface ChatCliTemplateContractUsage {
  mode: ChatCliTemplateConsumptionMode
  presetPropKeys: readonly ChatCliConsumablePresetPropKey[]
  presetSliceKeys: readonly ChatCliConsumablePresetSliceKey[]
}

export interface ChatCliTemplateDefinition {
  id: string
  label: string
  description?: string
  status: ChatCliTemplateStatus
  templateDir: string
  supportedProviders: readonly ChatCliSupportedProvider[]
  requiredChatFeatures: readonly ChatCliRequiredFeatureKey[]
  contractUsage: ChatCliTemplateContractUsage
  postScaffoldSteps?: readonly string[]
}

export const CHAT_CLI_TEMPLATE_REGISTRY = [
  {
    id: 'basic',
    label: 'Basic Chat Agent',
    description: 'General chat starter with white-box chat slices',
    status: 'stable',
    templateDir: 'basic',
    supportedProviders: ['openai', 'deepseek', 'custom'],
    requiredChatFeatures: ['welcomePrompts', 'history'],
    contractUsage: {
      mode: 'whitebox-slices',
      presetPropKeys: [],
      presetSliceKeys: ['root', 'layout', 'header', 'welcome', 'messageList', 'sender', 'history', 'modelSelector'],
    },
    postScaffoldSteps: ['copy-env', 'configure-endpoint', 'run-dev'],
  },
  {
    id: 'agent-mcp',
    label: 'Agent MCP',
    description: 'MCP panel + tool bridge starter',
    status: 'stable',
    templateDir: 'agent-mcp',
    supportedProviders: ['openai', 'deepseek', 'custom'],
    requiredChatFeatures: ['welcomePrompts', 'mcp', 'history'],
    contractUsage: {
      mode: 'whitebox-slices',
      presetPropKeys: [],
      presetSliceKeys: ['root', 'layout', 'header', 'welcome', 'messageList', 'sender', 'history', 'modelSelector'],
    },
    postScaffoldSteps: ['copy-env', 'configure-endpoint', 'review-mcp', 'run-dev'],
  },
] as const satisfies readonly ChatCliTemplateDefinition[]

export function validateChatCliTemplateRegistry(
  registry: readonly ChatCliTemplateDefinition[] = CHAT_CLI_TEMPLATE_REGISTRY,
): string[] {
  const errors: string[] = []
  const seenIds = new Set<string>()
  const validProviders = new Set<string>(CHAT_CLI_SUPPORTED_PROVIDERS)
  const validStatuses = new Set<string>(CHAT_CLI_TEMPLATE_STATUSES)
  const validConsumptionModes = new Set<string>(CHAT_CLI_TEMPLATE_CONSUMPTION_MODES)
  const validFeatures = new Set<string>(CHAT_CLI_REQUIRED_FEATURE_KEYS)
  const validPresetPropKeys = new Set<string>(CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS)
  const validPresetSliceKeys = new Set<string>(CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS)

  for (const template of registry) {
    if (!template.id) {
      errors.push('Template registry contains an entry with an empty id')
      continue
    }

    if (seenIds.has(template.id)) {
      errors.push(`Template registry contains a duplicate id "${template.id}"`)
    }
    seenIds.add(template.id)

    if (!validStatuses.has(template.status)) {
      errors.push(`Template "${template.id}" has unsupported status "${template.status}"`)
    }

    if (template.supportedProviders.length === 0) {
      errors.push(`Template "${template.id}" must declare at least one supported provider`)
    }

    const providerSet = new Set<string>()
    for (const provider of template.supportedProviders) {
      if (!validProviders.has(provider)) {
        errors.push(`Template "${template.id}" declares unsupported provider "${provider}"`)
      }
      if (providerSet.has(provider)) {
        errors.push(`Template "${template.id}" repeats provider "${provider}"`)
      }
      providerSet.add(provider)
    }

    const featureSet = new Set<string>()
    for (const feature of template.requiredChatFeatures) {
      if (!validFeatures.has(feature)) {
        errors.push(`Template "${template.id}" declares unsupported required feature "${feature}"`)
      }
      if (featureSet.has(feature)) {
        errors.push(`Template "${template.id}" repeats required feature "${feature}"`)
      }
      featureSet.add(feature)
    }

    if (!validConsumptionModes.has(template.contractUsage.mode)) {
      errors.push(`Template "${template.id}" declares unsupported contract usage mode "${template.contractUsage.mode}"`)
    }

    const presetPropKeySet = new Set<string>()
    for (const key of template.contractUsage.presetPropKeys) {
      if (!validPresetPropKeys.has(key)) {
        errors.push(`Template "${template.id}" declares unsupported preset prop key "${key}"`)
      }
      if (presetPropKeySet.has(key)) {
        errors.push(`Template "${template.id}" repeats preset prop key "${key}"`)
      }
      presetPropKeySet.add(key)
    }

    const presetSliceKeySet = new Set<string>()
    for (const key of template.contractUsage.presetSliceKeys) {
      if (!validPresetSliceKeys.has(key)) {
        errors.push(`Template "${template.id}" declares unsupported preset slice key "${key}"`)
      }
      if (presetSliceKeySet.has(key)) {
        errors.push(`Template "${template.id}" repeats preset slice key "${key}"`)
      }
      presetSliceKeySet.add(key)
    }

    if (template.contractUsage.mode === 'whitebox-slices' && template.contractUsage.presetSliceKeys.length === 0) {
      errors.push(`Template "${template.id}" must declare presetSliceKeys when using "whitebox-slices"`)
    }
  }

  return errors
}

export function getChatCliTemplateRegistry(): readonly ChatCliTemplateDefinition[] {
  return CHAT_CLI_TEMPLATE_REGISTRY
}

export function getChatCliTemplateDefinition(templateId: string): ChatCliTemplateDefinition | undefined {
  return CHAT_CLI_TEMPLATE_REGISTRY.find((template) => template.id === templateId)
}

export function getStableChatCliTemplates(): readonly ChatCliTemplateDefinition[] {
  return CHAT_CLI_TEMPLATE_REGISTRY.filter((template) => template.status === 'stable')
}

export function getStableChatCliTemplateIds(): string[] {
  return getStableChatCliTemplates().map((template) => template.id)
}
