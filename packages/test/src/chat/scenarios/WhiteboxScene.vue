<template>
  <div>
    <div data-testid="chat-whitebox" class="chat-wrapper">
      <div class="status-bar">
        <span data-testid="status-indicator">{{ status }}</span>
        <span data-testid="message-count">{{ messages.length }}</span>
        <span data-testid="on-finish-log">{{ finishLog }}</span>
        <span data-testid="on-action-log">{{ actionLog }}</span>
        <span data-testid="variant-indicator">{{ messageListVariant }}</span>
        <button data-testid="toggle-message-variant" @click="toggleMessageListVariant">
          {{ messageListVariant === 'bubble' ? 'docs variant' : 'bubble variant' }}
        </button>
      </div>

      <TrChat.Root
        :chat-kit="chat"
        :attachments-feature="sharedAttachmentsFeature"
        :sender-actions-feature="sharedSenderActionsFeature"
      >
        <TrChat.Layout>
          <TrChat.Header show-history />

          <TrChat.Welcome
            v-if="messages.length === 0"
            title="白盒模式测试"
            description="验证 Root、inject 和手动组合链路"
            :prompts="sharedPrompts"
            @prompt-click="handlePromptClick"
          />

          <TrChat.MessageList v-else auto-scroll :variant="messageListVariant" :on-action-click="handleMessageAction">
            <template #after="slotProps">
              <TrChatFeedback v-if="slotProps.role === 'assistant'" v-bind="slotProps" />
            </template>
          </TrChat.MessageList>

          <TrChat.Footer>
            <div class="whitebox-footer">
              <TrModelSelector
                v-model="selectedModel"
                :models="sharedModels"
                :provider-factories="sharedProviderFactories"
                @change="handleModelChange"
              />

              <TrChat.Sender placeholder="白盒模式请输入消息...">
                <template #footer-right>
                  <span data-testid="whitebox-custom-footer-right">自定义 footer-right</span>
                </template>
              </TrChat.Sender>
            </div>
          </TrChat.Footer>

          <TrChat.History />
        </TrChat.Layout>
      </TrChat.Root>
    </div>

    <div class="scene-grid">
      <div data-testid="chat-whitebox-slices-default" class="chat-wrapper">
        <TrChat.Root :chat-kit="whiteboxSlicesChat" v-bind="whiteboxFeatureSlices.root">
          <TrChat.Layout v-bind="{ ...whiteboxFeatureSlices.layout, ...whiteboxFeatureSlices.appearance }">
            <TrChat.Header v-bind="whiteboxFeatureSlices.header" />

            <TrChat.Welcome
              v-if="showWhiteboxSlicesWelcome && whiteboxFeatureSlices.welcome"
              v-bind="whiteboxFeatureSlices.welcome"
              @prompt-click="handleWhiteboxSlicesPromptClick"
            />

            <TrChat.MessageList v-else v-bind="whiteboxFeatureSlices.messageList" />

            <TrChat.Footer>
              <TrChat.Attachments />
              <TrChat.Sender v-bind="whiteboxFeatureSlices.sender" />
            </TrChat.Footer>
          </TrChat.Layout>
        </TrChat.Root>
      </div>

      <div data-testid="chat-whitebox-slices-slot" class="chat-wrapper">
        <TrChat.Root :chat-kit="whiteboxSlicesSlotChat" v-bind="whiteboxFeatureSlices.root">
          <TrChat.Layout v-bind="{ ...whiteboxFeatureSlices.layout, ...whiteboxFeatureSlices.appearance }">
            <TrChat.Header v-bind="whiteboxFeatureSlices.header" />

            <TrChat.Welcome
              v-if="showWhiteboxSlicesSlotWelcome && whiteboxFeatureSlices.welcome"
              v-bind="whiteboxFeatureSlices.welcome"
              @prompt-click="handleWhiteboxSlicesSlotPromptClick"
            />

            <TrChat.MessageList v-else v-bind="whiteboxFeatureSlices.messageList" />

            <TrChat.Footer>
              <TrChat.Attachments />
              <TrChat.Sender v-bind="whiteboxFeatureSlices.sender">
                <template #footer-right>
                  <span data-testid="whitebox-slices-custom-footer-right">whitebox slices footer-right</span>
                </template>
              </TrChat.Sender>
            </TrChat.Footer>
          </TrChat.Layout>
        </TrChat.Root>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  TrChat,
  TrChatFeedback,
  TrModelSelector,
  createChatAdapterFromConfig,
  createPresetChatProps,
  createPresetChatSlices,
  useChatKit,
  useModelSelector,
} from '../../../../chat/src'
import type { ChatListVariant, ChatMessageActionPayload, ModelOption } from '../../../../chat/src/types'
import { createMockProvider } from '../mockProvider'
import {
  sharedAttachmentsFeature,
  sharedModels,
  sharedPrompts,
  sharedProviderFactories,
  sharedSenderActionsFeature,
} from './sharedDemoFixtures'

