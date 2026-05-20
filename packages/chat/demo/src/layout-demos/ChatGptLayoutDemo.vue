<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'
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
  closedMode: 'rail',
  expandedWidth: isMobile.value ? 'min(84vw, 320px)' : 260,
  collapsedWidth: 52,
}))

const rightAside = computed<ChatAsideConfig>(() => ({
  layoutMode: isMobile.value ? 'drawer' : 'dock',
  expanded: rightExpanded.value,
  closedMode: 'hidden',
  expandedWidth: isMobile.value ? '100vw' : 364,
}))

function handleLeftAsideUpdate(nextConfig?: ChatAsideConfig): void {
  leftExpanded.value = nextConfig?.expanded ?? false
}

function handleRightAsideUpdate(nextConfig?: ChatAsideConfig): void {
  rightExpanded.value = nextConfig?.expanded ?? false
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
      <Chat.Header>
        <Header />
      </Chat.Header>
    </template>

    <template #main>
      <Chat.Main>
        <Main />
      </Chat.Main>
    </template>

    <template #footer>
      <Chat.Footer>
        <Composer />
      </Chat.Footer>
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
