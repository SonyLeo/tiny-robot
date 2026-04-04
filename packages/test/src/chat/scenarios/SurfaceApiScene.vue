<template>
  <div class="surface-grid">
    <div data-testid="chat-surface-slots-default" class="chat-wrapper">
      <TrChat :config="slotSurfaceConfig" :preset-overrides="slotSurfaceOverrides">
        <template #header-extra>
          <button data-testid="surface-header-extra">Header Extra</button>
        </template>

        <template #footer-extra>
          <div data-testid="surface-footer-extra">Footer Extra</div>
        </template>

        <template #prefix="{ role, messageIndexes }">
          <span v-if="role === 'assistant'" data-testid="surface-prefix-slot">
            prefix-{{ messageIndexes.join('-') }}
          </span>
        </template>

        <template #suffix="{ role, messageIndexes }">
          <span v-if="role === 'assistant'" data-testid="surface-suffix-slot">
            suffix-{{ messageIndexes.join('-') }}
          </span>
        </template>

        <template #after="{ role, messageIndexes }">
          <span v-if="role === 'assistant'" data-testid="surface-after-slot">
            after-{{ messageIndexes.join('-') }}
          </span>
        </template>

        <template #content-footer="{ role, messageIndexes }">
          <span v-if="role === 'assistant'" data-testid="surface-content-footer-slot">
            footer-{{ messageIndexes.join('-') }}
          </span>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-surface-header-slot" class="chat-wrapper">
      <TrChat :config="slotSurfaceConfig" :preset-overrides="slotSurfaceOverrides">
        <template #header>
          <div data-testid="surface-header-slot">Custom Header Slot</div>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-surface-welcome-slot" class="chat-wrapper">
      <TrChat :config="slotSurfaceConfig" :preset-overrides="slotSurfaceOverrides">
        <template #welcome>
          <div data-testid="surface-welcome-slot">Custom Welcome Slot</div>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-surface-empty-slot" class="chat-wrapper">
      <TrChat :config="emptySlotConfig" :preset-overrides="emptySlotOverrides">
        <template #empty>
          <div data-testid="surface-empty-slot">Custom Empty Slot</div>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-surface-custom-render" class="chat-wrapper">
      <TrChat :config="customRenderConfig" :runtime="customRenderRuntime" :preset-overrides="customRenderOverrides">
        <template #message-list="{ messages }">
          <div data-testid="surface-message-list-slot">messages:{{ messages.value.length }}</div>
        </template>

        <template #sender="{ send, status }">
          <div class="surface-custom-sender">
            <div data-testid="surface-sender-slot-status">status:{{ status.value }}</div>
            <button data-testid="surface-sender-slot-send" @click="send('surface-sender-slot')">Send From Slot</button>
          </div>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-surface-runtime-chat-kit" class="chat-wrapper">
      <TrChat :config="runtimeChatKitConfig" :runtime="{ chatKit: runtimeProvidedChatKit }" />
    </div>

    <div data-testid="chat-surface-runtime-bridge" class="chat-wrapper">
      <div class="surface-runtime-bridge-toolbar">
        <span data-testid="surface-runtime-bridge-request-state">
          request:{{ runtimeBridgeChat.runtime.requestState.value }}
        </span>
        <span data-testid="surface-runtime-bridge-processing-state">
          processing:{{ runtimeBridgeChat.runtime.processingState.value ?? 'none' }}
        </span>
        <span data-testid="surface-runtime-bridge-is-processing">
          active:{{ runtimeBridgeChat.runtime.isProcessing.value ? 'true' : 'false' }}
        </span>
        <span data-testid="surface-runtime-bridge-message-count">
          messages:{{ runtimeBridgeChat.messages.value.length }}
        </span>
        <span data-testid="surface-runtime-bridge-save-count">saves:{{ runtimeBridgeSaveCount }}</span>
        <button data-testid="surface-runtime-bridge-send" @click="sendRuntimeBridgeMessage">
          Send Runtime Message
        </button>
        <button data-testid="surface-runtime-bridge-save" @click="runtimeBridgeChat.runtime.saveMessages()">
          Save
        </button>
        <button data-testid="surface-runtime-bridge-clear" @click="runtimeBridgeChat.runtime.clear()">Clear</button>
      </div>

      <TrChat.Provider :chat-kit="runtimeBridgeChat">
        <TrChat.Layout>
          <TrChat.Header :show-new-chat="false">
            <template #title>
              <span data-testid="surface-runtime-bridge-title">Runtime Bridge Surface</span>
            </template>
          </TrChat.Header>

          <TrChat.Welcome
            v-if="runtimeBridgeChat.messages.value.length === 0"
            title="Runtime Bridge Welcome"
            description="This surface verifies runtime bridge state consumption."
          />

          <TrChat.MessageList v-else auto-scroll />

          <TrChat.Footer>
            <TrChat.Sender placeholder="Runtime bridge sender..." />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Provider>
    </div>

    <div data-testid="chat-surface-scaffold" class="chat-wrapper">
      <TrChat.Scaffold :config="scaffoldConfig" :callbacks="scaffoldCallbacks" :preset-overrides="scaffoldOverrides">
        <template #default="{ chatKit, currentModel, selectModel, presetSlices }">
          <div class="surface-diagnostics">
            <span data-testid="surface-scaffold-current-model">{{ currentModel.value }}</span>
            <span data-testid="surface-scaffold-header-title">{{ presetSlices.header.title }}</span>
            <span data-testid="surface-scaffold-model-log">{{ scaffoldModelLog }}</span>
            <button data-testid="surface-scaffold-switch-model" @click="selectModel(scaffoldDeepseekModel)">
              Switch To DeepSeek
            </button>
          </div>

          <TrChat.Layout>
            <TrChat.Header />

            <TrChat.Welcome
              v-if="chatKit.messages.value.length === 0 && presetSlices.welcome"
              v-bind="presetSlices.welcome"
              @prompt-click="chatKit.sendMessage($event)"
            />

            <TrChat.MessageList v-else v-bind="presetSlices.messageList" />

            <TrChat.Footer>
              <TrChat.Sender v-bind="presetSlices.sender" />
            </TrChat.Footer>
          </TrChat.Layout>
        </template>
      </TrChat.Scaffold>
    </div>

    <div data-testid="chat-surface-provider-branch" class="chat-wrapper">
      <TrChat.Provider :response-provider="providerBranchResponseProvider">
        <TrChat.Layout :appearance="{ mode: 'dark' }">
          <TrChat.Header :show-new-chat="false">
            <template #title>
              <span data-testid="surface-provider-title-slot">Provider Branch Title Slot</span>
            </template>
            <template #extra>
              <span data-testid="surface-provider-extra-slot">Provider Extra Slot</span>
            </template>
          </TrChat.Header>

          <TrChat.MessageList auto-scroll />

          <TrChat.Footer>
            <TrChat.Sender placeholder="Provider branch sender..." />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Provider>
    </div>

    <div data-testid="chat-surface-history-surface" class="history-surface-wrapper">
      <div class="history-surface-toolbar">
        <button data-testid="history-surface-seed" @click="seedHistorySurface">Seed Conversations</button>
      </div>

      <TrChat.Provider :chat-kit="historySurfaceChat">
        <TrChat.HistorySurface />
      </TrChat.Provider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import type { ChatMessage, ConversationStorageStrategy } from '@opentiny/tiny-robot-kit'
