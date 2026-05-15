<script setup lang="ts">
import { Chat } from '@/index'
import DemoConversationPreview from './DemoConversationPreview.vue'
import DemoLayoutControlsPanel from './DemoLayoutControlsPanel.vue'

const leftSidebarWidth = defineModel<number>('leftSidebarWidth', { required: true })
const leftRailWidth = defineModel<number>('leftRailWidth', { required: true })
const rightPanelWidth = defineModel<number>('rightPanelWidth', { required: true })
</script>

<template>
  <Chat.Main>
    <div class="demo-main">
      <DemoLayoutControlsPanel
        v-model:left-sidebar-width="leftSidebarWidth"
        v-model:left-rail-width="leftRailWidth"
        v-model:right-panel-width="rightPanelWidth"
      />
      <DemoConversationPreview />
    </div>
  </Chat.Main>
</template>

<style scoped>
.demo-main {
  display: grid;
  gap: 16px;
}
</style>
