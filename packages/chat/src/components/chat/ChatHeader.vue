<script setup lang="ts">
import { computed, inject } from 'vue'
import { TrIconButton } from '@opentiny/tiny-robot'
import { IconCancelFullScreen, IconClose, IconFullScreen, IconHistory, IconNewSession } from '@opentiny/tiny-robot-svgs'
import { CHAT_KIT_KEY, CHAT_UI_KEY } from '../../context'
import { CHAT_MESSAGES } from '../../messages'

defineOptions({ name: 'TrChatHeader' })

interface Props {
  showHistory?: boolean
  showNewChat?: boolean
  showFullScreen?: boolean
  isFullscreen?: boolean
  showClose?: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  showHistory: false,
  showNewChat: true,
  showFullScreen: false,
  isFullscreen: false,
  showClose: false,
  title: '',
})

const emit = defineEmits<{
  (e: 'update:fullscreen', value: boolean): void
  (e: 'close'): void
}>()

const chatKit = inject(CHAT_KIT_KEY)!
const { showHistoryDrawer } = inject(CHAT_UI_KEY)!

function handleNewChat() {
  chatKit.createConversation()
}

const fullScreenIcon = computed(() => (props.isFullscreen ? IconCancelFullScreen : IconFullScreen))
const fullscreenTitle = computed(() =>
  props.isFullscreen ? CHAT_MESSAGES.header.exitFullscreen : CHAT_MESSAGES.header.enterFullscreen,
)
const historyBtnLabel = computed(() =>
  showHistoryDrawer.value ? CHAT_MESSAGES.header.closeHistory : CHAT_MESSAGES.header.openHistory,
)
</script>

<template>
  <div class="tr-chat__header">
    <div class="tr-chat__header-inner">
      <div class="tr-chat__header-left">
        <slot name="title">
          <h3 v-if="props.title" class="tr-chat__header-brand">{{ props.title }}</h3>
        </slot>
      </div>

      <div class="tr-chat__header-right">
        <slot name="extra" />
        <TrIconButton
          v-if="props.showNewChat"
          :icon="IconNewSession"
          size="28"
          svg-size="20"
          :title="CHAT_MESSAGES.header.newChat"
          :aria-label="CHAT_MESSAGES.header.newChat"
          @click="handleNewChat"
        />
        <TrIconButton
          v-if="props.showHistory"
          :icon="IconHistory"
          size="28"
          svg-size="20"
          :title="historyBtnLabel"
          :aria-label="historyBtnLabel"
          @click="showHistoryDrawer = !showHistoryDrawer"
        />
        <TrIconButton
          v-if="props.showFullScreen"
          :title="fullscreenTitle"
          :aria-label="fullscreenTitle"
          :icon="fullScreenIcon"
          size="28"
          svg-size="20"
          @click="emit('update:fullscreen', !props.isFullscreen)"
        />
        <TrIconButton
          v-if="props.showClose"
          :title="CHAT_MESSAGES.header.close"
          :aria-label="CHAT_MESSAGES.header.close"
          :icon="IconClose"
          size="28"
          svg-size="20"
          @click="emit('close')"
        />
      </div>
    </div>
  </div>
</template>
