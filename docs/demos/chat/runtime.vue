<template>
  <div class="chat-demo-shell">
    <div class="chat-demo-hint">
      这个示例通过 <code>runtime</code> 注入 <code>chatKit</code>，并用
      <code>runtime.selectedModel</code> 指定页面实例的初始模型。
    </div>
    <div class="chat-demo-container">
      <TrChat :config="chatConfig" :runtime="{ chatKit, selectedModel: 'reasoner-model' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import { createDemoChatConfig, createMockResponseProvider } from './shared'

const chatConfig = createDemoChatConfig({
  models: [
    { id: 'mock-model', providerId: 'mock', label: 'Mock Model' },
    { id: 'reasoner-model', providerId: 'mock', label: 'Reasoner Model' },
  ],
  defaults: {
    model: 'mock-model',
  },
  ui: {
    brand: {
      title: 'runtime 注入示例',
    },
    welcome: {
      title: '页面实例级运行时',
      description: '这里会从 runtime 中读取 chatKit 与 selectedModel。',
    },
  },
})

const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('runtime 注入'),
})
</script>

<style scoped>
.chat-demo-shell {
  display: grid;
  gap: 12px;
}

.chat-demo-hint {
  padding: 10px 12px;
  color: #344054;
  background: #f8fafc;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  font-size: 13px;
}

.chat-demo-container {
  height: 560px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}
</style>
