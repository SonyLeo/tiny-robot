<script setup lang="ts">
import { inject, ref, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { StructuredData } from '@opentiny/tiny-robot'
import { CHAT_KIT_KEY } from '../context'

// 支持透传完整 TrSender props
defineOptions({ inheritAttrs: false })

interface Props {
  mode?: 'single' | 'multiple'
}

const props = defineProps<Props>()

const chatKit = inject(CHAT_KIT_KEY)!

const inputValue = ref('')

const isLoading = computed(() => chatKit.status.value === 'submitted' || chatKit.status.value === 'streaming')

function handleSend(content: string, data?: StructuredData) {
  chatKit.sendMessage(content, data)
  inputValue.value = ''
}

function handleAbort() {
  chatKit.abort()
}
</script>

<template>
  <TrSender
    v-model="inputValue"
    :loading="isLoading"
    :mode="props.mode"
    v-bind="$attrs"
    @submit="handleSend"
    @cancel="handleAbort"
  />
</template>
