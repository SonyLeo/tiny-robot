<template>
  <div class="surface-grid">
    <div data-testid="chat-surface-slots-default" class="chat-wrapper">
      <TrChat :config="slotSurfaceConfig">
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

        <template #content-footer="{ role, messageIndexes }">
          <span v-if="role === 'assistant'" data-testid="surface-content-footer-slot">
            footer-{{ messageIndexes.join('-') }}
          </span>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-surface-header-slot" class="chat-wrapper">
      <TrChat :config="slotSurfaceConfig">
        <template #header>
          <div data-testid="surface-header-slot">Custom Header Slot</div>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-surface-welcome-slot" class="chat-wrapper">
      <TrChat :config="slotSurfaceConfig">
        <template #welcome>
          <div data-testid="surface-welcome-slot">Custom Welcome Slot</div>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-surface-empty-slot" class="chat-wrapper">
      <TrChat :config="emptySlotConfig">
        <template #empty>
          <div data-testid="surface-empty-slot">Custom Empty Slot</div>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-surface-custom-render" class="chat-wrapper">
      <TrChat :config="customRenderConfig">
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

    <div data-testid="chat-surface-provider-chat-kit" class="chat-wrapper">
      <TrChat.Provider :chat-kit="runtimeProvidedChatKit">
        <TrChat.Layout>
          <TrChat.Header title="Provider ChatKit Surface" :show-new-chat="false" />

          <TrChat.Welcome
            v-if="runtimeProvidedChatKit.messages.value.length === 0"
            title="Provider ChatKit Welcome"
            description="An injected chatKit should keep its own responseProvider."
          />

          <TrChat.MessageList v-else auto-scroll />

          <TrChat.Footer>
            <TrChat.Sender placeholder="Provider chatKit sender..." />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Provider>
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

    <div data-testid="chat-surface-granular-model" class="chat-wrapper">
      <TrChat.Root :runtime="granularModelResolution.runtime" :ui="granularModelResolution.ui">
        <div class="surface-diagnostics">
          <span data-testid="surface-granular-current-model">
            {{ granularModelResolution.runtime.models?.currentModelId.value }}
          </span>
          <span data-testid="surface-granular-header-title">
            {{ granularModelResolution.ui.brand?.title }}
          </span>
          <span data-testid="surface-granular-model-log">{{ granularModelLog }}</span>
          <button data-testid="surface-granular-switch-model" @click="switchGranularModel">Switch To DeepSeek</button>
        </div>

        <TrChat.Layout
          :appearance="granularModelResolution.ui.appearance"
          :content-layout="granularModelResolution.ui.contentLayout"
        >
          <TrChat.Header
            :title="granularModelResolution.ui.brand?.title"
            :show-history="false"
            :show-new-chat="false"
          />

          <TrChat.Welcome
            v-if="showGranularModelWelcome"
            :compatibility-relay="false"
            :title="granularModelResolution.ui.welcome?.title"
            :description="granularModelResolution.ui.welcome?.description"
            :prompts="granularModelResolution.ui.welcome?.prompts"
            @prompt-click="granularModelResolution.runtime.conversation.send({ text: $event })"
          />

          <TrChat.MessageList v-else :compatibility-relay="false" />

          <TrChat.Footer>
            <TrChat.Sender />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
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

    <div data-testid="chat-surface-granular-footer-right" class="chat-wrapper">
      <TrChat.Root :runtime="granularFooterRightResolution.runtime" :ui="granularFooterRightResolution.ui">
        <TrChat.Layout
          :appearance="granularFooterRightResolution.ui.appearance"
          :content-layout="granularFooterRightResolution.ui.contentLayout"
        >
          <TrChat.Header :title="granularFooterRightResolution.ui.brand?.title" :show-history="false" />

          <TrChat.Welcome
            v-if="showGranularFooterRightWelcome"
            :compatibility-relay="false"
            :title="granularFooterRightResolution.ui.welcome?.title"
            :description="granularFooterRightResolution.ui.welcome?.description"
            :prompts="granularFooterRightResolution.ui.welcome?.prompts"
            @prompt-click="granularFooterRightResolution.runtime.conversation.send({ text: $event })"
          />

          <TrChat.MessageList v-else :compatibility-relay="false" />

          <TrChat.Footer>
            <TrChat.Sender>
              <template #footer-right>
                <button data-testid="surface-granular-footer-right-slot">Granular Footer Right Slot</button>
              </template>
            </TrChat.Sender>
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>

    <div data-testid="chat-surface-granular-sender-config" class="chat-wrapper">
      <TrChat.Root :runtime="granularSenderConfigResolution.runtime" :ui="granularSenderConfigResolution.ui">
        <TrChat.Layout
          :appearance="granularSenderConfigResolution.ui.appearance"
          :content-layout="granularSenderConfigResolution.ui.contentLayout"
        >
          <TrChat.Header :title="granularSenderConfigResolution.ui.brand?.title" :show-history="false" />

          <TrChat.Welcome
            v-if="showGranularSenderConfigWelcome"
            :compatibility-relay="false"
            :title="granularSenderConfigResolution.ui.welcome?.title"
            :description="granularSenderConfigResolution.ui.welcome?.description"
            :prompts="granularSenderConfigResolution.ui.welcome?.prompts"
            @prompt-click="granularSenderConfigResolution.runtime.conversation.send({ text: $event })"
          />

          <TrChat.MessageList v-else :compatibility-relay="false" />

          <TrChat.Footer>
            <TrChat.Sender />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>

    <div v-if="showGranularCloseShell" data-testid="chat-surface-granular-close" class="chat-wrapper">
      <TrChat.Root :runtime="granularCloseResolution.runtime" :ui="granularCloseResolution.ui">
        <TrChat.Layout
          :appearance="granularCloseResolution.ui.appearance"
          :content-layout="granularCloseResolution.ui.contentLayout"
        >
          <TrChat.Header
            :title="granularCloseResolution.ui.brand?.title"
            :show-history="false"
            :show-new-chat="false"
            show-close
            @close="showGranularCloseShell = false"
          />

          <TrChat.Welcome
            v-if="showGranularCloseWelcome"
            :compatibility-relay="false"
            :title="granularCloseResolution.ui.welcome?.title"
            :description="granularCloseResolution.ui.welcome?.description"
            :prompts="granularCloseResolution.ui.welcome?.prompts"
            @prompt-click="granularCloseResolution.runtime.conversation.send({ text: $event })"
          />

          <TrChat.MessageList v-else :compatibility-relay="false" />

          <TrChat.Footer>
            <TrChat.Sender />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
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
import { computed, ref } from 'vue'
import { TrChat, createRuntimeFromConfig, useChatKit } from '@opentiny/tiny-robot-chat'
import type { ChatMessage, ConversationStorageStrategy } from '@opentiny/tiny-robot-kit'
import { createMockProvider } from '../mockProvider'
import { createOfficialSceneConfig } from './officialSceneConfig'

