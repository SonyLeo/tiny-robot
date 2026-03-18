export type ChatCliSupportedProvider = 'openai' | 'deepseek' | 'custom'
export type ChatCliTemplateStatus = 'stable' | 'planned'
export type ChatCliRequiredFeatureKey = 'attachments' | 'senderActions' | 'welcomePrompts' | 'mcp'

export interface ChatCliTemplateDefinition {
  id: string
  label: string
  description?: string
  status: ChatCliTemplateStatus
  templateDir: string
  supportedProviders: readonly ChatCliSupportedProvider[]
  requiredChatFeatures: readonly ChatCliRequiredFeatureKey[]
  postScaffoldSteps?: readonly string[]
}

export const CHAT_CLI_TEMPLATE_REGISTRY = [
  {
    id: 'basic',
    label: 'Basic Chat Agent',
    description: 'Vue 3 + TypeScript + OpenAI/DeepSeek',
    status: 'stable',
    templateDir: 'basic',
    supportedProviders: ['openai', 'deepseek', 'custom'],
    requiredChatFeatures: [],
    postScaffoldSteps: ['copy-env', 'configure-endpoint', 'run-dev'],
  },
] as const satisfies readonly ChatCliTemplateDefinition[]

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
