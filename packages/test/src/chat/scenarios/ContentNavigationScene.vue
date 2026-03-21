<template>
  <div data-testid="content-navigation-scene" class="content-navigation-scene">
    <TrChatWorkspaceShell
      data-testid="content-navigation-shell"
      badge="P5-C"
      title="Content Navigation"
      description="Workspace-attached turn navigation"
      :appearance="lightAppearance"
      :content-navigation="{ placement: 'right' }"
      :view-state="{ fullWidth }"
    >
      <template #toolbar-actions>
        <button data-testid="toggle-content-navigation-width" type="button" @click="fullWidth = !fullWidth">
          {{ fullWidth ? 'Reading width' : 'Full width' }}
        </button>
      </template>

      <template #meta>
        <span class="scene-chip" data-testid="content-navigation-active">
          {{ activeTurnSummary }}
        </span>
        <span class="scene-chip" data-testid="content-navigation-count"> Turns: {{ turnNavigationItems.length }} </span>
        <span class="scene-chip" data-testid="content-navigation-placement"> Placement: right </span>
      </template>

      <template #navigation>
        <TrChatConversationTurnNavigation
          :messages="messages"
          :scroll-container="scrollContainer"
          placement="right"
          title="Turns"
          subtitle="Current conversation"
          @update:active-message-index="activeMessageIndex = $event"
        />
      </template>

      <div ref="chatAreaRef" class="content-navigation-scene__chat-area">
        <TrChat.Root :chat-kit="chat">
          <TrChat.Layout :appearance="lightAppearance">
            <TrChat.Header title="Turn navigation demo" />

            <TrChat.MessageList v-if="messages.length > 0" variant="workspace" />

            <TrChat.Welcome
              v-else
              title="Content navigation"
              description="Send a few messages to build a conversation map."
            />

            <TrChat.Footer>
              <TrChat.Sender placeholder="Add another turn..." />
            </TrChat.Footer>
          </TrChat.Layout>
        </TrChat.Root>
      </div>
    </TrChatWorkspaceShell>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import { TrChat, TrChatConversationTurnNavigation, TrChatWorkspaceShell, useChatKit } from '../../../../chat/src'
import { resolveConversationTurnNavigationItems } from '../../../../chat/src/components/workspace/navigation/turn-navigation/runtime'
import { createMockProvider } from '../mockProvider'

const lightAppearance = { mode: 'light' } as const

const initialMessages: ChatMessage[] = [
  { role: 'user', content: 'Summarize the rollout plan for the workspace shell.' },
  {
    role: 'assistant',
    content: [
      'Plan overview:',
      '1. Stabilize the shell container.',
      '2. Land appearance and panel state support.',
      '3. Add content navigation once the shell API is steady.',
      '4. Verify build and browser regressions before moving on.',
    ].join('\n'),
  },
  { role: 'user', content: 'List the test checkpoints we should cover before merge.' },
  {
    role: 'assistant',
    content: [
      'Testing checklist:',
      '1. Unit coverage for runtime coercion and item generation.',
      '2. Browser checks for host rendering, active state, and click-to-scroll.',
      '3. Workspace-shell regression checks for collapse and fullWidth state.',
      '4. Package build verification after the new exports land.',
    ].join('\n'),
  },
  { role: 'user', content: 'Call out the rollout risks for content navigation phase one.' },
  {
    role: 'assistant',
    content: [
      'Primary risks:',
      '1. Tying navigation too tightly to bubble DOM details.',
      '2. Regressing workspace shell spacing and panel behavior.',
      '3. Flaky scrolling assertions in browser tests.',
      '4. Mixing turn navigation with assistant outline too early.',
    ].join('\n'),
  },
]

const chat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'content-navigation-model',
  }),
  initialMessages,
})

const { messages } = chat
const fullWidth = ref(false)
const activeMessageIndex = ref<number | undefined>(0)
const chatAreaRef = ref<HTMLElement | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)
const turnNavigationItems = computed(() => resolveConversationTurnNavigationItems(messages.value))

const activeTurnSummary = computed(() => {
  const activeMessage = messages.value[activeMessageIndex.value ?? -1]
  const text = typeof activeMessage?.content === 'string' ? activeMessage.content : ''
  const normalized = text.replace(/\s+/g, ' ').trim()

  if (!normalized) {
    return 'Active turn: none'
  }

  return `Active turn: ${normalized.slice(0, 56)}${normalized.length > 56 ? '...' : ''}`
})

function syncScrollContainer() {
  scrollContainer.value = chatAreaRef.value?.querySelector<HTMLElement>('.tr-bubble-list') ?? null
}

onMounted(() => {
  syncScrollContainer()
})

watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    syncScrollContainer()
  },
  { immediate: true },
)
</script>

<style scoped>
.content-navigation-scene {
  height: calc(100vh - 100px);
}

.content-navigation-scene :deep(.tr-workspace-shell) {
  height: 100%;
}

.content-navigation-scene__chat-area {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.scene-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: #e8eefb;
  font-size: 11px;
}
</style>
