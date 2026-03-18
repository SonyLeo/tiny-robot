<script setup lang="ts">
import { provide, ref } from 'vue'
import { useChatAttachments, useChatKit } from '../../composables'
import {
  CHAT_ATTACHMENTS_KEY,
  CHAT_KIT_KEY,
  CHAT_SENDER_ACTIONS_KEY,
  CHAT_UI_KEY,
  MCP_MANAGER_KEY,
} from '../../context'
import type { TrChatRootProps, UseChatKitOptions } from '../../types'
import { conditionalProp } from '../../utils'

defineOptions({ name: 'TrChatRoot' })

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
const attachmentsFeature = props.attachmentsFeature
const attachmentsManager = props.attachmentsManager ?? (attachmentsFeature ? useChatAttachments() : null)

provide(CHAT_KIT_KEY, chatKit)
provide(CHAT_UI_KEY, { showHistoryDrawer })
if (props.mcpManager) {
  provide(MCP_MANAGER_KEY, props.mcpManager)
}
if (attachmentsManager && attachmentsFeature) {
  provide(CHAT_ATTACHMENTS_KEY, {
    manager: attachmentsManager,
    feature: attachmentsFeature,
  })
}
if (props.senderActionsFeature) {
  provide(CHAT_SENDER_ACTIONS_KEY, {
    feature: props.senderActionsFeature,
  })
}
</script>

<template>
  <slot />
</template>
