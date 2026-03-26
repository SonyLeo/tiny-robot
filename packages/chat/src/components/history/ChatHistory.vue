<script setup lang="ts">
import { computed, provide } from 'vue'
import { CHAT_UI_KEY, CHAT_HISTORY_KEY, useChatScaffoldContext, useRequiredInject } from '@/context'
import { useHistoryState } from '@/composables/useHistoryState'
import { triStateBooleanProp } from '@/utils'
import ChatHistoryContent from './ChatHistoryContent.vue'

defineOptions({ name: 'TrChatHistory' })

const props = defineProps({
  enabled: triStateBooleanProp,
})
const scaffoldContext = useChatScaffoldContext()
const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const resolvedEnabled = computed(() => props.enabled ?? scaffoldContext?.presetSlices.value.history.enabled ?? true)
const isDrawerMode = computed(() => chatUi.history.display.value === 'drawer')

const historyState = useHistoryState()
provide(CHAT_HISTORY_KEY, historyState)
</script>

<template>
  <template v-if="resolvedEnabled && isDrawerMode">
    <div
      class="tr-chat-drawer-overlay"
      :class="{ 'is-open': chatUi.history.visible.value }"
      @click="chatUi.history.close()"
    />

    <div class="tr-chat-drawer" :class="{ 'is-open': chatUi.history.visible.value }">
      <ChatHistoryContent />
    </div>
  </template>
</template>
