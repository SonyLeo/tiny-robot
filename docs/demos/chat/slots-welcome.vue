<template>
  <div class="chat-demo-container">
    <TrChat :config="chatConfig" :runtime="{ chatKit }">
      <template #welcome>
        <div class="custom-welcome">
          <h3>欢迎使用你的专属助手</h3>
          <p>这个区域由 welcome slot 接管，但底层发送区和消息链仍然沿用默认实现。</p>
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
    welcome: {
      title: '这个标题会被 slot 替换',
      description: '默认 welcome 不再显示。',
    },
  },
})

const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('welcome slot'),
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

.custom-welcome {
  padding: 28px;
  margin: 24px;
  background: linear-gradient(135deg, #eff8ff, #f5f3ff);
  border: 1px solid #d0d5dd;
  border-radius: 16px;
}

.custom-welcome h3 {
  margin: 0 0 8px;
}

.custom-welcome p {
  margin: 0;
  color: #475467;
}
</style>
