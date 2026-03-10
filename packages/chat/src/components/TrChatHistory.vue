<script setup lang="ts">
import { inject, computed, ref } from 'vue'
import { syncRef } from '@vueuse/core'
import type { HistoryItem, HistoryMenuItem } from '@opentiny/tiny-robot'
import { TrHistory } from '@opentiny/tiny-robot'
import { CHAT_KIT_KEY, CHAT_UI_KEY } from '../context'

// 支持透传完整 TrHistory props
defineOptions({ inheritAttrs: false })

// 内联 composable - 仅在此组件使用
const chatKit = inject(CHAT_KIT_KEY)!
const { showHistoryDrawer } = inject(CHAT_UI_KEY)!

// 将 conversations 转换为 HistoryItem 格式
const historyDataComputed = computed<HistoryItem[]>(() => {
  return chatKit.conversations.value.map((conv) => ({
    id: conv.id,
    title: conv.title || '新对话',
  }))
})

const historyData = ref<HistoryItem[]>([])

// 使用 syncRef 从 computed 同步到 ref（ltr 方向）
syncRef(historyDataComputed, historyData, { direction: 'ltr' })

async function handleItemClick(item: HistoryItem) {
  try {
    await chatKit.switchConversation(item.id!)
    showHistoryDrawer.value = false
  } catch (e) {
    console.error('[TrChatHistory] 切换会话失败', e)
  }
}

function handleItemTitleChange(newTitle: string, item: HistoryItem) {
  chatKit.updateConversationTitle(item.id!, newTitle)
}

async function handleItemAction(action: HistoryMenuItem, item: HistoryItem) {
  if (action.id === 'delete') {
    await chatKit.deleteConversation(item.id!)
  }
}

const activeConversationId = chatKit.activeConversationId
</script>

<template>
  <!-- 遮罩层：点击关闭 Drawer -->
  <div class="tr-chat-drawer-overlay" :class="{ 'is-open': showHistoryDrawer }" @click="showHistoryDrawer = false" />

  <!-- Drawer 面板 -->
  <div class="tr-chat-drawer" :class="{ 'is-open': showHistoryDrawer }">
    <TrHistory
      :data="historyData"
      :selected="activeConversationId ?? undefined"
      v-bind="$attrs"
      @item-click="handleItemClick"
      @item-title-change="handleItemTitleChange"
      @item-action="handleItemAction"
    />
  </div>
</template>
