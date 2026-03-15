<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { TrAttachments, UploadButton, ActionButton } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'
import { IconAccessory, IconPlugin } from '@opentiny/tiny-robot-svgs'
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
import type { ChatListVariant, ChatMessageActionPayload } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory, toolPlugin } from '@opentiny/tiny-robot-kit'
import { defaultMcpServers } from '../data/mcpServers'
import { WELCOME_CONFIG, PROMPTS, BRAND_CONFIG } from '../constants'
import { createDemoMcpBridge } from '../utils/mcpBridge'
import { wrapDemoRetryProviderFactories } from '../utils/demoRetryProvider'

defineEmits<{
  error: [error: Error]
}>()

const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || ''

const actionLog = ref('')
const messageListVariant = ref<ChatListVariant>('bubble')

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

const mcpManager = useMcpManager({
  initialPlugins: defaultMcpServers,
  bridge: createDemoMcpBridge(),
})

const toolPluginInstance = toolPlugin({
  getTools: mcpManager.getTools,
  callTool: mcpManager.callTool,
})

const demoProviderFactories = wrapDemoRetryProviderFactories(chatAdapter.providerFactories)

function getProviderForModel(modelValue?: string) {
  const model = chatAdapter.models.find((item) => item.value === modelValue) ?? chatAdapter.models[0]
  if (!model) {
    throw new Error('Whitebox demo requires at least one model to create a response provider.')
  }

  const factory = demoProviderFactories.find((item) => item.match(model))
  if (!factory) {
    throw new Error(`Whitebox demo could not match a provider for model "${model.value}".`)
  }

  return factory.createProvider(model)
}

const chatKit = useChatKit({
  responseProvider: getProviderForModel(chatAdapter.defaultModel),
  plugins: [toolPluginInstance],
  storage: localStorageStrategyFactory(),
})

const mcpPanelVisible = ref(false)
const attachments = ref<Attachment[]>([])
const selectedModel = ref<string>(chatAdapter.defaultModel || chatAdapter.models[0]?.value || '')

const { selectModel } = useModelSelector({
  currentModel: selectedModel,
  models: computed(() => chatAdapter.models),
  providerFactories: computed(() => demoProviderFactories),
  chatKit,
})

const showWelcome = computed(() => chatKit.messages.value.length === 0)
const mcpPanelIcon = computed(() => () => h(IconPlugin, { style: { fontSize: '24px' } }))

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
        <TrChat.MessageList
          v-else
          group-strategy="consecutive"
          auto-scroll
          :variant="messageListVariant"
          :on-action-click="handleMessageAction"
        >
          <template #after="slotProps">
            <TrChatFeedback v-if="slotProps.role === 'assistant'" v-bind="slotProps" style="margin-top: 6px" />
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
                  :provider-factories="demoProviderFactories"
                  @change="handleModelChange"
                />
                <UploadButton
                  tooltip="上传附件"
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
