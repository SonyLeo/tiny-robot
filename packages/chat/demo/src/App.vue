<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ThemeProvider } from '@opentiny/tiny-robot'
import type { ColorMode } from '@opentiny/tiny-robot'
import type { ChatContentLayout } from '@opentiny/tiny-robot-chat'
import RootPrimitivesDemo from './components/RootPrimitivesDemo.vue'
import BlackboxDemo from './components/BlackboxDemo.vue'
import RootPageDemo from './components/RootPageDemo.vue'
import './styles/index.css'

const demoCases = [
  { id: 'trchat', label: '路径 1 · TrChat', component: BlackboxDemo },
  { id: 'whitebox', label: '路径 2 · Root + Page', component: RootPageDemo },
  { id: 'granular', label: '路径 3 · Root + primitives', component: RootPrimitivesDemo },
] as const

type DemoCaseId = (typeof demoCases)[number]['id']

const DEFAULT_DEMO_CASE_ID: DemoCaseId = 'trchat'
const demoCaseIds = new Set<DemoCaseId>(demoCases.map((item) => item.id))

function resolveRouteCaseId(): DemoCaseId {
  if (typeof window === 'undefined') return DEFAULT_DEMO_CASE_ID
  const routeId = window.location.hash.replace(/^#\/?/, '').split(/[/?&]/)[0]
  return demoCaseIds.has(routeId as DemoCaseId) ? (routeId as DemoCaseId) : DEFAULT_DEMO_CASE_ID
}

const activeCaseId = ref<DemoCaseId>(resolveRouteCaseId())
const colorMode = ref<ColorMode>('light')
const contentLayout = ref<ChatContentLayout>('centered')

function switchCase(id: DemoCaseId) {
  window.location.hash = `#${id}`
}

function syncActiveCaseFromRoute() {
  activeCaseId.value = resolveRouteCaseId()
}

onMounted(() => window.addEventListener('hashchange', syncActiveCaseFromRoute))
onBeforeUnmount(() => window.removeEventListener('hashchange', syncActiveCaseFromRoute))
</script>

<template>
  <ThemeProvider v-model:color-mode="colorMode">
    <div class="demo-app">
      <nav class="demo-app__nav">
        <button
          v-for="item in demoCases"
          :key="item.id"
          type="button"
          class="demo-app__nav-item"
          :class="{ 'is-active': activeCaseId === item.id }"
          @click="switchCase(item.id)"
        >
          {{ item.label }}
        </button>
      </nav>

      <main class="demo-app__stage">
        <component
          :is="demoCases.find((c) => c.id === activeCaseId)!.component"
          :color-mode="colorMode"
          :content-layout="contentLayout"
          @update:color-mode="colorMode = $event"
          @update:content-layout="contentLayout = $event"
        />
      </main>
    </div>
  </ThemeProvider>
</template>

<style>
.demo-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.demo-app__nav {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
  padding: 6px 12px;
  background: var(--chat-panel-bg, #f5f5f5);
  border-bottom: 1px solid var(--chat-border-color, #e5e5e5);
}

.demo-app__nav-item {
  padding: 6px 14px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--chat-text-secondary, #666);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s;
}

.demo-app__nav-item:hover {
  background: var(--chat-panel-bg-muted, #eaeaea);
}

.demo-app__nav-item.is-active {
  background: var(--chat-primary-color, #1476ff);
  color: #fff;
}

.demo-app__stage {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.tr-sender:focus,
.tr-sender:focus-within {
  border-color: #1476ff;
  box-shadow: 0 0 6px rgba(20, 118, 255, 0.12) !important;
}

.tr-history {
  padding: 10px;
}
</style>
