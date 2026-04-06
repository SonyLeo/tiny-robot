<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { createContentNavFlashFeedback, defaultContentNavSearchMatcher } from './defaults'
import { useContentNavRegistry } from './useContentNavRegistry'
import { useContentNavScrollSpy } from './useContentNavScrollSpy'
import { useContentNavState } from './useContentNavState'
import { useContentNavScrollContainer } from './useScrollContainerContext'
import type { ContentNavEmits, ContentNavProps, ContentNavSlots } from './index.type'

defineOptions({ name: 'TrContentNav' })

const props = withDefaults(defineProps<ContentNavProps>(), {
  placement: 'right',
  collapsible: true,
  searchable: true,
  minItems: 2,
  mobileBehavior: 'hidden',
  clearQueryOnCollapse: false,
  showTooltipOnTruncate: true,
  keyboardMode: 'basic',
  ariaLabel: 'Content navigation',
  searchPlaceholder: 'Search',
  emptyText: 'No matching items',
  floating: true,
  smoothScroll: true,
  jumpFeedback: () => createContentNavFlashFeedback(),
})

const emit = defineEmits<ContentNavEmits>()
defineSlots<ContentNavSlots>()

const fallbackRegistry = useContentNavRegistry()
const injectedScrollContainer = useContentNavScrollContainer()
const registry = computed(() => props.registry ?? fallbackRegistry)
const hostRef = ref<HTMLElement | null>(null)
const navRef = ref<HTMLElement | null>(null)
const focusedItemId = ref<string | null>(null)
const hoveredItemId = ref<string | null>(null)
const tooltipItemId = ref<string | null>(null)

const itemsRef = computed(() => props.items)
const activeIdRef = computed(() => props.activeId)
const expandedRef = computed(() => props.expanded)
const queryRef = computed(() => props.query)
const matcherRef = computed(() => props.matcher ?? defaultContentNavSearchMatcher)
const scrollContainerRef = computed(() => props.scrollContainer ?? injectedScrollContainer.value ?? null)

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
  matcher: matcherRef,
  searchable: computed(() => props.searchable),
  collapsible: computed(() => props.collapsible),
  clearQueryOnCollapse: computed(() => props.clearQueryOnCollapse),
  keyboardMode: computed(() => props.keyboardMode),
  onUpdateExpanded: (value) => emit('update:expanded', value),
  onUpdateQuery: (value) => emit('update:query', value),
})

const shouldRender = computed(() => props.items.length >= props.minItems)
const rootClass = computed(() => [
  'tr-content-nav',
  `is-${props.placement}`,
  {
    'is-expanded': state.expanded.value,
    'is-floating': props.floating,
    'is-inline': !props.floating,
    'is-mobile-hidden': props.mobileBehavior === 'hidden',
    'is-mobile-inline': props.mobileBehavior !== 'hidden',
  },
])
const floatingStyle = computed(() => ({
  transform: props.floating ? `translate3d(0, ${scrollSpy.floatingOffset.value}px, 0)` : undefined,
}))

function setExpanded(value: boolean) {
  state.setExpanded(value)
}

function setQuery(value: string) {
  state.setQuery(value)
}

function isTextTruncated(element: HTMLElement | null | undefined) {
  return Boolean(element && element.scrollWidth > element.clientWidth)
}

function updateTooltipState(event: MouseEvent | FocusEvent, itemId: string) {
  if (!props.showTooltipOnTruncate) {
    tooltipItemId.value = null
    return
  }

  const currentTarget = event.currentTarget as HTMLElement | null
  const labelEl = currentTarget?.querySelector<HTMLElement>('.tr-content-nav__item-label')
  tooltipItemId.value = isTextTruncated(labelEl) ? itemId : null
}

function clearTooltipState(itemId: string) {
  if (tooltipItemId.value === itemId) {
    tooltipItemId.value = null
  }
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

      navRef.value?.querySelector<HTMLElement>(`[data-item-id="${id}"]`)?.focus()
    })
  }
}

watch(
  () => state.expanded.value,
  (expanded) => {
    if (!expanded) {
      tooltipItemId.value = null
      hoveredItemId.value = null
      focusedItemId.value = null
    }
  },
)
</script>

