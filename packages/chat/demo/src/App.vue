<script setup lang="ts">
import { ref } from 'vue'
import DemoSection from './components/DemoSection.vue'
import DemoFooter from './components/DemoFooter.vue'
import { useProviderConfig } from './composables/useProviderConfig'
import { AVAILABLE_MODELS, WELCOME_CONFIG, PROMPTS, BRAND_CONFIG, MODE_INFO } from './composables/useDemoConfig'
import './styles/index.css'

// State
const mode = ref<'blackbox' | 'whitebox'>('blackbox')
const selectedModel = ref<string>('deepseek-chat')

// Composables
const { responseProvider } = useProviderConfig(selectedModel)

// Handlers
function handleError(error: Error) {
  console.error('Chat error:', error)
}
</script>

<template>
  <div class="demo-container">
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
        @update:mode="mode = $event as 'blackbox' | 'whitebox'"
        @update:selected-model="selectedModel = $event"
        @error="handleError"
      />
    </main>

    <DemoFooter />
  </div>
</template>

<style>
.tr-sender:focus,
.tr-sender:focus-within {
  border-color: #1476ff;
  box-shadow: 0 0 6px rgba(20, 118, 255, 0.12) !important;
}
</style>
