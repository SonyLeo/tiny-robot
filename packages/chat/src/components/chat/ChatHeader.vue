<script setup lang="ts">
import { computed, inject } from 'vue'
import { TrIconButton } from '@opentiny/tiny-robot'
import { IconAccessory, IconClose, IconHistory, IconNewSession } from '@opentiny/tiny-robot-svgs'
import { CHAT_ATTACHMENTS_KEY, CHAT_KIT_KEY, CHAT_UI_KEY, useChatScaffoldContext, useRequiredInject } from '@/context'
import { useResolvedChatMessages } from '@/messages'
import { triStateBooleanProp } from '@/utils'

defineOptions({ name: 'TrChatHeader' })

const props = defineProps({
  showHistory: triStateBooleanProp,
  showNewChat: triStateBooleanProp,
  showClose: triStateBooleanProp,
  title: String,
})
const scaffoldContext = useChatScaffoldContext()
const headerSlice = computed(() => scaffoldContext?.presetSlices.value.header)
const shellSlice = computed(() => scaffoldContext?.presetSlices.value.shell.shell)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const chatKit = useRequiredInject(CHAT_KIT_KEY, 'chat kit')
const attachmentsContext = inject(CHAT_ATTACHMENTS_KEY, null)
const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const chatMessages = useResolvedChatMessages()
const resolvedTitle = computed(() => props.title ?? headerSlice.value?.title ?? '')
const resolvedShowHistory = computed(() => props.showHistory ?? headerSlice.value?.showHistory ?? false)
const resolvedShowNewChat = computed(() => props.showNewChat ?? true)
const resolvedShowClose = computed(() => props.showClose ?? headerSlice.value?.showClose ?? false)
const showWorkspaceMobileHistory = computed(
  () => resolvedShowHistory.value && chatUi.workspace.enabled.value && chatUi.workspace.isMobile.value,
)
const showLegacyHistoryButton = computed(
  () => resolvedShowHistory.value && (!chatUi.workspace.enabled.value || chatUi.workspace.isMobile.value),
)
const showRightPanelToggle = computed(
  () => chatUi.workspace.enabled.value && shellSlice.value?.rightRegion?.enabled !== false,
)

function handleNewChat() {
  attachmentsContext?.manager.clear()
  chatKit.createConversation()
}

const historyBtnLabel = computed(() =>
  chatUi.history.visible.value ? chatMessages.value.header.closeHistory : chatMessages.value.header.openHistory,
)
</script>

<template>
  <div class="tr-chat__header">
    <div class="tr-chat__header-inner">
      <div class="tr-chat__header-left">
        <TrIconButton
          v-if="showWorkspaceMobileHistory"
          :icon="IconHistory"
          size="28"
          svg-size="20"
          :title="historyBtnLabel"
          :aria-label="historyBtnLabel"
          @click="chatUi.history.toggle()"
        />
        <slot name="title">
          <h3 v-if="resolvedTitle" class="tr-chat__header-brand">{{ resolvedTitle }}</h3>
        </slot>
      </div>

      <div class="tr-chat__header-right">
        <slot name="extra" />
        <TrIconButton
          v-if="resolvedShowNewChat"
          :icon="IconNewSession"
          size="28"
          svg-size="20"
          :title="chatMessages.header.newChat"
          :aria-label="chatMessages.header.newChat"
          @click="handleNewChat"
        />
        <TrIconButton
          v-if="showLegacyHistoryButton && !showWorkspaceMobileHistory"
          :icon="IconHistory"
          size="28"
          svg-size="20"
          :title="historyBtnLabel"
          :aria-label="historyBtnLabel"
          @click="chatUi.history.toggle()"
        />
        <TrIconButton
          v-if="showRightPanelToggle"
          :icon="IconAccessory"
          size="28"
          svg-size="20"
          title="Toggle workspace panel"
          aria-label="Toggle workspace panel"
          @click="chatUi.workspace.right.toggle()"
        />
        <TrIconButton
          v-if="resolvedShowClose"
          :title="chatMessages.header.close"
          :aria-label="chatMessages.header.close"
          :icon="IconClose"
          size="28"
          svg-size="20"
          @click="emit('close')"
        />
      </div>
    </div>
  </div>
</template>
