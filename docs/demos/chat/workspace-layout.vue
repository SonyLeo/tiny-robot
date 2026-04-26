<template>
  <div class="demo-container">
    <TrChat.Root :runtime="resolution.runtime" :ui="resolution.ui">
      <TrChat.WorkspaceLayout :appearance="resolution.ui.appearance" :sidebar-title="resolution.ui.brand?.title">
        <template #left>
          <WorkspaceLeftPanel />
        </template>

        <template #left-rail>
          <span class="custom-rail__icon">📁</span>
          <span class="custom-rail__icon">⚙️</span>
        </template>

        <template #right>
          <WorkspaceRightPanel :mcp-status="mcpStatus" />
        </template>

        <TrChat.Layout :appearance="resolution.ui.appearance" :content-layout="resolution.ui.contentLayout">
          <TrChat.Header :title="resolution.ui.brand?.title">
            <template #extra>
              <FullscreenToggle />
            </template>
          </TrChat.Header>

          <TrChat.Welcome
            v-if="resolution.runtime.conversation.messages.value.length === 0"
            :title="resolution.ui.welcome?.title"
            :description="resolution.ui.welcome?.description"
            :prompts="resolution.ui.welcome?.prompts"
            @prompt-click="resolution.runtime.conversation.send({ text: $event })"
          />

          <TrChat.MessageList v-else variant="workspace" />

          <TrChat.Footer>
            <TrChat.Sender>
              <template #footer>
                <TrMcpTrigger label="MCP 工具" />
              </template>
            </TrChat.Sender>
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.WorkspaceLayout>
    </TrChat.Root>
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'
import { TrChat, TrMcpTrigger, useMcpManager, createRuntimeFromConfig } from '@opentiny/tiny-robot-chat'
import { MCP_MANAGER_KEY } from '@opentiny/tiny-robot-chat/internal'
import FullscreenToggle from './FullscreenToggle.vue'
import WorkspaceLeftPanel from './WorkspaceLeftPanel.vue'
import WorkspaceRightPanel from './WorkspaceRightPanel.vue'
import { chatConfig } from './workspace-layout-config'
import { mockPlugins, mockBridge } from './mockMcp'

const resolution = createRuntimeFromConfig(chatConfig)

const mcpManager = useMcpManager({
  initialPlugins: mockPlugins,
  bridge: mockBridge,
})

provide(MCP_MANAGER_KEY, mcpManager)

const mcpStatus = computed(() =>
  mcpManager.activeCount.value > 0 ? `${mcpManager.activeCount.value} 个插件已激活` : '未激活',
)
</script>

<style scoped>
.demo-container {
  height: 600px;
  width: 100%;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 8px;
  overflow: hidden;
}

:deep(.tr-chat),
:deep(.tr-chat-workspace-layout),
:deep(.tr-workspace-shell) {
  height: 100%;
  min-height: 0;
}

:deep(.tr-chat__header-right) {
  gap: 10px;
}

.custom-rail__icon {
  font-size: 15px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

.custom-rail__icon:hover {
  opacity: 1;
}
</style>
