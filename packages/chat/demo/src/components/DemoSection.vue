<script setup lang="ts">
import { TrChat, DEFAULT_ROLE_CONFIGS } from '@opentiny/tiny-robot-chat'
import WhiteboxChat from './WhiteboxChat.vue'
import McpPanel from './McpPanel.vue'
import type { ResponseProvider } from '@opentiny/tiny-robot-chat'
import { Component, provide, ref } from 'vue'
import { toolPlugin, localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import { useMcpManager } from '../composables/useMcpManager'
import { defaultMcpServers } from '../data/mcpServers'

interface BrandConfig {
  title: string
}

interface WelcomeConfig {
  title: string
  icon: Component
  description: string
}

interface PromptItem {
  label: string
  description: string
}

defineProps<{
  mode: 'blackbox' | 'whitebox'
  responseProvider: ResponseProvider
  brandConfig: BrandConfig
  welcomeConfig: WelcomeConfig
  prompts: PromptItem[]
  bubbleListProps?: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:mode': [value: 'blackbox' | 'whitebox']
  error: [error: Error]
}>()

// MCP Panel visibility state
const mcpPanelVisible = ref(false)

// MCP Manager - 创建单一实例
const mcpManager = useMcpManager()
mcpManager.installedPlugins.value = defaultMcpServers

// Provide 给子组件
provide('mcpManager', mcpManager)

// Tool plugin for chat
const toolPluginInstance = toolPlugin({
  getTools: mcpManager.getTools,
  callTool: mcpManager.callTool,
})

function handleError(error: Error) {
  console.error('Chat error:', error)
  emit('error', error)
}

function toggleMcpPanel() {
  mcpPanelVisible.value = !mcpPanelVisible.value
}
</script>

<template>
  <div class="demo-section">
    <div class="demo-chat">
      <!-- Black-box Mode -->
      <template v-if="mode === 'blackbox'">
        <TrChat
          :response-provider="responseProvider"
          :plugins="[toolPluginInstance]"
          :brand="brandConfig"
          :welcome="welcomeConfig"
          :prompts="prompts"
          :bubble-list-props="bubbleListProps"
          show-feedback
          show-history
          @error="handleError"
        />
      </template>

      <!-- White-box Mode: same features, manually composed -->
      <template v-else>
        <TrChat.Root
          :response-provider="responseProvider"
          :plugins="[toolPluginInstance]"
          :storage="localStorageStrategyFactory()"
          @error="handleError"
        >
          <WhiteboxChat
            :title="brandConfig.title"
            :welcome-icon="welcomeConfig.icon"
            :welcome-title="welcomeConfig.title"
            :welcome-description="welcomeConfig.description"
            :prompts="prompts"
            :role-configs="DEFAULT_ROLE_CONFIGS"
            :mcp-panel-visible="mcpPanelVisible"
            group-strategy="consecutive"
            @toggle-mcp-panel="toggleMcpPanel"
          />
        </TrChat.Root>
      </template>
    </div>

    <!-- MCP Picker Modal -->
    <McpPanel :visible="mcpPanelVisible" @update:visible="mcpPanelVisible = $event" />
  </div>
</template>

<style scoped>
.demo-section {
  display: flex;
  gap: 16px;
  height: 100%;
}

.demo-chat {
  flex: 1;
  min-width: 0;
}

:deep(.tr-chat) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.tr-chat__message-area) {
  flex: 1;
  overflow-y: auto;
}

:deep(.tr-chat__footer) {
  flex-shrink: 0;
}
</style>
