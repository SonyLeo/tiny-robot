import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import type { ChatAppearanceConfig } from './core'

export type ChatWorkspaceRegionKey = 'left' | 'right'

export type ChatWorkspacePanelWidth = 'sm' | 'md' | 'lg' | number

export type ChatWorkspaceBuiltInPanelKind = 'history' | 'mcp' | 'notebook' | 'outline' | 'sources' | 'custom'

export type ChatWorkspaceComposerDockMode = 'bottom' | 'floating-bottom'

export interface ChatWorkspacePanelDefinition {
  id: string
  kind?: ChatWorkspaceBuiltInPanelKind
  label?: string
  description?: string
  title?: string
  closable?: boolean
  defaultOpen?: boolean
}

export interface ChatWorkspaceRegionConfig {
  enabled?: boolean
  collapsible?: boolean
  defaultOpen?: boolean
  collapseMode?: 'rail' | 'hidden'
  width?: ChatWorkspacePanelWidth
  panels?: ChatWorkspacePanelDefinition[]
  activePanelId?: string
}

export interface ChatWorkspaceShellTopBarConfig {
  enabled?: boolean
}

export interface ChatWorkspaceCenterLayoutConfig {
  header?: boolean
  composerDock?: ChatWorkspaceComposerDockMode
}

export interface ChatWorkspaceViewStateConfig {
  fullWidth?: boolean
}

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

export interface ChatConversationTurnNavigationItem extends ChatContentNavigationItem {
  messageIndex: number
  role: 'user'
}

export interface ChatAssistantOutlineItem extends ChatContentNavigationItem {
  headingId: string
  level: 1 | 2 | 3 | 4
}

export interface ChatWorkspaceShellConfig {
  appearance?: ChatAppearanceConfig
  leftRegion?: ChatWorkspaceRegionConfig
  rightRegion?: ChatWorkspaceRegionConfig
  topBar?: ChatWorkspaceShellTopBarConfig
  centerLayout?: ChatWorkspaceCenterLayoutConfig
  viewState?: ChatWorkspaceViewStateConfig
  contentNavigation?: ChatContentNavigationConfig
}

export interface TrChatWorkspaceShellProps extends ChatWorkspaceShellConfig {
  badge?: string
  title?: string
  description?: string
  leftCollapsed?: boolean
  rightCollapsed?: boolean
  leftRailLabel?: string
  rightRailLabel?: string
}

export interface TrChatContentNavigationHostProps extends ChatContentNavigationConfig {
  items: ChatContentNavigationItem[]
  activeItemId?: string
  minItems?: number
  title?: string
  subtitle?: string
}

export interface TrChatConversationTurnNavigationProps {
  enabled?: boolean
  messages: ChatMessage[]
  scrollContainer?: HTMLElement | null
  activeMessageIndex?: number
  minItems?: number
  topOffset?: number
  title?: string
  subtitle?: string
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

export interface ChatWorkspacePanelHostItem {
  id: string
  label: string
  description?: string
}

export interface TrChatWorkspacePanelHostProps {
  title?: string
  subtitle?: string
  items: ChatWorkspacePanelHostItem[]
  modelValue?: string
  activePanelId?: string
  defaultActivePanelId?: string
}
