import type { Ref, VNode } from 'vue'

export interface ContentNavItem {
  id: string
  label: string
  searchText?: string
  tooltipText?: string
  level?: number
  disabled?: boolean
  meta?: Record<string, unknown>
}

export interface ContentNavHighlightSegment {
  text: string
  highlighted: boolean
}

export interface ContentNavRegistryEntry {
  id: string
  el: HTMLElement
}

export interface ContentNavRegistry {
  version: Readonly<Ref<number>>
  register: (id: string, el: HTMLElement | null) => void
  unregister: (id: string) => void
  get: (id: string) => HTMLElement | null
  getAll: () => ContentNavRegistryEntry[]
}

export type ContentNavSearchMatcher = (item: ContentNavItem, query: string) => false | ContentNavHighlightSegment[]

export type ContentNavActiveResolver = (options: {
  container: HTMLElement
  anchors: ContentNavRegistryEntry[]
  items: ContentNavItem[]
}) => string | undefined

export interface ContentNavJumpFeedbackController {
  apply: (el: HTMLElement) => void
  clear: (el: HTMLElement) => void
  duration?: number
}

export type ContentNavPlacement = 'left' | 'right'
export type ContentNavMobileBehavior = 'hidden' | 'inline' | 'drawer' | 'sheet'
export type ContentNavKeyboardMode = 'none' | 'basic' | 'roving'

export interface ContentNavFilteredItem {
  item: ContentNavItem
  segments: ContentNavHighlightSegment[]
}

export interface ContentNavSearchOptions {
  placeholder?: string
  matcher?: ContentNavSearchMatcher
  clearOnCollapse?: boolean
}

export interface ContentNavScrollSpyOptions {
  items: Ref<ContentNavItem[]>
  registry: ContentNavRegistry
  container: Ref<HTMLElement | null | undefined>
  host: Ref<HTMLElement | null | undefined>
  activeId?: Ref<string | undefined>
  onUpdateActiveId?: (value: string | undefined) => void
  resolveActive?: Ref<ContentNavActiveResolver | undefined>
  jumpOffset?: Ref<number | (() => number) | undefined>
  smoothScroll?: Ref<boolean | undefined>
  jumpFeedback?: Ref<ContentNavJumpFeedbackController | false | undefined>
}

export interface ContentNavStateOptions {
  items: Ref<ContentNavItem[]>
  activeId: Ref<string | undefined>
  expanded?: Ref<boolean | undefined>
  query?: Ref<string | undefined>
  search?: Ref<ContentNavSearchOptions | false | undefined>
  collapsible?: Ref<boolean | undefined>
  keyboardMode?: Ref<ContentNavKeyboardMode | undefined>
  onUpdateExpanded?: (value: boolean) => void
  onUpdateQuery?: (value: string) => void
}

export interface ContentNavProps {
  items: ContentNavItem[]
  registry?: ContentNavRegistry
  scrollContainer?: HTMLElement | null
  activeId?: string
  expanded?: boolean
  query?: string
  placement?: ContentNavPlacement
  collapsible?: boolean
  search?: false | ContentNavSearchOptions
  minItems?: number
  mobileBehavior?: ContentNavMobileBehavior
  showTooltipOnTruncate?: boolean
  keyboardMode?: ContentNavKeyboardMode
  ariaLabel?: string
  emptyText?: string
  floating?: boolean
  resolveActive?: ContentNavActiveResolver
  jumpOffset?: number | (() => number)
  smoothScroll?: boolean
  jumpFeedback?: ContentNavJumpFeedbackController | false
}

export interface ContentNavEmits {
  'update:activeId': [value: string | undefined]
  'update:expanded': [value: boolean]
  'update:query': [value: string]
  select: [item: ContentNavItem]
  activate: [item: ContentNavItem]
}

export interface ContentNavSlots {
  item?: (slotProps: {
    item: ContentNavItem
    segments: ContentNavHighlightSegment[]
    active: boolean
    expanded: boolean
    highlighted: boolean
  }) => VNode | VNode[]
  marker?: (slotProps: { item: ContentNavItem; active: boolean }) => VNode | VNode[]
  search?: (slotProps: {
    query: string
    setQuery: (value: string) => void
    options: ContentNavSearchOptions
  }) => VNode | VNode[]
  empty?: () => VNode | VNode[]
}
