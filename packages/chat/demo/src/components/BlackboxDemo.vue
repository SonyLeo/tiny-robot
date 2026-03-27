<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TrChatPresetOverrides } from '@opentiny/tiny-robot-chat'
import { TrChat, useMcpManager, createChatAdapterFromConfig } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory, toolPlugin } from '@opentiny/tiny-robot-kit'
import { defaultMcpServers } from '../data/mcpServers'
import { WELCOME_CONFIG, WELCOME_PROMPTS, BRAND_CONFIG } from '../constants'
import { createDemoMcpBridge } from '../utils/mcpBridge'

const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || ''

const mcpManager = useMcpManager({
  initialPlugins: defaultMcpServers,
  bridge: createDemoMcpBridge(),
})

const chatAdapter = createChatAdapterFromConfig({
  models: [
    { id: 'deepseek-chat', label: 'DeepSeek Chat', provider: 'deepseek' },
    { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner', provider: 'deepseek' },
    { id: 'gpt-4o', label: 'GPT-4o', provider: 'openai' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai' },
  ],
  providers: {
    deepseek: {
      type: 'openai-compatible',
      baseURL: 'https://api.deepseek.com/v1',
      headers: {
        Authorization: `Bearer ${deepseekApiKey}`,
      },
      systemPrompt: 'You are a helpful assistant.',
    },
    openai: {
      type: 'openai-compatible',
      baseURL: 'https://api.openai.com/v1',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
      },
      systemPrompt: 'You are a helpful assistant.',
    },
  },
  defaults: {
    model: 'deepseek-chat',
  },
  ui: {
    brand: BRAND_CONFIG,
    welcome: WELCOME_CONFIG,
    prompts: WELCOME_PROMPTS,
  },
  runtime: {
    mcpManager,
  },
})

const toolPluginInstance = toolPlugin({
  getTools: mcpManager.getTools,
  callTool: mcpManager.callTool,
})

const blackboxRuntime = {
  plugins: [toolPluginInstance],
  storage: localStorageStrategyFactory({
    key: 'tiny-robot-chat-demo-blackbox',
  }),
}

const isFullWidth = ref(false)
const blackboxPresetOverrides = computed<TrChatPresetOverrides>(() => ({
  showFeedback: true,
  contentLayout: isFullWidth.value ? 'wide' : 'centered',
}))
</script>

<template>
  <TrChat :config="chatAdapter.config" :runtime="blackboxRuntime" :preset-overrides="blackboxPresetOverrides">
    <template #header-extra>
      <label class="layout-toggle">
        <input v-model="isFullWidth" type="checkbox" />
        <span>contentLayout</span>
      </label>
    </template>
  </TrChat>
</template>

<style scoped>
.layout-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--tr-text-secondary);
  user-select: none;
}

.layout-toggle input {
  margin: 0;
}
</style>
