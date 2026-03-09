<script setup lang="ts">
import { TrChat, TrModelSelector } from '@opentiny/tiny-robot-chat'
import type { ResponseProvider } from '@opentiny/tiny-robot-chat'

interface BrandConfig {
  title: string
}

interface WelcomeConfig {
  title: string
  description: string
}

interface PromptItem {
  label: string
  description: string
}

defineProps<{
  title: string
  description: string
  code: string
  mode: 'blackbox' | 'whitebox'
  selectedModel: string
  availableModels: string[]
  responseProvider: ResponseProvider
  brandConfig: BrandConfig
  welcomeConfig: WelcomeConfig
  prompts: PromptItem[]
}>()

const emit = defineEmits<{
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
    <div class="demo-info">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <pre><code>{{ code }}</code></pre>
    </div>

    <div class="demo-chat">
      <div class="chat-header-extra">
        <TrModelSelector
          :model-value="selectedModel"
          :models="availableModels"
          @update:model-value="$emit('update:selectedModel', $event)"
        />
      </div>

      <!-- Black-box Mode -->
      <template v-if="mode === 'blackbox'">
        <TrChat
          :response-provider="responseProvider"
          :brand="brandConfig"
          :welcome="welcomeConfig"
          :prompts="prompts"
          show-feedback
          show-history
          @error="handleError"
        />
      </template>

      <!-- White-box Mode -->
      <template v-else>
        <TrChat.Root :response-provider="responseProvider" @error="handleError">
          <div class="tr-chat">
            <TrChat.Header :title="brandConfig.title" show-history>
              <template #extra>
                <TrModelSelector
                  :model-value="selectedModel"
                  :models="availableModels"
                  @update:model-value="$emit('update:selectedModel', $event)"
                />
              </template>
            </TrChat.Header>
            <TrChat.MessageList />
            <TrChat.Footer>
              <TrChat.Sender />
            </TrChat.Footer>
          </div>
        </TrChat.Root>
      </template>
    </div>
  </div>
</template>

<style scoped>
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

:deep(.tr-model-selector) {
  min-width: 200px;
}
</style>
