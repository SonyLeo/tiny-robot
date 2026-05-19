<script setup lang="ts">
import { Chat } from '@/index'
import Composer from './deepseek/components/Composer.vue'
import Header from './deepseek/components/Header.vue'
import Launcher from './deepseek/components/Launcher.vue'
import Main from './deepseek/components/Main.vue'
import RightPanel from './deepseek/components/RightPanel.vue'
import Sidebar from './deepseek/components/Sidebar.vue'
</script>

<template>
  <div class="deepseek-layout-demo-shell">
    <Chat.Layout class="deepseek-layout-demo" :left="{ defaultState: 'hidden', restingState: 'hidden' }">
      <template #left-sidebar>
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

      <template #right-panel>
        <RightPanel />
      </template>

      <template #page-layer>
        <Launcher />
      </template>
    </Chat.Layout>
  </div>
</template>

<style scoped>
.deepseek-layout-demo-shell {
  height: 100%;
}

.deepseek-layout-demo {
  --tr-chat-layout-left-sidebar-width: 262px;
  --tr-chat-layout-mobile-left-width: min(84vw, 320px);
  --tr-chat-layout-right-panel-width: 320px;
  --tr-chat-layout-mobile-right-width: 100vw;
  --tr-chat-layout-left-bg: #ffffff;
  --tr-chat-layout-right-bg: #ffffff;
  --tr-chat-layout-header-bg: #ffffff;
  --tr-chat-layout-main-bg: #ffffff;
  --tr-chat-layout-footer-bg: #ffffff;
  --tr-chat-layout-transition-duration: 0.3s;
  --tr-chat-layout-transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --tr-chat-layout-divider-color: #edf1f7;
  --tr-chat-layout-header-max-width: none;
  --tr-chat-layout-main-max-width: none;
  --tr-chat-layout-footer-max-width: none;
  --tr-chat-layout-header-padding-inline: 26px;
  --tr-chat-layout-main-padding-inline: 28px;
  --tr-chat-layout-footer-padding-inline: 24px;
  --tr-chat-layout-inner-padding-block: 0px;
  transition: grid-template-columns var(--tr-chat-layout-transition-duration, 220ms)
    var(--tr-chat-layout-transition-easing, ease);
}

.deepseek-layout-demo :deep(.tr-chat-layout__aside) {
  position: relative;
  z-index: 1;
  overflow: visible;
}

.deepseek-layout-demo :deep(.tr-chat-layout__aside > .tr-chat-aside) {
  width: 100%;
  transition:
    transform var(--tr-chat-layout-transition-duration, 220ms) var(--tr-chat-layout-transition-easing, ease),
    opacity var(--tr-chat-layout-transition-duration, 220ms) var(--tr-chat-layout-transition-easing, ease);
  will-change: transform, opacity;
}

.deepseek-layout-demo :deep(.tr-chat-layout__aside--desktop-hidden > .tr-chat-aside) {
  opacity: 0;
  pointer-events: none;
}

.deepseek-layout-demo :deep(.tr-chat-layout__aside--left > .tr-chat-aside) {
  width: var(--tr-chat-layout-left-sidebar-width);
}

.deepseek-layout-demo :deep(.tr-chat-layout__aside--left > .tr-chat-aside.tr-chat-aside--collapsed) {
  width: var(--tr-chat-layout-left-rail-width);
}

.deepseek-layout-demo :deep(.tr-chat-layout__aside--right > .tr-chat-aside) {
  width: var(--tr-chat-layout-right-panel-width);
  margin-inline-start: auto;
}

.deepseek-layout-demo :deep(.tr-chat-layout__aside--right > .tr-chat-aside.tr-chat-aside--collapsed) {
  width: var(--tr-chat-layout-right-rail-width);
}

.deepseek-layout-demo :deep(.tr-chat-layout__aside--left.tr-chat-layout__aside--desktop-hidden > .tr-chat-aside) {
  transform: translateX(calc(-100% - 12px));
}

.deepseek-layout-demo :deep(.tr-chat-layout__aside--right.tr-chat-layout__aside--desktop-hidden > .tr-chat-aside) {
  transform: translateX(calc(100% + 12px));
}

@media (max-width: 959px) {
  .deepseek-layout-demo {
    --tr-chat-layout-header-padding-inline: 18px;
    --tr-chat-layout-main-padding-inline: 16px;
    --tr-chat-layout-footer-padding-inline: 16px;
  }

  .deepseek-layout-demo :deep(.tr-chat-layout__aside) {
    position: fixed;
    z-index: var(--tr-chat-layout-z-index-overlay);
    overflow: hidden;
  }

  .deepseek-layout-demo :deep(.tr-chat-layout__aside > .tr-chat-aside) {
    width: 100%;
  }
}
</style>
