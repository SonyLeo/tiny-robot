/**
 * Composables 统一导出
 */

// 核心 composables
export { useChatKit } from './useChatKit'
export { useDefaultBubbleConfig } from './useDefaultBubbleConfig'
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
