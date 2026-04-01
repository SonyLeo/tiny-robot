<script setup lang="ts">
import { computed, ref } from 'vue'
import { ThemeProvider } from '@opentiny/tiny-robot'
import type { ColorMode } from '@opentiny/tiny-robot'
import BlackboxDemo from './components/BlackboxDemo.vue'
import GranularWorkspaceDemo from './components/GranularWorkspaceDemo.vue'
import WhiteboxDemo from './components/WhiteboxDemo.vue'
import './styles/index.css'

const demoCases = [
  {
    id: 'blackbox',
    label: '默认接入',
    component: BlackboxDemo,
  },
  {
    id: 'whitebox',
    label: '结构装配',
    component: WhiteboxDemo,
  },
  {
    id: 'granular',
    label: '面板粒度',
    component: GranularWorkspaceDemo,
  },
] as const

const activeCaseId = ref<(typeof demoCases)[number]['id']>('blackbox')
const colorMode = ref<ColorMode>('auto')
const colorModeOptions: Array<{ value: ColorMode; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]
const activeCase = computed(() => demoCases.find((item) => item.id === activeCaseId.value) ?? demoCases[0])
</script>

<template>
  <ThemeProvider v-model:color-mode="colorMode">
    <div class="demo-app">
      <header class="demo-app__toolbar">
        <div class="demo-app__switch" role="tablist" aria-label="Chat demo cases">
          <button
            v-for="item in demoCases"
            :key="item.id"
            type="button"
            class="demo-app__switch-button"
            :class="{ 'is-active': item.id === activeCaseId }"
            :aria-selected="item.id === activeCaseId"
            @click="activeCaseId = item.id"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="demo-app__theme" role="group" aria-label="Theme mode">
          <span class="demo-app__theme-label">Theme</span>
          <div class="demo-app__theme-buttons">
            <button
              v-for="option in colorModeOptions"
              :key="option.value"
              type="button"
              class="demo-app__theme-button"
              :class="{ 'is-active': option.value === colorMode }"
              :aria-pressed="option.value === colorMode"
              @click="colorMode = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </header>

      <main class="demo-app__stage">
        <KeepAlive>
          <component :is="activeCase.component" :key="activeCase.id" />
        </KeepAlive>
      </main>
    </div>
  </ThemeProvider>
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
