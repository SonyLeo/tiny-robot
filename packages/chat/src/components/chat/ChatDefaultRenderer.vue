<script setup lang="ts">
import { computed, inject, useAttrs, useSlots, type Slot } from 'vue'
import { BUBBLE_LIST_SLOTS, CHAT_KIT_KEY, useChatScaffoldContext } from '@/context'
import { useSlotFilter } from '@/composables'
import type { ChatListVariant, ModelOption } from '@/types'
import ChatFooter from './ChatFooter.vue'
import ChatAttachments from './ChatAttachments.vue'
import ChatFeedback from './ChatFeedback.vue'
import ChatHeader from './ChatHeader.vue'
import ChatLayout from './ChatLayout.vue'
import ChatMessageList from './ChatMessageList.vue'
import ChatSender from './ChatSender.vue'
import ChatWelcome from './ChatWelcome.vue'
import ModelSelector from '../model-selector/ModelSelector.vue'
import { ChatHistory } from '../history'

defineOptions({ name: 'TrChatDefaultRenderer', inheritAttrs: false })

const emit = defineEmits<{
  (e: 'update:fullscreen', value: boolean): void
  (e: 'update:show', value: boolean): void
  (e: 'update:model', value: string): void
}>()

const attrs = useAttrs()
const slots = useSlots() as Record<string, Slot | undefined>
const bubbleSlots = useSlotFilter(slots, BUBBLE_LIST_SLOTS)
const chatKit = inject(CHAT_KIT_KEY)!
const scaffoldContext = useChatScaffoldContext()

const showWelcome = computed(() => chatKit.messages.value.length === 0)
const welcomeSlice = computed(() => scaffoldContext?.presetSlices.value.welcome)
const messageListSlice = computed(() => scaffoldContext?.presetSlices.value.messageList)
const modelSelectorSlice = computed(() => scaffoldContext?.presetSlices.value.modelSelector)
const resolvedVariant = computed<ChatListVariant>(() => {
  const attrVariant = attrs['message-list-variant'] ?? attrs.messageListVariant
  const variant = typeof attrVariant === 'string' ? attrVariant : messageListSlice.value?.variant

  if (variant === 'docs' || variant === 'workspace') {
    return variant
  }

  return 'bubble'
})
const showModelSelector = computed(() =>
  Boolean(
    modelSelectorSlice.value?.enabled &&
    modelSelectorSlice.value.models?.length &&
    modelSelectorSlice.value.providerFactories?.length,
  ),
)

function handleModelChange(model: ModelOption) {
  emit('update:model', model.value)
}
</script>

<template>
  <ChatLayout>
    <template v-if="$slots.header">
      <slot name="header" />
    </template>
    <ChatHeader v-else @update:fullscreen="emit('update:fullscreen', $event)" @close="emit('update:show', false)">
      <template v-if="$slots['header-extra']" #extra>
        <slot name="header-extra" />
      </template>
    </ChatHeader>

    <template v-if="$slots['message-list']">
      <slot name="message-list" :messages="chatKit.messages" />
    </template>
    <template v-else>
      <div v-if="showWelcome" class="tr-chat__welcome-area">
        <slot v-if="$slots.welcome" name="welcome" />
        <ChatWelcome v-else-if="welcomeSlice" @prompt-click="chatKit.sendMessage($event)" />
        <slot v-else name="empty" />
      </div>

      <ChatMessageList v-else :variant="resolvedVariant">
        <template v-for="(_, name) in bubbleSlots" #[name]="slotProps" :key="name">
          <slot :name="name" v-bind="slotProps ?? {}" />
        </template>
        <template v-if="messageListSlice?.showFeedback" #after="slotProps">
          <ChatFeedback v-bind="slotProps" />
        </template>
      </ChatMessageList>
    </template>

    <template v-if="$slots.sender">
      <slot
        name="sender"
        :send="chatKit.sendMessage"
        :abort="chatKit.abort"
        :status="chatKit.status"
        :last-error="chatKit.lastError"
        :retry="chatKit.retry"
      />
    </template>
    <ChatFooter v-else>
      <template v-if="$slots['footer-extra']" #extra>
        <slot name="footer-extra" />
      </template>
      <div class="tr-chat-footer-content">
        <ChatAttachments />
        <ModelSelector v-if="showModelSelector" @change="handleModelChange" />
        <ChatSender />
      </div>
    </ChatFooter>

    <ChatHistory />
  </ChatLayout>
</template>

<style scoped>
.tr-chat-footer-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
