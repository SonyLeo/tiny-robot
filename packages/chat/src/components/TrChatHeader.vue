<script setup lang="ts">
import { inject, computed } from 'vue'
import { TrIconButton } from '@opentiny/tiny-robot'
import { IconHistory, IconNewSession, IconFullScreen, IconCancelFullScreen, IconClose } from '@opentiny/tiny-robot-svgs'
import { CHAT_KIT_KEY, CHAT_UI_KEY } from '../context'

interface Props {
  showHistory?: boolean
  showNewChat?: boolean
  showFullScreen?: boolean
  isFullscreen?: boolean
  showClose?: boolean
  /** Header 左侧品牌标题（UI-B1） */
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

const FullScreenIcon = computed(() => (props.isFullscreen ? IconCancelFullScreen : IconFullScreen))
const fullscreenTitle = computed(() => (props.isFullscreen ? '退出全屏' : '全屏'))

/** 历史按钮 aria-label / title 随 Drawer 状态动态切换（UI-H2） */
const historyBtnLabel = computed(() => (showHistoryDrawer.value ? '关闭历史' : '打开历史'))
</script>

<template>
  <div class="tr-chat__header">
    <div class="tr-chat__header-inner">
      <!-- 左侧：品牌标题（UI-B1） -->
      <div class="tr-chat__header-left">
        <slot name="title">
          <h3 v-if="props.title" class="tr-chat__header-brand">{{ props.title }}</h3>
        </slot>
      </div>

      <!-- 右侧：操作按钮组（UI-H1 / UI-H2） -->
      <div class="tr-chat__header-right">
        <slot name="extra" />
        <TrIconButton
          v-if="props.showNewChat"
          :icon="IconNewSession"
          size="28"
          svg-size="20"
          title="新建对话"
          aria-label="新建对话"
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
          :icon="FullScreenIcon"
          size="28"
          svg-size="20"
          @click="emit('update:fullscreen', !props.isFullscreen)"
        />
        <TrIconButton
          v-if="props.showClose"
          title="关闭"
          aria-label="关闭"
          :icon="IconClose"
          size="28"
          svg-size="20"
          @click="emit('close')"
        />
      </div>
    </div>
  </div>
</template>
