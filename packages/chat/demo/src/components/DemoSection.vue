<script setup lang="ts">
import { TrChat, TrModelSelector, DEFAULT_ROLE_CONFIGS } from '@opentiny/tiny-robot-chat'
import WhiteboxChat from './WhiteboxChat.vue'
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
    <div class="demo-header">
      <div class="demo-info">
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
        <pre><code>{{ code }}</code></pre>
      </div>

      <div class="demo-controls">
        <button
          class="mode-btn"
          :class="{ active: mode === 'blackbox' }"
          @click="$emit('update:mode', 'blackbox')"
          title="Black-box Mode"
        >
          🎯
        </button>
        <button
          class="mode-btn"
          :class="{ active: mode === 'whitebox' }"
          @click="$emit('update:mode', 'whitebox')"
          title="White-box Mode"
        >
          ⚙️
        </button>
      </div>
    </div>

    <div class="demo-chat">
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

.demo-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 280px;
  flex-shrink: 0;
}

.demo-info {
  flex: 1;
}

.demo-info h2 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.demo-info p {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

.demo-info pre {
  margin: 0;
  padding: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 11px;
}

.demo-info code {
  color: #374151;
  font-family: 'Monaco', 'Menlo', monospace;
}

.demo-controls {
  display: flex;
  gap: 8px;
}

.mode-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-btn:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.mode-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
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
