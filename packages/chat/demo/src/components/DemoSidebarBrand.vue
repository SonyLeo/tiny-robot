<script setup lang="ts">
import { IconAi } from '@opentiny/tiny-robot-svgs'

defineProps<{
  collapsed: boolean
}>()
</script>

<template>
  <div class="demo-panel__brand" :class="{ 'demo-panel__brand--collapsed': collapsed }">
    <IconAi class="demo-logo" />
    <span class="demo-panel__brand-label" :class="{ 'demo-panel__brand-label--hidden': collapsed }"
      >TinyRobot Chat</span
    >
  </div>
</template>

<style scoped>
.demo-panel__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  font-size: 15px;
  font-weight: 700;
  transition: gap 200ms ease;
}

.demo-panel__brand-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
  opacity: 1;
  transition:
    max-width 200ms ease,
    opacity 200ms ease;
}

.demo-panel__brand-label--hidden {
  max-width: 0;
  opacity: 0;
}

.demo-panel__brand--collapsed {
  width: 36px;
  gap: 0;
  justify-content: center;
}

.demo-logo {
  flex: none;
  font-size: 24px;
}
</style>
