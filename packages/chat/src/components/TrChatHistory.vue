<script setup lang="ts">
import { inject, provide } from 'vue'
import { CHAT_UI_KEY, CHAT_HISTORY_KEY } from '../context'
import { useHistoryState } from '../composables/useHistoryState'
import TrChatHistoryHeader from './TrChatHistoryHeader.vue'
import TrChatHistorySearch from './TrChatHistorySearch.vue'
import TrChatHistoryList from './TrChatHistoryList.vue'
import TrChatHistoryPanel from './TrChatHistoryPanel.vue'

const { showHistoryDrawer } = inject(CHAT_UI_KEY)!

// 创建并 provide 历史面板状态
const historyState = useHistoryState()
provide(CHAT_HISTORY_KEY, historyState)
</script>

<template>
  <!-- 遮罩层：点击关闭 Drawer -->
  <div class="tr-chat-drawer-overlay" :class="{ 'is-open': showHistoryDrawer }" @click="showHistoryDrawer = false" />

  <!-- Drawer 面板 -->
  <div class="tr-chat-drawer" :class="{ 'is-open': showHistoryDrawer }">
    <TrChatHistoryHeader />
    <TrChatHistorySearch />
    <!-- 列表区：管理模式下底部留出悬浮面板的空间 -->
    <TrChatHistoryList />
    <!-- 悬浮操作面板：仅管理模式下出现 -->
    <TrChatHistoryPanel />
  </div>
</template>
