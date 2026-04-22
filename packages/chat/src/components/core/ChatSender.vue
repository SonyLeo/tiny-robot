<script setup lang="ts">
import { inject, ref, computed, useSlots, useAttrs } from 'vue'
import type { PropType, Slot } from 'vue'
import { TrSender, UploadButton, VoiceButton } from '@opentiny/tiny-robot'
import type { StructuredData } from '@opentiny/tiny-robot'
import {
  CHAT_ATTACHMENTS_KEY,
  CHAT_BEFORE_SEND_KEY,
  CHAT_KIT_KEY,
  CHAT_RUNTIME_KEY,
  CHAT_SENDER_ACTIONS_KEY,
  useChatScaffoldContext,
} from '@/shared/context'
import { useResolvedChatMessages } from '@/shared/messages'

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
const chatRuntime = inject(CHAT_RUNTIME_KEY, null)
const attachmentsContext = inject(CHAT_ATTACHMENTS_KEY, null)
const senderActionsContext = inject(CHAT_SENDER_ACTIONS_KEY, null)
const beforeSendHandler = inject(CHAT_BEFORE_SEND_KEY, undefined)
const chatMessages = useResolvedChatMessages()
const attrs = useAttrs()
const slots = useSlots() as Record<string, Slot | undefined>
const scaffoldContext = useChatScaffoldContext()
const senderDefaults = computed(() => chatRuntime?.sender.defaults)

const legacyInputValue = ref('')
const inputValue = computed({
  get() {
    return chatRuntime?.sender.draft.value ?? legacyInputValue.value
  },
  set(value: string) {
    if (chatRuntime) {
      chatRuntime.sender.setDraft(value)
      return
    }

    legacyInputValue.value = value
  },
})

const isLoading = computed(() => {
  const status = chatRuntime?.conversation.status.value ?? chatKit.status.value
  return status === 'submitted' || status === 'streaming'
})
const senderActionsFeature = computed(() => senderActionsContext?.feature)
const senderSlice = computed(() => scaffoldContext?.presetSlices.value.sender)
const senderWordCount = computed(() => senderDefaults.value?.wordCount ?? senderActionsFeature.value?.wordCount)
const runtimeUploadConfig = computed(() => chatRuntime?.attachments?.uploadConfig?.value)
const hasAttachmentOwner = computed(() => Boolean(chatRuntime?.attachments || attachmentsContext))
const uploadActionConfig = computed(() => {
  const uploadConfig =
    runtimeUploadConfig.value ?? attachmentsContext?.feature.upload ?? senderActionsFeature.value?.upload
  if (!uploadConfig) {
    return uploadConfig
  }

  const usesSenderActionsCopy =
    !runtimeUploadConfig.value &&
    !attachmentsContext?.feature.upload &&
    uploadConfig === senderActionsFeature.value?.upload

  return {
    ...uploadConfig,
    tooltip:
      uploadConfig.tooltip ??
      (usesSenderActionsCopy
        ? chatMessages.value.senderActions.uploadTooltip
        : chatMessages.value.attachments.uploadTooltip),
  }
})
const voiceActionConfig = computed(() => {
  const voiceConfig = senderDefaults.value?.voice ?? senderActionsFeature.value?.voice
  if (!voiceConfig) {
    return voiceConfig
  }

  return {
    ...voiceConfig,
    tooltip: voiceConfig.tooltip ?? chatMessages.value.senderActions.voiceTooltip,
  }
})
const showDefaultUploadButton = computed(() =>
  Boolean(hasAttachmentOwner.value && uploadActionConfig.value?.enabled !== false),
)
const showDefaultVoiceButton = computed(() =>
  Boolean(voiceActionConfig.value && voiceActionConfig.value.enabled !== false),
)
const senderMode = computed<'single' | 'multiple'>(() => {
  const modeFromSlice = senderSlice.value?.mode
  return (
    props.mode ??
    senderDefaults.value?.mode ??
    (modeFromSlice === 'single' || modeFromSlice === 'multiple' ? modeFromSlice : undefined) ??
    'multiple'
  )
})
const senderPlaceholder = computed(() => {
  return (
    props.placeholder ??
    senderDefaults.value?.placeholder ??
    (typeof senderSlice.value?.placeholder === 'string' ? senderSlice.value.placeholder : undefined) ??
    chatMessages.value.sender.placeholder
  )
})
const senderMaxLength = computed(() => {
  return (
    props.maxLength ??
    senderDefaults.value?.maxLength ??
    (typeof senderSlice.value?.maxLength === 'number' ? senderSlice.value.maxLength : undefined)
  )
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
  showWordLimit: senderWordCount.value,
  defaultActions: senderActionsFeature.value?.defaultActions,
  maxLength: senderMaxLength.value,
  ...fallbackSenderAttrs.value,
  ...attrs,
}))

async function handleSend(content: string, data?: StructuredData) {
  if (chatRuntime) {
    await chatRuntime.sender.send({
      text: content,
      attachments: chatRuntime.sender.pendingAttachments.value,
    })
    return
  }

  let payload = {
    text: content,
    structuredData: data,
  }

  if (beforeSendHandler) {
    try {
      const result = await beforeSendHandler(payload)
      if (result === false) {
        return
      }

      payload = {
        ...payload,
        ...(result ?? {}),
      }
    } catch (error) {
      console.error('[TrChatSender] onBeforeSend failed:', error)
      return
    }
  }

  if (!payload.text.trim()) {
    return
  }

  await chatKit.sendMessage(payload.text)
  attachmentsContext?.manager.clear()
  inputValue.value = ''
}

function handleAbort() {
  if (chatRuntime) {
    chatRuntime.conversation.abort()
    return
  }

  chatKit.abort()
}

function handleFileSelect(files: File[]) {
  if (chatRuntime?.attachments) {
    const prepared = chatRuntime.attachments.prepareFiles(files)
    chatRuntime.sender.addPendingAttachments(prepared)
    return
  }

  attachmentsContext?.manager.addFiles(files)
}

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
    <template v-for="(_, name) in forwardedSlots" #[name]="slotProps" :key="name">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
    <template v-if="$slots['footer-right']" #footer-right="slotProps">
      <slot name="footer-right" v-bind="slotProps ?? {}" />
    </template>
    <template
      v-else-if="!$slots['footer-right'] && ((hasAttachmentOwner && showDefaultUploadButton) || showDefaultVoiceButton)"
      #footer-right
    >
      <span v-if="hasAttachmentOwner && showDefaultUploadButton" data-testid="chat-attachments-upload">
        <UploadButton v-bind="uploadActionConfig" @select="handleFileSelect" />
      </span>
      <span v-if="showDefaultVoiceButton" data-testid="chat-sender-action-voice">
        <VoiceButton v-bind="voiceActionConfig" />
      </span>
    </template>
  </TrSender>
</template>