<template>
  <div v-if="shouldRender" ref="hostRef" :class="rootClass" :style="floatingStyle" data-testid="content-nav">
    <nav
      ref="navRef"
      class="tr-content-nav__surface"
      :aria-label="props.ariaLabel"
      @mouseenter="setExpanded(true)"
      @mouseleave="setExpanded(false)"
      @focusin="setExpanded(true)"
      @focusout="
        (event) => {
          const next = event.relatedTarget as Node | null
          if (!next || !navRef?.contains(next)) {
            setExpanded(false)
          }
        }
      "
      @keydown="handleKeydown"
    >
      <div v-if="props.searchable && state.expanded.value" class="tr-content-nav__search-shell">
        <slot name="search" :query="state.query.value" :setQuery="setQuery">
          <input
            class="tr-content-nav__search"
            type="search"
            :value="state.query.value"
            :placeholder="props.searchPlaceholder"
            data-testid="content-nav-search"
            @input="setQuery(($event.target as HTMLInputElement).value)"
          />
        </slot>
      </div>

      <ul class="tr-content-nav__list" role="list">
        <li
          v-if="state.expanded.value && state.filteredItems.value.length === 0"
          class="tr-content-nav__empty"
          aria-live="polite"
        >
          <slot name="empty">{{ props.emptyText }}</slot>
        </li>
        <li
          v-for="(entry, index) in state.filteredItems.value"
          :key="entry.item.id"
          class="tr-content-nav__list-item"
          :class="{
            'is-active': entry.item.id === scrollSpy.activeId.value,
            'is-highlighted': props.keyboardMode === 'roving' && index === state.highlightedIndex.value,
            'is-tooltip-visible': tooltipItemId === entry.item.id,
          }"
          :data-tooltip="entry.item.tooltipText || entry.item.label"
        >
          <button
            type="button"
            class="tr-content-nav__item"
            :class="{ 'is-disabled': entry.item.disabled }"
            :data-item-id="entry.item.id"
            :aria-current="entry.item.id === scrollSpy.activeId.value ? 'location' : undefined"
            :disabled="entry.item.disabled"
            :tabindex="props.keyboardMode === 'roving' ? (index === state.highlightedIndex.value ? 0 : -1) : 0"
            @mouseenter="
              (event) => {
                hoveredItemId = entry.item.id
                updateTooltipState(event, entry.item.id)
              }
            "
            @mouseleave="
              () => {
                hoveredItemId = null
                clearTooltipState(entry.item.id)
              }
            "
            @focus="
              (event) => {
                focusedItemId = entry.item.id
                updateTooltipState(event, entry.item.id)
              }
            "
            @blur="
              () => {
                focusedItemId = null
                clearTooltipState(entry.item.id)
              }
            "
            @click="handleSelect(entry.item.id)"
          >
            <slot name="marker" :item="entry.item" :active="entry.item.id === scrollSpy.activeId.value">
              <span class="tr-content-nav__marker" />
            </slot>
            <slot
              name="item"
              :item="entry.item"
              :segments="entry.segments"
              :active="entry.item.id === scrollSpy.activeId.value"
              :expanded="state.expanded.value"
              :highlighted="focusedItemId === entry.item.id || hoveredItemId === entry.item.id"
            >
              <span class="tr-content-nav__item-label">
                <template v-for="(segment, segmentIndex) in entry.segments" :key="`${entry.item.id}-${segmentIndex}`">
                  <mark v-if="segment.highlighted" class="tr-content-nav__highlight">{{ segment.text }}</mark>
                  <template v-else>{{ segment.text }}</template>
                </template>
              </span>
            </slot>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style lang="less" scoped>
.tr-content-nav {
  pointer-events: none;
  z-index: var(--tr-z-index-fixed);
}

.tr-content-nav.is-floating {
  position: absolute;
  top: 0;
  bottom: 0;
}

.tr-content-nav.is-floating.is-right {
  right: 0;
}

.tr-content-nav.is-floating.is-left {
  left: 0;
}

.tr-content-nav.is-inline {
  position: relative;
}

.tr-content-nav__surface {
  width: var(--tr-content-nav-width-collapsed);
  border-radius: var(--tr-content-nav-surface-radius);
  pointer-events: auto;
  transition:
    width 0.22s ease,
    background-color 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}

.tr-content-nav.is-expanded .tr-content-nav__surface {
  width: var(--tr-content-nav-width-expanded);
  background: var(--tr-content-nav-bg);
  border: 1px solid var(--tr-content-nav-border);
  box-shadow: var(--tr-content-nav-shadow);
}

.tr-content-nav__search-shell {
  padding: 10px 10px 6px;
}

