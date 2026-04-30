<template>
  <div class="demo-container">
    <!--
      Root + 原语组合：
      - TrChat.Root 提供 runtime context，:mcp-manager 向下 provide
      - TrChat.WorkspaceLayout 提供左右侧边栏结构
      - 中间聊天区由原语手动组合：Header / Welcome / MessageList / Footer / Sender
      - TrChat.Attachments 显示待发附件列表（由用户控制放置位置）
      - TrChat.ModelSelector 和 TrChat.McpTrigger 由用户手动放入 Sender footer
    -->
    <TrChat.Root :runtime="resolution.runtime" :ui="resolution.ui" :mcp-manager="mcpManager">
      <TrChat.WorkspaceLayout :appearance="resolution.ui.appearance" :sidebar-title="resolution.ui.brand?.title">
        <!-- 右侧面板：说明文字 -->
        <template #right>
          <aside class="info-panel">
            <p class="info-panel__eyebrow">路径 3 · 原语组合</p>
            <h3 class="info-panel__title">Root + primitives</h3>
            <p class="info-panel__desc">直接组合公开原语，完全掌控每个组件的放置位置。</p>
          </aside>
        </template>

        <!-- 中间聊天区：手动组合原语 -->
        <TrChat.Layout :appearance="resolution.ui.appearance">
          <TrChat.Header :title="resolution.ui.brand?.title" :show-history="true">
            <template #extra>
              <FullscreenToggle />
            </template>
          </TrChat.Header>

          <TrChat.Welcome v-if="!hasMessages" />
          <TrChat.MessageList v-else>
            <template #after="slotProps">
              <TrChat.Feedback v-bind="slotProps" />
            </template>
          </TrChat.MessageList>

          <TrChat.Footer>
            <TrChat.Sender>
              <template #header>
                <TrChat.Attachments v-if="hasPendingAttachments" />
              </template>
              <template #footer>
                <TrChat.ModelSelector />
                <TrChat.McpTrigger />
              </template>
            </TrChat.Sender>
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.WorkspaceLayout>
    </TrChat.Root>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { TrChat, createRuntimeFromConfig, useMcpManager } from '@opentiny/tiny-robot-chat'
import FullscreenToggle from './FullscreenToggle.vue'
import { createDemoConfig } from './config'
import { MOCK_PLUGINS, MOCK_BRIDGE } from './mockMcp'

const mcpManager = useMcpManager({ initialPlugins: MOCK_PLUGINS, bridge: MOCK_BRIDGE })

const resolution = createRuntimeFromConfig(
  createDemoConfig({
    storageKey: 'docs-demo-root-primitives',
    welcomeTitle: 'Root + primitives',
    welcomeDescription: '直接组合公开原语，TrChat.McpTrigger 和附件列表均由你控制放置位置。',
    workspace: true,
    initialMessages: [
      {
        role: 'assistant',
        content: '路径 3：你直接组合原语，MCP Trigger 和附件列表均由你控制放置位置。',
      },
    ],
  }),
)

onBeforeUnmount(() => resolution.dispose())

const hasMessages = computed(() => resolution.runtime.conversation.messages.value.length > 0)
const hasPendingAttachments = computed(() => (resolution.runtime.sender?.pendingAttachments.value.length ?? 0) > 0)
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

.info-panel {
  height: 100%;
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 24px 22px;
  background: color-mix(in srgb, var(--workspace-shell-panel-bg, #f5f7fa) 92%, transparent);
}

.info-panel__eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--chat-text-secondary, #667085);
}

.info-panel__title {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
  color: var(--chat-text-primary, #111827);
}

.info-panel__desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--chat-text-secondary, #667085);
}
</style>
