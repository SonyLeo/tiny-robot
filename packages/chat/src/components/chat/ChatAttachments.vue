<script setup lang="ts">
import { inject, computed } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import { CHAT_ATTACHMENTS_KEY } from '../../context'

defineOptions({ name: 'TrChatAttachments' })

const attachmentsContext = inject(CHAT_ATTACHMENTS_KEY, null)

const attachments = computed(() => attachmentsContext?.manager.items.value ?? [])
const listProps = computed(() => attachmentsContext?.feature.list ?? {})

function handleUpdate(items: typeof attachments.value) {
  attachmentsContext?.manager.setItems(items)
}
</script>

<template>
  <div
    v-if="attachmentsContext && attachments.length > 0"
    class="tr-chat-attachments-area"
    data-testid="chat-attachments-area"
  >
    <TrAttachments :items="attachments" v-bind="listProps" @update:items="handleUpdate" />
  </div>
</template>
