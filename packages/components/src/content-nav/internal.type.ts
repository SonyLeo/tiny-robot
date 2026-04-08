import type { Ref } from 'vue'
import type {
  ContentNavHighlightSegment,
  ContentNavItem,
  ContentNavRegistry,
  ContentNavSearchOptions,
} from './index.type'

export interface ContentNavFilteredItem {
  item: ContentNavItem
  segments: ContentNavHighlightSegment[]
}

export interface ContentNavScrollSpyOptions {
  items: Ref<ContentNavItem[]>
  registry: Ref<ContentNavRegistry>
  container: Ref<HTMLElement | null | undefined>
  host: Ref<HTMLElement | null | undefined>
  activeId?: Ref<string | undefined>
  onUpdateActiveId?: (value: string | undefined) => void
}

export interface ContentNavStateOptions {
  items: Ref<ContentNavItem[]>
  activeId: Ref<string | undefined>
  expanded?: Ref<boolean | undefined>
  query?: Ref<string | undefined>
  search?: Ref<ContentNavSearchOptions | false | undefined>
  onUpdateExpanded?: (value: boolean) => void
  onUpdateQuery?: (value: string) => void
}
