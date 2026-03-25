<script setup lang="ts">
import { computed, inject } from 'vue'
import { TrIconButton } from '@opentiny/tiny-robot'
import { IconCancelFullScreen, IconClose, IconFullScreen, IconHistory, IconNewSession } from '@opentiny/tiny-robot-svgs'
import { CHAT_ATTACHMENTS_KEY, CHAT_KIT_KEY, CHAT_UI_KEY, useChatScaffoldContext } from '@/context'
import { useResolvedChatMessages } from '@/messages'
import { triStateBooleanProp } from '@/utils'

defineOptions({ name: 'TrChatHeader' })

const props = defineProps({
  showHistory: triStateBooleanProp,
  showNewChat: triStateBooleanProp,
  showFullScreen: triStateBooleanProp,
  isFullscreen: triStateBooleanProp,
  showClose: triStateBooleanProp,
  title: String,
})
const scaffoldContext = useChatScaffoldContext()
const headerSlice = computed(() => scaffoldContext?.presetSlices.value.header)

const emit = defineEmits<{
  (e: 'update:fullscreen', value: boolean): void
  (e: 'close'): void
}>()

const chatKit = inject(CHAT_KIT_KEY)!
const attachmentsContext = inject(CHAT_ATTACHMENTS_KEY, null)
const { showHistoryDrawer } = inject(CHAT_UI_KEY)!
const chatMessages = useResolvedChatMessages()
const resolvedTitle = computed(() => props.title ?? headerSlice.value?.title ?? '')
const resolvedShowHistory = computed(() => props.showHistory ?? headerSlice.value?.showHistory ?? false)
const resolvedShowNewChat = computed(() => props.showNewChat ?? true)
const resolvedShowFullScreen = computed(() => props.showFullScreen ?? headerSlice.value?.showFullScreen ?? false)
const resolvedIsFullscreen = computed(() => props.isFullscreen ?? headerSlice.value?.isFullscreen ?? false)
const resolvedShowClose = computed(() => props.showClose ?? headerSlice.value?.showClose ?? false)

function handleNewChat() {
  attachmentsContext?.manager.clear()
  chatKit.createConversation()
}

const fullScreenIcon = computed(() => (resolvedIsFullscreen.value ? IconCancelFullScreen : IconFullScreen))
const fullscreenTitle = computed(() =>
  resolvedIsFullscreen.value ? chatMessages.value.header.exitFullscreen : chatMessages.value.header.enterFullscreen,
)
const historyBtnLabel = computed(() =>
  showHistoryDrawer.value ? chatMessages.value.header.closeHistory : chatMessages.value.header.openHistory,
)
</script>

<template>
  <div class="tr-chat__header">
    <div class="tr-chat__header-inner">
      <div class="tr-chat__header-left">
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
          v-if="resolvedShowHistory"
          :icon="IconHistory"
          size="28"
          svg-size="20"
          :title="historyBtnLabel"
          :aria-label="historyBtnLabel"
          @click="showHistoryDrawer = !showHistoryDrawer"
        />
        <TrIconButton
          v-if="resolvedShowFullScreen"
          :title="fullscreenTitle"
          :aria-label="fullscreenTitle"
          :icon="fullScreenIcon"
          size="28"
          svg-size="20"
          @click="emit('update:fullscreen', !resolvedIsFullscreen)"
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
