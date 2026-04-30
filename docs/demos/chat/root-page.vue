<template>
  <div class="demo-container">
    <!-- 工具栏：展示 runtime 的外部控制能力 -->
    <div class="demo-toolbar">
      <span class="toolbar-status">消息数：{{ messageCount }} · 状态：{{ conversationStatus }}</span>
      <button class="toolbar-btn" @click="sendFromOutside">从外部发送消息</button>
    </div>

    <div class="demo-chat">
      <TrChat.Root :runtime="resolution.runtime" :ui="resolution.ui" :mcp-manager="mcpManager">
        <TrChat.Page>
          <template #header-extra>
            <FullscreenToggle />
          </template>
        </TrChat.Page>
      </TrChat.Root>
    </div>
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
    storageKey: 'docs-demo-root-page',
    welcomeTitle: 'Root + Page',
    welcomeDescription: '显式创建 runtime，页面结构由 TrChat.Page 负责。可从外部直接调用 runtime 发送消息。',
    workspace: true,
    initialMessages: [
      {
        role: 'assistant',
        content: '你拥有 runtime，TrChat.Page 负责页面编排。试试点击上方"从外部发送消息"按钮。',
      },
    ],
  }),
)

onBeforeUnmount(() => resolution.dispose())

const messageCount = computed(() => resolution.runtime.conversation.messages.value.length)
const conversationStatus = computed(() => resolution.runtime.conversation.status.value)

function sendFromOutside() {
  resolution.runtime.conversation.send({ text: '这条消息是从页面外部的按钮发送的！' })
}
</script>

<style scoped>
.demo-container {
  height: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 8px;
  overflow: hidden;
}

.demo-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: var(--vp-c-bg-soft, #f8fafc);
  border-bottom: 1px solid var(--tr-border-color-default, #e5e6eb);
  flex-shrink: 0;
}

.toolbar-status {
  font-size: 13px;
  color: var(--vp-c-text-2, #64748b);
}

.toolbar-btn {
  padding: 6px 14px;
  border: 0;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.toolbar-btn:hover {
  background: #1d4ed8;
}

.demo-chat {
  flex: 1;
  min-height: 0;
}

:deep(.tr-chat),
:deep(.tr-chat-workspace-layout),
:deep(.tr-workspace-shell) {
  height: 100%;
  min-height: 0;
}
</style>
