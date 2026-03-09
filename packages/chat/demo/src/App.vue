<script setup lang="ts">
import { ref } from 'vue'
import DemoHeader from './components/DemoHeader.vue'
import DemoSection from './components/DemoSection.vue'
import DemoFooter from './components/DemoFooter.vue'
import { useProviderConfig } from './composables/useProviderConfig'
import { AVAILABLE_MODELS, WELCOME_CONFIG, PROMPTS, BRAND_CONFIG, MODE_INFO } from './composables/useDemoConfig'
import './styles/index.css'

// State
const mode = ref<'blackbox' | 'whitebox'>('blackbox')
const selectedModel = ref<string>('gpt-4o')

// Composables
const { responseProvider, apiKeyStatus } = useProviderConfig(selectedModel)

// Handlers
function handleError(error: Error) {
  console.error('Chat error:', error)
}
</script>

<template>
  <div class="demo-container">
    <DemoHeader
      :mode="mode"
      :selected-model="selectedModel"
      :has-api-key="apiKeyStatus.hasKey"
      :is-open-a-i="apiKeyStatus.isOpenAI"
      @update:mode="mode = $event as 'blackbox' | 'whitebox'"
      @update:selected-model="selectedModel = $event"
    />

    <main class="demo-main">
      <DemoSection
        :title="MODE_INFO[mode].title"
        :description="MODE_INFO[mode].description"
        :code="MODE_INFO[mode].code"
        :mode="mode"
        :selected-model="selectedModel"
        :available-models="AVAILABLE_MODELS"
        :response-provider="responseProvider"
        :brand-config="BRAND_CONFIG"
        :welcome-config="WELCOME_CONFIG"
        :prompts="PROMPTS"
        @update:selected-model="selectedModel = $event"
        @error="handleError"
      />
    </main>

    <DemoFooter />
  </div>
</template>
