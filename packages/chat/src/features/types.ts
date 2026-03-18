import type { PromptProps } from '@opentiny/tiny-robot'
import type { ChatAttachmentsFeaturePreset, ChatSenderActionsFeaturePreset, TrChatProps } from '../types'

export type ChatFeatureInput<TConfig extends object = object> = boolean | ({ enabled?: boolean } & TConfig)

export interface ChatHistoryFeatureOptions {
  props?: TrChatProps['historyProps']
}

export type ChatAttachmentsFeatureConfig = ChatFeatureInput<ChatAttachmentsFeaturePreset>
export type ChatSenderActionsFeatureConfig = ChatFeatureInput<ChatSenderActionsFeaturePreset>
export interface ChatWelcomePromptsFeatureOptions {
  welcome?: PromptProps[]
}
export type ChatWelcomePromptsFeatureConfig = ChatFeatureInput<ChatWelcomePromptsFeatureOptions>
export type ChatHistoryFeatureConfig = ChatFeatureInput<ChatHistoryFeatureOptions>
export type ChatFeedbackFeatureConfig = ChatFeatureInput

export interface ChatFeatureConfigMap {
  attachments?: ChatAttachmentsFeatureConfig
  senderActions?: ChatSenderActionsFeatureConfig
  welcomePrompts?: ChatWelcomePromptsFeatureConfig
  history?: ChatHistoryFeatureConfig
  feedback?: ChatFeedbackFeatureConfig
}

export type BuiltInChatFeatureKey = 'attachments' | 'senderActions' | 'welcomePrompts' | 'history' | 'feedback'

export type ChatFeaturePresetProps = Partial<
  Pick<
    TrChatProps,
    'attachmentsFeature' | 'senderActionsFeature' | 'prompts' | 'showHistory' | 'historyProps' | 'showFeedback'
  >
>

export interface ChatAttachmentsFeatureResolution {
  key: 'attachments'
  enabled: boolean
  config?: Exclude<ChatAttachmentsFeatureConfig, boolean>
  presetProps: ChatFeaturePresetProps
}

export interface ChatSenderActionsFeatureResolution {
  key: 'senderActions'
  enabled: boolean
  config?: Exclude<ChatSenderActionsFeatureConfig, boolean>
  presetProps: ChatFeaturePresetProps
}

export interface ChatWelcomePromptsFeatureResolution {
  key: 'welcomePrompts'
  enabled: boolean
  config?: Exclude<ChatWelcomePromptsFeatureConfig, boolean>
  presetProps: ChatFeaturePresetProps
}

export interface ChatHistoryFeatureResolution {
  key: 'history'
  enabled: boolean
  config?: Exclude<ChatHistoryFeatureConfig, boolean>
  presetProps: ChatFeaturePresetProps
}

export interface ChatFeedbackFeatureResolution {
  key: 'feedback'
  enabled: boolean
  config?: Exclude<ChatFeedbackFeatureConfig, boolean>
  presetProps: ChatFeaturePresetProps
}

export interface ResolvedChatFeatures {
  entries: {
    attachments: ChatAttachmentsFeatureResolution
    senderActions: ChatSenderActionsFeatureResolution
    welcomePrompts: ChatWelcomePromptsFeatureResolution
    history: ChatHistoryFeatureResolution
    feedback: ChatFeedbackFeatureResolution
  }
  enabledKeys: BuiltInChatFeatureKey[]
  presetProps: ChatFeaturePresetProps
}
