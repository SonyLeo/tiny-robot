<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'
import chatConfig from './chat.config'
import { chatRuntime } from './lib/chat'
</script>

<template>
  <div class="app-shell">
    <TrChat :config="chatConfig" :runtime="chatRuntime" />
  </div>
</template>

<style scoped>
.app-shell {
  height: 100%;
}
</style>
