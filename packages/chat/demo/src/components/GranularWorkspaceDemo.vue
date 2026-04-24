<script setup lang="ts">
import { computed } from 'vue'
import { TrChat, createRuntimeFromConfig } from '@opentiny/tiny-robot-chat'
import type { ChatContentLayout, TrChatConfig } from '@opentiny/tiny-robot-chat'
import type { ColorMode } from '@opentiny/tiny-robot'
import { createOfficialDemoConfig } from '../data/officialConfig'
import DemoHeaderActions from './DemoHeaderActions.vue'

const props = defineProps<{
  colorMode: ColorMode
  contentLayout: ChatContentLayout
}>()

const emit = defineEmits<{
  (e: 'update:colorMode', value: ColorMode): void
  (e: 'update:contentLayout', value: ChatContentLayout): void
}>()

const granularConfig = computed<TrChatConfig>(() =>
  createOfficialDemoConfig({
    storageKey: 'tiny-robot-chat-demo-root-primitives',
    contentLayout: props.contentLayout,
    brandTitle: 'Root + primitives',
    welcomeTitle: 'Official Root + primitives entry',
    welcomeDescription: 'Compose the public building blocks directly when you want to own page structure yourself.',
    workspace: true,
    initialMessages: [
      {
        role: 'assistant',
        content: 'This route composes the public primitives directly instead of going through the default page layer.',
      },
    ],
  }),
)

const granularResolution = computed(() => createRuntimeFromConfig(granularConfig.value))
const hasMessages = computed(() => granularResolution.value.runtime.conversation.messages.value.length > 0)
const ownerChecklist = [
  'WorkspaceLayout owns the shell and mobile-sheet behavior.',
  'Layout, Header, MessageList, Footer, Attachments, and Sender stay on public primitives only.',
  'No internal demo helper or internal package import is required.',
]
</script>

<template>
  <TrChat.Root :runtime="granularResolution.runtime" :ui="granularResolution.ui">
    <TrChat.WorkspaceLayout
      :appearance="granularResolution.ui.appearance"
      :sidebar-title="granularResolution.ui.brand?.title"
    >
      <template #right>
        <aside class="granular-workspace__panel">
          <p class="granular-workspace__eyebrow">Public composition</p>
          <h3 class="granular-workspace__title">Root + primitives</h3>
          <p class="granular-workspace__description">
            This route stays on the frozen public building blocks while keeping runtime creation explicit.
          </p>

          <ul class="granular-workspace__list">
            <li v-for="item in ownerChecklist" :key="item">
              {{ item }}
            </li>
          </ul>
        </aside>
      </template>

      <TrChat.Layout
        :appearance="granularResolution.ui.appearance"
        :content-layout="granularResolution.ui.contentLayout"
      >
        <TrChat.Header :title="granularResolution.ui.brand?.title" :show-history="true">
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
          <TrChat.Attachments />
          <TrChat.Sender />
        </TrChat.Footer>
      </TrChat.Layout>
    </TrChat.WorkspaceLayout>
  </TrChat.Root>
</template>

<style scoped>
.granular-workspace__panel {
  height: 100%;
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 24px 22px;
  background: color-mix(in srgb, var(--workspace-shell-panel-bg) 92%, transparent);
}

.granular-workspace__eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--chat-text-secondary);
}

.granular-workspace__title {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
  color: var(--chat-text-primary);
}

.granular-workspace__description {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--chat-text-secondary);
}

.granular-workspace__list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 10px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--chat-text-primary);
}
</style>
