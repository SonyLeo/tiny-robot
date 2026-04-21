import { getCurrentInstance, inject, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import type {
  ChatAttachmentsFeaturePreset,
  ChatBeforeSendPayload,
  ChatBeforeSendResult,
  ChatMessageActionsInput,
  ChatMessageActionsMode,
  ChatMessageActionPayload,
  ChatMessages,
  ChatSenderActionsFeaturePreset,
  UseChatKitReturn,
} from '@/types'
import type { UseMcpManagerReturn } from '@/components/mcp/useMcpManager'
import type { UseChatAttachmentsReturn } from '@/components/attachments/useChatAttachments'
import type { BubbleListProps } from '@opentiny/tiny-robot'
import type { TrChatScaffoldContextValue } from '@/types/scaffold'
import type { ChatUiContextValue } from '@/components/workspace/chatUiContext'
import type { ChatRuntime } from '@/types/root'

export { createChatUiContext } from '@/components/workspace/chatUiContext'
export type {
  ChatHistoryDisplayMode,
  ChatUiContextValue,
  ChatWorkspaceRegionState,
  ChatWorkspaceState,
  CreateChatUiContextOptions,
} from '@/components/workspace/chatUiContext'

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
export const CHAT_RUNTIME_KEY: InjectionKey<ChatRuntime> = Symbol('chatRuntime')

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
export const CHAT_BEFORE_SEND_KEY: InjectionKey<
  ((payload: ChatBeforeSendPayload) => ChatBeforeSendResult | Promise<ChatBeforeSendResult>) | undefined
> = Symbol('chatBeforeSend')

export const MESSAGE_ACTION_KEY: InjectionKey<((payload: ChatMessageActionPayload) => void) | undefined> =
  Symbol('messageAction')

export const MESSAGE_ACTIONS_KEY: InjectionKey<{
  messageActions: ComputedRef<ChatMessageActionsInput | undefined>
  messageActionsMode: ComputedRef<ChatMessageActionsMode | undefined>
}> = Symbol('messageActions')

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
