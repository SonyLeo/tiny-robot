<script setup lang="ts">
import {
  BubbleRenderers,
  TrBubbleList,
  TrBubbleProvider,
  TrDropdownMenu,
  TrSender,
  type BubbleRoleConfig,
} from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { computed, h } from 'vue'
import { useChat } from '../composables/useChat'
import ChatWelcome from './ChatWelcome.vue'
import McpPanelTrigger from './McpPanelTrigger.vue'

const props = defineProps<{
  fullscreen?: boolean
}>()

const {
  inputMessage,
  messages,
  visibleMessages,
  isProcessing,
  hasApiConfig,
  sendMessage,
  abortRequest,
  modelOptions,
  selectedModel,
  selectedModelId,
  availableModelCount,
} = useChat()

const assistantAvatar = h(IconAi, { style: { fontSize: '28px' } })
const userAvatar = h(IconUser, { style: { fontSize: '28px' } })

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: assistantAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
  system: {
    hidden: true,
  },
}

const senderPlaceholder = computed(() => {
  if (!hasApiConfig) {
    return availableModelCount.value > 0 ? 'Current model is unavailable.' : 'Fill provider keys in .env first.'
  }

  return isProcessing.value ? 'Assistant is thinking...' : 'Ask anything...'
})

const modelMenuItems = computed(() =>
  modelOptions.map((item) => ({
    id: item.id,
    text: item.name,
    disabled: !item.apiKey,
  })),
)

const compactActions = computed(() => !props.fullscreen)

function handleModelSelect(item: { id?: string }) {
  if (!item.id) {
    return
  }
  selectedModelId.value = item.id
}
</script>

<template>
  <section class="conversation-shell">
    <div class="conversation-body">
      <p v-if="!hasApiConfig" class="config-warning">
        <template v-if="availableModelCount > 0">Current model has no API key. Switch to an available model.</template>
        <template v-else>Missing provider keys. Update <code>.env</code> before sending messages.</template>
      </p>

      <TrBubbleProvider :fallback-content-renderer="BubbleRenderers.Markdown">
        <ChatWelcome v-if="visibleMessages.length === 0" @submit="sendMessage" />
        <TrBubbleList v-else :messages="messages" :role-configs="roles" :auto-scroll="true" class="conversation-list" />
      </TrBubbleProvider>
    </div>

    <div class="conversation-footer">
      <TrSender
        v-model="inputMessage"
        class="conversation-sender"
        mode="multiple"
        :placeholder="senderPlaceholder"
        :clearable="true"
        :loading="isProcessing"
        :disabled="!hasApiConfig"
        @submit="sendMessage"
        @cancel="abortRequest"
      >
        <template #footer>
          <div class="model-actions">
            <McpPanelTrigger :compact="compactActions" />
            <TrDropdownMenu :items="modelMenuItems" trigger="click" @item-click="handleModelSelect">
              <template #trigger>
                <button
                  class="sender-action-btn sender-model-btn"
                  :class="{ 'sender-model-btn--compact': compactActions }"
                  type="button"
                >
                  <component :is="selectedModel?.icon" :size="16" class="sender-action-btn__icon" />
                  <span v-if="!compactActions">{{ selectedModel?.name || '选择模型' }}</span>
                </button>
              </template>
            </TrDropdownMenu>
          </div>
        </template>
      </TrSender>
    </div>
  </section>
</template>

<style scoped>
.conversation-shell {
  container-type: inline-size;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 16px;
}

.conversation-body,
.conversation-footer {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

.conversation-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-warning {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--tr-radius-md);
  background: var(--tr-color-warning-light);
  color: var(--tr-color-warning);
  font-size: var(--tr-font-size-sm);
}

.conversation-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 4px 0 0;
}

.conversation-sender {
  flex-shrink: 0;
}

.model-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sender-action-btn {
  border: 1px solid var(--tr-border-color-disabled);
  border-radius: var(--tr-radius-full);
  background: var(--tr-container-bg-default);
  color: var(--tr-text-secondary);
  font-size: var(--tr-font-size-sm);
  height: 32px;
  padding: 0 10px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sender-model-btn--compact {
  min-width: 32px;
  padding: 0;
  justify-content: center;
}

.sender-action-btn__icon {
  flex-shrink: 0;
}

.sender-action-btn:hover:not(:disabled) {
  border-color: var(--tr-border-color-hover);
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-hover);
}

.sender-action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (max-width: 767px) {
  .conversation-shell {
    padding: 0 12px 12px;
  }
}

:deep() {
  [data-box-type='box'][data-role='user'] {
    --tr-bubble-box-bg: var(--tr-color-primary-light);
  }

  [data-box-type='box']:not([data-role='user']) {
    --tr-bubble-box-bg: transparent;
  }

  [data-type='markdown'] p {
    margin: 0;
  }

  .conversation-sender .tr-sender {
    box-shadow: none;
    background: transparent;
  }
}
</style>
