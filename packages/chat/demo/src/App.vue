<script setup lang="ts">
import { ref } from 'vue'
import BlackboxDemo from './components/BlackboxDemo.vue'
import WhiteboxDemo from './components/WhiteboxDemo.vue'
import DemoFooter from './components/DemoFooter.vue'
import './styles/index.css'

// State
const mode = ref<'blackbox' | 'whitebox'>('whitebox')

// Handlers
function handleError(error: Error) {
  console.error('Chat error:', error)
}
</script>

<template>
  <div class="demo-container">
    <main class="demo-main">
      <!-- Black-box Demo -->
      <template v-if="mode === 'blackbox'">
        <BlackboxDemo @error="handleError" />
      </template>

      <!-- White-box Demo -->
      <template v-else>
        <WhiteboxDemo @error="handleError" />
      </template>

      <!-- Mode Switcher -->
      <div class="mode-switcher">
        <button :class="{ active: mode === 'blackbox' }" @click="mode = 'blackbox'">Black-box</button>
        <button :class="{ active: mode === 'whitebox' }" @click="mode = 'whitebox'">White-box</button>
      </div>
    </main>

    <DemoFooter />
  </div>
</template>

<style scoped>
.mode-switcher {
  position: fixed;
  top: 10px;
  right: 200px;
  display: flex;
  gap: 8px;
  z-index: 1000;
}

.mode-switcher button {
  padding: 8px 16px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-switcher button.active {
  background: #1476ff;
  color: white;
  border-color: #1476ff;
}

.mode-switcher button:hover {
  border-color: #1476ff;
}
</style>

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
