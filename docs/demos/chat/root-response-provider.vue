<template>
  <div class="chat-demo-container">
    <TrChat.Root :response-provider="responseProvider" :initial-messages="initialMessages">
      <TrChat.Layout>
        <TrChat.Header title="Root + responseProvider" />
        <TrChat.MessageList auto-scroll />
        <TrChat.Footer>
          <TrChat.Sender placeholder="直接把 responseProvider 注入 Root..." />
        </TrChat.Footer>
      </TrChat.Layout>
    </TrChat.Root>
  </div>
</template>

<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'
import { createMockResponseProvider } from './shared'

const responseProvider = createMockResponseProvider('Root + responseProvider')

const initialMessages = [
  {
    role: 'assistant',
    content: '这个示例没有提前创建 chatKit，而是直接把 responseProvider 交给了 Root。',
  },
]
</script>

<style scoped>
.chat-demo-container {
  height: 560px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}
</style>
