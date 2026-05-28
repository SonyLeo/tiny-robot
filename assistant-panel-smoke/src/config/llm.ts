export type LlmProvider = 'openai' | 'deepseek'

export interface AssistantLlmConfig {
  provider: LlmProvider
  apiKey: string
  model: string
  endpoint: string
}

const DEFAULT_BASE_URLS: Record<LlmProvider, string> = {
  openai: 'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com/v1',
}

function normalizeProvider(value: string | undefined): LlmProvider {
  return value === 'deepseek' ? 'deepseek' : 'openai'
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

function buildChatEndpoint(baseUrl: string): string {
  return baseUrl.endsWith('/chat/completions') ? baseUrl : `${trimTrailingSlash(baseUrl)}/chat/completions`
}

const provider = normalizeProvider(import.meta.env.VITE_LLM_PROVIDER)
const apiKey = import.meta.env.VITE_LLM_API_KEY?.trim() || ''
const model = import.meta.env.VITE_LLM_MODEL?.trim() || ''
const baseUrl = trimTrailingSlash(import.meta.env.VITE_LLM_BASE_URL?.trim() || DEFAULT_BASE_URLS[provider])

export const llmConfig: AssistantLlmConfig = {
  provider,
  apiKey,
  model,
  endpoint: buildChatEndpoint(baseUrl),
}

export const hasLlmConfig = Boolean(llmConfig.apiKey && llmConfig.model && llmConfig.endpoint)