const SurfaceWelcomeIcon = {
  template: '<span data-testid="surface-welcome-icon">I</span>',
}

const slotSurfaceConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Surface Default Slots',
    welcomeTitle: 'Surface Welcome',
    welcomeDescription: 'Default renderer slot passthrough should stay intact.',
    welcomeIcon: SurfaceWelcomeIcon,
    sender: {
      placeholder: 'slot surface sender...',
      maxLength: 80,
    },
  }),
)

const emptySlotConfig = computed(() => {
  const config = createOfficialSceneConfig({
    brandTitle: 'Empty Slot Surface',
    welcomeTitle: 'Unused Welcome',
    welcomeDescription: 'This welcome content is removed so the empty slot can take over.',
  })

  return {
    ...config,
    ui: {
      ...config.ui,
      welcome: undefined,
    },
  }
})

const customRenderConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Custom Render Surface',
    welcomeTitle: 'Custom Render Surface',
    welcomeDescription: 'Message-list and sender slots should receive live slot props.',
    initialMessages: [
      {
        id: 'custom-render-initial',
        role: 'assistant',
        content: 'Initial custom render message',
      },
    ],
  }),
)

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

const granularModelLog = ref('')
const granularModelConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Surface Granular Model Switch',
    welcomeTitle: 'Granular Model Switch',
    welcomeDescription: 'Manual Root + primitives composition should expose model runtime and page inputs.',
    models: [
      { id: 'openai-test', label: 'OpenAI Test', providerId: 'openai' },
      { id: 'deepseek-test', label: 'DeepSeek Test', providerId: 'deepseek' },
    ],
    defaultModelId: 'openai-test',
    welcomePrompts: [{ label: 'granular prompt', description: 'granular prompt' }],
  }),
)
const granularModelResolution = computed(() => createRuntimeFromConfig(granularModelConfig.value))
const showGranularModelWelcome = computed(
  () => granularModelResolution.value.runtime.conversation.messages.value.length === 0,
)

async function switchGranularModel() {
  const modelsRuntime = granularModelResolution.value.runtime.models
  if (!modelsRuntime) {
    return
  }

  const nextModelId = 'deepseek-test'
  const changed = await Promise.resolve(modelsRuntime.selectModel(nextModelId))
  if (changed !== false) {
    granularModelLog.value = modelsRuntime.currentModelId.value ?? ''
  }
}

const providerBranchResponseProvider = createMockProvider({
  provider: 'provider-branch',
  model: 'provider-branch-model',
})

const granularFooterRightConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Granular Footer Right Surface',
    welcomeTitle: 'Granular Footer Right Surface',
    welcomeDescription:
      'The official granular path should allow footer-right slot replacement without default sender tools.',
  }),
)

const granularFooterRightResolution = computed(() => createRuntimeFromConfig(granularFooterRightConfig.value))
const showGranularFooterRightWelcome = computed(
  () => granularFooterRightResolution.value.runtime.conversation.messages.value.length === 0,
)

const granularSenderConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Granular Sender Config Surface',
    welcomeTitle: 'Granular Sender Config Surface',
    welcomeDescription:
      'The official granular path should allow sender config to disable voice and word-count affordances.',
    sender: {
      wordCount: false,
      voice: {
        enabled: false,
      },
    },
  }),
)

const granularSenderConfigResolution = computed(() => createRuntimeFromConfig(granularSenderConfig.value))
const showGranularSenderConfigWelcome = computed(
  () => granularSenderConfigResolution.value.runtime.conversation.messages.value.length === 0,
)

const showGranularCloseShell = ref(true)
const granularCloseConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Granular Close Surface',
    welcomeTitle: 'Granular Close Surface',
    welcomeDescription: 'Leaf composition should be able to remove the surrounding shell after close.',
  }),
)
const granularCloseResolution = computed(() => createRuntimeFromConfig(granularCloseConfig.value))
const showGranularCloseWelcome = computed(
  () => granularCloseResolution.value.runtime.conversation.messages.value.length === 0,
)

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
