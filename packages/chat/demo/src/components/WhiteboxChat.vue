<script setup lang="ts">
import { inject, computed, Component, h } from 'vue'
import { TrChat, TrChatFeedback, TrModelSelector, CHAT_KIT_KEY } from '@opentiny/tiny-robot-chat'
import { BubbleProvider } from '@opentiny/tiny-robot'
import type { PromptProps, BubbleListProps } from '@opentiny/tiny-robot'
import { boxRendererMatches, contentRendererMatches, roles as baseRoles } from '../composables/useBubbleConfig'

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
  groupStrategy: () => 'consecutive' as const,
})

const mergedRoleConfigs = computed(() => {
  const configs = props.roleConfigs || {}
  return {
    assistant: {
      ...baseRoles.assistant,
      ...configs.assistant,
    },
    user: {
      ...baseRoles.user,
      ...configs.user,
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

function handleEditMessage(messageIndexes: number[]) {
  if (!messageIndexes?.length) return
  const message = chatKit.messages.value[messageIndexes[0]]
  if (message) {
    if (!message.state) message.state = {}
    message.state.isEditing = true
  }
}

function isMessageEditing(messageIndexes: number[]): boolean {
  if (!messageIndexes?.length) return false
  const message = chatKit.messages.value[messageIndexes[0]]
  return message?.state?.isEditing === true
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
    <BubbleProvider
      v-else
      :box-renderer-matches="boxRendererMatches"
      :content-renderer-matches="contentRendererMatches"
    >
      <TrChat.MessageList :role-configs="mergedRoleConfigs" :group-strategy="props.groupStrategy" auto-scroll>
        <template #after="slotProps">
          <TrChatFeedback
            v-if="!isMessageEditing(slotProps.messageIndexes)"
            v-bind="slotProps"
            @edit="handleEditMessage(slotProps.messageIndexes)"
            style="margin-top: 6px"
          />
        </template>
      </TrChat.MessageList>
    </BubbleProvider>

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

.tr-bubble__box[data-editing='true'] {
  --tr-bubble-box-bg: transparent;
  width: 50% !important;
}
</style>
