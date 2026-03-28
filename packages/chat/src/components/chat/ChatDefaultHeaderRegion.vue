<script setup lang="ts">
import ChatHeader from '@/components/chat/ChatHeader.vue'

defineOptions({ name: 'TrChatDefaultHeaderRegion' })

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <template v-if="$slots.header">
    <slot name="header" />
  </template>
  <ChatHeader v-else @close="emit('close')">
    <template v-if="$slots['header-extra']" #extra>
      <slot name="header-extra" />
    </template>
  </ChatHeader>
</template>
