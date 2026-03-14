<script setup lang="ts">
import { inject, ref, computed, useSlots } from 'vue'
import type { PropType, Slot } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { StructuredData } from '@opentiny/tiny-robot'
import { CHAT_KIT_KEY } from '../context'

// 支持透传完整 TrSender props
defineOptions({ inheritAttrs: false })

const props = defineProps({
  mode: {
    type: String as PropType<'single' | 'multiple'>,
    default: 'multiple',
  },
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
const slots = useSlots() as Record<string, Slot | undefined>
const forwardedSlots = computed<Partial<Record<string, Slot>>>(() =>
  Object.fromEntries(
    Object.entries(slots)
      .filter(([, slot]) => slot !== undefined)
      .map(([name, slot]) => [name, slot as Slot]),
  ),
)
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
    <template v-for="(_, name) in forwardedSlots" #[name]="slotProps" :key="name">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </TrSender>
</template>
