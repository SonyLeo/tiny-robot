<script setup lang="ts">
import { computed, ref, useAttrs, useSlots, watch, type Slot } from 'vue'
import { useChatKit, useModelSelector, useSlotFilter } from '../composables'
import { BUBBLE_LIST_SLOTS } from '../context'
import { CHAT_MESSAGES } from '../messages'
import type { ChatListVariant, ModelOption, TrChatProps } from '../types'
import TrChatFooter from './TrChatFooter.vue'
import TrChatFeedback from './TrChatFeedback.vue'
import TrChatHeader from './TrChatHeader.vue'
import { TrChatHistory } from './history'
import TrChatLayout from './TrChatLayout.vue'
import TrChatMessageList from './TrChatMessageList.vue'
import TrChatRoot from './TrChatRoot.vue'
import TrChatSender from './TrChatSender.vue'
import TrChatWelcome from './TrChatWelcome.vue'
import TrModelSelector from './TrModelSelector.vue'

defineOptions({ inheritAttrs: false })

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
const senderPlaceholder = computed(() => props.placeholder ?? CHAT_MESSAGES.sender.placeholder)
const showModelSelector = computed(() => Boolean(props.models?.length && props.providerFactories?.length))
const messageListVariant = computed<ChatListVariant>(() => {
  const attrVariant = attrs['message-list-variant'] ?? attrs.messageListVariant

  if (props.messageListVariant === 'docs' || attrVariant === 'docs') {
    return 'docs'
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
  <TrChatRoot :chat-kit="chatKit" :mcp-manager="props.mcpManager">
    <TrChatLayout :show="props.show !== false" :fullscreen="props.fullscreen" :role-configs="props.roleConfigs">
      <template v-if="$slots.header">
        <slot name="header" />
      </template>
      <TrChatHeader
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
      </TrChatHeader>

      <template v-if="$slots['message-list']">
        <slot name="message-list" :messages="chatKit.messages" />
      </template>
      <template v-else>
        <div v-if="showWelcome" class="tr-chat__welcome-area">
          <slot v-if="$slots.welcome" name="welcome" />
          <TrChatWelcome
            v-else-if="props.welcome"
            :title="props.welcome.title"
            :description="props.welcome.description"
            :icon="welcomeIcon"
            :prompts="props.prompts"
            @prompt-click="handlePromptClick"
          />
          <slot v-else name="empty" />
        </div>

        <TrChatMessageList
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
            <TrChatFeedback v-if="slotProps.role === 'assistant'" v-bind="slotProps" />
          </template>
        </TrChatMessageList>
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
      <TrChatFooter v-else>
        <template v-if="$slots['footer-extra']" #extra>
          <slot name="footer-extra" />
        </template>
        <div class="tr-chat-footer-content">
          <TrModelSelector
            v-if="showModelSelector"
            v-model="selectedModel"
            :models="props.models!"
            :provider-factories="props.providerFactories!"
            @change="handleSelectedModelChange"
          />
          <TrChatSender
            :placeholder="senderPlaceholder"
            :max-length="props.maxLength"
            :mode="props.senderMode"
            v-bind="props.senderProps"
          />
        </div>
      </TrChatFooter>

      <TrChatHistory v-if="props.showHistory" v-bind="props.historyProps" />
    </TrChatLayout>
  </TrChatRoot>
</template>

<style scoped>
.tr-chat-footer-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
