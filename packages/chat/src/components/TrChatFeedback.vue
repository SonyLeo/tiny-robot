<script setup lang="ts">
import { TrFeedback } from '@opentiny/tiny-robot'
import type { BubbleMessage } from '@opentiny/tiny-robot'
import { computed, inject } from 'vue'
import { useChatFeedback } from '../composables/useChatFeedback'
import { CHAT_KIT_KEY } from '../context'
import type { UseChatKitReturn } from '../types'

const props = defineProps<{
  messages: BubbleMessage[]
  messageIndexes: number[]
  role?: string
}>()

const emit = defineEmits<{
  edit: [content: string]
}>()

const chatKit = inject<UseChatKitReturn | null>(CHAT_KIT_KEY, null)

const { feedbackActions, handleCopyAction, handleRefreshAction, userContent } = useChatFeedback({
  messages: props.messages,
  messageIndexes: props.messageIndexes,
  role: props.role,
  chatKit,
})

// 检查当前消息是否在编辑态
const isEditing = computed(() => {
  if (!chatKit || !props.messageIndexes?.length) return false
  return chatKit.isMessageEditing(props.messageIndexes[0])
})

function handleAction(name: string) {
  if (name === 'copy') {
    handleCopyAction()
  } else if (name === 'edit') {
    // 使用 chatKit API 进入编辑态
    if (chatKit && props.messageIndexes?.length) {
      chatKit.startEditMessage(props.messageIndexes[0])
    }
    emit('edit', userContent.value)
  } else if (name === 'refresh') {
    if (handleRefreshAction()) {
      emit('edit', userContent.value)
    }
  }
}
</script>

<template>
  <TrFeedback v-if="!isEditing" :actions="feedbackActions" @action="handleAction" />
</template>

<style scoped>
:deep(.tr-feedback .tr-feedback__operations) {
  justify-content: flex-start !important;
  padding: 0 2px;
}
</style>
