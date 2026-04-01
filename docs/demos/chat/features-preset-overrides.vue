<template>
  <div class="chat-demo-shell">
    <div class="demo-toolbar">
      <button :class="buttonClass(showHistory)" @click="showHistory = !showHistory">历史入口</button>
      <button :class="buttonClass(showFeedback)" @click="showFeedback = !showFeedback">反馈能力</button>
    </div>
    <div class="chat-demo-container">
      <TrChat
        :config="chatConfig"
        :runtime="{ chatKit, mcpManager }"
        :callbacks="{ onModelChange }"
        :preset-overrides="presetOverrides"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import type { ModelOption } from '@opentiny/tiny-robot-chat'
import { createDemoChatConfig, createDemoMcpManager, createMockResponseProvider } from './shared'

const showHistory = ref(true)
const showFeedback = ref(true)

const chatConfig = createDemoChatConfig({
  ui: {
    brand: {
      title: 'feature 页面级覆盖',
    },
  },
  features: {
    history: false,
    feedback: false,
  },
})

const selectedModel = ref(chatConfig.defaults?.model ?? chatConfig.models[0]?.id ?? 'deepseek-chat')
const mcpManager = createDemoMcpManager()
const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('feature override', {
    getModelId: () => selectedModel.value,
  }),
})

const presetOverrides = computed(() => ({
  showHistory: showHistory.value,
  showFeedback: showFeedback.value,
  senderActionsFeature: {
    wordCount: true,
  },
}))

function buttonClass(active: boolean) {
  return ['toolbar-button', { active }]
}

function onModelChange(model: ModelOption) {
  selectedModel.value = model.value
}
</script>

<style scoped>
.chat-demo-shell {
  display: grid;
  gap: 12px;
}

.demo-toolbar {
  display: flex;
  gap: 8px;
}

.toolbar-button {
  padding: 8px 12px;
  color: #344054;
  background: #fff;
  border: 1px solid #d0d5dd;
  border-radius: 999px;
  cursor: pointer;
}

.toolbar-button.active {
  color: #175cd3;
  background: #eff6ff;
  border-color: #b2ddff;
}

.chat-demo-container {
  height: 560px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}
</style>
