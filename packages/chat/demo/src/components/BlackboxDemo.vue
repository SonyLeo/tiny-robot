<script setup lang="ts">
import { ref } from 'vue'
import { TrChat, useMcpManager, createChatAdapterFromConfig, createPresetChatProps } from '@opentiny/tiny-robot-chat'
import type { ChatListVariant, ChatMessageActionPayload } from '@opentiny/tiny-robot-chat'
import { toolPlugin } from '@opentiny/tiny-robot-kit'
import { defaultMcpServers } from '../data/mcpServers'
import { WELCOME_CONFIG, PROMPTS, BRAND_CONFIG } from '../constants'
import { createDemoMcpBridge } from '../utils/mcpBridge'
import { wrapDemoRetryProviderFactories } from '../utils/demoRetryProvider'

defineEmits<{
  error: [error: Error]
}>()

const actionLog = ref('')
const messageListVariant = ref<ChatListVariant>('bubble')

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
    prompts: PROMPTS,
  },
  runtime: {
    mcpManager,
  },
})

const toolPluginInstance = toolPlugin({
  getTools: mcpManager.getTools,
  callTool: mcpManager.callTool,
})

const demoProviderFactories = wrapDemoRetryProviderFactories(chatAdapter.providerFactories)

const chatPreset = createPresetChatProps(chatAdapter, {
  providerFactories: demoProviderFactories,
  plugins: [toolPluginInstance],
  showFeedback: true,
  showHistory: true,
})

function handleError(error: Error) {
  console.error('Chat error:', error)
}

function handleMessageAction(payload: ChatMessageActionPayload) {
  actionLog.value = `action:${payload.action}:${payload.role ?? ''}:${payload.messageIndex ?? -1}`
}

function toggleMessageListVariant() {
  messageListVariant.value = messageListVariant.value === 'bubble' ? 'docs' : 'bubble'
}
</script>

<template>
  <div class="demo-chat-shell">
    <div class="demo-status-bar">
      <span data-testid="demo-variant-indicator">{{ messageListVariant }}</span>
      <button class="demo-status-btn" @click="toggleMessageListVariant">
        {{ messageListVariant === 'bubble' ? 'Switch to docs' : 'Switch to bubble' }}
      </button>
      <span v-if="actionLog" data-testid="demo-action-log">{{ actionLog }}</span>
    </div>
    <TrChat
      v-bind="chatPreset"
      :message-list-variant="messageListVariant"
      :on-message-action="handleMessageAction"
      @error="handleError"
    />
  </div>
</template>

<style scoped>
.demo-chat-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.demo-status-bar {
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  background: #f5f7fb;
  border-bottom: 1px solid #e6ebf5;
  font-size: 12px;
  font-family: monospace;
  flex-shrink: 0;
}

.demo-status-bar span {
  padding: 2px 8px;
  border-radius: 999px;
  background: #e8eefb;
}

.demo-status-btn {
  padding: 2px 10px;
  border: 1px solid #d0d7e2;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  font: inherit;
}

:deep(.tr-chat) {
  flex: 1;
  min-height: 0;
  height: auto;
}
</style>
