<script setup lang="ts">
import { computed, inject, useAttrs, useSlots, type Slot } from 'vue'
import { BUBBLE_LIST_SLOTS, CHAT_KIT_KEY, MCP_MANAGER_KEY, useChatScaffoldContext } from '@/context'
import { useSlotFilter } from '@/composables'
import type { ChatListVariant, ModelOption } from '@/types'
import type { ChatPresetMessageListSlice, ChatPresetWelcomeSlice } from '@/adapters'
import ChatDefaultBodyRegion from './ChatDefaultBodyRegion.vue'
import ChatDefaultFooterRegion from './ChatDefaultFooterRegion.vue'
import ChatDefaultHeaderRegion from './ChatDefaultHeaderRegion.vue'
import ChatLayout from '@/components/chat/ChatLayout.vue'
import ChatWorkspaceLayout from './ChatWorkspaceLayout.vue'
import { ChatHistory } from '@/components/history'

defineOptions({ name: 'TrChatDefaultRenderer', inheritAttrs: false })

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'update:model', value: string): void
}>()

const attrs = useAttrs()
const slots = useSlots() as Record<string, Slot | undefined>
const bubbleSlots = useSlotFilter(slots, BUBBLE_LIST_SLOTS)
const chatKit = inject(CHAT_KIT_KEY)!
const mcpManager = inject(MCP_MANAGER_KEY, null)
const scaffoldContext = useChatScaffoldContext()
const bubbleSlotNames = computed(() => Object.keys(bubbleSlots.value))

const showWelcome = computed(() => chatKit.messages.value.length === 0)
const welcomeSlice = computed<ChatPresetWelcomeSlice | undefined>(() => scaffoldContext?.presetSlices.value.welcome)
const messageListSlice = computed<ChatPresetMessageListSlice | undefined>(
  () => scaffoldContext?.presetSlices.value.messageList,
)
const appearanceSlice = computed(() => scaffoldContext?.presetSlices.value.appearance.appearance)
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
  Boolean(modelSelectorSlice.value?.enabled && (modelSelectorSlice.value.models?.length ?? 0) > 1),
)
const shellSlice = computed(() => scaffoldContext?.presetSlices.value.shell.shell)
const isWorkspaceShell = computed(() => shellSlice.value?.variant === 'workspace')
const showMcpTrigger = computed(() => Boolean(mcpManager))
const showFooterTools = computed(() => showModelSelector.value || showMcpTrigger.value)

function handleModelChange(model: ModelOption) {
  emit('update:model', model.value)
}
</script>

<template>
  <ChatWorkspaceLayout v-if="isWorkspaceShell" :appearance="appearanceSlice" :shell="shellSlice">
    <ChatLayout>
      <ChatDefaultHeaderRegion @close="emit('update:show', false)">
        <template v-if="$slots.header" #header>
          <slot name="header" />
        </template>
        <template v-if="$slots['header-extra']" #header-extra>
          <slot name="header-extra" />
        </template>
      </ChatDefaultHeaderRegion>

      <ChatDefaultBodyRegion
        :show-welcome="showWelcome"
        :welcome-slice="welcomeSlice"
        :message-list-slice="messageListSlice"
        :variant="resolvedVariant"
        :bubble-slot-names="bubbleSlotNames"
      >
        <template v-if="$slots['message-list']" #message-list="slotProps">
          <slot name="message-list" v-bind="slotProps ?? {}" />
        </template>
        <template v-if="$slots.welcome" #welcome>
          <slot name="welcome" />
        </template>
        <template v-if="$slots.empty" #empty>
          <slot name="empty" />
        </template>
        <template v-for="name in bubbleSlotNames" #[name]="slotProps" :key="name">
          <slot :name="name" v-bind="slotProps ?? {}" />
        </template>
      </ChatDefaultBodyRegion>

      <ChatDefaultFooterRegion
        :show-footer-tools="showFooterTools"
        :show-model-selector="showModelSelector"
        :show-mcp-trigger="showMcpTrigger"
        @change-model="handleModelChange"
      >
        <template v-if="$slots.sender" #sender="slotProps">
          <slot name="sender" v-bind="slotProps ?? {}" />
        </template>
        <template v-if="$slots['footer-extra']" #footer-extra>
          <slot name="footer-extra" />
        </template>
      </ChatDefaultFooterRegion>
    </ChatLayout>
  </ChatWorkspaceLayout>

  <ChatLayout v-else>
    <ChatDefaultHeaderRegion @close="emit('update:show', false)">
      <template v-if="$slots.header" #header>
        <slot name="header" />
      </template>
      <template v-if="$slots['header-extra']" #header-extra>
        <slot name="header-extra" />
      </template>
    </ChatDefaultHeaderRegion>

    <ChatDefaultBodyRegion
      :show-welcome="showWelcome"
      :welcome-slice="welcomeSlice"
      :message-list-slice="messageListSlice"
      :variant="resolvedVariant"
      :bubble-slot-names="bubbleSlotNames"
    >
      <template v-if="$slots['message-list']" #message-list="slotProps">
        <slot name="message-list" v-bind="slotProps ?? {}" />
      </template>
      <template v-if="$slots.welcome" #welcome>
        <slot name="welcome" />
      </template>
      <template v-if="$slots.empty" #empty>
        <slot name="empty" />
      </template>
      <template v-for="name in bubbleSlotNames" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </ChatDefaultBodyRegion>

    <ChatDefaultFooterRegion
      :show-footer-tools="showFooterTools"
      :show-model-selector="showModelSelector"
      :show-mcp-trigger="showMcpTrigger"
      @change-model="handleModelChange"
    >
      <template v-if="$slots.sender" #sender="slotProps">
        <slot name="sender" v-bind="slotProps ?? {}" />
      </template>
      <template v-if="$slots['footer-extra']" #footer-extra>
        <slot name="footer-extra" />
      </template>
    </ChatDefaultFooterRegion>

    <ChatHistory />
  </ChatLayout>
</template>
