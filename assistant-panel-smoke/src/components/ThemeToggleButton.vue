<script setup lang="ts">
import { TrIconButton, useTheme } from '@opentiny/tiny-robot'
import { computed } from 'vue'
import { IconMoon, IconSun } from './icons'

const { resolvedColorMode, toggleColorMode } = useTheme()

const isDark = computed(() => resolvedColorMode?.value === 'dark')
const themeLabel = computed(() => (isDark.value ? 'Dark mode' : 'Light mode'))
const themeIcon = computed(() => (isDark.value ? IconMoon : IconSun))
</script>

<template>
  <TrIconButton
    :icon="themeIcon"
    size="28"
    svgSize="20"
    :title="themeLabel"
    :aria-label="themeLabel"
    @click="toggleColorMode()"
  />
</template>

<style scoped>
:deep(.tr-icon-button) {
  background: transparent;
}
</style>
