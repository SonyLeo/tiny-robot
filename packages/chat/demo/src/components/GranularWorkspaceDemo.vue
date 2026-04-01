<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { TrChat, createChatAdapterFromConfig, useChatKit, useMcpManager } from '@opentiny/tiny-robot-chat'
import type { ModelOption, TrChatPresetOverrides } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory, toolPlugin } from '@opentiny/tiny-robot-kit'
import { defaultMcpServers } from '../data/mcpServers'
import { WELCOME_CONFIG, WELCOME_PROMPTS, BRAND_CONFIG } from '../constants'
import { createDemoMcpBridge } from '../utils/mcpBridge'
import GranularWorkspaceSidebar from './GranularWorkspaceSidebar.vue'

const STORAGE_KEY = 'tiny-robot-chat-demo-granular-workspace'
const SEEDED_FLAG_KEY = `${STORAGE_KEY}-seeded-v2`
const previewConversationTitles = ['Research board', 'Weekly sync', 'Launch checklist']
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
  shell: {
    variant: 'workspace',
    leftRegion: {
      enabled: true,
      width: 368,
      collapsible: true,
      defaultOpen: true,
      collapseMode: 'rail',
      railLabel: 'Control',
    },
  },
  layout: {
    variant: 'workspace',
    contentLayout: 'wide',
  },
  ui: {
    brand: {
      ...BRAND_CONFIG,
      title: 'GenUI Workspace',
    },
    welcome: WELCOME_CONFIG,
    prompts: WELCOME_PROMPTS,
  },
}

const toolPluginInstance = toolPlugin({
  getTools: mcpManager.getTools,
  callTool: mcpManager.callTool,
})

const chatAdapter = createChatAdapterFromConfig(chatConfig)
const currentModelValue = ref(chatAdapter.defaultModel ?? chatConfig.defaults.model)
const temperature = ref(0.5)

if (chatAdapter.config.providers.deepseek) {
  chatAdapter.config.providers.deepseek.temperature = temperature.value
}
if (chatAdapter.config.providers.openai) {
  chatAdapter.config.providers.openai.temperature = temperature.value
}

const chatKit = useChatKit({
  responseProvider: chatAdapter.createResponseProvider(chatAdapter.defaultModel),
  plugins: [toolPluginInstance],
  storage: localStorageStrategyFactory({
    key: STORAGE_KEY,
  }),
})

const panelPresetOverrides: TrChatPresetOverrides = {
  showFeedback: false,
}

function ensureDemoConversations() {
  if (typeof window === 'undefined') {
    return
  }

  if (window.localStorage.getItem(SEEDED_FLAG_KEY) === '1') {
    return
  }

  if (chatKit.conversations.value.length > 0) {
    window.localStorage.setItem(SEEDED_FLAG_KEY, '1')
    return
  }

  const created = previewConversationTitles.map((title) => chatKit.createConversation({ title }))
  const firstConversation = created[0]

  if (firstConversation) {
    void chatKit.switchConversation(firstConversation.id)
  }

  window.localStorage.setItem(SEEDED_FLAG_KEY, '1')
}

function handleModelChange(model: string | ModelOption) {
  const nextModelValue = typeof model === 'string' ? model : model.value
  currentModelValue.value = nextModelValue
  if (chatAdapter.config.providers.deepseek) {
    chatAdapter.config.providers.deepseek.temperature = temperature.value
  }
  if (chatAdapter.config.providers.openai) {
    chatAdapter.config.providers.openai.temperature = temperature.value
  }
  chatKit.updateResponseProvider(chatAdapter.createResponseProvider(nextModelValue))
}

function handleTemperatureChange(value: number) {
  temperature.value = value
  if (chatAdapter.config.providers.deepseek) {
    chatAdapter.config.providers.deepseek.temperature = value
  }
  if (chatAdapter.config.providers.openai) {
    chatAdapter.config.providers.openai.temperature = value
  }
  chatKit.updateResponseProvider(chatAdapter.createResponseProvider(currentModelValue.value))
}

onMounted(() => {
  if (typeof window === 'undefined') {
    return
  }

  window.requestAnimationFrame(() => {
    ensureDemoConversations()
  })
})
</script>

<template>
  <TrChat :config="chatConfig" :runtime="{ chatKit, mcpManager }" :preset-overrides="panelPresetOverrides">
    <template #left>
      <GranularWorkspaceSidebar
        title="GenUI"
        :models="chatConfig.models"
        :current-model="currentModelValue"
        :temperature="temperature"
        :mcp-manager="mcpManager"
        @update:current-model="handleModelChange"
        @update:temperature="handleTemperatureChange"
      />
    </template>

    <template #left-rail>
      <div class="granular-workspace__left-rail">
        <span class="granular-workspace__left-rail-mark">G</span>
        <span class="granular-workspace__left-rail-text">Panels</span>
      </div>
    </template>
  </TrChat>
</template>

<style scoped>
.granular-workspace__left-rail {
  height: 100%;
  display: grid;
  align-content: start;
  justify-items: center;
  gap: 8px;
  padding: 18px 0;
  color: var(--chat-workspace-text-secondary, var(--tr-text-secondary, #6b7280));
}

.granular-workspace__left-rail-mark {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--chat-workspace-accent, #2f6bff) 16%, transparent);
  color: var(--chat-workspace-accent, var(--tr-color-primary, #2f6bff));
  font-size: 12px;
  font-weight: 700;
}

.granular-workspace__left-rail-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
</style>
