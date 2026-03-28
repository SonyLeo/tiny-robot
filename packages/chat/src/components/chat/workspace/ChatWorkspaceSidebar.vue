<script setup lang="ts">
import { computed } from 'vue'
import { IconAi, IconMenu2 } from '@opentiny/tiny-robot-svgs'
import { CHAT_UI_KEY, useChatScaffoldContext, useRequiredInject } from '@/context'
import { ChatHistoryContent } from '@/components/history'

defineOptions({ name: 'TrChatWorkspaceSidebar' })

const props = withDefaults(
  defineProps<{
    mobile?: boolean
  }>(),
  {
    mobile: false,
  },
)

const scaffoldContext = useChatScaffoldContext()
const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const title = computed(() => scaffoldContext?.presetSlices.value.header.title ?? 'TinyRobot')

function handleAction() {
  if (props.mobile) {
    chatUi.workspace.left.close()
    return
  }

  chatUi.workspace.left.collapse()
}
</script>

<template>
  <div class="tr-chat-workspace-sidebar" :class="{ 'is-mobile': props.mobile }">
    <div class="tr-chat-workspace-sidebar__header">
      <div class="tr-chat-workspace-sidebar__brand">
        <span class="tr-chat-workspace-sidebar__brand-icon">
          <IconAi />
        </span>
        <strong>{{ title }}</strong>
      </div>

      <button
        type="button"
        class="tr-chat-workspace-sidebar__toggle"
        :aria-label="props.mobile ? 'Close sidebar' : 'Collapse sidebar'"
        @click="handleAction"
      >
        <IconMenu2 />
      </button>
    </div>

    <div class="tr-chat-workspace-sidebar__content">
      <ChatHistoryContent />
    </div>
  </div>
</template>

<style scoped>
.tr-chat-workspace-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  color: var(--workspace-shell-text-primary, var(--tr-text-primary, #111827));
}

.tr-chat-workspace-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 24px 22px 10px;
  flex-shrink: 0;
}

.tr-chat-workspace-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.tr-chat-workspace-sidebar__brand strong {
  color: var(--workspace-shell-text-primary, var(--tr-text-primary, #111827));
  font-size: 18px;
  font-weight: 700;
}

.tr-chat-workspace-sidebar__brand-icon {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--workspace-shell-accent, var(--tr-color-primary, #2f6bff));
}

.tr-chat-workspace-sidebar__brand-icon :deep(svg) {
  width: 28px;
  height: 28px;
}

.tr-chat-workspace-sidebar__toggle {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--workspace-shell-text-secondary, var(--tr-text-secondary, #6b7280));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.tr-chat-workspace-sidebar__toggle:hover {
  background: var(--workspace-shell-hover-bg, var(--tr-container-bg-hover, rgba(15, 23, 42, 0.06)));
  color: var(--workspace-shell-accent, var(--tr-color-primary, #2f6bff));
}

.tr-chat-workspace-sidebar__toggle :deep(svg) {
  width: 18px;
  height: 18px;
}

.tr-chat-workspace-sidebar__content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
