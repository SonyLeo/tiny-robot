import { getCurrentInstance, inject, type ComputedRef, type InjectionKey, type Ref } from 'vue'
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
import type { TrChatScaffoldContextValue } from './components/chat/scaffold'
import type { ChatUiContextValue } from './chatUiContext'

export { createChatUiContext } from './chatUiContext'
export type { ChatHistoryDisplayMode, ChatUiContextValue, CreateChatUiContextOptions } from './chatUiContext'

export const CHAT_KIT_KEY: InjectionKey<UseChatKitReturn> = Symbol('chatKit')

export function useRequiredInject<T>(
  key: InjectionKey<T>,
  dependencyName: string,
  componentName?: string,
): NonNullable<T> {
  const value = inject(key, null as T | null)
  const resolvedComponentName = componentName ?? getCurrentInstance()?.type.name ?? 'AnonymousComponent'

  if (value == null) {
    throw new Error(`[${resolvedComponentName}] Missing required ${dependencyName} context`)
  }

  return value as NonNullable<T>
}

export const CHAT_UI_KEY: InjectionKey<ChatUiContextValue> = Symbol('chatUI')

export const MCP_MANAGER_KEY: InjectionKey<UseMcpManagerReturn> = Symbol('mcpManager')

export const CHAT_ATTACHMENTS_KEY: InjectionKey<{
  manager: UseChatAttachmentsReturn
  feature: ChatAttachmentsFeaturePreset
}> = Symbol('chatAttachments')

export const CHAT_SENDER_ACTIONS_KEY: InjectionKey<{
  feature: ChatSenderActionsFeaturePreset
}> = Symbol('chatSenderActions')

export const CHAT_MESSAGES_KEY: InjectionKey<ComputedRef<ChatMessages>> = Symbol('chatMessages')
export const CHAT_SCAFFOLD_KEY: InjectionKey<TrChatScaffoldContextValue> = Symbol('chatScaffold')

export const MESSAGE_ACTION_KEY: InjectionKey<((payload: ChatMessageActionPayload) => void) | undefined> =
  Symbol('messageAction')

export const BUBBLE_CONFIG_KEY: InjectionKey<{
  roleConfigs: ComputedRef<BubbleListProps['roleConfigs'] | undefined>
}> = Symbol('bubbleConfig')

export const BUBBLE_LIST_SLOTS = ['prefix', 'suffix', 'after', 'content-footer'] as const

export const CHAT_HISTORY_KEY: InjectionKey<{
  isManagementMode: Ref<boolean>
  selectedItems: Ref<string[]>
  searchQuery: Ref<string>
  toggleItemSelection: (itemId: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
}> = Symbol('chatHistory')

export function useChatScaffoldContext() {
  return inject(CHAT_SCAFFOLD_KEY, null)
}
