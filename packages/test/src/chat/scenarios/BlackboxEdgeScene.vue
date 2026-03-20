<template>
  <div v-if="isShow" data-testid="chat-blackbox-edge" class="chat-wrapper">
    <div class="status-bar">
      <span data-testid="on-error-log">{{ errorLog }}</span>
    </div>

    <TrChat
      :response-provider="edgeResponseProvider"
      :brand="sharedBrand"
      :attachments-feature="edgeAttachmentsFeature"
      :sender-actions-feature="edgeSenderActionsFeature"
      placeholder="请输入消息..."
      show-history
      enable-fullscreen
      v-model:fullscreen="isFullscreen"
      v-model:show="isShow"
      :role-configs="{ user: { placement: 'start' }, assistant: { placement: 'end' } }"
      :sender-props="{ maxLength: 5 }"
      :on-finish="handleFinish"
      :on-error="handleError"
    >
      <template #header-extra>
        <button data-testid="custom-header-btn">自定义按钮</button>
      </template>

      <template #footer-extra>
        <div data-testid="custom-footer-extra">这是 Footer 额外区域</div>
      </template>
    </TrChat>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrChat } from '../../../../chat/src'
import {
  createEdgeResponseProvider,
  edgeAttachmentsFeature,
  edgeSenderActionsFeature,
  sharedBrand,
} from './sharedDemoFixtures'

const errorLog = ref('')
const isFullscreen = ref(false)
const isShow = ref(true)
const edgeResponseProvider = createEdgeResponseProvider()

function handleFinish(msg: { content?: string }) {
  errorLog.value = `finish:${msg.content?.slice(0, 40) ?? ''}`
}

function handleError(err: Error) {
  errorLog.value = `error:${err.message}`
}
</script>

<style scoped>
.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
}

.status-bar {
  display: flex;
  gap: 12px;
  padding: 4px 12px;
  background: #f5f5f5;
  font-size: 12px;
  font-family: monospace;
  border-bottom: 1px solid #eee;
}

.status-bar span {
  padding: 2px 6px;
  background: #e8e8e8;
  border-radius: 3px;
}
</style>
