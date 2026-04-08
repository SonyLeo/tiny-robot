<script setup lang="ts">
import { computed } from 'vue'
import type { ChatContentLayout, TrChatPresetOverrides } from '@opentiny/tiny-robot-chat'
import { TrChat, useMcpManager } from '@opentiny/tiny-robot-chat'
import type { ColorMode } from '@opentiny/tiny-robot'
import { localStorageStrategyFactory, toolPlugin } from '@opentiny/tiny-robot-kit'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { defaultMcpServers } from '../data/mcpServers'
import { WELCOME_CONFIG, WELCOME_PROMPTS, BRAND_CONFIG } from '../constants'
import { createDemoMcpBridge } from '../utils/mcpBridge'
import DemoHeaderActions from './DemoHeaderActions.vue'

const props = defineProps<{
  colorMode: ColorMode
  contentLayout: ChatContentLayout
}>()

const emit = defineEmits<{
  (e: 'update:colorMode', value: ColorMode): void
  (e: 'update:contentLayout', value: ChatContentLayout): void
}>()

const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || ''

const mcpManager = useMcpManager({
  initialPlugins: defaultMcpServers,
  bridge: createDemoMcpBridge(),
})

const chatConfig = {
  models: [
    { id: 'deepseek-chat', label: 'DeepSeek Chat', providerId: 'deepseek' },
    { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner', providerId: 'deepseek' },
    { id: 'gpt-4o', label: 'GPT-4o', providerId: 'openai' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', providerId: 'openai', icon: IconAi },
  ],
  providers: {
    deepseek: {
      baseURL: 'https://api.deepseek.com/v1',
      headers: {
        Authorization: `Bearer ${deepseekApiKey}`,
      },
      systemPrompt: 'You are a helpful assistant.',
    },
    openai: {
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
  integrations: {
    mcpManager,
  },
}

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

const blackboxPresetOverrides = computed<TrChatPresetOverrides>(() => ({
  showFeedback: true,
  contentLayout: props.contentLayout,
}))
</script>

<template>
  <TrChat :config="chatConfig" :runtime="blackboxRuntime" :preset-overrides="blackboxPresetOverrides">
    <template #header-extra>
      <DemoHeaderActions
        :color-mode="props.colorMode"
        :content-layout="props.contentLayout"
        @update:color-mode="emit('update:colorMode', $event)"
        @update:content-layout="emit('update:contentLayout', $event)"
      />
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
