<template>
  <div class="chat-demo-container">
    <TrChat :config="chatConfig" :runtime="{ chatKit, mcpManager }" :callbacks="{ onModelChange }">
      <template #header-extra>
        <button class="chip-button">打开 MCP</button>
      </template>

      <template #footer-extra>
        <div class="slot-tip">这里是 footer-extra，可以插提示语、状态条或工具按钮。</div>
      </template>
    </TrChat>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import type { ModelOption } from '@opentiny/tiny-robot-chat'
import { createDemoChatConfig, createDemoMcpManager, createMockResponseProvider } from './shared'

const chatConfig = createDemoChatConfig({
  ui: {
    brand: {
      title: 'header-extra / footer-extra',
    },
  },
})

const selectedModel = ref(chatConfig.defaults?.model ?? chatConfig.models[0]?.id ?? 'deepseek-chat')
const mcpManager = createDemoMcpManager()
const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('slots 扩展位', {
    getModelId: () => selectedModel.value,
  }),
})

function onModelChange(model: ModelOption) {
  selectedModel.value = model.value
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
