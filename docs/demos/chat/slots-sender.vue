<template>
  <div class="chat-demo-container">
    <TrChat :config="chatConfig" :runtime="{ chatKit }">
      <template #sender="{ send, status, retry }">
        <div class="custom-sender">
          <div class="sender-status">当前状态：{{ status.value }}</div>
          <div class="sender-actions">
            <button @click="send('你好，介绍一下 sender slot 的定位。')">发送预设问题</button>
            <button @click="retry()">重试上一轮</button>
          </div>
        </div>
      </template>
    </TrChat>
  </div>
</template>

<script setup lang="ts">
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import { createDemoChatConfig, createMockResponseProvider } from './shared'

const chatConfig = createDemoChatConfig({
  ui: {
    brand: {
      title: 'sender slot',
    },
  },
})

const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('sender slot'),
})
</script>

<style scoped>
.chat-demo-container {
  height: 560px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}

.custom-sender {
  padding: 12px 16px 16px;
  display: grid;
  gap: 10px;
}

.sender-status {
  color: #475467;
  font-size: 13px;
}

.sender-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sender-actions button {
  padding: 8px 12px;
  border: 1px solid #d0d5dd;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
}
</style>
