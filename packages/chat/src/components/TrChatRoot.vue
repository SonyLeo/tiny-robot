<script setup lang="ts">
import { provide, ref } from 'vue'
import { useChatKit } from '../composables/useChatKit'
import { CHAT_KIT_KEY, CHAT_UI_KEY } from '../context'
import type { TrChatRootProps } from '../types'

// 两种互斥模式：
// 模式 A：传 UseChatKitOptions，Root 内部创建状态
// 模式 B：传 chatKit 实例，Root 直接 provide，不重复创建

const props = defineProps<TrChatRootProps>()

// 此时 TypeScript 保证了互斥，可以安全断言
const chatKit =
  props.chatKit ??
  useChatKit({
    responseProvider: props.responseProvider!,
    plugins: props.plugins,
    storage: props.storage,
    initialMessages: props.initialMessages,
    onFinish: props.onFinish,
    onError: props.onError,
  })

// UI 状态由 Root 统一管理，供 Header / History 通过 inject 消费
const showHistoryDrawer = ref(false)

provide(CHAT_KIT_KEY, chatKit)
provide(CHAT_UI_KEY, { showHistoryDrawer })
</script>

<template>
  <slot />
</template>
