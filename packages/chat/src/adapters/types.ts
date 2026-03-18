import type { PromptProps, SenderProps } from '@opentiny/tiny-robot'
import type {
  BrandConfig,
  ChatListVariant,
  ModelOption,
  ModelProviderFactory,
  ResponseProvider,
  TrChatProps,
  WelcomeConfig,
} from '../types'
import type { ChatFeatureConfigMap, ChatFeaturePresetProps, ResolvedChatFeatures } from '../features'
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

export interface ChatLayoutPlacementsConfig {
  assistant?: 'start' | 'end'
  user?: 'start' | 'end'
}

export interface ChatLayoutConfig {
  variant?: ChatListVariant
  placements?: ChatLayoutPlacementsConfig
}

export interface ChatConfig {
  models: ChatConfigModel[]
  providers: Record<string, ChatConfigProvider>
  defaults?: ChatConfigDefaults
  ui?: ChatConfigUI
  layout?: ChatLayoutConfig
  features?: ChatFeatureConfigMap
}

export interface ChatAdapter {
  config: ChatConfig
  models: ModelOption[]
  providerFactories: ModelProviderFactory[]
  defaultModel?: string
  resolvedFeatures: ResolvedChatFeatures
  createResponseProvider: (modelId?: string) => ResponseProvider
}

export type ChatPresetProps = Pick<
  TrChatProps,
  'models' | 'providerFactories' | 'defaultModel' | 'brand' | 'welcome' | 'prompts'
> &
  ChatFeaturePresetProps

export interface ChatPresetRootSlice {
  mcpManager?: TrChatProps['mcpManager']
  attachmentsManager?: TrChatProps['attachmentsManager']
  attachmentsFeature?: TrChatProps['attachmentsFeature']
  senderActionsFeature?: TrChatProps['senderActionsFeature']
}

export interface ChatPresetLayoutSlice {
  show?: TrChatProps['show']
  fullscreen?: TrChatProps['fullscreen']
  roleConfigs?: TrChatProps['roleConfigs']
}

export interface ChatPresetHeaderSlice {
  title?: string
  showHistory?: boolean
  showFullScreen?: boolean
  isFullscreen?: boolean
  showClose?: boolean
}

export interface ChatPresetWelcomeSlice {
  title: string
  description?: string
  icon?: WelcomeConfig['icon'] | BrandConfig['logo']
  prompts?: PromptProps[]
}

export type ChatPresetMessageListSlice = {
  autoScroll?: boolean
  variant?: TrChatProps['messageListVariant']
  onActionClick?: TrChatProps['onMessageAction']
  groupStrategy?: TrChatProps['groupStrategy']
  showFeedback?: boolean
} & NonNullable<TrChatProps['bubbleListProps']>

export type ChatPresetSenderSlice = {
  placeholder?: string
  mode?: TrChatProps['senderMode']
  maxLength?: TrChatProps['maxLength']
} & Partial<SenderProps>

export interface ChatPresetHistorySlice {
  enabled: boolean
  props?: TrChatProps['historyProps']
}

export interface ChatPresetModelSelectorSlice {
  enabled: boolean
  models?: TrChatProps['models']
  providerFactories?: TrChatProps['providerFactories']
  defaultModel?: TrChatProps['defaultModel']
}

export interface ChatPresetSlices {
  root: ChatPresetRootSlice
  layout: ChatPresetLayoutSlice
  header: ChatPresetHeaderSlice
  welcome?: ChatPresetWelcomeSlice
  messageList: ChatPresetMessageListSlice
  sender: ChatPresetSenderSlice
  history: ChatPresetHistorySlice
  modelSelector: ChatPresetModelSelectorSlice
}
