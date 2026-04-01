/**
 * Composables 统一导出
 */

// 核心 composables
export { useChatKit } from './useChatKit'
export { useChatConversation } from './useChatConversation'
export { useChatRequest } from './useChatRequest'
export { useChatMessages } from './useChatMessages'
export {
  getChatRenderMessageIndex,
  getChatRenderSourceMessage,
  normalizeChatRenderMessages,
  unwrapChatRenderMessages,
} from './chatRenderMessages'
export { useDefaultBubbleConfig } from './useDefaultBubbleConfig'
export { useChatAttachments } from './useChatAttachments'
export { useMcpManager } from './useMcpManager'
export { useModelSelector } from './useModelSelector'

// UI 相关 composables
export { useChatFeedback } from './useChatFeedback'
export { useFloatingDropdown } from './useFloatingDropdown'
export { useKeyboardNavigation } from './useKeyboardNavigation'
export { useHistoryState } from './useHistoryState'
export { useSlotFilter } from './useSlotFilter'

// 类型导出
export type { UseMcpManagerReturn } from './useMcpManager'
export type { UseMcpManagerBridge, UseMcpManagerOptions } from './useMcpManager'
export type { UseDefaultBubbleConfigOptions } from './useDefaultBubbleConfig'
export type { UseModelSelectorOptions } from './useModelSelector'
export type { UseChatAttachmentsReturn } from './useChatAttachments'
