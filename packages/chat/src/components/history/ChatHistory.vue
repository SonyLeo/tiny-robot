<script setup lang="ts">
import { ThemeProvider } from '@opentiny/tiny-robot'
import { computed, getCurrentInstance } from 'vue'
import { CHAT_UI_KEY, useChatPageInputs, useRequiredInject } from '@/shared/context'
import type { TrChatHistoryProps } from '@/types'
import ChatHistoryContent from './ChatHistoryContent.vue'

defineOptions({ name: 'TrChatHistory' })

const props = defineProps<TrChatHistoryProps>()

const pageInputs = useChatPageInputs()
const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const historyInput = computed(() => pageInputs?.value.history)
const appearanceInput = computed(() => pageInputs?.value.appearance)
const resolvedEnabled = computed(() => props.enabled ?? historyInput.value?.enabled ?? true)
const shouldRenderDrawer = computed(
  () => resolvedEnabled.value && chatUi.history.display.value === 'drawer' && !chatUi.workspace.enabled.value,
)
const appearance = computed(() => props.appearance ?? appearanceInput.value)
const scopedColorMode = computed(() => {
  const mode = appearance.value?.mode

  if (mode === 'light' || mode === 'dark') {
    return mode
  }

  if (mode === 'system') {
    return 'auto'
  }

  return undefined
})

const themeScopeId = `tr-chat-history-drawer-theme-${getCurrentInstance()?.uid ?? 'fallback'}`
</script>

<template>
  <template v-if="shouldRenderDrawer">
    <div
      class="tr-chat-drawer-overlay"
      :class="{ 'is-open': chatUi.history.visible.value }"
      @click="chatUi.history.close()"
    />

    <ThemeProvider v-if="scopedColorMode" :target-element="`#${themeScopeId}`" :color-mode="scopedColorMode">
      <div :id="themeScopeId" class="tr-chat-drawer" :class="{ 'is-open': chatUi.history.visible.value }">
        <ChatHistoryContent />
      </div>
    </ThemeProvider>

    <div v-else :id="themeScopeId" class="tr-chat-drawer" :class="{ 'is-open': chatUi.history.visible.value }">
      <ChatHistoryContent />
    </div>
  </template>
</template>
