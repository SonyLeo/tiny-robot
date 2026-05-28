<script setup lang="ts">
import { IconAi } from '@opentiny/tiny-robot-svgs'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'open'): void
}>()
</script>

<template>
  <button v-if="!show" class="launcher-button" type="button" aria-label="Open assistant panel" @click="emit('open')">
    <IconAi :size="32" class="launcher-button__icon" />
  </button>
</template>

<style scoped>
.launcher-button {
  position: fixed;
  right: var(--assistant-panel-offset);
  bottom: var(--assistant-panel-offset);
  z-index: var(--tr-z-index-drawer);
  width: var(--assistant-launcher-size);
  height: var(--assistant-launcher-size);
  border: 1px solid var(--assistant-launcher-border);
  border-radius: var(--tr-radius-full);
  background: var(--assistant-launcher-bg);
  color: var(--assistant-launcher-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--assistant-launcher-shadow);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.launcher-button:hover {
  transform: translateY(-2px) scale(1.02);
}

.launcher-button__icon {
  filter: drop-shadow(0 2px 6px rgba(20, 118, 255, 0.14));
}

@media (max-width: 767px) {
  .launcher-button {
    right: 16px;
    bottom: 16px;
  }
}
</style>
