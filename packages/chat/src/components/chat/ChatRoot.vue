<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useChatAttachments } from '@/composables'
import {
  CHAT_ATTACHMENTS_KEY,
  CHAT_KIT_KEY,
  CHAT_MESSAGES_KEY,
  CHAT_SENDER_ACTIONS_KEY,
  CHAT_UI_KEY,
  MCP_MANAGER_KEY,
} from '@/context'
import { resolveChatMessages } from '@/messages'
import type { TrChatRootProps } from '@/types'
import { resolveRootChatKit } from './resolveRootChatKit'

defineOptions({ name: 'TrChatRoot' })

const props = defineProps<TrChatRootProps>()

const chatKit = resolveRootChatKit('TrChatRoot', props)

const showHistoryDrawer = ref(false)
const chatMessages = computed(() => resolveChatMessages(props.messages))
const attachmentsFeature = props.attachmentsFeature
const attachmentsManager = props.attachmentsManager ?? (attachmentsFeature ? useChatAttachments() : null)

provide(CHAT_KIT_KEY, chatKit)
provide(CHAT_UI_KEY, { showHistoryDrawer })
provide(CHAT_MESSAGES_KEY, chatMessages)
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
