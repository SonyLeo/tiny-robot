<script setup lang="ts">
import { ref } from 'vue'
import DemoSection from './components/DemoSection.vue'
import DemoFooter from './components/DemoFooter.vue'
import { useProviderConfig } from './composables/useProviderConfig'
import { WELCOME_CONFIG, PROMPTS, BRAND_CONFIG } from './composables/useDemoConfig'
import { BubbleRenderers } from '@opentiny/tiny-robot'
import { markRaw } from 'vue'
import './styles/index.css'

// State
const mode = ref<'blackbox' | 'whitebox'>('whitebox')
const selectedModel = ref<string>('deepseek-chat')

// Composables
const { responseProvider } = useProviderConfig(selectedModel)

// BubbleList props with Markdown renderer
const bubbleListProps = {
  fallbackContentRenderer: markRaw(BubbleRenderers.Markdown),
}

// Handlers
function handleError(error: Error) {
  console.error('Chat error:', error)
}
</script>

<template>
  <div class="demo-container">
    <main class="demo-main">
      <DemoSection
        :mode="mode"
        :response-provider="responseProvider"
        :brand-config="BRAND_CONFIG"
        :welcome-config="WELCOME_CONFIG"
        :prompts="PROMPTS"
        :bubble-list-props="bubbleListProps"
        @update:mode="mode = $event as 'blackbox' | 'whitebox'"
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

.tr-history {
  padding: 10px;
}
</style>
