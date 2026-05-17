<script setup lang="ts" generic="T extends HistoryItem">
import { TrHistory, type HistoryItem, type HistoryMenuItem } from '@opentiny/tiny-robot'
import { useAttrs } from 'vue'
import type { ChatHistoryListEmits, ChatHistoryListProps, ChatHistoryListSlots } from '@/types/ui'

defineOptions({
  name: 'ChatHistoryList',
  inheritAttrs: false,
})

const props = defineProps<ChatHistoryListProps<T>>()
const emit = defineEmits<ChatHistoryListEmits<T>>()
defineSlots<ChatHistoryListSlots<T>>()

const attrs = useAttrs()

function normalizeSlotProps(slotProps: { item: HistoryItem }): { item: T } {
  return {
    item: slotProps.item as T,
  }
}

function handleItemClick(item: HistoryItem): void {
  emit('item-click', item as T)
}

function handleItemTitleChange(newTitle: string, item: HistoryItem): void {
  emit('item-title-change', newTitle, item as T)
}

function handleItemAction(action: HistoryMenuItem, item: HistoryItem): void {
  emit('item-action', action, item as T)
}
</script>

<template>
  <TrHistory
    v-bind="attrs"
    class="tr-chat-history-list"
    :data="props.data"
    :selected="props.selected"
    :show-rename-controls="props.showRenameControls"
    :rename-control-on-click-outside="props.renameControlOnClickOutside"
    :menu-items="props.menuItems"
    :menu-list-gap="props.menuListGap"
    @item-click="handleItemClick"
    @item-title-change="handleItemTitleChange"
    @item-action="handleItemAction"
  >
    <template v-if="$slots['item-prefix']" #item-prefix="slotProps">
      <slot name="item-prefix" v-bind="normalizeSlotProps(slotProps)" />
    </template>

    <template v-if="$slots['item-title']" #item-title="slotProps">
      <slot name="item-title" v-bind="normalizeSlotProps(slotProps)" />
    </template>
  </TrHistory>
</template>
