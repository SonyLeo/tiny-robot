import type { MaybeRefOrGetter } from 'vue'
import type { LayoutAsideConfig, LayoutAsideMode, LayoutPlacement } from './index.type'

export interface LayoutPanelApi {
  placement: LayoutPlacement
  layoutMode: LayoutAsideMode
  isExpanded: boolean
  isDock: boolean
  isDrawer: boolean
  isRail: boolean
  isHidden: boolean
  canResize: boolean
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

export interface LayoutStore {
  left: LayoutPanelApi
  right: LayoutPanelApi
  isDrawerVisible: boolean
  closeDrawers: () => void
}

export interface LayoutAsideStoreInput {
  layoutMode?: MaybeRefOrGetter<LayoutAsideConfig['layoutMode'] | undefined>
  expanded?: MaybeRefOrGetter<LayoutAsideConfig['expanded'] | undefined>
  expandedWidth?: MaybeRefOrGetter<LayoutAsideConfig['expandedWidth'] | undefined>
  collapsedWidth?: MaybeRefOrGetter<LayoutAsideConfig['collapsedWidth'] | undefined>
  resizable?: MaybeRefOrGetter<LayoutAsideConfig['resizable'] | undefined>
  minExpandedWidth?: MaybeRefOrGetter<LayoutAsideConfig['minExpandedWidth'] | undefined>
  maxExpandedWidth?: MaybeRefOrGetter<LayoutAsideConfig['maxExpandedWidth'] | undefined>
  onUpdate?: (nextConfig: LayoutAsideConfig) => void
}

export interface CreateLayoutStoreOptions {
  left?: LayoutAsideStoreInput
  right?: LayoutAsideStoreInput
}
