<template>
  <div class="chat-demo-container">
    <TrChat :config="chatConfig" :runtime="{ chatKit }">
      <template #message-list="{ messages }">
        <div class="custom-message-list">
          <h4>自定义消息区域</h4>
          <p>当前消息数：{{ messages.value.length }}</p>
          <ul>
            <li v-for="(message, index) in messages.value" :key="index">
              <strong>{{ message.role }}:</strong> {{ message.content }}
            </li>
          </ul>
        </div>
      </template>
    </TrChat>
  </div>
</template>

<script setup lang="ts">
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import { createDemoChatConfig, createMockResponseProvider, seededMessages } from './shared'

const chatConfig = createDemoChatConfig({
  ui: {
    brand: {
      title: 'message-list slot',
    },
  },
})

const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('message-list slot'),
  initialMessages: seededMessages,
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

.custom-message-list {
  padding: 20px;
}

.custom-message-list h4 {
  margin: 0 0 8px;
}

.custom-message-list p {
  margin: 0 0 12px;
  color: #475467;
}

.custom-message-list ul {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
}
</style>
