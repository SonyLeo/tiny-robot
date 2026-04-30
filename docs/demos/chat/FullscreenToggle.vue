<template>
  <!--
    文档示例辅助组件，仅用于在嵌入式文档页面中提供全屏预览能力。
    不是 @opentiny/tiny-robot-chat 的内置组件，业务项目中无需引入。
  -->
  <button ref="btnRef" class="fullscreen-toggle" :title="isFullscreen ? '退出全屏' : '全屏预览'" @click="toggle">
    <svg
      v-if="!isFullscreen"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  target?: string
}>()

const btnRef = ref<HTMLButtonElement | null>(null)
const isFullscreen = ref(false)
let targetEl: HTMLElement | null = null

function resolveTarget(): HTMLElement | null {
  if (!btnRef.value) return null
  if (props.target) return document.querySelector(props.target)
  return btnRef.value.closest('.demo-container') as HTMLElement | null
}

function toggle() {
  isFullscreen.value = !isFullscreen.value
  targetEl = resolveTarget()
  if (!targetEl) return

  if (isFullscreen.value) {
    targetEl.classList.add('is-demo-fullscreen')
    document.body.style.overflow = 'hidden'
  } else {
    exit()
  }
}

function exit() {
  isFullscreen.value = false
  targetEl?.classList.remove('is-demo-fullscreen')
  targetEl = null
  document.body.style.overflow = ''
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) exit()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  exit()
})
</script>

<style scoped>
.fullscreen-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--chat-text-secondary, #6b7280);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.fullscreen-toggle:hover {
  background: var(--chat-surface-bg-hover, rgba(15, 23, 42, 0.06));
  color: var(--chat-text-primary, #111827);
}
</style>

<style>
.is-demo-fullscreen {
  position: fixed !important;
  inset: 0 !important;
  z-index: 9999 !important;
  height: 100dvh !important;
  width: 100vw !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: var(--vp-c-bg, #fff) !important;
}
</style>
