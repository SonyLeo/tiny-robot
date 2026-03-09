<script setup lang="ts">
import { inject, computed } from 'vue'
import { TrChat, TrChatFeedback, TrModelSelector, CHAT_KIT_KEY } from '@opentiny/tiny-robot-chat'
import type { PromptProps, BubbleListProps } from '@opentiny/tiny-robot'

interface Props {
  title: string
  welcomeTitle: string
  welcomeDescription: string
  prompts: PromptProps[]
  selectedModel: string
  availableModels: string[]
  roleConfigs?: BubbleListProps['roleConfigs']
  groupStrategy?: BubbleListProps['groupStrategy']
}

const props = withDefaults(defineProps<Props>(), {
  roleConfigs: () => ({
    user: { placement: 'end' },
    assistant: { placement: 'start' },
  }),
  groupStrategy: () => 'consecutive' as const,
})

const emit = defineEmits<{ 'update:selectedModel': [value: string] }>()

const chatKit = inject(CHAT_KIT_KEY)!
const showWelcome = computed(() => chatKit.messages.value.length === 0)

function handlePromptClick(description: string) {
  chatKit.sendMessage(description)
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
        :description="props.welcomeDescription"
        :prompts="props.prompts"
        @prompt-click="handlePromptClick"
      />
    </div>
    <TrChat.MessageList v-else :role-configs="props.roleConfigs" :group-strategy="props.groupStrategy" auto-scroll>
      <template #after="slotProps">
        <TrChatFeedback v-if="slotProps.role === 'assistant'" v-bind="slotProps" />
      </template>
    </TrChat.MessageList>

    <TrChat.Footer>
      <TrChat.Sender />
    </TrChat.Footer>
    <TrChat.History />
  </div>
</template>
