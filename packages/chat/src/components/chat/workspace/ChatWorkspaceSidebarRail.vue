<script setup lang="ts">
import { IconAi, IconHistory, IconNewSession } from '@opentiny/tiny-robot-svgs'
import { CHAT_KIT_KEY, CHAT_UI_KEY, useRequiredInject } from '@/context'

defineOptions({ name: 'TrChatWorkspaceSidebarRail' })

const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const chatKit = useRequiredInject(CHAT_KIT_KEY, 'chat kit')

function handleCreateConversation() {
  chatKit.createConversation()
}
</script>

<template>
  <div class="tr-chat-workspace-sidebar-rail">
    <IconAi
      type="button"
      aria-label="Expand sidebar"
      @click="chatUi.workspace.left.expand()"
      :style="{ fontSize: '28px', cursor: 'pointer' }"
    />
    <button
      type="button"
      class="tr-chat-workspace-sidebar-rail__button"
      aria-label="History"
      @click="chatUi.workspace.left.expand()"
    >
      <IconHistory />
    </button>
    <button
      type="button"
      class="tr-chat-workspace-sidebar-rail__button"
      aria-label="Create conversation"
      @click="handleCreateConversation"
    >
      <IconNewSession />
    </button>
  </div>
</template>

<style scoped>
.tr-chat-workspace-sidebar-rail {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 18px;
  padding: 20px 0;
}

.tr-chat-workspace-sidebar-rail__button {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--workspace-shell-text-secondary, var(--tr-text-secondary, #6b7280));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.tr-chat-workspace-sidebar-rail__button:hover {
  background: var(--workspace-shell-hover-bg, var(--tr-container-bg-hover, rgba(15, 23, 42, 0.06)));
  color: var(--workspace-shell-accent, var(--tr-color-primary, #2f6bff));
}

.tr-chat-workspace-sidebar-rail__button :deep(svg) {
  width: 18px;
  height: 18px;
}
</style>
