<script setup lang="ts">
import { Chat } from '@/index'
import DemoFooterBar from './components/DemoFooterBar.vue'
import DemoHeaderBar from './components/DemoHeaderBar.vue'
import DemoLeftSidebar from './components/DemoLeftSidebar.vue'
import DemoMainContent from './components/DemoMainContent.vue'
import DemoRightPanel from './components/DemoRightPanel.vue'
import { useDemoLayoutControls } from './composables/useDemoLayoutControls'

const { leftSidebarWidth, leftRailWidth, rightPanelWidth } = useDemoLayoutControls()
</script>

<template>
  <Chat.Root :default-right-panel-open="true">
    <Chat.Layout
      :left-sidebar-width="leftSidebarWidth"
      :left-rail-width="leftRailWidth"
      :right-panel-width="rightPanelWidth"
      :content-max-width="980"
    >
      <template #left-sidebar>
        <DemoLeftSidebar />
      </template>

      <template #header>
        <DemoHeaderBar />
      </template>

      <template #main>
        <DemoMainContent
          v-model:left-sidebar-width="leftSidebarWidth"
          v-model:left-rail-width="leftRailWidth"
          v-model:right-panel-width="rightPanelWidth"
        />
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
