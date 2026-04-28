<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { TrChat, createRuntimeFromConfig, useMcpManager } from '@opentiny/tiny-robot-chat'
import type { ChatContentLayout, TrChatRootUiConfig } from '@opentiny/tiny-robot-chat'
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

const resolution = createRuntimeFromConfig(
  createOfficialDemoConfig({
    storageKey: 'tiny-robot-chat-demo-root-page',
    brandTitle: 'Root + Page（路径 2）',
    welcomeTitle: '白盒页面路径 · Root + Page',
    welcomeDescription: '显式创建 runtime，页面结构由 TrChat.Page 负责。',
    workspace: true,
    initialMessages: [
      {
        role: 'assistant',
        content: '路径 2：你拥有 runtime，TrChat.Page 负责页面编排。MCP 和附件均已接入。',
      },
    ],
  }),
)

onBeforeUnmount(() => resolution.dispose())

const ui = computed<TrChatRootUiConfig>(() => ({
  ...resolution.ui,
  contentLayout: props.contentLayout,
}))
</script>

<template>
  <TrChat.Root :runtime="resolution.runtime" :ui="ui" :mcp-manager="mcpManager">
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
