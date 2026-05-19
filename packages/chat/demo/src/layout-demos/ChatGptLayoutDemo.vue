<script setup lang="ts">
import { Chat } from '@/index'
import Composer from './chatgpt/components/Composer.vue'
import Header from './chatgpt/components/Header.vue'
import Main from './chatgpt/components/Main.vue'
import RightPanel from './chatgpt/components/RightPanel.vue'
import Sidebar from './chatgpt/components/Sidebar.vue'
</script>

<template>
  <Chat.Layout class="chatgpt-layout-demo" :right="{ defaultState: 'expanded' }">
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
  </Chat.Layout>
</template>

<style scoped>
.chatgpt-layout-demo {
  --tr-chat-layout-left-sidebar-width: 260px;
  --tr-chat-layout-left-rail-width: 52px;
  --tr-chat-layout-right-panel-width: 364px;
  --tr-chat-layout-content-max-width: 1040px;
  --tr-chat-layout-left-bg: #fbfbf8;
  --tr-chat-layout-divider-color: #ece9e3;
  --tr-chat-layout-inner-padding-inline: 24px;
  --tr-chat-layout-transition-duration: 240ms;
  --tr-chat-layout-transition-easing: cubic-bezier(0, 0, 0.2, 1);
}
</style>
