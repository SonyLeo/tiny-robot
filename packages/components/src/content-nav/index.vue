<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import ContentNavList from './components/ContentNavList.vue'
import ContentNavOverlay from './components/ContentNavOverlay.vue'
import ContentNavSearch from './components/ContentNavSearch.vue'
import { createContentNavFlashFeedback } from './defaults'
import { useContentNavRegistry } from './useContentNavRegistry'
import { useContentNavScrollSpy } from './useContentNavScrollSpy'
import { useContentNavState } from './useContentNavState'
import { useContentNavScrollContainer } from './useScrollContainerContext'
import type { ContentNavEmits, ContentNavProps, ContentNavSearchOptions, ContentNavSlots } from './index.type'

defineOptions({ name: 'TrContentNav' })

const props = withDefaults(defineProps<ContentNavProps>(), {
  placement: 'right',
  collapsible: true,
  minItems: 2,
  mobileBehavior: 'hidden',
  showTooltipOnTruncate: true,
  keyboardMode: 'basic',
  ariaLabel: 'Content navigation',
  emptyText: 'No matching items',
  floating: true,
  smoothScroll: true,
  jumpFeedback: () => createContentNavFlashFeedback(),
})

const emit = defineEmits<ContentNavEmits>()
defineSlots<ContentNavSlots>()

const fallbackRegistry = useContentNavRegistry()
const injectedScrollContainer = useContentNavScrollContainer()
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
const scrollContainerRef = computed(() => props.scrollContainer ?? injectedScrollContainer.value ?? null)
const hostRef = computed(() => overlayShellRef.value?.hostEl ?? null)
const searchOptions = computed<ContentNavSearchOptions | false>(() => props.search ?? false)
const resolvedSearchOptions = computed(() => (searchOptions.value ? searchOptions.value : undefined))
const searchSlotOptions = computed<ContentNavSearchOptions>(() => resolvedSearchOptions.value ?? {})

const scrollSpy = useContentNavScrollSpy({
  items: itemsRef,
  registry: registry.value,
  container: scrollContainerRef,
  host: hostRef,
  activeId: activeIdRef,
  onUpdateActiveId: (value) => emit('update:activeId', value),
  resolveActive: computed(() => props.resolveActive),
  jumpOffset: computed(() => props.jumpOffset),
  smoothScroll: computed(() => props.smoothScroll),
  jumpFeedback: computed(() => props.jumpFeedback),
})

const state = useContentNavState({
  items: itemsRef,
  activeId: scrollSpy.activeId,
  expanded: expandedRef,
  query: queryRef,
  search: computed(() => searchOptions.value),
  collapsible: computed(() => props.collapsible),
  keyboardMode: computed(() => props.keyboardMode),
  onUpdateExpanded: (value) => emit('update:expanded', value),
  onUpdateQuery: (value) => emit('update:query', value),
})

const shouldRender = computed(() => props.items.length >= props.minItems)
const hasSearchSection = computed(() => Boolean(resolvedSearchOptions.value) && state.expanded.value)

function setExpanded(value: boolean) {
  state.setExpanded(value)
}

function setQuery(value: string) {
  state.setQuery(value)
}

function handleSelect(itemId: string) {
  const target = props.items.find((item) => item.id === itemId)
  if (!target || target.disabled) {
    return
  }

  scrollSpy.scrollTo(itemId)
  emit('select', target)
  emit('activate', target)
}

function handleKeydown(event: KeyboardEvent) {
  const handled = state.handleKeydown(event)

  if (event.key === 'Enter' || event.key === ' ') {
    const target = state.activateHighlighted()
    if (target) {
      event.preventDefault()
      handleSelect(target.id)
      return
    }
  }

  if (handled && props.keyboardMode === 'roving') {
    nextTick(() => {
      const id = state.highlightedId.value
      if (!id) {
        return
      }

      overlayShellRef.value?.navEl?.querySelector<HTMLElement>(`[data-item-id="${id}"]`)?.focus()
    })
  }
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
    :expanded="state.expanded.value"
    :placement="props.placement"
    :floating="props.floating"
    :mobile-behavior="props.mobileBehavior"
    :aria-label="props.ariaLabel"
    :floating-offset="scrollSpy.floatingOffset.value"
    @mouseenter="setExpanded(true)"
    @mouseleave="setExpanded(false)"
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
      :keyboard-mode="props.keyboardMode ?? 'basic'"
      :placement="props.placement"
      :empty-text="props.emptyText"
      :show-tooltip-on-truncate="props.showTooltipOnTruncate"
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
