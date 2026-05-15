<script setup lang="ts">
import { Chat } from '@/index'
import DemoSidebarContentArea from './DemoSidebarContentArea.vue'
import DemoSidebarFixedArea from './DemoSidebarFixedArea.vue'
</script>

<template>
  <Chat.LeftSidebar>
    <template #default="{ collapsed, isMobile, mode }">
      <div class="demo-sidebar" :class="{ 'demo-sidebar--rail': mode === 'rail' }">
        <DemoSidebarFixedArea :collapsed="collapsed" :is-mobile="isMobile" :show-toggle="true" />
        <DemoSidebarContentArea v-show="mode !== 'rail'" :mode="mode" />
      </div>
    </template>
  </Chat.LeftSidebar>
</template>

<style scoped>
.demo-sidebar {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 16px;
  height: 100%;
  padding: 20px 16px;
}

.demo-sidebar--rail {
  justify-items: center;
  padding-inline: 0;
}
</style>
