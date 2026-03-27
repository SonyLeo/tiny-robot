<script setup lang="ts">
import {
  TrChat,
  TrChatFeedback,
  TrMcpTrigger,
  TrModelSelector,
  useMcpManager,
  createChatAdapterFromConfig,
} from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory, toolPlugin } from '@opentiny/tiny-robot-kit'
import { defaultMcpServers } from '../data/mcpServers'
import { WELCOME_CONFIG, BRAND_CONFIG } from '../constants'
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
  },
  runtime: {
    mcpManager,
  },
})

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

const scaffoldPresetOverrides = {
  showFeedback: false,
}
</script>

<template>
  <TrChat.Scaffold
    :config="chatAdapter.config"
    :runtime="scaffoldRuntime"
    :preset-overrides="scaffoldPresetOverrides"
    v-slot="{ chatKit }"
  >
    <TrChat.Layout>
      <TrChat.Header />

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

:deep(.tr-bubble__box[data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}

:deep(.tr-bubble__box[data-editing='true']) {
  width: 50% !important;
}
</style>
