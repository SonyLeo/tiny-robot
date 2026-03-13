<script setup lang="ts">
import { IconAccessory, IconPlugin } from '@opentiny/tiny-robot-svgs'
import { computed, ref, provide, h } from 'vue'
import { BubbleProvider, TrAttachments, UploadButton, ActionButton } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'
import {
  TrChat,
  TrChatFeedback,
  TrModelSelector,
  TrChatMcpPanel,
  useDefaultBubbleConfig,
  useChatKit,
  useMcpManager,
  createDeepSeekFactory,
  createOpenAIFactory,
  CHAT_KIT_KEY,
  CHAT_UI_KEY,
  MCP_MANAGER_KEY,
} from '@opentiny/tiny-robot-chat'
import type { ModelOption, ModelProviderFactory } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import { defaultMcpServers } from '../data/mcpServers'
import { WELCOME_CONFIG, PROMPTS, BRAND_CONFIG } from '../constants'

defineEmits<{
  error: [error: Error]
}>()

// API Keys
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

// Get initial provider
const getInitialProvider = () => {
  const defaultModel = AVAILABLE_MODELS[0]
  const factory = providerFactories.find((f) => f.match(defaultModel))
  if (factory) {
    return factory.createProvider(defaultModel)
  }
  return createDeepSeekFactory({
    apiKey: deepseekApiKey,
    systemPrompt: 'You are a helpful assistant.',
  }).createProvider(defaultModel)
}

// Create chatKit directly using useChatKit
const chatKit = useChatKit({
  responseProvider: getInitialProvider(),
  plugins: [],
  storage: localStorageStrategyFactory(),
})

// Provide chatKit to child components
provide(CHAT_KIT_KEY, chatKit)

// UI state for Header/History
const showHistoryDrawer = ref(false)
provide(CHAT_UI_KEY, { showHistoryDrawer })

// MCP Manager
const mcpManager = useMcpManager()
mcpManager.installedPlugins.value = defaultMcpServers
provide(MCP_MANAGER_KEY, mcpManager)

// State
const mcpPanelVisible = ref(false)
const attachments = ref<Attachment[]>([])
const selectedModel = ref<string>('deepseek-chat')

// Config
const { contentMatches, boxMatches, roles } = useDefaultBubbleConfig()
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
</script>

<template>
  <div class="tr-chat">
    <TrChat.Header :title="BRAND_CONFIG.title" show-history />

    <div v-if="showWelcome" class="tr-chat__welcome-area">
      <TrChat.Welcome
        :title="WELCOME_CONFIG.title"
        :icon="WELCOME_CONFIG.icon"
        :description="WELCOME_CONFIG.description"
        :prompts="PROMPTS"
        @prompt-click="handlePromptClick"
      />
    </div>
    <BubbleProvider v-else :box-renderer-matches="boxMatches" :content-renderer-matches="contentMatches">
      <TrChat.MessageList :role-configs="roles" group-strategy="consecutive" auto-scroll>
        <template #after="slotProps">
          <TrChatFeedback v-bind="slotProps" style="margin-top: 6px" />
        </template>
      </TrChat.MessageList>
    </BubbleProvider>

    <TrChat.Footer>
      <div class="tr-chat-footer-wrapper">
        <div v-if="attachments.length > 0" class="tr-chat-attachments-area">
          <TrAttachments v-model:items="attachments" variant="card" :wrap="true" />
        </div>
        <TrChat.Sender>
          <template #footer>
            <TrModelSelector
              v-model="selectedModel"
              :models="AVAILABLE_MODELS"
              :provider-factories="providerFactories"
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
  </div>
</template>

<style scoped>
.tr-chat {
  height: 100%;
  display: flex;
  flex-direction: column;
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
