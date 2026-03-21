<script setup lang="ts">
import { computed, ref, useAttrs, useSlots, watch, type Slot } from 'vue'
import { useChatKit, useModelSelector, useSlotFilter } from '@/composables'
import { BUBBLE_LIST_SLOTS } from '@/context'
import { resolveChatMessages } from '@/messages'
import type { ChatListVariant, ModelOption, TrChatProps } from '@/types'
import { ChatHistory } from '../history'
import ChatFooter from './ChatFooter.vue'
import ChatAttachments from './ChatAttachments.vue'
import ChatFeedback from './ChatFeedback.vue'
import ChatHeader from './ChatHeader.vue'
import ChatLayout from './ChatLayout.vue'
import ChatMessageList from './ChatMessageList.vue'
import ChatRoot from './ChatRoot.vue'
import ChatSender from './ChatSender.vue'
import ChatWelcome from './ChatWelcome.vue'
import ModelSelector from '../model-selector/ModelSelector.vue'

defineOptions({ name: 'TrChat', inheritAttrs: false })

const props = withDefaults(defineProps<TrChatProps>(), {
  autoScroll: true,
  showHistory: false,
  enableFullscreen: false,
  fullscreen: undefined,
  show: undefined,
})
const attrs = useAttrs()

const emit = defineEmits<{
  (e: 'update:fullscreen', value: boolean): void
  (e: 'update:show', value: boolean): void
  (e: 'update:model', value: string): void
}>()

const selectedModel = ref<string>(props.defaultModel || props.models?.[0]?.value || '')

const getInitialProvider = () => {
  if (props.models?.length && props.providerFactories?.length && selectedModel.value) {
    const model = props.models.find((item) => item.value === selectedModel.value)
    if (model) {
      const factory = props.providerFactories.find((item) => item.match(model))
      if (factory) {
        return factory.createProvider(model)
      }
    }
  }

  return props.responseProvider
}

const chatKit = useChatKit({
  responseProvider: getInitialProvider()!,
  plugins: props.plugins,
  storage: props.storage,
  initialMessages: props.initialMessages,
  onFinish: props.onFinish,
  onError: props.onError,
})

const { selectModel } = useModelSelector({
  currentModel: selectedModel,
  models: computed(() => props.models ?? []),
  providerFactories: computed(() => props.providerFactories),
  chatKit,
})

watch(
  () => props.responseProvider,
  (newProvider) => {
    if (newProvider) {
      chatKit.updateResponseProvider(newProvider)
    }
  },
)

const showWelcome = computed(() => chatKit.messages.value.length === 0)
const welcomeIcon = computed(() => props.welcome?.icon ?? props.brand?.logo)
const chatMessages = computed(() => resolveChatMessages(props.messages))
const senderPlaceholder = computed(() => props.placeholder ?? chatMessages.value.sender.placeholder)
const showModelSelector = computed(() => Boolean(props.models?.length && props.providerFactories?.length))
const messageListVariant = computed<ChatListVariant>(() => {
  const attrVariant = attrs['message-list-variant'] ?? attrs.messageListVariant

  const variant = props.messageListVariant ?? attrVariant

  if (variant === 'docs' || variant === 'workspace') {
    return variant
  }

  return 'bubble'
})

const slots = useSlots() as Record<string, Slot | undefined>
const bubbleSlots = useSlotFilter(slots, BUBBLE_LIST_SLOTS)

function handlePromptClick(description: string) {
  chatKit.sendMessage(description)
}

function handleSelectedModelChange(model: ModelOption) {
  selectModel(model)
  props.onModelChange?.(model)
  emit('update:model', model.value)
}
</script>

<template>
  <ChatRoot
    :chat-kit="chatKit"
    :mcp-manager="props.mcpManager"
    :attachments-manager="props.attachmentsManager"
    :attachments-feature="props.attachmentsFeature"
    :sender-actions-feature="props.senderActionsFeature"
    :messages="props.messages"
  >
    <ChatLayout
      :show="props.show !== false"
      :fullscreen="props.fullscreen"
      :role-configs="props.roleConfigs"
      :appearance="props.appearance"
    >
      <template v-if="$slots.header">
        <slot name="header" />
      </template>
      <ChatHeader
        v-else
        :show-history="props.showHistory"
        :title="props.brand?.title"
        :show-full-screen="props.enableFullscreen"
        :is-fullscreen="props.fullscreen"
        :show-close="props.show !== undefined"
        @update:fullscreen="emit('update:fullscreen', $event)"
        @close="emit('update:show', false)"
      >
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
          <ChatWelcome
            v-else-if="props.welcome"
            :title="props.welcome.title"
            :description="props.welcome.description"
            :icon="welcomeIcon"
            :prompts="props.prompts"
            @prompt-click="handlePromptClick"
          />
          <slot v-else name="empty" />
        </div>

        <ChatMessageList
          v-else
          :auto-scroll="props.autoScroll"
          :variant="messageListVariant"
          :on-action-click="props.onMessageAction"
          :group-strategy="props.groupStrategy"
          v-bind="props.bubbleListProps"
        >
          <template v-for="(_, name) in bubbleSlots" #[name]="slotProps" :key="name">
            <slot :name="name" v-bind="slotProps ?? {}" />
          </template>
          <template v-if="props.showFeedback" #after="slotProps">
            <ChatFeedback v-if="slotProps.role === 'assistant'" v-bind="slotProps" />
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
          <ModelSelector
            v-if="showModelSelector"
            v-model="selectedModel"
            :models="props.models!"
            :provider-factories="props.providerFactories!"
            @change="handleSelectedModelChange"
          />
          <ChatSender
            :placeholder="senderPlaceholder"
            :max-length="props.maxLength"
            :mode="props.senderMode"
            v-bind="props.senderProps"
          />
        </div>
      </ChatFooter>

      <ChatHistory v-if="props.showHistory" v-bind="props.historyProps" />
    </ChatLayout>
  </ChatRoot>
</template>

<style scoped>
.tr-chat-footer-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
