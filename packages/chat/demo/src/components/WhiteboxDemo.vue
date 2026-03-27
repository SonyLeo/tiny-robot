<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TrChatPresetOverrides } from '@opentiny/tiny-robot-chat'
import { TrChat, TrChatFeedback, TrMcpTrigger, TrModelSelector, useMcpManager } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory, toolPlugin } from '@opentiny/tiny-robot-kit'
import { defaultMcpServers } from '../data/mcpServers'
import { WELCOME_CONFIG, WELCOME_PROMPTS, BRAND_CONFIG } from '../constants'
import { createDemoMcpBridge } from '../utils/mcpBridge'

defineEmits<{
  error: [error: Error]
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
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', providerId: 'openai' },
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
  runtime: {
    mcpManager,
  },
}

const toolPluginInstance = toolPlugin({
  getTools: mcpManager.getTools,
  callTool: mcpManager.callTool,
})

const scaffoldRuntime = {
  plugins: [toolPluginInstance],
  storage: localStorageStrategyFactory({
    key: 'tiny-robot-chat-demo-whitebox',
  }),
}

const isFullWidth = ref(false)
const scaffoldPresetOverrides = computed<TrChatPresetOverrides>(() => ({
  showFeedback: false,
  contentLayout: isFullWidth.value ? 'wide' : 'centered',
}))
</script>

<template>
  <TrChat.Scaffold
    :config="chatConfig"
    :runtime="scaffoldRuntime"
    :preset-overrides="scaffoldPresetOverrides"
    v-slot="{ chatKit }"
  >
    <TrChat.Layout>
      <TrChat.Header>
        <template #extra>
          <label class="layout-toggle">
            <input v-model="isFullWidth" type="checkbox" />
            <span>contentLayout</span>
          </label>
        </template>
      </TrChat.Header>

      <div v-if="chatKit.messages.value.length === 0" class="tr-chat__welcome-area">
        <TrChat.Welcome @prompt-click="chatKit.sendMessage($event)" />
      </div>
      <TrChat.MessageList v-else>
        <template #after="slotProps">
          <TrChatFeedback v-bind="slotProps" style="margin-top: 6px" />
        </template>
      </TrChat.MessageList>

      <TrChat.Footer class="tr-chat-footer-wrapper">
        <TrChat.Attachments />
        <TrChat.Sender>
          <template #footer>
            <TrModelSelector />
            <TrMcpTrigger />
          </template>
        </TrChat.Sender>
      </TrChat.Footer>

      <TrChat.History />
    </TrChat.Layout>
  </TrChat.Scaffold>
</template>

<style scoped>
.tr-chat-footer-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

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

:deep(.tr-bubble__box[data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}

:deep(.tr-bubble__box[data-editing='true']) {
  width: 50% !important;
}
</style>
