<script setup lang="ts">
import { TrBubbleList, TrBubbleProvider } from '@opentiny/tiny-robot'
import { computed, useAttrs, useSlots, useTemplateRef } from 'vue'
import type { ChatConversationPanelEmits, ChatConversationPanelProps, ChatConversationPanelSlots } from '@/types/ui'

defineOptions({
  name: 'ChatConversationPanel',
  inheritAttrs: false,
})

type BubbleListExposed = {
  scrollToBottom?: (behavior?: ScrollBehavior) => Promise<void>
}

const props = defineProps<ChatConversationPanelProps>()
const emit = defineEmits<ChatConversationPanelEmits>()
defineSlots<ChatConversationPanelSlots>()

const attrs = useAttrs()
const slots = useSlots()
const bubbleListRef = useTemplateRef<BubbleListExposed>('bubbleList')

const hasVisibleMessages = computed(() =>
  props.messages.some((message) => {
    const role = message.role || props.fallbackRole || 'assistant'
    return !props.roleConfigs?.[role]?.hidden
  }),
)

const showEmpty = computed(() => Boolean(slots.empty) && !hasVisibleMessages.value)

defineExpose({
  scrollToBottom: (behavior?: ScrollBehavior) => bubbleListRef.value?.scrollToBottom?.(behavior),
})
</script>

<template>
  <div v-bind="attrs" class="tr-chat-conversation-panel">
    <TrBubbleProvider
      :box-renderer-matches="props.boxRendererMatches"
      :content-renderer-matches="props.contentRendererMatches"
      :box-attributes="props.boxAttributes"
      :content-attributes="props.contentAttributes"
      :fallback-box-renderer="props.fallbackBoxRenderer"
      :fallback-content-renderer="props.fallbackContentRenderer"
      :store="props.store"
    >
      <div v-if="showEmpty" class="tr-chat-conversation-panel__empty">
        <slot name="empty" />
      </div>

      <TrBubbleList
        v-else
        ref="bubbleList"
        class="tr-chat-conversation-panel__list"
        :messages="props.messages"
        :group-strategy="props.groupStrategy"
        :divider-role="props.dividerRole"
        :fallback-role="props.fallbackRole"
        :role-configs="props.roleConfigs"
        :content-render-mode="props.contentRenderMode"
        :content-resolver="props.contentResolver"
        :auto-scroll="props.autoScroll"
        @state-change="emit('state-change', $event)"
      >
        <template v-if="$slots.prefix" #prefix="slotProps">
          <slot name="prefix" v-bind="slotProps" />
        </template>

        <template v-if="$slots.suffix" #suffix="slotProps">
          <slot name="suffix" v-bind="slotProps" />
        </template>

        <template v-if="$slots.after" #after="slotProps">
          <slot name="after" v-bind="slotProps" />
        </template>

        <template v-if="$slots['content-footer']" #content-footer="slotProps">
          <slot name="content-footer" v-bind="slotProps" />
        </template>
      </TrBubbleList>
    </TrBubbleProvider>
  </div>
</template>
