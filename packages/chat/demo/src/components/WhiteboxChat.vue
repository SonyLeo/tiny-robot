<script setup lang="ts">
import { inject, computed, Component, h, markRaw } from 'vue'
import { TrChat, TrChatFeedback, TrModelSelector, CHAT_KIT_KEY } from '@opentiny/tiny-robot-chat'
import { BubbleRenderers } from '@opentiny/tiny-robot'
import type { PromptProps, BubbleListProps } from '@opentiny/tiny-robot'

interface Props {
  title: string
  welcomeIcon: Component
  welcomeTitle: string
  welcomeDescription: string
  prompts: PromptProps[]
  selectedModel: string
  availableModels: string[]
  roleConfigs?: BubbleListProps['roleConfigs']
  groupStrategy?: BubbleListProps['groupStrategy']
  bubbleListProps?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  roleConfigs: () => ({
    user: { placement: 'end' },
    assistant: { placement: 'start' },
  }),
  groupStrategy: () => 'consecutive' as const,
})

// 合并 roleConfigs，为 assistant 注入 fallbackContentRenderer
const mergedRoleConfigs = computed(() => {
  const base = props.roleConfigs ?? {}
  const fallbackRenderer =
    (props.bubbleListProps?.fallbackContentRenderer as object | undefined) ?? markRaw(BubbleRenderers.Markdown)
  return {
    ...base,
    assistant: {
      ...(base['assistant'] ?? {}),
      fallbackContentRenderer: fallbackRenderer,
    },
  }
})

const renderWelcomeIcon = () => {
  return h(props.welcomeIcon, { style: { fontSize: '38px' } })
}

const emit = defineEmits<{ 'update:selectedModel': [value: string] }>()

const chatKit = inject(CHAT_KIT_KEY)!
const showWelcome = computed(() => chatKit.messages.value.length === 0)

function handlePromptClick(description: string) {
  chatKit.sendMessage(description)
}

function handleEditMessage(content: string) {
  console.log('[WhiteboxChat] Edit message:', content)
  // TODO: 实现编辑逻辑
}
</script>

<template>
  <div class="tr-chat">
    <TrChat.Header :title="props.title" show-history>
      <template #extra>
        <TrModelSelector
          :model-value="props.selectedModel"
          :models="props.availableModels"
          @update:model-value="emit('update:selectedModel', $event)"
        />
      </template>
    </TrChat.Header>

    <div v-if="showWelcome" class="tr-chat__welcome-area">
      <TrChat.Welcome
        :title="props.welcomeTitle"
        :icon="renderWelcomeIcon"
        :description="props.welcomeDescription"
        :prompts="props.prompts"
        @prompt-click="handlePromptClick"
      />
    </div>
    <TrChat.MessageList v-else :role-configs="mergedRoleConfigs" :group-strategy="props.groupStrategy" auto-scroll>
      <template #after="slotProps">
        <TrChatFeedback v-bind="slotProps" @edit="handleEditMessage" style="margin-top: 6px" />
      </template>
    </TrChat.MessageList>

    <TrChat.Footer>
      <TrChat.Sender />
    </TrChat.Footer>
    <TrChat.History />
  </div>
</template>

<style>
.tr-bubble__box[data-role='user'] {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}
</style>
