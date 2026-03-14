<script setup lang="ts">
import { IconAccessory, IconPlugin } from '@opentiny/tiny-robot-svgs'
import { computed, ref, h } from 'vue'
import { TrAttachments, UploadButton, ActionButton } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'
import {
  TrChat,
  TrChatFeedback,
  TrModelSelector,
  TrChatMcpPanel,
  useChatKit,
  useMcpManager,
  useModelSelector,
  createChatAdapterFromConfig,
} from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory, toolPlugin } from '@opentiny/tiny-robot-kit'
import { defaultMcpServers } from '../data/mcpServers'
import { WELCOME_CONFIG, PROMPTS, BRAND_CONFIG } from '../constants'
import { createDemoMcpBridge } from '../utils/mcpBridge'

defineEmits<{
  error: [error: Error]
}>()

// API Keys
const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || ''

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
})

// MCP Manager
const mcpManager = useMcpManager({
  initialPlugins: defaultMcpServers,
  bridge: createDemoMcpBridge(),
})

const toolPluginInstance = toolPlugin({
  getTools: mcpManager.getTools,
  callTool: mcpManager.callTool,
})

// Create chatKit directly using useChatKit
const chatKit = useChatKit({
  responseProvider: chatAdapter.createResponseProvider(),
  plugins: [toolPluginInstance],
  storage: localStorageStrategyFactory(),
})

// State
const mcpPanelVisible = ref(false)
const attachments = ref<Attachment[]>([])
const selectedModel = ref<string>(chatAdapter.defaultModel || chatAdapter.models[0]?.value || '')
const { selectModel } = useModelSelector({
  currentModel: selectedModel,
  models: computed(() => chatAdapter.models),
  providerFactories: computed(() => chatAdapter.providerFactories),
  chatKit,
})

const showWelcome = computed(() => chatKit.messages.value.length === 0)

// MCP Panel icon renderer
const mcpPanelIcon = computed(() => () => h(IconPlugin, { style: { fontSize: '24px' } }))

// Handlers
function handlePromptClick(description: string) {
  chatKit.sendMessage(description)
}

function handleFileSelect(files: File[]) {
  files.forEach((file) => {
    attachments.value.push({ rawFile: file, url: URL.createObjectURL(file) })
  })
}

function handleToggleMcpPanel() {
  mcpPanelVisible.value = !mcpPanelVisible.value
}

function handleModelChange(model: (typeof chatAdapter.models)[number]) {
  selectModel(model)
}
</script>

<template>
  <TrChat.Root :chat-kit="chatKit" :mcp-manager="mcpManager">
    <TrChat.Layout>
      <TrChat.Header :title="BRAND_CONFIG.title" show-history />

      <div v-if="showWelcome" class="tr-chat__welcome-area">
        <TrChat.Welcome
          :title="chatAdapter.config.ui?.welcome?.title || WELCOME_CONFIG.title"
          :icon="chatAdapter.config.ui?.welcome?.icon || WELCOME_CONFIG.icon"
          :description="chatAdapter.config.ui?.welcome?.description || WELCOME_CONFIG.description"
          :prompts="chatAdapter.config.ui?.prompts || PROMPTS"
          @prompt-click="handlePromptClick"
        />
      </div>
      <TrChat.MessageList v-else group-strategy="consecutive" auto-scroll>
        <template #after="slotProps">
          <TrChatFeedback v-bind="slotProps" style="margin-top: 6px" />
        </template>
      </TrChat.MessageList>

      <TrChat.Footer>
        <div class="tr-chat-footer-wrapper">
          <div v-if="attachments.length > 0" class="tr-chat-attachments-area">
            <TrAttachments v-model:items="attachments" variant="card" :wrap="true" />
          </div>
          <TrChat.Sender>
            <template #footer>
              <TrModelSelector
                v-model="selectedModel"
                :models="chatAdapter.models"
                :provider-factories="chatAdapter.providerFactories"
                @change="handleModelChange"
              />
              <UploadButton
                tooltip="上传文件"
                tooltip-placement="top"
                :multiple="true"
                :icon="IconAccessory"
                accept="*"
                @select="handleFileSelect"
              />
              <ActionButton :icon="mcpPanelIcon" @click="handleToggleMcpPanel" />
            </template>
          </TrChat.Sender>
        </div>
      </TrChat.Footer>

      <TrChat.History />
      <TrChatMcpPanel :visible="mcpPanelVisible" @update:visible="mcpPanelVisible = $event" />
    </TrChat.Layout>
  </TrChat.Root>
</template>

<style scoped>
:deep(.tr-chat) {
  height: 100%;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mcp-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--tr-color-border);
  border-radius: 4px;
  background: var(--tr-color-bg-default);
  color: var(--tr-color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mcp-toggle-btn:hover {
  background: var(--tr-color-bg-hover);
  border-color: var(--tr-color-border-hover);
}

.mcp-toggle-btn:active {
  background: var(--tr-color-bg-active);
}

.tr-chat-footer-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tr-chat-attachments-area {
  padding: 8px 12px;
  border-top: 1px solid var(--tr-color-border);
  background: var(--tr-color-bg-default);
}

:deep(.tr-bubble__box[data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}

:deep(.tr-bubble__box[data-editing='true']) {
  --tr-bubble-box-bg: transparent;
  width: 50% !important;
}
</style>
