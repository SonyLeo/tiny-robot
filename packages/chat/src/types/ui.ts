import type {
  BubbleListProps,
  BubbleListSlots,
  BubbleProviderProps,
  HistoryItem,
  HistoryMenuItem,
  HistoryProps,
  HistorySlots,
  SenderEmits,
  SenderProps,
  SenderSlots,
} from '@opentiny/tiny-robot'
import type { VNode } from 'vue'
import type { ChatAsideMode } from './layout'

export interface ChatTopbarProps {
  title?: string
}

export interface ChatTopbarSlots {
  leading?: () => VNode[]
  title?: () => VNode[]
  actions?: () => VNode[]
  extra?: () => VNode[]
}

export interface ChatSidebarPanelProps {
  mode: ChatAsideMode
}

export interface ChatSidebarPanelSlotProps {
  mode: ChatAsideMode
  collapsed: boolean
  isRail: boolean
  isDrawer: boolean
}

export interface ChatSidebarPanelSlots {
  header?: (slotProps: ChatSidebarPanelSlotProps) => VNode[]
  'primary-action'?: (slotProps: ChatSidebarPanelSlotProps) => VNode[]
  default?: (slotProps: ChatSidebarPanelSlotProps) => VNode[]
}

export type ChatHistoryListProps<T extends HistoryItem = HistoryItem> = HistoryProps<T>

export type ChatHistoryListSlots<T extends HistoryItem = HistoryItem> = HistorySlots<T>

export interface ChatHistoryListEmits<T extends HistoryItem = HistoryItem> {
  (e: 'item-click', item: T): void
  (e: 'item-title-change', newTitle: string, item: T): void
  (e: 'item-action', action: HistoryMenuItem, item: T): void
}

export type ChatConversationPanelProps = BubbleListProps & BubbleProviderProps

export interface ChatConversationPanelSlots extends BubbleListSlots {
  empty?: () => VNode[]
}

export interface ChatConversationPanelEmits {
  (e: 'state-change', payload: { key: string; value: unknown; messageIndex: number; contentIndex: number }): void
}

export type ChatSenderPanelProps = SenderProps

export type ChatSenderPanelSlots = SenderSlots

export type ChatSenderPanelEmits = SenderEmits
