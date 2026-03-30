<template>
  <div class="chat-demo-container">
    <TrChat :config="chatConfig" :runtime="{ chatKit }">
      <template #after="{ role, messageIndexes }">
        <div v-if="role === 'assistant'" class="bubble-extra">当前分组索引：{{ messageIndexes.join(', ') }}</div>
      </template>

      <template #content-footer="{ role }">
        <div v-if="role === 'assistant'" class="bubble-footer">由 content-footer slot 渲染的补充说明。</div>
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
      title: 'Bubble passthrough slots',
    },
  },
})

const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('bubble slots'),
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

.bubble-extra,
.bubble-footer {
  margin: 6px 0 0 56px;
  color: #475467;
  font-size: 12px;
}
</style>
