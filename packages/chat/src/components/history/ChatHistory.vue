<script setup lang="ts">
import { ThemeProvider } from '@opentiny/tiny-robot'
import { computed, getCurrentInstance } from 'vue'
import { CHAT_UI_KEY, useChatScaffoldContext, useRequiredInject } from '@/context'
import { triStateBooleanProp } from '@/utils'
import ChatHistoryContent from './ChatHistoryContent.vue'

defineOptions({ name: 'TrChatHistory' })

const props = defineProps({
  enabled: triStateBooleanProp,
})

const scaffoldContext = useChatScaffoldContext()
const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const resolvedEnabled = computed(() => props.enabled ?? scaffoldContext?.presetSlices.value.history.enabled ?? true)
const shouldRenderDrawer = computed(
  () => resolvedEnabled.value && chatUi.history.display.value === 'drawer' && !chatUi.workspace.enabled.value,
)
const appearance = computed(() => scaffoldContext?.presetSlices.value.appearance.appearance)
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
