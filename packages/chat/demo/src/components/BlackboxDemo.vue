<script setup lang="ts">
import { computed } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import type { ChatContentLayout, TrChatConfig } from '@opentiny/tiny-robot-chat'
import type { ColorMode } from '@opentiny/tiny-robot'
import { createOfficialDemoConfig } from '../data/officialConfig'
import DemoHeaderActions from './DemoHeaderActions.vue'

const props = defineProps<{
  colorMode: ColorMode
  contentLayout: ChatContentLayout
}>()

const emit = defineEmits<{
  (e: 'update:colorMode', value: ColorMode): void
  (e: 'update:contentLayout', value: ChatContentLayout): void
}>()

const blackboxConfig = computed<TrChatConfig>(() =>
  createOfficialDemoConfig({
    storageKey: 'tiny-robot-chat-demo-blackbox',
    contentLayout: props.contentLayout,
    brandTitle: 'TrChat',
    welcomeTitle: 'Official blackbox entry',
    welcomeDescription: 'Pass a target TrChatConfig directly into TrChat.',
  }),
)
</script>

<template>
  <TrChat :config="blackboxConfig">
    <template #header-extra>
      <DemoHeaderActions
        :color-mode="props.colorMode"
        :content-layout="props.contentLayout"
        @update:color-mode="emit('update:colorMode', $event)"
        @update:content-layout="emit('update:contentLayout', $event)"
      />
    </template>
  </TrChat>
</template>
