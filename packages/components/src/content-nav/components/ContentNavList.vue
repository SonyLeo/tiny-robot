<script setup lang="ts">
import ContentNavItem from './ContentNavItem.vue'
import type {
  ContentNavFilteredItem,
  ContentNavItem as ContentNavItemType,
  ContentNavKeyboardMode,
  ContentNavPlacement,
} from '../index.type'

defineOptions({ name: 'ContentNavList' })

defineProps<{
  items: ContentNavFilteredItem[]
  activeId?: string
  expanded: boolean
  highlightedIndex: number
  keyboardMode: ContentNavKeyboardMode
  placement: ContentNavPlacement
  emptyText: string
  showTooltipOnTruncate: boolean
}>()

const emit = defineEmits<{
  select: [item: ContentNavItemType]
}>()

defineSlots<{
  item?: (slotProps: {
    item: ContentNavItemType
    segments: ContentNavFilteredItem['segments']
    active: boolean
    expanded: boolean
    highlighted: boolean
  }) => unknown
  marker?: (slotProps: { item: ContentNavItemType; active: boolean }) => unknown
  empty?: () => unknown
}>()
</script>

<template>
  <ul class="tr-content-nav__list" role="list">
    <li v-if="expanded && items.length === 0" class="tr-content-nav__empty" aria-live="polite">
      <slot name="empty">{{ emptyText }}</slot>
    </li>

    <ContentNavItem
      v-for="(entry, index) in items"
      :key="entry.item.id"
      :entry="entry"
      :active-id="activeId"
      :expanded="expanded"
      :highlighted="index === highlightedIndex"
      :keyboard-mode="keyboardMode"
      :placement="placement"
      :show-tooltip-on-truncate="showTooltipOnTruncate"
      @select="emit('select', $event)"
    >
      <template v-if="$slots.item" #item="slotProps">
        <slot name="item" v-bind="slotProps" />
      </template>

      <template v-if="$slots.marker" #marker="slotProps">
        <slot name="marker" v-bind="slotProps" />
      </template>
    </ContentNavItem>
  </ul>
</template>

<style lang="less" scoped>
.tr-content-nav {
  &__list {
    position: relative;
    z-index: 1;
    list-style: none;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 6px 0;
  }

  &__empty {
    padding: 20px 12px;
    color: var(--tr-content-nav-empty-color);
    font-size: var(--tr-font-size-sm);
    text-align: center;
  }
}
</style>
