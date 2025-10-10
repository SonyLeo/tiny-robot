<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <!-- 语音录制 UI -->
    <div>
      <h4>{{ isMobile ? '移动端' : 'PC 端' }} 语音录制</h4>
      <div
        class="sender-container"
        @touchmove.prevent="handleTouchMove"
        @touchend.prevent="handleTouchEnd"
        @mousemove.prevent="handleTouchMove"
        @mouseup.prevent="handleTouchEnd"
      >
        <!-- 输入框：使用 content 插槽自定义按住说话入口 -->
        <tr-sender
          v-show="!showMobileVoiceUI"
          ref="senderRef"
          v-model="inputText"
          mode="single"
          class="sender"
          :allowSpeech="true"
          :speech="speechConfig"
        >
          <template v-if="isMobile" #content>
            <div
              class="press-to-talk-trigger"
              @touchstart.prevent="handleTouchStart"
              @mousedown.prevent="handleTouchStart"
            >
              按住说话
            </div>
          </template>
        </tr-sender>

        <!-- 录音浮层：显示录音动画和提示 -->
        <PressToTalkOverlay
          v-model:visible="showMobileVoiceUI"
          :isCanceling="isCanceling"
          :cancelThreshold="cancelThreshold"
        />
      </div>
    </div>
    <div>
      <span style="margin-right: 20px">是否是移动端</span>
      <tiny-switch v-model="isMobile"></tiny-switch>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TinySwitch } from '@opentiny/vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { VoiceButtonClickContext } from '@opentiny/tiny-robot'
import { MockSpeechHandler } from './speechHandlers'
import PressToTalkOverlay from './PressToTalkOverlay.vue'

const senderRef = ref<InstanceType<typeof TrSender>>()
const inputText = ref('')
const showMobileVoiceUI = ref(false)
const isMobile = ref(false)
const isCanceling = ref(false)
const startY = ref(0)
const cancelThreshold = 30

// 语音配置
const speechConfig = {
  mode: 'custom' as const,
  customHandler: new MockSpeechHandler(),
  onVoiceButtonClick: async (context: VoiceButtonClickContext) => {
    if (!isMobile.value) return false
    if (!context.isRecording) {
      showMobileVoiceUI.value = true
      return true
    } else {
      context.speechHandler.stop()
      showMobileVoiceUI.value = false
      return true
    }
  },
}

// 按下开始录音
const handleTouchStart = (e: TouchEvent | MouseEvent) => {
  const clientY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
  startY.value = clientY
  showMobileVoiceUI.value = true
  isCanceling.value = false
  senderRef.value?.startSpeech()
}

// 移动检测是否取消
const handleTouchMove = (e: TouchEvent | MouseEvent) => {
  if (!showMobileVoiceUI.value) return

  const currentY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
  const slideDistance = startY.value - currentY
  isCanceling.value = slideDistance > cancelThreshold
}

// 松开结束录音
const handleTouchEnd = () => {
  if (!showMobileVoiceUI.value) return

  if (isCanceling.value) {
    // 取消录音（可以在这里清空输入框或其他处理）
    inputText.value = ''
  }

  console.log('handleTouchEnd - 开始发送', inputText.value)

  senderRef.value?.stopSpeech()
  senderRef.value?.submit()
  showMobileVoiceUI.value = false
  isCanceling.value = false
}
</script>

<style scoped>
.sender-container {
  position: relative;
  min-height: 180px;
}

.sender {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}

.press-to-talk-trigger {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;
  font-size: 16px;
  color: #333;
}
</style>
