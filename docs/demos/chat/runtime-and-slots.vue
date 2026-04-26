<template>
  <div class="demo-container">
    <div class="demo-toolbar">
      <span class="toolbar-status"> 消息数：{{ messageCount }} · 状态：{{ conversationStatus }} </span>
      <button class="toolbar-btn" @click="sendFromOutside">从外部发送消息</button>
    </div>
    <div class="demo-chat">
      <TrChat.Root :runtime="resolution.runtime" :ui="resolution.ui">
        <TrChat.Page>
          <template #header-extra>
            <span class="slot-badge">header-extra</span>
            <FullscreenToggle />
          </template>
          <template #footer-extra>
            <div class="footer-extra-bar">
              <span class="slot-badge">footer-extra</span>
              <span class="footer-extra-hint">这里可以放模型选择器、工具栏等</span>
            </div>
          </template>
        </TrChat.Page>
      </TrChat.Root>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrChat, createRuntimeFromConfig } from '@opentiny/tiny-robot-chat'
import FullscreenToggle from './FullscreenToggle.vue'
import { chatConfig } from './runtime-and-slots-config'

const resolution = createRuntimeFromConfig(chatConfig)
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
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.toolbar-status {
  font-size: 13px;
  color: #64748b;
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

.slot-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
}

.footer-extra-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 4px;
}

.footer-extra-hint {
  font-size: 12px;
  color: #94a3b8;
}
</style>
