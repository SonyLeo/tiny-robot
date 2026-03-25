import type { ComputedRef, Ref } from 'vue'
import type { ChatMessage, ConversationStorageStrategy, UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { ChatAdapter, ChatConfig, ChatPresetProps, ChatPresetSlices } from '@/adapters'
import type { UseMcpManagerReturn } from '@/composables/useMcpManager'
import type { ModelOption, TrChatPresetOverrides, UseChatKitReturn } from '@/types'

export interface ChatScaffoldRuntimeInput {
  chatKit?: UseChatKitReturn
  plugins?: UseMessagePlugin[]
  storage?: ConversationStorageStrategy
  initialMessages?: ChatMessage[]
  mcpManager?: UseMcpManagerReturn
  selectedModel?: string
}

export interface ChatScaffoldCallbacks {
  onFinish?: (message: ChatMessage) => void
  onError?: (error: Error) => void
  onMessageAction?: NonNullable<TrChatPresetOverrides['onMessageAction']>
  onModelChange?: NonNullable<TrChatPresetOverrides['onModelChange']>
}

export interface TrChatScaffoldProps {
  config: string | ChatConfig | unknown
  runtime?: ChatScaffoldRuntimeInput
  callbacks?: ChatScaffoldCallbacks
  presetOverrides?: Partial<TrChatPresetOverrides>
}

export interface TrChatScaffoldContextValue {
  adapter?: ComputedRef<ChatAdapter>
  presetProps: ComputedRef<ChatPresetProps & Partial<TrChatPresetOverrides>>
  presetSlices: ComputedRef<ChatPresetSlices>
  currentModel: Ref<string>
  models: ComputedRef<ModelOption[]>
  providerFactories: ComputedRef<TrChatPresetOverrides['providerFactories'] | undefined>
  defaultModel: ComputedRef<string | undefined>
  updateModel: (model: ModelOption) => void
}
