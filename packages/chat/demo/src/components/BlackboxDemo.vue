<script setup lang="ts">
import { computed } from 'vue'
import { TrChat, useMcpManager } from '@opentiny/tiny-robot-chat'
import type { ChatContentLayout, TrChatConfig } from '@opentiny/tiny-robot-chat'
import type { ColorMode } from '@opentiny/tiny-robot'
import { createOfficialDemoConfig } from '../data/officialConfig'
import DemoHeaderActions from './DemoHeaderActions.vue'
import { MOCK_PLUGINS, MOCK_BRIDGE } from '../data/mockMcp'

const props = defineProps<{
  colorMode: ColorMode
  contentLayout: ChatContentLayout
}>()

const emit = defineEmits<{
  (e: 'update:colorMode', value: ColorMode): void
  (e: 'update:contentLayout', value: ChatContentLayout): void
}>()

const mcpManager = useMcpManager({ initialPlugins: MOCK_PLUGINS, bridge: MOCK_BRIDGE })

const config = computed<TrChatConfig>(() =>
  createOfficialDemoConfig({
    storageKey: 'tiny-robot-chat-demo-trchat',
    brandTitle: 'TrChat（路径 1）',
    welcomeTitle: '黑盒入口 · TrChat',
    welcomeDescription: '直接传入 TrChatConfig，附件和 MCP 均通过 prop / config 配置。',
  }),
)
</script>

<template>
  <TrChat :config="config" :mcp-manager="mcpManager">
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
