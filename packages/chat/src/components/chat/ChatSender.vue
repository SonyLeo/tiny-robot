<script setup lang="ts">
import { inject, ref, computed, useSlots, useAttrs } from 'vue'
import type { PropType, Slot } from 'vue'
import { TrSender, UploadButton, VoiceButton } from '@opentiny/tiny-robot'
import type { StructuredData } from '@opentiny/tiny-robot'
import { CHAT_ATTACHMENTS_KEY, CHAT_KIT_KEY, CHAT_SENDER_ACTIONS_KEY, useChatScaffoldContext } from '@/context'
import { useResolvedChatMessages } from '@/messages'

// 支持透传完整 TrSender props
defineOptions({ name: 'TrChatSender', inheritAttrs: false })

const props = defineProps({
  mode: {
    type: String as PropType<'single' | 'multiple'>,
  },
  placeholder: {
    type: String,
  },
  maxLength: {
    type: Number,
  },
})

const chatKit = inject(CHAT_KIT_KEY)!
const attachmentsContext = inject(CHAT_ATTACHMENTS_KEY, null)
const senderActionsContext = inject(CHAT_SENDER_ACTIONS_KEY, null)
const chatMessages = useResolvedChatMessages()
const attrs = useAttrs()
const slots = useSlots() as Record<string, Slot | undefined>
const scaffoldContext = useChatScaffoldContext()

const inputValue = ref('')

const isLoading = computed(() => chatKit.status.value === 'submitted' || chatKit.status.value === 'streaming')
const senderActionsFeature = computed(() => senderActionsContext?.feature)
const senderSlice = computed(() => scaffoldContext?.presetSlices.value.sender)
const uploadActionConfig = computed(() => senderActionsFeature.value?.upload ?? attachmentsContext?.feature.upload)
const voiceActionConfig = computed(() => senderActionsFeature.value?.voice)
const showDefaultUploadButton = computed(() => Boolean(uploadActionConfig.value?.enabled !== false))
const showDefaultVoiceButton = computed(() => Boolean(voiceActionConfig.value?.enabled))
const showDefaultFooterRightActions = computed(
  () =>
    !slots['footer-right'] && ((attachmentsContext && showDefaultUploadButton.value) || showDefaultVoiceButton.value),
)
const senderMode = computed<'single' | 'multiple'>(() => {
  const modeFromSlice = senderSlice.value?.mode
  return (
    props.mode ?? (modeFromSlice === 'single' || modeFromSlice === 'multiple' ? modeFromSlice : undefined) ?? 'multiple'
  )
})
const senderPlaceholder = computed(() => {
  return (
    props.placeholder ??
    (typeof senderSlice.value?.placeholder === 'string' ? senderSlice.value.placeholder : undefined) ??
    chatMessages.value.sender.placeholder
  )
})
const senderMaxLength = computed(() => {
  return props.maxLength ?? (typeof senderSlice.value?.maxLength === 'number' ? senderSlice.value.maxLength : undefined)
})
const fallbackSenderAttrs = computed(() => {
  if (!senderSlice.value) return {}

  return Object.fromEntries(
    Object.entries(senderSlice.value).filter(([key, value]) => {
      if (key === 'mode' || key === 'placeholder' || key === 'maxLength') return false
      if (value === undefined) return false
      return !(key in attrs)
    }),
  )
})
const mergedSenderAttrs = computed(() => ({
  showWordLimit: senderActionsFeature.value?.wordCount || undefined,
  defaultActions: senderActionsFeature.value?.defaultActions,
  maxLength: senderMaxLength.value,
  ...fallbackSenderAttrs.value,
  ...attrs,
}))

async function handleSend(content: string, data?: StructuredData) {
  await chatKit.sendMessage(content, data)
  attachmentsContext?.manager.clear()
  inputValue.value = ''
}

function handleAbort() {
  chatKit.abort()
}

function handleFileSelect(files: File[]) {
  attachmentsContext?.manager.addFiles(files)
}

// 获取所有插槽以支持透传
const forwardedSlots = computed<Partial<Record<string, Slot>>>(() =>
  Object.fromEntries(
    Object.entries(slots)
      .filter(([name]) => name !== 'footer-right')
      .filter(([, slot]) => slot !== undefined)
      .map(([name, slot]) => [name, slot as Slot]),
  ),
)
</script>

<template>
  <TrSender
    v-model="inputValue"
    :loading="isLoading"
    :mode="senderMode"
    :placeholder="senderPlaceholder"
    v-bind="mergedSenderAttrs"
    @submit="handleSend"
    @cancel="handleAbort"
  >
    <!-- 透传所有插槽 -->
    <template v-for="(_, name) in forwardedSlots" #[name]="slotProps" :key="name">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
    <template v-if="$slots['footer-right']" #footer-right="slotProps">
      <slot name="footer-right" v-bind="slotProps ?? {}" />
    </template>
    <template v-else-if="showDefaultFooterRightActions" #footer-right>
      <span v-if="attachmentsContext && showDefaultUploadButton" data-testid="chat-attachments-upload">
        <UploadButton v-bind="uploadActionConfig" @select="handleFileSelect" />
      </span>
      <span v-if="showDefaultVoiceButton" data-testid="chat-sender-action-voice">
        <VoiceButton v-bind="voiceActionConfig" />
      </span>
    </template>
  </TrSender>
</template>
