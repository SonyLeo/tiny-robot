<script setup lang="ts">
import { provide, ref } from 'vue'
import { conditionalProp } from '../utils'
import { useChatKit } from '../composables'
import { CHAT_KIT_KEY, CHAT_UI_KEY, MCP_MANAGER_KEY } from '../context'
import type { TrChatRootProps, UseChatKitOptions } from '../types'

// 两种互斥模式：
// 模式 A：传 UseChatKitOptions，Root 内部创建状态
// 模式 B：传 chatKit 实例，Root 直接 provide，不重复创建

const props = defineProps<TrChatRootProps>()

const providedChatKit = conditionalProp(props, 'chatKit')
const providedResponseProvider = conditionalProp(props, 'responseProvider')

if (!providedChatKit && !providedResponseProvider) {
  throw new Error('[TrChatRoot] Either chatKit or responseProvider must be provided')
}

// 使用类型守卫安全地提取属性
const chatKit =
  providedChatKit ??
  useChatKit({
    responseProvider: providedResponseProvider as UseChatKitOptions['responseProvider'],
    plugins: conditionalProp(props, 'plugins'),
    storage: conditionalProp(props, 'storage'),
    initialMessages: conditionalProp(props, 'initialMessages'),
    onFinish: conditionalProp(props, 'onFinish'),
    onError: conditionalProp(props, 'onError'),
  })

// UI 状态由 Root 统一管理，供 Header / History 通过 inject 消费
const showHistoryDrawer = ref(false)

provide(CHAT_KIT_KEY, chatKit)
provide(CHAT_UI_KEY, { showHistoryDrawer })
if (props.mcpManager) {
  provide(MCP_MANAGER_KEY, props.mcpManager)
}
</script>

<template>
  <slot />
</template>
