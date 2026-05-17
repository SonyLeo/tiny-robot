<script setup lang="ts">
import { Chat } from '@/index'
import DemoConversationPreview from './DemoConversationPreview.vue'
</script>

<template>
  <Chat.Main>
    <div class="demo-main">
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
