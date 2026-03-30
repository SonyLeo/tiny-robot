<template>
  <div class="chat-demo-shell">
    <div class="chat-demo-log">
      <strong>回调日志</strong>
      <ul>
        <li v-for="entry in logs" :key="entry">{{ entry }}</li>
      </ul>
    </div>
    <div class="chat-demo-container">
      <TrChat :config="chatConfig" :runtime="{ chatKit }" :callbacks="callbacks" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import { createDemoChatConfig, createMockResponseProvider } from './shared'

const logs = ref<string[]>(['等待触发 onFinish / onError / onModelChange ...'])

const chatConfig = createDemoChatConfig({
  models: [
    { id: 'mock-model', providerId: 'mock', label: 'Mock Model' },
    { id: 'reasoner-model', providerId: 'mock', label: 'Reasoner Model' },
  ],
  ui: {
    brand: {
      title: 'callbacks 示例',
    },
    welcome: {
      title: '把行为回调收口到 callbacks',
      description: '发送消息或切换模型后，可以直接在上方看到事件日志。',
    },
  },
})

const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('callbacks 示例'),
})

function pushLog(message: string) {
  logs.value = [message, ...logs.value].slice(0, 6)
}

const callbacks = {
  onFinish(message: ChatMessage) {
    pushLog(`onFinish: ${String(message.content ?? '').slice(0, 28)}`)
  },
  onError(error: Error) {
    pushLog(`onError: ${error.message}`)
  },
  onModelChange(model: { value?: string; label?: string }) {
    pushLog(`onModelChange: ${model.label ?? model.value ?? 'unknown-model'}`)
  },
}
</script>

<style scoped>
.chat-demo-shell {
  display: grid;
  gap: 12px;
}

.chat-demo-log {
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  font-size: 13px;
  color: #344054;
}

.chat-demo-log ul {
  margin: 8px 0 0;
  padding-left: 18px;
}

.chat-demo-container {
  height: 560px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}
</style>
