import type { ComputedRef, Ref } from 'vue'
import type { ChatMessage, ConversationStorageStrategy, UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { StructuredData } from '@opentiny/tiny-robot'
import type { ChatAdapter, ChatConfig, ChatPresetProps, ChatPresetSlices } from '@/runtime/config'
import type { UseMcpManagerReturn } from '@/components/mcp/useMcpManager'
import type { ModelOption, TrChatPresetOverrides, UseChatKitOptions, UseChatKitReturn } from '@/types'

export interface TrChatRuntimeInput {
  chatKit?: UseChatKitReturn
  plugins?: UseMessagePlugin[]
  storage?: ConversationStorageStrategy
  initialMessages?: ChatMessage[]
  messageTransforms?: UseChatKitOptions['messageTransforms']
  mcpManager?: UseMcpManagerReturn
  selectedModel?: string
}

export interface ChatBeforeSendPayload {
  text: string
  structuredData?: StructuredData
}

export type ChatBeforeSendResult =
  | false
  | void
  | {
      text?: string
      structuredData?: StructuredData
    }

export interface ChatScaffoldCallbacks {
  onBeforeSend?: (payload: ChatBeforeSendPayload) => ChatBeforeSendResult | Promise<ChatBeforeSendResult>
  onFinish?: (message: ChatMessage) => void
  onError?: (error: Error) => void
  onMessageAction?: NonNullable<TrChatPresetOverrides['onMessageAction']>
  onModelChange?: NonNullable<TrChatPresetOverrides['onModelChange']>
}

export interface TrChatScaffoldProps {
  config: string | ChatConfig | unknown
  runtime?: TrChatRuntimeInput
  callbacks?: ChatScaffoldCallbacks
  presetOverrides?: Partial<TrChatPresetOverrides>
}

export interface TrChatScaffoldContextValue {
  adapter?: ComputedRef<ChatAdapter>
  presetProps: ComputedRef<ChatPresetProps & Partial<TrChatPresetOverrides>>
  presetSlices: ComputedRef<ChatPresetSlices>
  currentModel: Ref<string>
  models: ComputedRef<ModelOption[]>
  defaultModel: ComputedRef<string | undefined>
  updateModel: (model: ModelOption) => void
}
