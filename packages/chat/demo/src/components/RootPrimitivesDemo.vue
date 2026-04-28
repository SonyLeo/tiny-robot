<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { TrChat, createRuntimeFromConfig, useMcpManager } from '@opentiny/tiny-robot-chat'
import type { ChatContentLayout } from '@opentiny/tiny-robot-chat'
import type { ColorMode } from '@opentiny/tiny-robot'
import { createOfficialDemoConfig } from '../data/officialConfig'
import DemoHeaderActions from './DemoHeaderActions.vue'
import { MOCK_PLUGINS } from '../data/mockMcp'

const props = defineProps<{
  colorMode: ColorMode
  contentLayout: ChatContentLayout
}>()

const emit = defineEmits<{
  (e: 'update:colorMode', value: ColorMode): void
  (e: 'update:contentLayout', value: ChatContentLayout): void
}>()

const mcpManager = useMcpManager({ initialPlugins: MOCK_PLUGINS })

const resolution = createRuntimeFromConfig(
  createOfficialDemoConfig({
    storageKey: 'tiny-robot-chat-demo-root-primitives',
    brandTitle: 'Root + 原语（路径 3）',
    welcomeTitle: '原语组合路径 · Root + primitives',
    welcomeDescription: '直接组合公开原语，TrMcpTrigger 由用户手动放置。',
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

<template>
  <!--
    路径 3：TrChat.Root + 原语
    - :mcp-manager 由 TrChatRoot provide，TrMcpTrigger 需用户手动放置
    - TrChat.Attachments 显示待发附件列表
    - TrChat.Sender 内置 UploadButton（来自 runtime.attachments）
  -->
  <TrChat.Root :runtime="resolution.runtime" :ui="resolution.ui" :mcp-manager="mcpManager">
    <TrChat.WorkspaceLayout :appearance="resolution.ui.appearance" :sidebar-title="resolution.ui.brand?.title">
      <template #right>
        <aside class="demo-sidebar">
          <p class="demo-sidebar__eyebrow">路径 3 · 原语组合</p>
          <h3 class="demo-sidebar__title">Root + primitives</h3>
          <p class="demo-sidebar__desc">直接组合公开原语，完全掌控页面结构。</p>
        </aside>
      </template>

      <TrChat.Layout :appearance="resolution.ui.appearance" :content-layout="props.contentLayout">
        <TrChat.Header :title="resolution.ui.brand?.title" :show-history="true">
          <template #extra>
            <DemoHeaderActions
              :color-mode="props.colorMode"
              :content-layout="props.contentLayout"
              @update:color-mode="emit('update:colorMode', $event)"
              @update:content-layout="emit('update:contentLayout', $event)"
            />
          </template>
        </TrChat.Header>

        <TrChat.Welcome v-if="!hasMessages" />
        <TrChat.MessageList v-else />

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
</template>

<style scoped>
.demo-sidebar {
  height: 100%;
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 24px 22px;
  background: color-mix(in srgb, var(--workspace-shell-panel-bg) 92%, transparent);
}

.demo-sidebar__eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--chat-text-secondary);
}

.demo-sidebar__title {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
  color: var(--chat-text-primary);
}

.demo-sidebar__desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--chat-text-secondary);
}
</style>