import { createMockProvider } from '../mockProvider'
import { createChatSceneConfig } from './sharedDemoFixtures'

const SurfaceWelcomeIcon = {
  template: '<span data-testid="surface-welcome-icon">I</span>',
}

const slotSurfaceConfig = createChatSceneConfig({
  ui: {
    brand: {
      title: 'Surface Default Slots',
    },
    welcome: {
      title: 'Surface Welcome',
      description: 'Default renderer slot passthrough should stay intact.',
      icon: SurfaceWelcomeIcon,
    },
    prompts: [{ label: 'slot prompt', description: 'slot prompt' }],
  },
})

const slotSurfaceOverrides = {
  placeholder: 'slot surface sender...',
  maxLength: 80,
}

const emptySlotConfig = createChatSceneConfig({
  ui: {
    brand: {
      title: 'Empty Slot Surface',
    },
  },
})

const emptySlotOverrides = {}

const customRenderConfig = createChatSceneConfig({
  ui: {
    brand: {
      title: 'Custom Render Surface',
    },
  },
})

const customRenderRuntime = {
  initialMessages: [
    {
      id: 'custom-render-initial',
      role: 'assistant',
      content: 'Initial custom render message',
    },
  ],
}

const customRenderOverrides = {}

const runtimeChatKitConfig = createChatSceneConfig({
  ui: {
    brand: {
      title: 'Runtime ChatKit Surface',
    },
    welcome: {
      title: 'Runtime ChatKit Welcome',
      description: 'An injected chatKit should keep its own responseProvider.',
    },
    prompts: [{ label: 'runtime chatKit prompt', description: 'runtime chatKit prompt' }],
  },
})

