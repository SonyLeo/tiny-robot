<script setup lang="ts">
import { computed, watch, useSlots } from 'vue'
import type { Slot } from 'vue'
import { useChatKit } from '../composables/useChatKit'
import { DEFAULT_ROLE_CONFIGS } from '../composables/defaults'
import TrChatRoot from './TrChatRoot.vue'
import TrChatHeader from './TrChatHeader.vue'
import TrChatWelcome from './TrChatWelcome.vue'
import TrChatMessageList from './TrChatMessageList.vue'
import TrChatFooter from './TrChatFooter.vue'
import TrChatSender from './TrChatSender.vue'
import TrChatHistory from './TrChatHistory.vue'
import { BUBBLE_LIST_SLOTS } from '../context'
import type { TrChatProps } from '../types'

const props = withDefaults(defineProps<TrChatProps>(), {
  placeholder: '请输入您的问题',
  autoScroll: true,
  showHistory: false,
  enableFullscreen: false,
  fullscreen: undefined,
  show: undefined,
})

const emit = defineEmits<{
  (e: 'update:fullscreen', value: boolean): void
  (e: 'update:show', value: boolean): void
}>()

// 黑盒模式：内部创建 chatKit 实例，传给 Root（模式 B）
const chatKit = useChatKit({
  responseProvider: props.responseProvider,
  plugins: props.plugins,
  storage: props.storage,
  initialMessages: props.initialMessages,
  onFinish: props.onFinish,
  onError: props.onError,
})

// 监听 responseProvider 变化，动态更新
watch(
  () => props.responseProvider,
  (newProvider) => {
    chatKit.updateResponseProvider(newProvider)
  },
)

const showWelcome = computed(() => chatKit.messages.value.length === 0)

// 黑盒模式下自动处理引导词点击
function handlePromptClick(description: string) {
  chatKit.sendMessage(description)
}

// UI-RC1：默认 roleConfigs 合并（用户配置优先）
const mergedRoleConfigs = computed(() => ({
  ...DEFAULT_ROLE_CONFIGS,
  ...props.roleConfigs,
}))

// UI-B1：Welcome 区 icon：优先 welcome.icon，fallback brand.logo
const welcomeIcon = computed(() => props.welcome?.icon ?? props.brand?.logo)

// BubbleList 允许的 slot 白名单
const slots = useSlots() as Record<string, Slot | undefined>
const bubbleSlots = computed<Partial<Record<string, Slot>>>(() =>
  Object.fromEntries(
    Object.entries(slots)
      .filter(([name, slot]) => (BUBBLE_LIST_SLOTS as readonly string[]).includes(name) && slot !== undefined)
      .map(([name, slot]) => [name, slot as Slot]),
  ),
)
</script>

<template>
  <TrChatRoot :chat-kit="chatKit">
    <div v-show="props.show !== false" class="tr-chat" :class="{ 'tr-chat--fullscreen': props.fullscreen }">
      <!-- 顶部栏 -->
      <template v-if="$slots.header">
        <slot name="header" />
      </template>
      <!-- UI-B1：将 brand.title 传给 Header，UI-S1: full-screen / close 支持 -->
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

      <!-- 消息区 / 欢迎页 -->
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

        <!-- UI-RC1：使用 mergedRoleConfigs 确保默认左右布局 -->
        <TrChatMessageList
          v-else
          :auto-scroll="props.autoScroll"
          :role-configs="mergedRoleConfigs"
          :group-strategy="props.groupStrategy"
          v-bind="props.bubbleListProps"
        >
          <!-- 只透传 BubbleList 允许的 slots -->
          <template v-for="(_, name) in bubbleSlots" #[name]="slotProps" :key="name">
            <slot :name="name" v-bind="slotProps ?? {}" />
          </template>
        </TrChatMessageList>
      </template>

      <!-- 底部 -->
      <template v-if="$slots.sender">
        <slot name="sender" :send="chatKit.sendMessage" :abort="chatKit.abort" :status="chatKit.status" />
      </template>
      <TrChatFooter v-else>
        <template v-if="$slots['footer-extra']" #extra>
          <slot name="footer-extra" />
        </template>
        <TrChatSender
          :placeholder="props.placeholder"
          :max-length="props.maxLength"
          :mode="props.senderMode"
          v-bind="props.senderProps"
        />
      </TrChatFooter>

      <!-- 历史 Drawer -->
      <TrChatHistory v-if="props.showHistory" v-bind="props.historyProps" />
    </div>
  </TrChatRoot>
</template>
