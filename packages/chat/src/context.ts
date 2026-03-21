import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type {
  ChatAttachmentsFeaturePreset,
  ChatMessageActionPayload,
  ChatMessages,
  ChatSenderActionsFeaturePreset,
  UseChatKitReturn,
} from './types'
import type { UseMcpManagerReturn } from './composables/useMcpManager'
import type { UseChatAttachmentsReturn } from './composables/useChatAttachments'
import type { BubbleListProps } from '@opentiny/tiny-robot'

// 主状态注入 key：由 TrChatRoot provide，所有子组件 inject
export const CHAT_KIT_KEY: InjectionKey<UseChatKitReturn> = Symbol('chatKit')

// UI 状态注入 key：由 TrChat.vue / TrChatRoot.vue provide，供 Header/History 使用
export const CHAT_UI_KEY: InjectionKey<{
  showHistoryDrawer: Ref<boolean>
}> = Symbol('chatUI')

// MCP 管理器注入 key：由 TrChatRoot provide，供 TrChatMcpPanel 使用
export const MCP_MANAGER_KEY: InjectionKey<UseMcpManagerReturn> = Symbol('mcpManager')

export const CHAT_ATTACHMENTS_KEY: InjectionKey<{
  manager: UseChatAttachmentsReturn
  feature: ChatAttachmentsFeaturePreset
}> = Symbol('chatAttachments')

export const CHAT_SENDER_ACTIONS_KEY: InjectionKey<{
  feature: ChatSenderActionsFeaturePreset
}> = Symbol('chatSenderActions')

export const CHAT_MESSAGES_KEY: InjectionKey<ComputedRef<ChatMessages>> = Symbol('chatMessages')

export const MESSAGE_ACTION_KEY: InjectionKey<((payload: ChatMessageActionPayload) => void) | undefined> =
  Symbol('messageAction')

// Bubble 默认配置：由 TrChatLayout provide，供 MessageList 在未显式传参时兜底
export const BUBBLE_CONFIG_KEY: InjectionKey<{
  roleConfigs: ComputedRef<BubbleListProps['roleConfigs'] | undefined>
}> = Symbol('bubbleConfig')

// BubbleList 允许的 slot 白名单
export const BUBBLE_LIST_SLOTS = ['prefix', 'suffix', 'after', 'content-footer'] as const

// History 状态注入 key：由 TrChatHistory provide，供子组件使用
export const CHAT_HISTORY_KEY: InjectionKey<{
  isManagementMode: Ref<boolean>
  selectedItems: Ref<string[]>
  searchQuery: Ref<string>
  toggleItemSelection: (itemId: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
}> = Symbol('chatHistory')
