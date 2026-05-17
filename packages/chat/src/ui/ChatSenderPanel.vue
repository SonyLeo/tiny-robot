<script setup lang="ts">
import { TrSender, type SenderSlotScope, type StructuredData } from '@opentiny/tiny-robot'
import { computed, mergeProps, useAttrs, useTemplateRef } from 'vue'
import type { ChatSenderPanelEmits, ChatSenderPanelProps, ChatSenderPanelSlots } from '@/types/ui'

defineOptions({
  name: 'ChatSenderPanel',
  inheritAttrs: false,
})

type SenderExposed = {
  submit: () => void
  clear: () => void
  cancel: () => void
  focus: () => void
  blur: () => void
  setContent: (content: string) => void
  getContent: () => string
  editor?: SenderSlotScope['editor']
}

const props = defineProps<ChatSenderPanelProps>()
const emit = defineEmits<ChatSenderPanelEmits>()
defineSlots<ChatSenderPanelSlots>()

const attrs = useAttrs()
const senderRef = useTemplateRef<SenderExposed>('sender')
const forwardedProps = computed(() => mergeProps(attrs, props))

function getEditor(): SenderSlotScope['editor'] {
  return senderRef.value?.editor
}

function focusSender(): void {
  senderRef.value?.focus()
}

function blurSender(): void {
  senderRef.value?.blur()
}

function clearSender(): void {
  senderRef.value?.clear()
}

function setSenderContent(content: string): void {
  senderRef.value?.setContent(content)
}

function normalizeSenderSlotProps(slotProps: unknown): SenderSlotScope {
  return slotProps as SenderSlotScope
}

function handleUpdateModelValue(value: string): void {
  emit('update:modelValue', value)
}

function handleSubmit(textContent: string, structuredData?: StructuredData): void {
  emit('submit', textContent, structuredData)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

function handleClear(): void {
  emit('clear')
}

function handleCancel(): void {
  emit('cancel')
}

function handleInput(value: string): void {
  emit('input', value)
}

defineExpose({
  submit: () => senderRef.value?.submit(),
  clear: clearSender,
  cancel: () => senderRef.value?.cancel(),
  focus: focusSender,
  blur: blurSender,
  setContent: setSenderContent,
  getContent: () => senderRef.value?.getContent() ?? '',
  get editor() {
    return getEditor()
  },
})
</script>

<template>
  <TrSender
    ref="sender"
    v-bind="forwardedProps"
    class="tr-chat-sender-panel"
    @update:model-value="handleUpdateModelValue"
    @submit="handleSubmit"
    @focus="handleFocus"
    @blur="handleBlur"
    @clear="handleClear"
    @cancel="handleCancel"
    @input="handleInput"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>

    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>

    <template v-if="$slots.content" #content="slotProps">
      <slot name="content" v-bind="slotProps" />
    </template>

    <template v-if="$slots['actions-inline']" #actions-inline="slotProps">
      <slot name="actions-inline" v-bind="normalizeSenderSlotProps(slotProps)" />
    </template>

    <template v-if="$slots.footer" #footer="slotProps">
      <slot name="footer" v-bind="normalizeSenderSlotProps(slotProps)" />
    </template>

    <template v-if="$slots['footer-right']" #footer-right="slotProps">
      <slot name="footer-right" v-bind="normalizeSenderSlotProps(slotProps)" />
    </template>
  </TrSender>
</template>
