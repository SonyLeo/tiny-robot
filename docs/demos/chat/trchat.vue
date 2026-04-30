<template>
  <div class="chat-demo-container">
    <TrChat :config="config" :mcp-manager="mcpManager">
      <template #header-extra>
        <FullscreenToggle />
      </template>
    </TrChat>
  </div>
</template>

<script setup lang="ts">
import { TrChat, useMcpManager } from '@opentiny/tiny-robot-chat'
import FullscreenToggle from './FullscreenToggle.vue'
import { createDemoConfig } from './config'
import { MOCK_PLUGINS, MOCK_BRIDGE } from './mockMcp'

const mcpManager = useMcpManager({ initialPlugins: MOCK_PLUGINS, bridge: MOCK_BRIDGE })

const config = createDemoConfig({
  storageKey: 'docs-demo-trchat',
  welcomeTitle: 'TrChat 全量用法',
  welcomeDescription: '一个 <TrChat> 组件，通过 config + mcp-manager prop 开启全部功能。',
})
</script>

<style scoped>
.chat-demo-container {
  height: 600px;
  width: 100%;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 8px;
  overflow: hidden;
}
</style>
