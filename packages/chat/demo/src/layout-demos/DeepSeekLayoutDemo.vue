<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'
import { Chat } from '@/index'
import type { ChatAsideConfig } from '@/types/layout'
import Composer from './deepseek/components/Composer.vue'
import Header from './deepseek/components/Header.vue'
import Launcher from './deepseek/components/Launcher.vue'
import Main from './deepseek/components/Main.vue'
import RightPanel from './deepseek/components/RightPanel.vue'
import Sidebar from './deepseek/components/Sidebar.vue'

const isMobile = useMediaQuery('(max-width: 959px)')

const leftExpanded = shallowRef(false)
const rightExpanded = shallowRef(false)

watch(
  isMobile,
  (mobile) => {
    if (mobile) {
      rightExpanded.value = false
    }
  },
  { immediate: true },
)

const leftAside = computed<ChatAsideConfig>(() => ({
  layoutMode: 'drawer',
  expanded: leftExpanded.value,
  expandedWidth: isMobile.value ? 'min(84vw, 320px)' : 262,
}))

const rightAside = computed<ChatAsideConfig>(() => ({
  layoutMode: isMobile.value ? 'drawer' : 'dock',
  expanded: rightExpanded.value,
  expandedWidth: isMobile.value ? '100vw' : 320,
}))

function handleLeftAsideUpdate(nextConfig?: ChatAsideConfig): void {
  leftExpanded.value = nextConfig?.expanded ?? false
}

function handleRightAsideUpdate(nextConfig?: ChatAsideConfig): void {
  rightExpanded.value = nextConfig?.expanded ?? false
}
</script>

<template>
  <div class="deepseek-layout-demo-shell">
    <Chat.Layout
      class="deepseek-layout-demo"
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
        <Chat.Main>
          <Main />
        </Chat.Main>
      </template>

      <template #footer>
        <Composer />
      </template>

      <template #right-aside>
        <RightPanel />
      </template>
    </Chat.Layout>

    <Launcher :visible="!isMobile && !leftExpanded" @open="leftExpanded = true" />
  </div>
</template>

<style scoped>
.deepseek-layout-demo-shell {
  position: relative;
  width: 100%;
  height: 100%;
}

.deepseek-layout-demo {
  --tr-chat-layout-divider-color: #edf1f7;
  --tr-chat-layout-content-max-width: none;
  --tr-chat-layout-header-padding-inline: 26px;
  --tr-chat-layout-main-padding-inline: 28px;
  --tr-chat-layout-footer-padding-inline: 24px;
  --tr-chat-layout-inner-padding-block: 0px;
  --tr-chat-layout-transition-duration: 0.3s;
  --tr-chat-layout-transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 959px) {
  .deepseek-layout-demo {
    --tr-chat-layout-header-padding-inline: 18px;
    --tr-chat-layout-main-padding-inline: 16px;
    --tr-chat-layout-footer-padding-inline: 16px;
  }
}
</style>
