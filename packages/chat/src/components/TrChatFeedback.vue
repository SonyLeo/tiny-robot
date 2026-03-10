<script setup lang="ts">
import { TrFeedback } from '@opentiny/tiny-robot'
import type { BubbleMessage } from '@opentiny/tiny-robot'
import { useChatFeedback } from '../composables/useChatFeedback'

const props = defineProps<{
  messages: BubbleMessage[]
  messageIndexes: number[]
  role?: string
}>()

const emit = defineEmits<{
  edit: [content: string]
}>()

const { feedbackActions, handleCopyAction, handleRefreshAction, userContent } = useChatFeedback({
  messages: props.messages,
  messageIndexes: props.messageIndexes,
  role: props.role,
})

function handleAction(name: string) {
  if (name === 'copy') {
    handleCopyAction()
  } else if (name === 'edit') {
    emit('edit', userContent.value)
  } else if (name === 'refresh') {
    if (handleRefreshAction()) {
      emit('edit', userContent.value)
    }
  }
}
</script>

<template>
  <TrFeedback :actions="feedbackActions" @action="handleAction" />
</template>

<style>
.tr-feedback .tr-feedback__operations {
  justify-content: flex-start !important;
  padding: 0 2px;
}
</style>
