/**
 * Composables 统一导出
 */

// 核心 composables
export { useChatKit } from './useChatKit'
export { useDefaultBubbleConfig } from './useDefaultBubbleConfig'
export { useMcpManager } from './useMcpManager'

// UI 相关 composables
export { useChatFeedback } from './useChatFeedback'
export { useFloatingDropdown } from './useFloatingDropdown'
export { useKeyboardNavigation } from './useKeyboardNavigation'
export { useHistoryState } from './useHistoryState'

// 类型导出
export type { UseMcpManagerReturn } from './useMcpManager'
