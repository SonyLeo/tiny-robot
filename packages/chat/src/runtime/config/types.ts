import type { PromptProps, SenderProps } from '@opentiny/tiny-robot'
import type {
  BrandConfig,
  ChatAppearanceConfig,
  ChatContentLayout,
  ChatListVariant,
  ModelOption,
  ResponseProvider,
  TrChatPresetOverrides,
  WelcomeConfig,
} from '@/types'
import type { ChatFeatureConfigMap, ChatFeaturePresetProps, ResolvedChatFeatures } from './featureTypes'
import type { ChatWorkspaceShellConfig } from '@/types/workspace'

export interface ChatConfigModel {
  id: string
  providerId: string
  label?: string
  disabled?: boolean
}

export interface OpenAICompatibleProviderConfig {
  type?: 'openai-compatible'
  baseURL?: string
  endpoint?: string
  apiPath?: string
  headers?: Record<string, string>
  credentials?: RequestCredentials
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
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
  shell?: ChatWorkspaceShellConfig
  ui?: ChatConfigUI
  layout?: ChatLayoutConfig
  features?: ChatFeatureConfigMap
  runtime?: ChatConfigRuntime
}

export interface ChatAdapter {
  config: ChatConfig
  models: ModelOption[]
  defaultModel?: string
  resolvedFeatures: ResolvedChatFeatures
  getModel: (modelId?: string) => ModelOption | undefined
  createResponseProvider: (modelId?: string) => ResponseProvider
}

export type ChatPresetProps = Pick<
  TrChatPresetOverrides,
  | 'appearance'
  | 'brand'
  | 'welcome'
  | 'prompts'
  | 'messages'
  | 'contentLayout'
  | 'shell'
  | 'bubbleRenderers'
  | 'messageActions'
  | 'messageActionsMode'
> &
  ChatFeaturePresetProps & {
    models: ModelOption[]
    defaultModel?: string
  }

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
  bubbleRenderers?: TrChatPresetOverrides['bubbleRenderers']
}

export interface ChatPresetAppearanceSlice {
  appearance?: TrChatPresetOverrides['appearance']
}

export interface ChatPresetShellSlice {
  shell?: TrChatPresetOverrides['shell']
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
  messageActions?: TrChatPresetOverrides['messageActions']
  messageActionsMode?: TrChatPresetOverrides['messageActionsMode']
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
  models?: ModelOption[]
  defaultModel?: string
}

export interface ChatPresetSlices {
  root: ChatPresetRootSlice
  layout: ChatPresetLayoutSlice
  appearance: ChatPresetAppearanceSlice
  shell: ChatPresetShellSlice
  header: ChatPresetHeaderSlice
  welcome?: ChatPresetWelcomeSlice
  messageList: ChatPresetMessageListSlice
  sender: ChatPresetSenderSlice
  history: ChatPresetHistorySlice
  modelSelector: ChatPresetModelSelectorSlice
}
