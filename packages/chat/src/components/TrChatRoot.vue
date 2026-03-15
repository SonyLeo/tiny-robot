<script setup lang="ts">
import { provide, ref } from 'vue'
import { useChatKit } from '../composables'
import { CHAT_KIT_KEY, CHAT_UI_KEY, MCP_MANAGER_KEY } from '../context'
import type { TrChatRootProps, UseChatKitOptions } from '../types'
import { conditionalProp } from '../utils'

const props = defineProps<TrChatRootProps>()

const providedChatKit = conditionalProp(props, 'chatKit')
const providedResponseProvider = conditionalProp(props, 'responseProvider')

if (!providedChatKit && !providedResponseProvider) {
  throw new Error('[TrChatRoot] Either chatKit or responseProvider must be provided')
}

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
