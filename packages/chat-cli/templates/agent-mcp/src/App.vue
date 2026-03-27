<script setup lang="ts">
import { TrChat, TrChatFeedback, TrMcpTrigger, TrModelSelector } from '@opentiny/tiny-robot-chat'
import chatConfig from './chat.config'
import { chatRuntime } from './lib/chat'
</script>

<template>
  <div class="app-shell">
    <TrChat.Scaffold :config="chatConfig" :runtime="chatRuntime" v-slot="{ chatKit }">
      <TrChat.Layout>
        <TrChat.Header />

        <div v-if="chatKit.messages.value.length === 0" class="tr-chat__welcome-area">
          <TrChat.Welcome @prompt-click="chatKit.sendMessage($event)" />
        </div>

        <TrChat.MessageList v-else>
          <template #after="slotProps">
            <TrChatFeedback v-bind="slotProps" />
          </template>
        </TrChat.MessageList>

        <TrChat.Footer class="app-footer-stack">
          <TrChat.Attachments />
          <TrChat.Sender>
            <template #footer>
              <div class="app-footer-tools">
                <TrModelSelector />
                <TrMcpTrigger label="MCP" />
              </div>
            </template>
          </TrChat.Sender>
        </TrChat.Footer>

        <TrChat.History />
      </TrChat.Layout>
    </TrChat.Scaffold>
  </div>
</template>

<style scoped>
.app-shell {
  height: 100%;
}

.app-footer-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-footer-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
</style>
