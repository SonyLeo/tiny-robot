<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { shallowRef, useTemplateRef, watch } from 'vue'
import { Chat } from '@/index'
import type { ChatAsideConfig } from '@/types/layout'
import Composer from './chatgpt/components/Composer.vue'
import Header from './chatgpt/components/Header.vue'
import Main from './chatgpt/components/Main.vue'
import RightPanel from './chatgpt/components/RightPanel.vue'
import Sidebar from './chatgpt/components/Sidebar.vue'

const isMobile = useMediaQuery('(max-width: 959px)')

const leftAside = shallowRef<ChatAsideConfig>({
  layoutMode: 'dock',
  expanded: true,
  expandedWidth: 260,
  collapsedWidth: 52,
  resizable: true,
  minExpandedWidth: 220,
  maxExpandedWidth: 420,
})
const rightAside = shallowRef<ChatAsideConfig>({
  layoutMode: 'dock',
  expanded: true,
  expandedWidth: 364,
  resizable: true,
  minExpandedWidth: 280,
  maxExpandedWidth: 520,
})
const mainRef = useTemplateRef<InstanceType<typeof Main>>('mainRef')

function resolveDesktopWidth(width: ChatAsideConfig['expandedWidth'], fallback: number): number {
  return typeof width === 'number' ? width : fallback
}

watch(
  isMobile,
  (mobile) => {
    leftAside.value = {
      ...leftAside.value,
      layoutMode: mobile ? 'drawer' : 'dock',
      expanded: !mobile,
      expandedWidth: mobile ? 'min(84vw, 320px)' : resolveDesktopWidth(leftAside.value.expandedWidth, 260),
      collapsedWidth: 52,
      resizable: !mobile,
      minExpandedWidth: 220,
      maxExpandedWidth: 420,
    }

    rightAside.value = {
      ...rightAside.value,
      layoutMode: mobile ? 'drawer' : 'dock',
      expanded: !mobile,
      expandedWidth: mobile ? '100vw' : resolveDesktopWidth(rightAside.value.expandedWidth, 364),
      resizable: !mobile,
      minExpandedWidth: 280,
      maxExpandedWidth: 520,
    }
  },
  { immediate: true },
)
</script>

<template>
  <Chat.Layout class="chatgpt-layout-demo" v-model:left-aside="leftAside" v-model:right-aside="rightAside">
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
