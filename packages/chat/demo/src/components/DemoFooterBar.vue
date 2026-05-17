<script setup lang="ts">
import { shallowRef } from 'vue'
import { Chat } from '@/index'

const draft = shallowRef('')

function handleSubmit(): void {
  draft.value = ''
}
</script>

<template>
  <Chat.Footer>
    <Chat.SenderPanel
      v-model="draft"
      mode="multiple"
      :auto-size="{ minRows: 1, maxRows: 4 }"
      placeholder="向 TinyRobot 提问..."
      clearable
      @submit="handleSubmit"
    />
  </Chat.Footer>
</template>
