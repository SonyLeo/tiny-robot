<template>
  <div data-testid="content-navigation-scene" class="content-navigation-scene">
    <TrChatWorkspaceShell
      data-testid="content-navigation-shell"
      badge="P5-C"
      title="Content Navigation"
      description="Workspace conversation navigation + assistant outline"
      :appearance="lightAppearance"
      :content-navigation="{ enabled: true }"
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
        <span class="scene-chip" data-testid="assistant-outline-active">
          {{ activeHeadingSummary }}
        </span>
      </template>

      <template #navigation>
        <TrChatConversationTurnNavigation
          :messages="messages"
          :scroll-container="scrollContainer"
          title="Turns"
          subtitle="Current conversation"
          @update:active-message-index="activeMessageIndex = $event"
        />
      </template>

      <div ref="chatAreaRef" class="content-navigation-scene__chat-area">
        <TrChat.Root :chat-kit="chat">
          <TrChat.Layout :appearance="lightAppearance">
            <TrChat.Header title="Turn navigation demo" />

            <div v-if="messages.length > 0" class="content-navigation-scene__message-stage">
              <TrChatAssistantOutline
                :scroll-container="scrollContainer"
                @update:active-heading-id="activeHeadingId = $event"
              >
                <TrChat.MessageList variant="workspace">
                  <template #prefix="{ role, messageIndexes }">
                    <TrChatAssistantOutlineTrigger :role="role" :message-indexes="messageIndexes" />
                  </template>
                </TrChat.MessageList>
              </TrChatAssistantOutline>
            </div>

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
import {
  TrChat,
  TrChatAssistantOutline,
  TrChatAssistantOutlineTrigger,
  TrChatConversationTurnNavigation,
  TrChatWorkspaceShell,
  useChatKit,
} from '../../../../chat/src'
import { resolveConversationTurnNavigationItems } from '../../../../chat/src/components/workspace/navigation/turn-navigation'
import { createMockProvider } from '../mockProvider'

const lightAppearance = { mode: 'light' } as const

const initialMessages: ChatMessage[] = [
  { role: 'user', content: 'Summarize the rollout plan for the workspace shell.' },
  {
    role: 'assistant',
    content: [
      '# Plan overview',
      '## Stabilize the shell container',
      'Confirm the center layout, panel spacing, and shell height contract first.',
      '## Land appearance and panel state support',
      'Add the remaining appearance props and controlled panel state wiring.',
      '## Add content navigation once the shell API is steady',
      'Introduce navigation only after the shell host API stops moving.',
      '## Verify build and browser regressions before moving on',
      'Run build, unit, and browser checks before advancing to the next phase.',
    ].join('\n'),
  },
  { role: 'user', content: 'List the test checkpoints we should cover before merge.' },
  {
    role: 'assistant',
    content: [
      '# Testing checklist',
      '## Runtime coercion coverage',
      'Verify item normalization and active-state coercion paths.',
      '## Browser host rendering',
      'Check host rendering, active markers, hover expansion, and click-to-scroll.',
      '## Workspace-shell regressions',
      'Cover collapse behavior, spacing rules, and fullWidth layout changes.',
      '## Package verification',
      'Confirm the package build and public exports stay intact.',
    ].join('\n'),
  },
  { role: 'user', content: 'Call out the rollout risks for content navigation phase one.' },
  {
    role: 'assistant',
    content: [
      '# Primary risks',
      '## DOM coupling',
      'Avoid tying navigation to unstable bubble internals whenever possible.',
      '## Workspace regressions',
      'Watch for spacing, collapse, and panel host regressions in the shell.',
      '## Browser flakiness',
      'Keep scrolling assertions tolerant enough for browser rounding differences.',
      '## Mixed navigation models',
      'Keep turn navigation and assistant outline concerns separate in phase one.',
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
const activeHeadingId = ref<string | undefined>()
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

const activeHeadingSummary = computed(() => {
  if (!activeHeadingId.value) {
    return 'Active outline: none'
  }

  return `Active outline: ${activeHeadingId.value}`
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

.content-navigation-scene__message-stage {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
}

.scene-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: #e8eefb;
  font-size: 11px;
}
</style>
