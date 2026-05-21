<script setup lang="ts">
import { computed, markRaw, shallowRef } from 'vue'
import ContainerLayoutDemo from './layout-demos/ContainerLayoutDemo.vue'
import ChatGptLayoutDemo from './layout-demos/ChatGptLayoutDemo.vue'
import DeepSeekLayoutDemo from './layout-demos/DeepSeekLayoutDemo.vue'

const demos = [
  {
    id: 'container',
    label: 'Container',
    component: markRaw(ContainerLayoutDemo),
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    component: markRaw(DeepSeekLayoutDemo),
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    component: markRaw(ChatGptLayoutDemo),
  },
] as const

type DemoId = (typeof demos)[number]['id']

const activeDemoId = shallowRef<DemoId>('deepseek')
const activeDemo = computed(() => demos.find((demo) => demo.id === activeDemoId.value) ?? demos[0])
const dockClass = computed(() => ({
  'demo-shell__dock--left': activeDemoId.value === 'container',
}))
</script>

<template>
  <div class="demo-shell">
    <component :is="activeDemo.component" />

    <aside class="demo-shell__dock" :class="dockClass">
      <div class="demo-shell__buttons">
        <button
          v-for="demo in demos"
          :key="demo.id"
          class="demo-shell__button"
          :class="{ 'is-active': demo.id === activeDemoId }"
          type="button"
          @click="activeDemoId = demo.id"
        >
          {{ demo.label }}
        </button>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.demo-shell {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
}

.demo-shell__dock {
  position: fixed;
  right: 14px;
  bottom: 14px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(18px);
}

.demo-shell__dock--left {
  right: auto;
  left: 14px;
}

.demo-shell__buttons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.demo-shell__button {
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid #dde3ef;
  border-radius: 999px;
  background: #ffffff;
  color: #111827;
  font-size: 13px;
  cursor: pointer;
}

.demo-shell__button.is-active {
  border-color: #355dff;
  background: #eef3ff;
  color: #355dff;
}

@media (max-width: 959px) {
  .demo-shell__dock {
    display: none;
  }
}
</style>
