<script setup lang="ts">
import { computed, ref } from 'vue'
import { ThemeProvider } from '@opentiny/tiny-robot'
import BlackboxDemo from './components/BlackboxDemo.vue'
import WhiteboxDemo from './components/WhiteboxDemo.vue'
import './styles/index.css'

const demoCases = [
  {
    id: 'blackbox',
    label: 'Blackbox',
    component: BlackboxDemo,
  },
  {
    id: 'whitebox',
    label: 'Whitebox',
    component: WhiteboxDemo,
  },
] as const

const activeCaseId = ref<(typeof demoCases)[number]['id']>('blackbox')
const activeCase = computed(() => demoCases.find((item) => item.id === activeCaseId.value) ?? demoCases[0])
</script>

<template>
  <ThemeProvider>
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
