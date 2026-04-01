<script setup lang="ts">
import { inject } from 'vue'
import type { PropType } from 'vue'
import { CHAT_KIT_KEY } from '@/context'
import type { ChatPresetMessageListSlice, ChatPresetWelcomeSlice } from '@/adapters'
import type { ChatListVariant } from '@/types'
import ChatFeedback from '@/components/feedback/ChatFeedback.vue'
import ChatMessageList from '../ChatMessageList.vue'
import ChatWelcome from '../ChatWelcome.vue'

defineOptions({ name: 'TrChatDefaultBodyRegion' })

const props = defineProps({
  showWelcome: {
    type: Boolean,
    required: true,
  },
  welcomeSlice: Object as PropType<ChatPresetWelcomeSlice | undefined>,
  messageListSlice: Object as PropType<ChatPresetMessageListSlice | undefined>,
  variant: {
    type: String as PropType<ChatListVariant>,
    required: true,
  },
  bubbleSlotNames: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
})

const chatKit = inject(CHAT_KIT_KEY)!
</script>

<template>
  <template v-if="$slots['message-list']">
    <slot name="message-list" :messages="chatKit.messages" />
  </template>
  <template v-else>
    <div v-if="props.showWelcome" class="tr-chat__welcome-area">
      <slot v-if="$slots.welcome" name="welcome" />
      <ChatWelcome v-else-if="props.welcomeSlice" @prompt-click="chatKit.sendMessage($event)" />
      <slot v-else name="empty" />
    </div>

    <ChatMessageList v-else :variant="props.variant">
      <template v-for="name in props.bubbleSlotNames" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
      <template v-if="props.messageListSlice?.showFeedback" #after="slotProps">
        <ChatFeedback v-bind="slotProps" />
      </template>
    </ChatMessageList>
  </template>
</template>
