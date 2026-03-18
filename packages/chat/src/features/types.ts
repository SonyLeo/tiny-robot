import type { ChatAttachmentsFeaturePreset, TrChatProps } from '../types'

export type ChatFeatureInput<TConfig extends object = object> = boolean | ({ enabled?: boolean } & TConfig)

export interface ChatHistoryFeatureOptions {
  props?: TrChatProps['historyProps']
}

export type ChatAttachmentsFeatureConfig = ChatFeatureInput<ChatAttachmentsFeaturePreset>
export type ChatHistoryFeatureConfig = ChatFeatureInput<ChatHistoryFeatureOptions>
export type ChatFeedbackFeatureConfig = ChatFeatureInput

export interface ChatFeatureConfigMap {
  attachments?: ChatAttachmentsFeatureConfig
  history?: ChatHistoryFeatureConfig
  feedback?: ChatFeedbackFeatureConfig
}

export type BuiltInChatFeatureKey = 'attachments' | 'history' | 'feedback'

export type ChatFeaturePresetProps = Partial<
  Pick<TrChatProps, 'attachmentsFeature' | 'showHistory' | 'historyProps' | 'showFeedback'>
>

export interface ChatAttachmentsFeatureResolution {
  key: 'attachments'
  enabled: boolean
  config?: Exclude<ChatAttachmentsFeatureConfig, boolean>
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
    history: ChatHistoryFeatureResolution
    feedback: ChatFeedbackFeatureResolution
  }
  enabledKeys: BuiltInChatFeatureKey[]
  presetProps: ChatFeaturePresetProps
}