const finishLog = ref('')
const actionLog = ref('')
const messageListVariant = ref<ChatListVariant>('bubble')
const selectedModel = ref('openai-test')

const whiteboxFeatureAdapter = createChatAdapterFromConfig({
  models: [{ id: 'whitebox-slices-model', provider: 'openai' }],
  providers: {
    openai: {
      type: 'openai-compatible',
      endpoint: '/api/chat',
    },
  },
  ui: {
    brand: {
      title: 'Whitebox Slices',
    },
    welcome: {
      title: 'Whitebox Slices Welcome',
      description: 'Preset slices drive the white-box footer defaults.',
    },
  },
  features: {
    attachments: true,
    senderActions: {
      voice: {
        enabled: true,
        tooltip: 'Voice from preset slices',
      },
      wordCount: true,
    },
  },
})

const whiteboxFeaturePreset = createPresetChatProps(whiteboxFeatureAdapter, {
  placeholder: 'Whitebox slices sender...',
  maxLength: 60,
})
const whiteboxFeatureSlices = createPresetChatSlices(whiteboxFeaturePreset)
const whiteboxSlicesChat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'whitebox-slices-model',
  }),
})
const whiteboxSlicesSlotChat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'whitebox-slices-slot-model',
  }),
})
const showWhiteboxSlicesWelcome = computed(() => whiteboxSlicesChat.messages.value.length === 0)
const showWhiteboxSlicesSlotWelcome = computed(() => whiteboxSlicesSlotChat.messages.value.length === 0)

const chat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'openai',
    model: selectedModel.value,
  }),
  onFinish: (msg) => {
    finishLog.value = `finish:${msg.content?.slice(0, 40) ?? ''}`
  },
  onError: (err) => {
    finishLog.value = `error:${err.message}`
  },
})

const { messages, status } = chat

const { selectModel } = useModelSelector({
  currentModel: selectedModel,
  models: sharedModels,
  providerFactories: sharedProviderFactories,
  chatKit: chat,
})

function handleMessageAction(payload: ChatMessageActionPayload) {
  actionLog.value = `action:${payload.action}:${payload.role ?? ''}:${payload.messageIndex ?? -1}`
}

function toggleMessageListVariant() {
  messageListVariant.value = messageListVariant.value === 'bubble' ? 'docs' : 'bubble'
}

function handlePromptClick(description: string) {
  chat.sendMessage(description)
}

function handleWhiteboxSlicesPromptClick(description: string) {
  whiteboxSlicesChat.sendMessage(description)
}

function handleWhiteboxSlicesSlotPromptClick(description: string) {
  whiteboxSlicesSlotChat.sendMessage(description)
}

function handleModelChange(model: ModelOption) {
  selectModel(model)
}
</script>

<style scoped>
.scene-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
}

.status-bar {
  display: flex;
  gap: 12px;
  padding: 4px 12px;
  background: #f5f5f5;
  font-size: 12px;
  font-family: monospace;
  border-bottom: 1px solid #eee;
}

.status-bar span {
  padding: 2px 6px;
  background: #e8e8e8;
  border-radius: 3px;
}

.status-bar button {
  padding: 2px 8px;
  border: 1px solid #d0d7e2;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  font: inherit;
}

.whitebox-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
