<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'
import { chatPreset } from './lib/chat'
</script>

<template>
  <TrChat v-bind="chatPreset" />
</template>
