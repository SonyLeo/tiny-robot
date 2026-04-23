<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ThemeProvider } from '@opentiny/tiny-robot'
import type { ColorMode } from '@opentiny/tiny-robot'
import type { ChatContentLayout } from '@opentiny/tiny-robot-chat'
import BlackboxDemo from './components/BlackboxDemo.vue'
import GranularWorkspaceDemo from './components/GranularWorkspaceDemo.vue'
import WhiteboxDemo from './components/WhiteboxDemo.vue'
import './styles/index.css'

const demoCases = [
  {
    id: 'blackbox',
    label: 'TrChat',
    component: BlackboxDemo,
  },
  {
    id: 'whitebox',
    label: 'Root + Page',
    component: WhiteboxDemo,
  },
  {
    id: 'granular',
    label: 'Root + primitives',
    component: GranularWorkspaceDemo,
  },
] as const

type DemoCaseId = (typeof demoCases)[number]['id']

const DEFAULT_DEMO_CASE_ID: DemoCaseId = 'blackbox'
const demoCaseIds = new Set<DemoCaseId>(demoCases.map((item) => item.id))

function resolveRouteCaseId(): DemoCaseId {
  if (typeof window === 'undefined') {
    return DEFAULT_DEMO_CASE_ID
  }

  const routeId = window.location.hash.replace(/^#\/?/, '').split(/[/?&]/)[0]

  return demoCaseIds.has(routeId as DemoCaseId) ? (routeId as DemoCaseId) : DEFAULT_DEMO_CASE_ID
}

const activeCaseId = ref<DemoCaseId>(resolveRouteCaseId())
const colorMode = ref<ColorMode>('light')
const contentLayout = ref<ChatContentLayout>('centered')
const activeCase = computed(() => demoCases.find((item) => item.id === activeCaseId.value) ?? demoCases[0])

function syncActiveCaseFromRoute() {
  activeCaseId.value = resolveRouteCaseId()
}

onMounted(() => {
  window.addEventListener('hashchange', syncActiveCaseFromRoute)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', syncActiveCaseFromRoute)
})
</script>

<template>
  <ThemeProvider v-model:color-mode="colorMode">
    <div class="demo-app">
      <main class="demo-app__stage">
        <KeepAlive>
          <component
            :is="activeCase.component"
            :key="activeCase.id"
            :color-mode="colorMode"
            :content-layout="contentLayout"
            @update:color-mode="colorMode = $event"
            @update:content-layout="contentLayout = $event"
          />
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
