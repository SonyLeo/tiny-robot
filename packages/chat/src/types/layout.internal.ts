import type { MaybeRefOrGetter } from 'vue'
import type { ChatAsideConfig, ChatAsideLayoutMode, ChatPlacement } from './layout'

// Runtime store types
export interface ChatLayoutPanelApi {
  placement: ChatPlacement
  layoutMode: ChatAsideLayoutMode
  isExpanded: boolean
  isDock: boolean
  isDrawer: boolean
  isRail: boolean
  isHidden: boolean
  expandedWidth: string
  collapsedWidth: string
  resizable: boolean
  minExpandedWidth: string
  maxExpandedWidth: string
  setExpandedWidth: (nextWidth: number) => void
  open: () => void
  close: () => void
  toggle: () => void
}

export interface ChatLayoutStore {
  left: ChatLayoutPanelApi
  right: ChatLayoutPanelApi
  isDrawerVisible: boolean
  closeDrawers: () => void
}

export interface ChatLayoutAsideStoreInput {
  layoutMode?: MaybeRefOrGetter<ChatAsideConfig['layoutMode'] | undefined>
  expanded?: MaybeRefOrGetter<ChatAsideConfig['expanded'] | undefined>
  expandedWidth?: MaybeRefOrGetter<ChatAsideConfig['expandedWidth'] | undefined>
  collapsedWidth?: MaybeRefOrGetter<ChatAsideConfig['collapsedWidth'] | undefined>
  resizable?: MaybeRefOrGetter<ChatAsideConfig['resizable'] | undefined>
  minExpandedWidth?: MaybeRefOrGetter<ChatAsideConfig['minExpandedWidth'] | undefined>
  maxExpandedWidth?: MaybeRefOrGetter<ChatAsideConfig['maxExpandedWidth'] | undefined>
  onUpdate?: (nextConfig: ChatAsideConfig) => void
}

export interface CreateChatLayoutStoreOptions {
  left?: ChatLayoutAsideStoreInput
  right?: ChatLayoutAsideStoreInput
}
