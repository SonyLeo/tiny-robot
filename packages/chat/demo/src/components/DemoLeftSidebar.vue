<script setup lang="ts">
import { Chat } from '@/index'
import DemoSidebarContentArea from './DemoSidebarContentArea.vue'
import DemoSidebarFixedArea from './DemoSidebarFixedArea.vue'
</script>

<template>
  <Chat.Aside side="left" v-slot="{ mode }">
    <Chat.SidebarPanel :mode="mode">
      <template #header="{ collapsed, isDrawer }">
        <DemoSidebarFixedArea :collapsed="collapsed" :is-mobile="isDrawer" :show-toggle="true" />
      </template>

      <template #default>
        <DemoSidebarContentArea />
      </template>
    </Chat.SidebarPanel>
  </Chat.Aside>
</template>
