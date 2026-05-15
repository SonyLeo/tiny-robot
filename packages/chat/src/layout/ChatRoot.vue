<script setup lang="ts">
import { toRef } from 'vue'
import { useChatLayoutStore } from '@/composables/useChatLayoutStore'
import { provideChatLayoutStore } from '@/context/layoutContext'
import { DEFAULT_MOBILE_BREAKPOINT } from '@/shared/constants'
import type { ChatRootProps } from '@/types/layout'

defineOptions({
  name: 'ChatRoot',
})

const props = withDefaults(defineProps<ChatRootProps>(), {
  mobileBreakpoint: DEFAULT_MOBILE_BREAKPOINT,
  defaultLeftSidebarOpen: true,
  defaultRightPanelOpen: false,
})

const layoutStore = useChatLayoutStore({
  mobileBreakpoint: toRef(props, 'mobileBreakpoint'),
  defaultLeftSidebarOpen: props.defaultLeftSidebarOpen,
  defaultRightPanelOpen: props.defaultRightPanelOpen,
})

provideChatLayoutStore(layoutStore)
</script>

<template>
  <slot />
</template>