.tr-content-nav__search {
  width: 100%;
  box-sizing: border-box;
  height: 32px;
  border: 1px solid var(--tr-content-nav-search-border);
  border-radius: var(--tr-content-nav-search-radius);
  background: var(--tr-content-nav-search-bg);
  color: var(--tr-content-nav-search-color);
  padding: 0 10px;
  outline: none;
}

.tr-content-nav__search:focus {
  border-color: var(--tr-content-nav-search-border-focus);
  box-shadow: 0 0 0 3px var(--tr-content-nav-search-focus-ring);
}

.tr-content-nav__list {
  list-style: none;
  margin: 0;
  padding: 6px 0;
}

.tr-content-nav__empty {
  padding: 20px 12px;
  color: var(--tr-content-nav-empty-color);
  font-size: var(--tr-font-size-sm);
  text-align: center;
}

.tr-content-nav__list-item {
  position: relative;
}

.tr-content-nav__list-item::after {
  content: attr(data-tooltip);
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: var(--tr-z-index-tooltip);
  width: min(280px, 55vw);
  opacity: 0;
  pointer-events: none;
  padding: 6px 12px;
  border-radius: var(--tr-radius-md);
  background: var(--tr-content-nav-tooltip-bg);
  color: var(--tr-content-nav-tooltip-color);
  box-shadow: var(--tr-content-nav-tooltip-shadow);
  transition: opacity 0.15s ease;
  font-size: var(--tr-font-size-sm);
  line-height: 1.5;
  white-space: normal;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.tr-content-nav.is-right .tr-content-nav__list-item::after {
  right: calc(100% + 8px);
}

.tr-content-nav.is-left .tr-content-nav__list-item::after {
  left: calc(100% + 8px);
}

.tr-content-nav__list-item.is-tooltip-visible::after {
  opacity: 1;
}

.tr-content-nav__item {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: 0;
  border-radius: var(--tr-content-nav-item-radius);
  background: transparent;
  color: var(--tr-content-nav-item-color);
  cursor: pointer;
  text-align: left;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.tr-content-nav.is-right .tr-content-nav__item {
  justify-content: flex-end;
  text-align: right;
}

.tr-content-nav.is-left .tr-content-nav__item {
  justify-content: flex-start;
}

.tr-content-nav__item:hover,
.tr-content-nav__item:focus-visible,
.tr-content-nav__list-item.is-highlighted .tr-content-nav__item {
  background: var(--tr-content-nav-item-bg-hover);
}

.tr-content-nav__item:focus-visible {
  outline: 2px solid var(--tr-content-nav-focus-ring);
  outline-offset: 0;
}

.tr-content-nav__item.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tr-content-nav__marker {
  width: var(--tr-content-nav-marker-size);
  min-width: var(--tr-content-nav-marker-size);
  height: var(--tr-content-nav-marker-size);
  border-radius: var(--tr-radius-full);
  background: var(--tr-content-nav-marker-color);
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.tr-content-nav__list-item.is-active .tr-content-nav__marker {
  background: var(--tr-content-nav-marker-color-active);
  transform: scale(1.25);
}

.tr-content-nav__item-label {
  flex: 1;
  overflow: hidden;
  max-width: 0;
  opacity: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition:
    max-width 0.22s ease,
    opacity 0.18s ease,
    color 0.18s ease;
}

.tr-content-nav.is-expanded .tr-content-nav__item-label,
.tr-content-nav.is-mobile-inline .tr-content-nav__item-label {
  max-width: calc(var(--tr-content-nav-width-expanded) - 48px);
  opacity: 1;
}

.tr-content-nav__list-item.is-active .tr-content-nav__item-label {
  color: var(--tr-content-nav-item-color-active);
}

.tr-content-nav__highlight {
  color: var(--tr-content-nav-highlight-color);
  background: transparent;
  font-weight: var(--tr-font-weight-semibold);
}

@media (max-width: 960px) {
  .tr-content-nav.is-mobile-hidden {
    display: none;
  }

  .tr-content-nav.is-mobile-inline {
    position: static;
    width: 100%;
    transform: none !important;
    margin-bottom: 12px;
  }

  .tr-content-nav.is-mobile-inline .tr-content-nav__surface {
    width: 100%;
    background: var(--tr-content-nav-bg);
    border: 1px solid var(--tr-content-nav-border);
    box-shadow: var(--tr-content-nav-shadow);
  }
}
</style>
