import type { PromptProps, SenderProps } from '@opentiny/tiny-robot'
import type {
  BrandConfig,
  ChatAppearanceConfig,
  ChatContentLayout,
  ChatListVariant,
  ModelOption,
  ModelProviderFactory,
  ResponseProvider,
  TrChatPresetOverrides,
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
  contentLayout?: ChatContentLayout
}

export interface ChatConfigRuntime {
  mcpManager?: TrChatPresetOverrides['mcpManager']
}

export interface ChatConfig {
  models: ChatConfigModel[]
  providers: Record<string, ChatConfigProvider>
  defaults?: ChatConfigDefaults
  appearance?: ChatAppearanceConfig
  ui?: ChatConfigUI
  layout?: ChatLayoutConfig
  features?: ChatFeatureConfigMap
  runtime?: ChatConfigRuntime
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
  TrChatPresetOverrides,
  | 'models'
  | 'providerFactories'
  | 'defaultModel'
  | 'appearance'
  | 'brand'
  | 'welcome'
  | 'prompts'
  | 'messages'
  | 'contentLayout'
> &
  ChatFeaturePresetProps

export interface ChatPresetRootSlice {
  mcpManager?: TrChatPresetOverrides['mcpManager']
  attachmentsManager?: TrChatPresetOverrides['attachmentsManager']
  attachmentsFeature?: TrChatPresetOverrides['attachmentsFeature']
  senderActionsFeature?: TrChatPresetOverrides['senderActionsFeature']
  messages?: TrChatPresetOverrides['messages']
}

export interface ChatPresetLayoutSlice {
  show?: TrChatPresetOverrides['show']
  roleConfigs?: TrChatPresetOverrides['roleConfigs']
  contentLayout?: TrChatPresetOverrides['contentLayout']
}

export interface ChatPresetAppearanceSlice {
  appearance?: TrChatPresetOverrides['appearance']
}

export interface ChatPresetHeaderSlice {
  title?: string
  showHistory?: boolean
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
  variant?: TrChatPresetOverrides['messageListVariant']
  onActionClick?: TrChatPresetOverrides['onMessageAction']
  groupStrategy?: TrChatPresetOverrides['groupStrategy']
  showFeedback?: boolean
} & NonNullable<TrChatPresetOverrides['bubbleListProps']>

export type ChatPresetSenderSlice = {
  placeholder?: string
  mode?: TrChatPresetOverrides['senderMode']
  maxLength?: TrChatPresetOverrides['maxLength']
} & Partial<SenderProps>

export interface ChatPresetHistorySlice {
  enabled: boolean
  props?: TrChatPresetOverrides['historyProps']
}

export interface ChatPresetModelSelectorSlice {
  enabled: boolean
  models?: TrChatPresetOverrides['models']
  providerFactories?: TrChatPresetOverrides['providerFactories']
  defaultModel?: TrChatPresetOverrides['defaultModel']
}

export interface ChatPresetSlices {
  root: ChatPresetRootSlice
  layout: ChatPresetLayoutSlice
  appearance: ChatPresetAppearanceSlice
  header: ChatPresetHeaderSlice
  welcome?: ChatPresetWelcomeSlice
  messageList: ChatPresetMessageListSlice
  sender: ChatPresetSenderSlice
  history: ChatPresetHistorySlice
  modelSelector: ChatPresetModelSelectorSlice
}
