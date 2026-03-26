<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import { CHAT_UI_KEY, CHAT_HISTORY_KEY, useChatScaffoldContext } from '@/context'
import { useHistoryState } from '@/composables/useHistoryState'
import { triStateBooleanProp } from '@/utils'
import ChatHistoryContent from './ChatHistoryContent.vue'

defineOptions({ name: 'TrChatHistory' })

const props = defineProps({
  enabled: triStateBooleanProp,
})
const scaffoldContext = useChatScaffoldContext()
const { showHistoryDrawer } = inject(CHAT_UI_KEY)!
const resolvedEnabled = computed(() => props.enabled ?? scaffoldContext?.presetSlices.value.history.enabled ?? true)

const historyState = useHistoryState()
provide(CHAT_HISTORY_KEY, historyState)
</script>

<template>
  <template v-if="resolvedEnabled">
    <div class="tr-chat-drawer-overlay" :class="{ 'is-open': showHistoryDrawer }" @click="showHistoryDrawer = false" />

    <div class="tr-chat-drawer" :class="{ 'is-open': showHistoryDrawer }">
      <ChatHistoryContent />
    </div>
  </template>
</template>
