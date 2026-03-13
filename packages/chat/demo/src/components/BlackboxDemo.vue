<script setup lang="ts">
import { TrChat, useMcpManager } from '@opentiny/tiny-robot-chat'
import { createDeepSeekFactory, createOpenAIFactory } from '@opentiny/tiny-robot-chat'
import type { ModelOption, ModelProviderFactory } from '@opentiny/tiny-robot-chat'
import { toolPlugin } from '@opentiny/tiny-robot-kit'
import { defaultMcpServers } from '../data/mcpServers'
import { WELCOME_CONFIG, PROMPTS, BRAND_CONFIG } from '../constants'

defineEmits<{
  error: [error: Error]
}>()

// API Keys from environment
const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || ''

// Model options
const AVAILABLE_MODELS: ModelOption[] = [
  { value: 'deepseek-chat', label: 'DeepSeek Chat', provider: 'deepseek' },
  { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner', provider: 'deepseek' },
  { value: 'gpt-4o', label: 'GPT-4o', provider: 'openai' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai' },
]

// Provider factories
const providerFactories: ModelProviderFactory[] = [
  createDeepSeekFactory({
    apiKey: deepseekApiKey,
    systemPrompt: 'You are a helpful assistant.',
  }),
  createOpenAIFactory({
    apiKey: openaiApiKey,
    systemPrompt: 'You are a helpful assistant.',
  }),
]

// Get initial provider for TrChat
const getInitialProvider = () => {
  const defaultModel = AVAILABLE_MODELS[0]
  const factory = providerFactories.find((f) => f.match(defaultModel))
  if (factory) {
    return factory.createProvider(defaultModel)
  }
  // Fallback
  return createDeepSeekFactory({
    apiKey: deepseekApiKey,
    systemPrompt: 'You are a helpful assistant.',
  }).createProvider(defaultModel)
}

// MCP Manager
const mcpManager = useMcpManager()
mcpManager.installedPlugins.value = defaultMcpServers

// Tool plugin for chat
const toolPluginInstance = toolPlugin({
  getTools: mcpManager.getTools,
  callTool: mcpManager.callTool,
})

function handleError(error: Error) {
  console.error('Chat error:', error)
}
</script>

<template>
  <TrChat
    :response-provider="getInitialProvider()"
    :models="AVAILABLE_MODELS"
    :provider-factories="providerFactories"
    default-model="deepseek-chat"
    :plugins="[toolPluginInstance]"
    :brand="BRAND_CONFIG"
    :welcome="WELCOME_CONFIG"
    :prompts="PROMPTS"
    show-feedback
    show-history
    @error="handleError"
  />
</template>

<style scoped>
:deep(.tr-chat) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.tr-chat__header) {
  flex-shrink: 0;
  border-bottom: 1px solid var(--tr-color-border);
}

:deep(.tr-chat__welcome-area) {
  flex: 1;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.tr-chat__message-area) {
  flex: 1;
  overflow-y: auto;
}

:deep(.tr-chat__footer) {
  flex-shrink: 0;
  border-top: 1px solid var(--tr-color-border);
}
</style>
