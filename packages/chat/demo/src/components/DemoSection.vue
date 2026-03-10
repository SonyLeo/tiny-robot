<script setup lang="ts">
import { TrChat, TrModelSelector, DEFAULT_ROLE_CONFIGS } from '@opentiny/tiny-robot-chat'
import WhiteboxChat from './WhiteboxChat.vue'
import type { ResponseProvider } from '@opentiny/tiny-robot-chat'
import { Component } from 'vue'

interface BrandConfig {
  title: string
}

interface WelcomeConfig {
  title: string
  icon: Component
  description: string
}

interface PromptItem {
  label: string
  description: string
}

defineProps<{
  mode: 'blackbox' | 'whitebox'
  selectedModel: string
  availableModels: string[]
  responseProvider: ResponseProvider
  brandConfig: BrandConfig
  welcomeConfig: WelcomeConfig
  prompts: PromptItem[]
  bubbleListProps?: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:mode': [value: 'blackbox' | 'whitebox']
  'update:selectedModel': [value: string]
  error: [error: Error]
}>()

function handleError(error: Error) {
  console.error('Chat error:', error)
  emit('error', error)
}
</script>

<template>
  <div class="demo-section">
    <div class="demo-chat">
      <!-- Black-box Mode -->
      <template v-if="mode === 'blackbox'">
        <TrChat
          :response-provider="responseProvider"
          :brand="brandConfig"
          :welcome="welcomeConfig"
          :prompts="prompts"
          :bubble-list-props="bubbleListProps"
          show-feedback
          show-history
          @error="handleError"
        >
          <template #header-extra>
            <TrModelSelector
              :model-value="selectedModel"
              :models="availableModels"
              @update:model-value="$emit('update:selectedModel', $event)"
            />
          </template>
        </TrChat>
      </template>

      <!-- White-box Mode: same features, manually composed -->
      <template v-else>
        <TrChat.Root :response-provider="responseProvider" @error="handleError">
          <WhiteboxChat
            :title="brandConfig.title"
            :welcome-icon="welcomeConfig.icon"
            :welcome-title="welcomeConfig.title"
            :welcome-description="welcomeConfig.description"
            :prompts="prompts"
            :selected-model="selectedModel"
            :available-models="availableModels"
            :role-configs="DEFAULT_ROLE_CONFIGS"
            group-strategy="consecutive"
            @update:selected-model="$emit('update:selectedModel', $event)"
          />
        </TrChat.Root>
      </template>
    </div>
  </div>
</template>

<style scoped>
.demo-section {
  display: flex;
  gap: 16px;
  height: 100%;
}

.demo-chat {
  flex: 1;
  min-width: 0;
}

:deep(.tr-chat) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.tr-chat__message-area) {
  flex: 1;
  overflow-y: auto;
}

:deep(.tr-chat__footer) {
  flex-shrink: 0;
}
</style>
