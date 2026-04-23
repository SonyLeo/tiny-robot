<template>
  <div data-testid="chat-blackbox" class="chat-wrapper">
    <TrChat :config="blackboxConfig" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import { createOfficialSceneConfig } from './officialSceneConfig'

const blackboxConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'TrChat',
    welcomeTitle: 'Official blackbox entry',
    welcomeDescription: 'Pass a target TrChatConfig directly into TrChat.',
    workspace: true,
  }),
)
</script>

<style scoped>
.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
  min-height: 0;
}
</style>
