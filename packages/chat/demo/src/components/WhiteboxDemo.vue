<script setup lang="ts">
import {
  TrChat,
  TrChatFeedback,
  TrMcpTrigger,
  TrModelSelector,
  useMcpManager,
  createChatAdapterFromConfig,
} from '@opentiny/tiny-robot-chat'
import type { ChatMessageActionPayload } from '@opentiny/tiny-robot-chat'
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
  features: {
    attachments: {
      upload: {
        accept: '*',
        multiple: true,
        tooltip: '上传附件',
      },
      list: {
        variant: 'card',
        wrap: true,
      },
    },
  },
})

const toolPluginInstance = toolPlugin({
  getTools: mcpManager.getTools,
  callTool: mcpManager.callTool,
})

const demoProviderFactories = wrapDemoRetryProviderFactories(chatAdapter.providerFactories)

function handleMessageAction(payload: ChatMessageActionPayload) {
  console.debug('Whitebox message action:', payload)
}

const scaffoldRuntime = {
  plugins: [toolPluginInstance],
  storage: localStorageStrategyFactory({
    key: 'tiny-robot-chat-demo-whitebox',
  }),
}

const scaffoldCallbacks = {
  onMessageAction: handleMessageAction,
}

const scaffoldPresetOverrides = {
  providerFactories: demoProviderFactories,
  showHistory: true,
  showFeedback: false,
}
</script>

<template>
  <div class="demo-chat-shell">
    <TrChat.Scaffold
      :config="chatAdapter.config"
      :runtime="scaffoldRuntime"
      :callbacks="scaffoldCallbacks"
      :preset-overrides="scaffoldPresetOverrides"
      v-slot="{ chatKit }"
    >
      <TrChat.Layout>
        <TrChat.Header />

        <div v-if="chatKit.messages.value.length === 0" class="tr-chat__welcome-area">
          <TrChat.Welcome @prompt-click="chatKit.sendMessage($event)" />
        </div>
        <TrChat.MessageList v-else :on-action-click="handleMessageAction">
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

.tr-chat-footer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

:deep(.tr-bubble__box[data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}

:deep(.tr-bubble__box[data-editing='true']) {
  --tr-bubble-box-bg: transparent;
  width: 50% !important;
}
</style>
