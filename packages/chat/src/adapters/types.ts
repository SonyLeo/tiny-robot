import type { PromptProps } from '@opentiny/tiny-robot'
import type {
  BrandConfig,
  ModelOption,
  ModelProviderFactory,
  ResponseProvider,
  TrChatProps,
  WelcomeConfig,
} from '../types'
import type { ServerProxyFactoryOptions } from '../providers/serverProxy'

export interface ChatConfigModel {
  id: string
  provider: string
  label?: string
  disabled?: boolean
}

export interface OpenAICompatibleProviderConfig extends Omit<ServerProxyFactoryOptions, 'provider'> {
  type: 'openai-compatible'
}

export type ChatConfigProvider = OpenAICompatibleProviderConfig

export interface ChatConfigDefaults {
  model?: string
  systemPrompt?: string
}

export interface ChatConfigUI {
  brand?: BrandConfig
  welcome?: WelcomeConfig
  prompts?: PromptProps[]
}

export interface ChatConfig {
  models: ChatConfigModel[]
  providers: Record<string, ChatConfigProvider>
  defaults?: ChatConfigDefaults
  ui?: ChatConfigUI
}

export interface ChatAdapter {
  config: ChatConfig
  models: ModelOption[]
  providerFactories: ModelProviderFactory[]
  defaultModel?: string
  createResponseProvider: (modelId?: string) => ResponseProvider
}

export type ChatPresetProps = Pick<
  TrChatProps,
  'models' | 'providerFactories' | 'defaultModel' | 'brand' | 'welcome' | 'prompts'
>
