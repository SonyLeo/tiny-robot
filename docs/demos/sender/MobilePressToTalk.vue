<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <div>
      <h4>支持移动端按住说话的输入框</h4>
      <div
        class="sender-container"
        @touchmove.prevent="handleContainerTouchMove"
        @touchend.prevent="handleContainerTouchEnd"
        @mousemove.prevent="handleContainerTouchMove"
        @mouseup.prevent="handleContainerTouchEnd"
      >
        <tr-sender
          v-show="!showMobileVoiceUI"
          ref="senderRef"
          v-model="inputText"
          mode="single"
          class="sender"
          :allowSpeech="true"
          :speech="speechConfig"
          placeholder="点击麦克风按钮开始语音输入..."
          @speech-start="handleSpeechStart"
          @speech-end="handleSpeechEnd"
          @speech-error="handleSpeechError"
          @submit="handleSubmit"
        >
          <template #content>
            <div
              style="width: 100%; display: flex; justify-content: center; user-select: none"
              @touchstart.prevent="handleDecorativeTouchStart"
              @mousedown.prevent="handleDecorativeTouchStart"
            >
              按住说话
            </div>
          </template>
        </tr-sender>

        <PressToTalkOverlay
          ref="mobileVoiceUIRef"
          v-model:visible="showMobileVoiceUI"
          :cancelThreshold="cancelThreshold"
          :isCanceling="isCanceling"
        />
      </div>
    </div>

    <div v-if="results.length > 0" style="padding: 16px; background: #f9f9f9; border-radius: 8px">
      <h4 style="margin: 0 0 12px 0">识别历史</h4>
      <div style="max-height: 200px; overflow-y: auto">
        <div
          v-for="(result, index) in results"
          :key="index"
          style="
            padding: 8px;
            margin-bottom: 8px;
            background: white;
            border-radius: 4px;
            border-left: 3px solid #52c41a;
          "
        >
          <div style="font-size: 12px; color: #999; margin-bottom: 4px">
            {{ result.timestamp }} - {{ result.platform }} - {{ result.mode }}
            <span v-if="result.canceled" style="color: #ff4d4f"> - 已取消</span>
            <span v-if="result.completed" style="color: #00b176"> - 已发送</span>
          </div>
          <div>{{ result.text }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { VoiceButtonClickContext } from '@opentiny/tiny-robot'
import { MockSpeechHandler } from './speechHandlers'
import PressToTalkOverlay from './PressToTalkOverlay.vue'

interface Result {
  text: string
  timestamp: string
  mode: string
  platform: string
  canceled?: boolean
  completed?: boolean
}

const senderRef = ref<InstanceType<typeof TrSender>>()
const mobileVoiceUIRef = ref<InstanceType<typeof PressToTalkOverlay>>()

const inputText = ref('')
const showMobileVoiceUI = ref(false)
const isCanceling = ref(false)
const startY = ref(0)
const results = ref<Result[]>([])

const autoReplace = ref(true)
const cancelThreshold = 30
const isMobile = computed(() => true)
const customSpeechHandler = new MockSpeechHandler()

const speechConfig = computed(() => ({
  mode: 'custom' as const,
  customHandler: customSpeechHandler,
  autoReplace: autoReplace.value,
  interimResults: true,
  isMobile: isMobile.value,
  onVoiceButtonClick: async (context: VoiceButtonClickContext) => {
    if (!context.isMobile) return false
    if (!context.isRecording) {
      showMobileVoiceUI.value = true
      return true
    } else {
      context.speechHandler.stop()
      showMobileVoiceUI.value = false
      return true
    }
  },
}))

const handleSpeechStart = () => {}

const handleSpeechEnd = (transcript?: string) => {
  if (transcript) {
    results.value.unshift({
      text: transcript,
      timestamp: new Date().toLocaleTimeString(),
      mode: autoReplace.value ? '替换模式' : '追加模式',
      platform: isMobile.value ? '移动端' : 'PC端',
    })
    if (results.value.length > 10) results.value.length = 10
  }
}

const handleSpeechError = () => {}

const handleSubmit = (text: string) => {
  console.log('提交内容:', text)
}

const handleDecorativeTouchStart = (e: TouchEvent | MouseEvent) => {
  const clientY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
  startY.value = clientY
  showMobileVoiceUI.value = true
  isCanceling.value = false
  senderRef.value?.startSpeech()
}

const handleContainerTouchMove = (e: TouchEvent | MouseEvent) => {
  if (!showMobileVoiceUI.value) return
  const currentY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
  const slideDistance = startY.value - currentY
  isCanceling.value = slideDistance > cancelThreshold
}

const handleContainerTouchEnd = (e: TouchEvent | MouseEvent) => {
  if (!showMobileVoiceUI.value) return

  const endY = e instanceof TouchEvent ? e.changedTouches[0].clientY : e.clientY
  const totalSlide = startY.value - endY
  const canceled = totalSlide > cancelThreshold

  if (canceled) {
    senderRef.value?.stopSpeech()
    results.value.unshift({
      text: '(录音已取消)',
      timestamp: new Date().toLocaleTimeString(),
      mode: autoReplace.value ? '替换模式' : '追加模式',
      platform: isMobile.value ? '移动端' : 'PC端',
      canceled: true,
    })
  } else {
    results.value.unshift({
      text: inputText.value,
      timestamp: new Date().toLocaleTimeString(),
      mode: autoReplace.value ? '替换模式' : '追加模式',
      platform: isMobile.value ? '移动端' : 'PC端',
      completed: true,
    })
    senderRef.value?.stopSpeech()
  }

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
</style>
