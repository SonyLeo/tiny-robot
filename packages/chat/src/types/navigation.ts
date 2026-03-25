export type ChatContentNavigationPlacement = 'left' | 'right'

export interface ChatContentNavigationConfig {
  enabled?: boolean
  placement?: ChatContentNavigationPlacement
}

export interface ChatContentNavigationItem {
  id: string
  label: string
  description?: string
  level?: number
}

export interface ChatAssistantOutlineItem extends ChatContentNavigationItem {
  headingId: string
  level: 1 | 2 | 3 | 4
}

export interface TrChatAssistantOutlineProps {
  enabled?: boolean
  scrollContainer?: HTMLElement | null
  minItems?: number
  topOffset?: number
}

export interface TrChatAssistantOutlineTriggerProps {
  role?: string
  messageIndexes?: number[]
}
