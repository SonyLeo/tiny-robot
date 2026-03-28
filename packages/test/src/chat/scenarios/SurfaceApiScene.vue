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

    <div data-testid="chat-surface-root-provider" class="chat-wrapper">
      <TrChat.Root :response-provider="rootProvider">
        <TrChat.Layout :appearance="{ mode: 'dark' }">
          <TrChat.Header :show-new-chat="false">
            <template #title>
              <span data-testid="surface-root-title-slot">Root Provider Title Slot</span>
            </template>
            <template #extra>
              <span data-testid="surface-root-extra-slot">Root Extra Slot</span>
            </template>
          </TrChat.Header>

          <TrChat.MessageList auto-scroll />

          <TrChat.Footer>
            <TrChat.Sender placeholder="Root provider sender..." />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>

    <div data-testid="chat-surface-history-surface" class="history-surface-wrapper">
      <div class="history-surface-toolbar">
        <button data-testid="history-surface-seed" @click="seedHistorySurface">Seed Conversations</button>
      </div>

      <TrChat.Root :chat-kit="historySurfaceChat">
        <TrChat.HistorySurface />
      </TrChat.Root>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
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

const rootProvider = createMockProvider({
  provider: 'root-provider',
  model: 'root-provider-model',
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
}

.surface-custom-sender {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.surface-custom-sender button,
.surface-diagnostics button,
.history-surface-toolbar button {
  padding: 6px 12px;
  border: 1px solid #d0d7e2;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
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
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 420px;
}

.history-surface-toolbar {
  display: flex;
  gap: 8px;
}

.history-surface-wrapper :deep(.tr-chat-history-surface) {
  min-height: 360px;
}
</style>
