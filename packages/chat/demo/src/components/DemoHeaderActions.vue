<script setup lang="ts">
import { computed } from 'vue'
import type { ColorMode } from '@opentiny/tiny-robot'
import type { ChatContentLayout } from '@opentiny/tiny-robot-chat'
import IconMax from './icons/IconMax.vue'
import IconMini from './icons/IconMini.vue'
import IconMoon from './icons/IconMoon.vue'
import IconSun from './icons/IconSun.vue'

const props = defineProps<{
  colorMode: ColorMode
  contentLayout: ChatContentLayout
}>()

const emit = defineEmits<{
  (e: 'update:colorMode', value: ColorMode): void
  (e: 'update:contentLayout', value: ChatContentLayout): void
}>()

const isDarkMode = computed(() => props.colorMode === 'dark')
const isWideLayout = computed(() => props.contentLayout === 'wide')
const themeTitle = computed(() => (isDarkMode.value ? 'Switch to light theme' : 'Switch to dark theme'))
const layoutTitle = computed(() => (isWideLayout.value ? 'Use centered width' : 'Use full width'))

function toggleTheme() {
  emit('update:colorMode', isDarkMode.value ? 'light' : 'dark')
}

function toggleContentLayout() {
  emit('update:contentLayout', isWideLayout.value ? 'centered' : 'wide')
}
</script>

<template>
  <div class="demo-header-actions">
    <button
      type="button"
      class="demo-header-actions__button"
      :class="{ 'is-active': isDarkMode }"
      :aria-label="themeTitle"
      :title="themeTitle"
      @click="toggleTheme"
    >
      <IconMoon v-if="isDarkMode" />
      <IconSun v-else />
    </button>

    <button
      type="button"
      class="demo-header-actions__button"
      :class="{ 'is-active': isWideLayout }"
      :aria-label="layoutTitle"
      :title="layoutTitle"
      @click="toggleContentLayout"
    >
      <IconMini v-if="isWideLayout" />
      <IconMax v-else />
    </button>
  </div>
</template>

<style scoped>
.demo-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.demo-header-actions__button {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--chat-text-secondary);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.demo-header-actions__button:hover,
.demo-header-actions__button.is-active {
  background: var(--chat-panel-bg-muted);
  color: var(--chat-text-primary);
}

.demo-header-actions__button svg {
  width: 16px;
  height: 16px;
}
</style>