const runtimeProvidedChatKit = useChatKit({
  responseProvider: createMockProvider({
    provider: 'runtime-chat-kit',
    model: 'runtime-chat-kit-model',
  }),
})

const runtimeBridgeSaveCount = ref(0)
const runtimeBridgeConversations: Array<{
  id: string
  title?: string
  createdAt: number
  updatedAt: number
  metadata?: Record<string, unknown>
}> = []
const runtimeBridgeMessageMap = new Map<string, ChatMessage[]>()
const runtimeBridgeStorage: ConversationStorageStrategy = {
  saveConversation(conversation) {
    const nextConversation = { ...conversation }
    const index = runtimeBridgeConversations.findIndex((item) => item.id === nextConversation.id)
    if (index === -1) {
      runtimeBridgeConversations.unshift(nextConversation)
    } else {
      runtimeBridgeConversations.splice(index, 1, nextConversation)
    }
  },
  loadConversations() {
    return runtimeBridgeConversations.map((conversation) => ({ ...conversation }))
  },
  saveMessages(conversationId, messages) {
    runtimeBridgeSaveCount.value += 1
    runtimeBridgeMessageMap.set(
      conversationId,
      messages.map((message) => ({
        ...message,
        metadata: message.metadata ? { ...message.metadata } : message.metadata,
        state:
          message.state && typeof message.state === 'object'
            ? { ...(message.state as Record<string, unknown>) }
            : message.state,
      })),
    )
  },
  loadMessages(conversationId) {
    return runtimeBridgeMessageMap.get(conversationId)?.map((message) => ({ ...message })) ?? []
  },
  deleteConversation(conversationId) {
    const index = runtimeBridgeConversations.findIndex((item) => item.id === conversationId)
    if (index !== -1) {
      runtimeBridgeConversations.splice(index, 1)
    }
    runtimeBridgeMessageMap.delete(conversationId)
  },
}

const runtimeBridgeChat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'runtime-bridge',
    model: 'runtime-bridge-model',
  }),
  storage: runtimeBridgeStorage,
})

function sendRuntimeBridgeMessage() {
  runtimeBridgeChat.sendMessage('runtime-bridge-path')
}

const scaffoldModelLog = ref('')
const scaffoldConfig = createChatSceneConfig({
  ui: {
    brand: {
      title: 'Surface Scaffold',
    },
    welcome: {
      title: 'Scaffold Welcome',
      description: 'Scaffold slot should expose adapter and model state.',
    },
    prompts: [{ label: 'scaffold prompt', description: 'scaffold prompt' }],
  },
})

const scaffoldCallbacks = {
  onModelChange(model: { value: string }) {
    scaffoldModelLog.value = model.value
  },
}

const scaffoldOverrides = {}

const scaffoldDeepseekModel = {
  value: 'deepseek-test',
  label: 'DeepSeek Test',
  providerId: 'deepseek',
}

const providerBranchResponseProvider = createMockProvider({
  provider: 'provider-branch',
  model: 'provider-branch-model',
})

const historySurfaceChat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'history-surface',
    model: 'history-surface-model',
  }),
})

function seedHistorySurface() {
  if (historySurfaceChat.conversations.value.length > 0) {
    return
  }

  const firstConversation = historySurfaceChat.createConversation({ title: 'Alpha Surface' })
  historySurfaceChat.createConversation({ title: 'Beta Surface' })
  void historySurfaceChat.switchConversation(firstConversation.id)
}
</script>

<style scoped>
.surface-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
  min-height: 0;
  overflow: hidden;
  isolation: isolate;
}

.surface-custom-sender {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.surface-custom-sender button,
.surface-diagnostics button,
.history-surface-toolbar button,
.surface-runtime-bridge-toolbar button {
  padding: 6px 12px;
  border: 1px solid #d0d7e2;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.surface-runtime-bridge-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px 0;
  font-size: 12px;
}

.surface-runtime-bridge-toolbar span {
  padding: 2px 6px;
  border-radius: 999px;
  background: #eef2ff;
}

.surface-diagnostics {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 0;
  font-size: 12px;
}

.surface-diagnostics span {
  padding: 2px 6px;
  border-radius: 999px;
  background: #eef2ff;
}

.history-surface-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 420px;
  overflow: hidden;
  isolation: isolate;
}

.history-surface-toolbar {
  display: flex;
  gap: 8px;
}

.history-surface-wrapper :deep(.tr-chat-history-surface) {
  min-height: 360px;
}
</style>
