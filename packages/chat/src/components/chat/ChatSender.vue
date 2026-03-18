<script setup lang="ts">
import { inject, ref, computed, useSlots } from 'vue'
import type { PropType, Slot } from 'vue'
import { TrSender, UploadButton } from '@opentiny/tiny-robot'
import type { StructuredData } from '@opentiny/tiny-robot'
import { CHAT_ATTACHMENTS_KEY, CHAT_KIT_KEY } from '../../context'
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

const inputValue = ref('')

const isLoading = computed(() => chatKit.status.value === 'submitted' || chatKit.status.value === 'streaming')
const attachmentsUploadConfig = computed(() => attachmentsContext?.feature.upload)
const showDefaultUploadButton = computed(() => Boolean(attachmentsUploadConfig.value?.enabled !== false))

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
    v-bind="$attrs"
    @submit="handleSend"
    @cancel="handleAbort"
  >
    <!-- 透传所有插槽 -->
    <template v-for="(_, name) in forwardedSlots" #[name]="slotProps" :key="name">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
    <template v-if="attachmentsContext && showDefaultUploadButton && !$slots.footer" #footer-right>
      <span data-testid="chat-attachments-upload">
        <UploadButton v-bind="attachmentsUploadConfig" @select="handleFileSelect" />
      </span>
    </template>
  </TrSender>
</template>
