<script setup lang="ts">
import { inject, computed, Component, h, markRaw, defineComponent } from 'vue'
import { TrChat, TrChatFeedback, TrModelSelector, CHAT_KIT_KEY } from '@opentiny/tiny-robot-chat'
import { BubbleRendererMatchPriority, BubbleProvider, BubbleRenderers } from '@opentiny/tiny-robot'
import type { PromptProps, BubbleListProps, BubbleContentRendererProps, BubbleMessage } from '@opentiny/tiny-robot'
import EditInputRenderer from './EditInputRenderer.vue'

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

// 自定义编辑状态渲染器（content 级别，渲染输入框）
const EditStateRenderer = defineComponent({
  props: {
    message: { type: Object, required: true },
    contentIndex: Number,
  },
  setup(props: BubbleContentRendererProps) {
    return () => h(EditInputRenderer, { message: props.message, contentIndex: props.contentIndex })
  },
})

// box 渲染器：当消息处于编辑状态时，给 box 添加 data-editing 属性
const boxRendererMatches = computed(() => [
  {
    find: (messages: BubbleMessage[]) =>
      messages.length === 1 && (messages[0].state as Record<string, unknown>)?.isEditing === true,
    renderer: markRaw(BubbleRenderers.Box),
    priority: BubbleRendererMatchPriority.NORMAL,
    attributes: { 'data-editing': 'true' },
  },
])

// content 渲染器：当消息处于编辑状态时渲染输入框
const contentRendererMatches = computed(() => [
  {
    find: (message: BubbleMessage) => (message.state as Record<string, unknown>)?.isEditing === true,
    renderer: markRaw(EditStateRenderer),
    priority: BubbleRendererMatchPriority.NORMAL,
  },
])

// 合并 roleConfigs
const mergedRoleConfigs = computed(() => props.roleConfigs ?? {})

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
