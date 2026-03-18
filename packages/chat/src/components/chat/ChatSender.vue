<script setup lang="ts">
import { inject, ref, computed, useSlots, useAttrs } from 'vue'
import type { PropType, Slot } from 'vue'
import { TrSender, UploadButton, VoiceButton } from '@opentiny/tiny-robot'
import type { StructuredData } from '@opentiny/tiny-robot'
import { CHAT_ATTACHMENTS_KEY, CHAT_KIT_KEY, CHAT_SENDER_ACTIONS_KEY } from '../../context'
import { CHAT_MESSAGES } from '../../messages'

// 支持透传完整 TrSender props
defineOptions({ name: 'TrChatSender', inheritAttrs: false })

const props = defineProps({
  mode: {
    type: String as PropType<'single' | 'multiple'>,
    default: 'multiple',
  },
  placeholder: {
    type: String,
    default: CHAT_MESSAGES.sender.placeholder,
  },
})

const chatKit = inject(CHAT_KIT_KEY)!
const attachmentsContext = inject(CHAT_ATTACHMENTS_KEY, null)
const senderActionsContext = inject(CHAT_SENDER_ACTIONS_KEY, null)
const attrs = useAttrs()

const inputValue = ref('')

const isLoading = computed(() => chatKit.status.value === 'submitted' || chatKit.status.value === 'streaming')
const senderActionsFeature = computed(() => senderActionsContext?.feature)
const uploadActionConfig = computed(() => senderActionsFeature.value?.upload ?? attachmentsContext?.feature.upload)
const voiceActionConfig = computed(() => senderActionsFeature.value?.voice)
const showDefaultUploadButton = computed(() => Boolean(uploadActionConfig.value?.enabled !== false))
const showDefaultVoiceButton = computed(() => Boolean(voiceActionConfig.value?.enabled))
const mergedSenderAttrs = computed(() => ({
  showWordLimit: senderActionsFeature.value?.wordCount || undefined,
  defaultActions: senderActionsFeature.value?.defaultActions,
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
const slots = useSlots() as Record<string, Slot | undefined>
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
    :mode="props.mode"
    :placeholder="props.placeholder"
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
    <template v-else-if="(attachmentsContext && showDefaultUploadButton) || showDefaultVoiceButton" #footer-right>
      <span
        v-if="attachmentsContext && showDefaultUploadButton && !$slots.footer && !$slots['footer-right']"
        data-testid="chat-attachments-upload"
      >
        <UploadButton v-bind="uploadActionConfig" @select="handleFileSelect" />
      </span>
      <span
        v-if="showDefaultVoiceButton && !$slots.footer && !$slots['footer-right']"
        data-testid="chat-sender-action-voice"
      >
        <VoiceButton v-bind="voiceActionConfig" />
      </span>
    </template>
  </TrSender>
</template>
