<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { computed, shallowRef, useTemplateRef, watch } from 'vue'
import { Chat } from '@/index'
import type { ChatAsideConfig } from '@/types/layout'
import Composer from './chatgpt/components/Composer.vue'
import Header from './chatgpt/components/Header.vue'
import Main from './chatgpt/components/Main.vue'
import RightPanel from './chatgpt/components/RightPanel.vue'
import Sidebar from './chatgpt/components/Sidebar.vue'

const isMobile = useMediaQuery('(max-width: 959px)')

const leftExpanded = shallowRef(true)
const rightExpanded = shallowRef(true)
const leftDockWidth = shallowRef<ChatAsideConfig['expandedWidth']>(260)
const rightDockWidth = shallowRef<ChatAsideConfig['expandedWidth']>(364)
const mainRef = useTemplateRef<InstanceType<typeof Main>>('mainRef')

watch(
  isMobile,
  (mobile) => {
    leftExpanded.value = !mobile
    rightExpanded.value = !mobile
  },
  { immediate: true },
)

const leftAside = computed<ChatAsideConfig>(() => ({
  layoutMode: isMobile.value ? 'drawer' : 'dock',
  expanded: leftExpanded.value,
  expandedWidth: isMobile.value ? 'min(84vw, 320px)' : leftDockWidth.value,
  collapsedWidth: 52,
  resizable: !isMobile.value,
  minExpandedWidth: 220,
  maxExpandedWidth: 420,
}))

const rightAside = computed<ChatAsideConfig>(() => ({
  layoutMode: isMobile.value ? 'drawer' : 'dock',
  expanded: rightExpanded.value,
  expandedWidth: isMobile.value ? '100vw' : rightDockWidth.value,
  resizable: !isMobile.value,
  minExpandedWidth: 280,
  maxExpandedWidth: 520,
}))

function handleLeftAsideUpdate(nextConfig?: ChatAsideConfig): void {
  leftExpanded.value = nextConfig?.expanded ?? false

  if (!isMobile.value && nextConfig?.expandedWidth !== undefined) {
    leftDockWidth.value = nextConfig.expandedWidth
  }
}

function handleRightAsideUpdate(nextConfig?: ChatAsideConfig): void {
  rightExpanded.value = nextConfig?.expanded ?? false

  if (!isMobile.value && nextConfig?.expandedWidth !== undefined) {
    rightDockWidth.value = nextConfig.expandedWidth
  }
}
</script>

<template>
  <Chat.Layout
    class="chatgpt-layout-demo"
    :left-aside="leftAside"
    :right-aside="rightAside"
    @update:left-aside="handleLeftAsideUpdate"
    @update:right-aside="handleRightAsideUpdate"
  >
    <template #left-aside>
      <Sidebar />
    </template>

    <template #header>
      <Header />
    </template>

    <template #main>
      <Chat.Main :scroll-host="mainRef">
        <Main ref="mainRef" />
      </Chat.Main>
    </template>

    <template #footer>
      <Composer />
    </template>

    <template #right-aside>
      <RightPanel />
    </template>
  </Chat.Layout>
</template>

<style scoped>
.chatgpt-layout-demo {
  --tr-chat-layout-content-max-width: 1040px;
  --tr-chat-layout-left-bg: #fbfbf8;
  --tr-chat-layout-divider-color: #ece9e3;
  --tr-chat-layout-inner-padding-inline: 24px;
  --tr-chat-layout-transition-duration: 240ms;
  --tr-chat-layout-transition-easing: cubic-bezier(0, 0, 0.2, 1);
}
</style>
