<script setup lang="ts">
import { computed, nextTick, ref, useAttrs } from 'vue'
import ContentNavList from './components/ContentNavList.vue'
import ContentNavOverlay from './components/ContentNavOverlay.vue'
import ContentNavSearch from './components/ContentNavSearch.vue'
import { useContentNavRegistry } from './useContentNavRegistry'
import { useContentNavScrollSpy } from './useContentNavScrollSpy'
import { useContentNavState } from './useContentNavState'
import type { ContentNavEmits, ContentNavProps, ContentNavSearchOptions, ContentNavSlots } from './index.type'

defineOptions({
  name: 'TrContentNav',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ContentNavProps>(), {
  placement: 'right',
  emptyText: 'No matching items',
})

const emit = defineEmits<ContentNavEmits>()
defineSlots<ContentNavSlots>()
const attrs = useAttrs()

const fallbackRegistry = useContentNavRegistry()
const overlayShellRef = ref<{
  hostEl: HTMLElement | null
  overlayEl: HTMLElement | null
  navEl: HTMLElement | null
} | null>(null)

const itemsRef = computed(() => props.items)
const activeIdRef = computed(() => props.activeId)
const expandedRef = computed(() => props.expanded)
const queryRef = computed(() => props.query)
const registry = computed(() => props.registry ?? fallbackRegistry)
const scrollContainerRef = computed(() => props.scrollContainer ?? null)
const hostRef = computed(() => overlayShellRef.value?.hostEl ?? null)
const searchOptions = computed<ContentNavSearchOptions | false>(() => props.search ?? false)
const resolvedSearchOptions = computed(() => (searchOptions.value ? searchOptions.value : undefined))
const searchSlotOptions = computed<ContentNavSearchOptions>(() => resolvedSearchOptions.value ?? {})

const scrollSpy = useContentNavScrollSpy({
  items: itemsRef,
  registry,
  container: scrollContainerRef,
  host: hostRef,
  activeId: activeIdRef,
  onUpdateActiveId: (value) => emit('update:activeId', value),
})

const state = useContentNavState({
  items: itemsRef,
  activeId: scrollSpy.activeId,
  expanded: expandedRef,
  query: queryRef,
  search: computed(() => searchOptions.value),
  onUpdateExpanded: (value) => emit('update:expanded', value),
  onUpdateQuery: (value) => emit('update:query', value),
})

const shouldRender = computed(() => props.items.length > 0)
const hasSearchSection = computed(() => Boolean(resolvedSearchOptions.value) && state.expanded.value)

function setExpanded(value: boolean) {
  state.setExpanded(value)
}

function setQuery(value: string) {
  state.setQuery(value)
}

function handleSelect(itemId: string) {
  const target = props.items.find((item) => item.id === itemId)
  if (!target) {
    return
  }

  scrollSpy.scrollTo(itemId)
  emit('select', target)
  emit('activate', target)
}

function isEditableEventTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  )
}

function handleKeydown(event: KeyboardEvent) {
  if (isEditableEventTarget(event.target)) {
    return
  }

  const handled = state.handleKeydown(event)

  if (event.key === 'Enter' || event.key === ' ') {
    const target = state.activateHighlighted()
    if (target) {
      event.preventDefault()
      handleSelect(target.id)
      return
    }
  }

  if (handled) {
    nextTick(() => {
      const id = state.highlightedId.value
      if (!id) {
        return
      }

      const escapedId = typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(id) : id
      overlayShellRef.value?.navEl?.querySelector<HTMLElement>(`[data-item-id="${escapedId}"]`)?.focus()
    })
  }
}

function handleMouseLeave() {
  const overlayEl = overlayShellRef.value?.overlayEl ?? null
  const activeElement = document.activeElement

  if (overlayEl && activeElement instanceof Node && overlayEl.contains(activeElement)) {
    return
  }

  setExpanded(false)
}

function handleFocusOut(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  const overlayEl = overlayShellRef.value?.overlayEl ?? null
  if (!next || !overlayEl?.contains(next)) {
    setExpanded(false)
  }
}
</script>

<template>
  <ContentNavOverlay
    v-if="shouldRender"
    ref="overlayShellRef"
    v-bind="attrs"
    :expanded="state.expanded.value"
    :placement="props.placement"
    :floating-offset="scrollSpy.floatingOffset.value"
    @mouseenter="setExpanded(true)"
    @mouseleave="handleMouseLeave"
    @focusin="setExpanded(true)"
    @focusout="handleFocusOut"
    @keydown="handleKeydown"
  >
    <template v-if="hasSearchSection" #search>
      <slot name="search" :query="state.query.value" :setQuery="setQuery" :options="searchSlotOptions">
        <ContentNavSearch :query="state.query.value" :options="searchSlotOptions" @update:query="setQuery" />
      </slot>
    </template>

    <ContentNavList
      :items="state.filteredItems.value"
      :active-id="scrollSpy.activeId.value"
      :expanded="state.expanded.value"
      :highlighted-index="state.highlightedIndex.value"
      :placement="props.placement"
      :empty-text="props.emptyText"
      @select="handleSelect($event.id)"
    >
      <template v-if="$slots.marker" #marker="slotProps">
        <slot name="marker" v-bind="slotProps" />
      </template>

      <template v-if="$slots.item" #item="slotProps">
        <slot name="item" v-bind="slotProps" />
      </template>

      <template v-if="$slots.empty" #empty>
        <slot name="empty" />
      </template>
    </ContentNavList>
  </ContentNavOverlay>
</template>
