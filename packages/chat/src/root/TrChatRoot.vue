<script setup lang="ts">
import { computed, provide } from 'vue'
import ChatProvider from '@/components/core/ChatProvider.vue'
import { CHAT_PAGE_INPUTS_KEY, CHAT_RUNTIME_KEY, CHAT_SCAFFOLD_KEY } from '@/shared/context'
import { createLegacyRootBridge } from '@/legacy/rootBridge'
import { normalizeChatRuntime } from '@/runtime/core/normalizeRuntime'
import type { TrChatRootProps } from '@/types/root'

defineOptions({ name: 'TrChatRoot' })

const props = defineProps<TrChatRootProps>()

const normalizedRuntime = computed(() => normalizeChatRuntime(props.runtime))
const bridge = createLegacyRootBridge(
  normalizedRuntime,
  computed(() => props.ui),
)

provide(CHAT_SCAFFOLD_KEY, bridge.scaffoldContext)
provide(CHAT_PAGE_INPUTS_KEY, bridge.pageInputs)
provide(CHAT_RUNTIME_KEY, normalizedRuntime.value)
</script>

<template>
  <ChatProvider
    :chat-kit="bridge.chatKit.value"
    :attachments-manager="bridge.attachmentsManager.value"
    :attachments-feature="bridge.attachmentsFeature.value"
    :messages="bridge.messages.value"
    :shell="bridge.shell.value"
  >
    <slot />
  </ChatProvider>
</template>
