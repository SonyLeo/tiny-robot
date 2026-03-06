<script setup lang="ts">
import { inject } from 'vue'
import { CHAT_KIT_KEY, CHAT_UI_KEY } from '../context'

interface Props {
  showHistory?: boolean
  showNewChat?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHistory: false,
  showNewChat: true,
})

const chatKit = inject(CHAT_KIT_KEY)!
const { showHistoryDrawer } = inject(CHAT_UI_KEY)!

function handleNewChat() {
  chatKit.createConversation()
}
</script>

<template>
  <div class="tr-chat__header">
    <!-- 左侧：历史按钮 -->
    <div class="tr-chat__header-left">
      <button
        v-if="props.showHistory"
        class="tr-chat__header-button"
        :title="showHistoryDrawer ? '关闭历史' : '打开历史'"
        @click="showHistoryDrawer = !showHistoryDrawer"
      >
        <slot name="history-icon">☰</slot>
      </button>
    </div>

    <!-- 中间：标题 slot -->
    <div class="tr-chat__header-title">
      <slot />
    </div>

    <!-- 右侧：新建按钮 + extra slot -->
    <div class="tr-chat__header-right">
      <slot name="extra" />
      <button v-if="props.showNewChat" class="tr-chat__header-button" title="新建对话" @click="handleNewChat">
        <slot name="new-chat-icon">✏️</slot>
      </button>
    </div>
  </div>
</template>
