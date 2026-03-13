<script setup lang="ts">
import { syncRef } from '@vueuse/core'
import { inject, computed, ref } from 'vue'
import { TrHistory } from '@opentiny/tiny-robot'
import type { HistoryItem, HistoryMenuItem } from '@opentiny/tiny-robot'
import { CHAT_HISTORY_KEY, CHAT_KIT_KEY, CHAT_UI_KEY } from '../../context'

// 职责：仅负责列表的渲染和事件处理
const historyState = inject(CHAT_HISTORY_KEY)!
const chatKit = inject(CHAT_KIT_KEY)!
const { showHistoryDrawer } = inject(CHAT_UI_KEY)!

// 搜索过滤
const filteredHistoryData = computed<HistoryItem[]>(() => {
  const data = chatKit.conversations.value.map((conv) => ({
    id: conv.id,
    title: conv.title || '新对话',
  }))

  if (!historyState.searchQuery.value) return data

  return data.filter((item) => item.title.toLowerCase().includes(historyState.searchQuery.value.toLowerCase()))
})

const historyData = ref<HistoryItem[]>([])

// 使用 syncRef 从 computed 同步到 ref（ltr 方向）
syncRef(filteredHistoryData, historyData, { direction: 'ltr' })

// 事件处理
async function handleItemClick(item: HistoryItem) {
  if (historyState.isManagementMode.value) {
    historyState.toggleItemSelection(item.id!)
    return
  }

  try {
    await chatKit.switchConversation(item.id!)
    showHistoryDrawer.value = false
  } catch (e) {
    console.error('[TrChatHistoryList] 切换会话失败', e)
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

const activeConversationId = computed<string | undefined>(() => {
  const id = chatKit.activeConversationId.value
  return id ?? undefined
})

// 检查 item 是否被选中
function isItemSelected(itemId: string): boolean {
  return historyState.selectedItems.value.includes(itemId)
}
</script>

<template>
  <div class="tr-chat-history-list" :class="{ compressed: historyState.isManagementMode.value }">
    <TrHistory
      :data="historyData"
      :selected="historyState.isManagementMode.value ? undefined : activeConversationId"
      @item-click="handleItemClick"
      @item-title-change="handleItemTitleChange"
      @item-action="handleItemAction"
    >
      <!-- 多选模式下显示复选框 -->
      <template v-if="historyState.isManagementMode.value" #item-prefix="{ item }">
        <input
          type="checkbox"
          :checked="isItemSelected(item.id!)"
          @change="historyState.toggleItemSelection(item.id!)"
          class="item-checkbox"
          :data-item-id="item.id"
        />
      </template>

      <!-- 自定义 item-title 以支持选中样式 -->
      <template #item-title="{ item }">
        <span class="item-title-text">{{ item.title }}</span>
      </template>
    </TrHistory>
  </div>
</template>

<style lang="less" scoped>
.tr-chat-history-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.3s ease;
  padding-right: 8px;

  &.compressed {
    padding-bottom: 10px;
  }

  // 修改 TrHistory item 的选中样式
  :deep(.tr-history__item) {
    margin: 8px auto;
    border: 2px solid transparent;

    // 检查 checkbox 是否被选中（通过相邻的 checkbox 状态）
    &:has(input[type='checkbox']:checked) {
      border: 2px solid var(--tr-color-primary);
      background-color: var(--tr-color-primary-light);
    }
  }

  // 管理模式下隐藏菜单按钮
  &.compressed :deep(.tr-history__item-actions > .menu) {
    display: none;
  }
}

.item-checkbox {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  cursor: pointer;
  accent-color: var(--tr-color-primary);
  flex-shrink: 0;

  &:hover {
    opacity: 0.8;
  }
}

.item-title-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
