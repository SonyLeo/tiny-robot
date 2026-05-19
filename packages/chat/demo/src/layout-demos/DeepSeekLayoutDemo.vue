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
</template>

<style scoped>
.deepseek-layout-demo {
  --tr-chat-layout-left-sidebar-width: 262px;
  --tr-chat-layout-mobile-left-width: min(84vw, 320px);
  --tr-chat-layout-transition-duration: 0.3s;
  --tr-chat-layout-transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --tr-chat-layout-divider-color: #edf1f7;
  --tr-chat-layout-content-max-width: none;
  --tr-chat-layout-header-padding-inline: 26px;
  --tr-chat-layout-main-padding-inline: 28px;
  --tr-chat-layout-footer-padding-inline: 24px;
  --tr-chat-layout-inner-padding-block: 0px;
}

@media (max-width: 959px) {
  .deepseek-layout-demo {
    --tr-chat-layout-header-padding-inline: 18px;
    --tr-chat-layout-main-padding-inline: 16px;
    --tr-chat-layout-footer-padding-inline: 16px;
  }
}
</style>
