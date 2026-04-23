<script setup lang="ts">
import { computed } from 'vue'
import { TrChat, createRuntimeFromConfig } from '@opentiny/tiny-robot-chat'
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

const whiteboxConfig = computed<TrChatConfig>(() =>
  createOfficialDemoConfig({
    storageKey: 'tiny-robot-chat-demo-root-page',
    contentLayout: props.contentLayout,
    brandTitle: 'Root + Page',
    welcomeTitle: 'Official Root + Page entry',
    welcomeDescription:
      'Use createRuntimeFromConfig(config) when you want to own runtime creation but keep the official page composition.',
    workspace: true,
    initialMessages: [
      {
        role: 'assistant',
        content: 'Root + Page keeps the official composition layer while letting you own runtime creation explicitly.',
      },
    ],
  }),
)

const whiteboxResolution = computed(() => createRuntimeFromConfig(whiteboxConfig.value))
</script>

<template>
  <TrChat.Root :runtime="whiteboxResolution.runtime" :ui="whiteboxResolution.ui">
    <TrChat.Page>
      <template #header-extra>
        <DemoHeaderActions
          :color-mode="props.colorMode"
          :content-layout="props.contentLayout"
          @update:color-mode="emit('update:colorMode', $event)"
          @update:content-layout="emit('update:contentLayout', $event)"
        />
      </template>
    </TrChat.Page>
  </TrChat.Root>
</template>
