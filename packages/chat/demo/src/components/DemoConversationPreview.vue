<script setup lang="ts">
import { BubbleRenderers, type BubbleMessage, type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconCopy, IconRefresh } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'
import { Chat } from '@/index'

const messages: BubbleMessage[] = [
  {
    id: 'assistant-intro',
    role: 'assistant',
    content: '你拥有 runtime，TrChat.Page 负责页面编排。试试点击上方“更多”按钮。',
  },
]

const roleConfigs: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: h(IconAi, {
      style: {
        fontSize: '24px',
      },
    }),
  },
}
</script>

<template>
  <section class="demo-card demo-card--chat">
    <Chat.ConversationPanel
      class="demo-conversation"
      :messages="messages"
      :role-configs="roleConfigs"
      :auto-scroll="true"
      :fallback-content-renderer="BubbleRenderers.Markdown"
    >
      <template #content-footer="{ role }">
        <div v-if="role === 'assistant'" class="demo-conversation__actions">
          <button class="demo-icon-button" type="button" aria-label="复制消息">
            <IconCopy class="demo-icon-glyph" />
          </button>
          <button class="demo-icon-button" type="button" aria-label="重新生成">
            <IconRefresh class="demo-icon-glyph" />
          </button>
        </div>
      </template>
    </Chat.ConversationPanel>
  </section>
</template>

<style scoped>
.demo-card {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid #dbe1ea;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.demo-card--chat {
  min-height: 420px;
  align-content: start;
}

.demo-conversation {
  min-height: 0;
}

.demo-conversation__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.tr-bubble-list) {
  padding: 0;
  gap: 16px;
}

:deep([data-box-type='box']) {
  border: 1px solid #dbe1ea;
  border-radius: 20px;
  background: #ffffff;
}

:deep([data-role='assistant'] [data-type='markdown'] p) {
  margin: 0;
  line-height: 1.7;
}

@media (max-width: 959px) {
  .demo-card--chat {
    min-height: 320px;
  }
}
</style>
