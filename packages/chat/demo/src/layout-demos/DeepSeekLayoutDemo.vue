<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { computed, shallowRef, useTemplateRef, watch } from 'vue'
import { Chat } from '@/index'
import type { ChatAsideConfig } from '@/types/layout'
import Composer from './deepseek/components/Composer.vue'
import Header from './deepseek/components/Header.vue'
import Launcher from './deepseek/components/Launcher.vue'
import Main from './deepseek/components/Main.vue'
import RightPanel from './deepseek/components/RightPanel.vue'
import Sidebar from './deepseek/components/Sidebar.vue'

const isMobile = useMediaQuery('(max-width: 959px)')

const leftAside = shallowRef<ChatAsideConfig>({
  layoutMode: 'dock',
  expandedWidth: 262,
})
const rightAside = shallowRef<ChatAsideConfig>({
  layoutMode: 'dock',
  expandedWidth: 340,
  resizable: true,
  minExpandedWidth: 300,
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
      layoutMode: 'dock',
      expandedWidth: mobile ? 'min(84vw, 320px)' : 262,
    }

    rightAside.value = {
      ...rightAside.value,
      layoutMode: mobile ? 'drawer' : 'dock',
      expanded: mobile ? false : true,
      expandedWidth: mobile ? '100vw' : resolveDesktopWidth(rightAside.value.expandedWidth, 340),
      resizable: !mobile,
      minExpandedWidth: 300,
      maxExpandedWidth: 520,
    }
  },
  { immediate: true },
)

const launcherVisible = computed(() => !isMobile.value && !leftAside.value.expanded)
</script>

<template>
  <div class="deepseek-layout-demo-shell">
    <Chat.Layout class="deepseek-layout-demo" v-model:left-aside="leftAside" v-model:right-aside="rightAside">
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

    <Launcher :visible="launcherVisible" @open="leftAside = { ...leftAside, expanded: true }" />
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
