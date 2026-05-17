<script setup lang="ts">
import { Chat } from '@/index'
import DemoFooterBar from './components/DemoFooterBar.vue'
import DemoHeaderBar from './components/DemoHeaderBar.vue'
import DemoLeftSidebar from './components/DemoLeftSidebar.vue'
import DemoMainContent from './components/DemoMainContent.vue'
import DemoRightPanel from './components/DemoRightPanel.vue'
</script>

<template>
  <Chat.Root :default-right-panel-open="true">
    <Chat.Layout :content-max-width="980">
      <template #left-sidebar>
        <DemoLeftSidebar />
      </template>

      <template #header>
        <DemoHeaderBar />
      </template>

      <template #main>
        <DemoMainContent />
      </template>

      <template #footer>
        <DemoFooterBar />
      </template>

      <template #right-panel>
        <DemoRightPanel />
      </template>
    </Chat.Layout>
  </Chat.Root>
</template>
