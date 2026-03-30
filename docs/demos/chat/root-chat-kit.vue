<template>
  <div class="chat-demo-container">
    <TrChat.Root :chat-kit="chat">
      <TrChat.Layout>
        <TrChat.Header show-history title="Root + chatKit" />

        <TrChat.Welcome
          v-if="messages.value.length === 0"
          title="Root 直接消费现成 chatKit"
          description="适合已经在业务里统一管理聊天运行时的场景。"
          :prompts="prompts"
          @prompt-click="chat.sendMessage($event)"
        />

        <TrChat.MessageList v-else auto-scroll />

        <TrChat.Footer>
          <template #extra>
            <div class="footer-tip">当前页面完全自己决定如何装配 Header / MessageList / Sender。</div>
          </template>
          <TrChat.Sender placeholder="请输入..." />
        </TrChat.Footer>

        <TrChat.History />
      </TrChat.Layout>
    </TrChat.Root>
  </div>
</template>

<script setup lang="ts">
import type { PromptProps } from '@opentiny/tiny-robot'
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import { createMockResponseProvider } from './shared'

const prompts: PromptProps[] = [{ label: '复用运行时', description: '解释一下 Root 为什么适合和业务 chatKit 共用。' }]

const chat = useChatKit({
  responseProvider: createMockResponseProvider('Root + chatKit'),
})

const { messages } = chat
</script>

<style scoped>
.chat-demo-container {
  height: 600px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}

.footer-tip {
  padding: 8px 12px 0;
  color: #475467;
  font-size: 12px;
}
</style>
