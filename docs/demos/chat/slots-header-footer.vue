<template>
  <div class="chat-demo-container">
    <TrChat :config="chatConfig">
      <template #header-extra>
        <button class="chip-button">页面操作</button>
      </template>

      <template #footer-extra>
        <div class="slot-tip">这里是 footer-extra，可以插提示语、状态条或工具按钮。</div>
      </template>
    </TrChat>
  </div>
</template>

<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'

const chatConfig = {
  models: [
    { id: 'gpt-4o-mini', providerId: 'openai', label: 'GPT-4o Mini' },
    { id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' },
  ],
  providers: {
    openai: {
      type: 'openai-compatible' as const,
      endpoint: '/api/chat/completions',
      systemPrompt: 'You are a helpful assistant for the TinyRobot docs.',
    },
  },
  defaults: {
    model: 'gpt-4o-mini',
  },
  ui: {
    brand: {
      title: 'header-extra / footer-extra',
    },
    welcome: {
      title: '局部 slots 定制',
      description: '不改默认页面结构，只在 header 和 footer 补充额外内容。',
    },
  },
}
</script>

<style scoped>
.chat-demo-container {
  height: 560px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}

.chip-button {
  padding: 6px 10px;
  color: #175cd3;
  background: #eff6ff;
  border: 1px solid #b2ddff;
  border-radius: 999px;
  cursor: pointer;
}

.slot-tip {
  padding: 8px 12px 0;
  color: #475467;
  font-size: 12px;
}
</style>
