<script setup lang="ts">
import { shallowRef } from 'vue'
import type { HistoryItem } from '@opentiny/tiny-robot'
import { Chat } from '@/index'

type DemoHistoryItem = HistoryItem & {
  id: string
  title: string
}

const selectedId = shallowRef('runtime')

const historyData = [
  {
    group: '今天',
    items: [
      { id: 'runtime', title: 'Runtime 编排建议' },
      { id: 'layout', title: 'Layout shell baseline' },
    ],
  },
  {
    group: '更早',
    items: [
      { id: 'history', title: 'History 透传边界' },
      { id: 'sender', title: 'Sender 扩展入口' },
    ],
  },
] satisfies Array<{ group: string; items: DemoHistoryItem[] }>

function handleItemClick(item: HistoryItem): void {
  if (item.id) {
    selectedId.value = item.id
  }
}
</script>

<template>
  <section class="demo-sidebar-content-area">
    <Chat.HistoryList :data="historyData" :selected="selectedId" @item-click="handleItemClick" />
  </section>
</template>

<style scoped>
.demo-sidebar-content-area {
  min-height: 0;
}
</style>
