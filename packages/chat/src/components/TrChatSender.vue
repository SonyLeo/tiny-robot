<script setup lang="ts">
import { inject, ref, computed, useSlots } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { StructuredData } from '@opentiny/tiny-robot'
import { CHAT_KIT_KEY } from '../context'

// 支持透传完整 TrSender props
defineOptions({ inheritAttrs: false })

interface Props {
  mode?: 'single' | 'multiple'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'multiple',
})

const chatKit = inject(CHAT_KIT_KEY)!

const inputValue = ref('')

const isLoading = computed(() => chatKit.status.value === 'submitted' || chatKit.status.value === 'streaming')

async function handleSend(content: string, data?: StructuredData) {
  await chatKit.sendMessage(content, data)
  inputValue.value = ''
}

function handleAbort() {
  chatKit.abort()
}

// 获取所有插槽以支持透传
const slots = useSlots()
</script>

<template>
  <TrSender
    v-model="inputValue"
    :loading="isLoading"
    :mode="props.mode"
    v-bind="$attrs"
    @submit="handleSend"
    @cancel="handleAbort"
  >
    <!-- 透传所有插槽 -->
    <template v-if="slots.header" #header>
      <slot name="header" />
    </template>
    <template v-if="slots.prefix" #prefix>
      <slot name="prefix" />
    </template>
    <template v-if="slots.content" #content="slotProps">
      <slot name="content" v-bind="slotProps" />
    </template>
    <template v-if="slots['actions-inline']" #actions-inline>
      <slot name="actions-inline" />
    </template>
    <template v-if="slots.footer" #footer>
      <slot name="footer" />
    </template>
    <template v-if="slots['footer-right']" #footer-right>
      <slot name="footer-right" />
    </template>
  </TrSender>
</template>
