<script setup lang="ts">
import { computed, inject, provide, useAttrs, useSlots } from 'vue'
import type { PropType, Slot } from 'vue'
import { TrBubbleList } from '@opentiny/tiny-robot'
import type { BubbleListProps, BubbleRoleConfig } from '@opentiny/tiny-robot'
import {
  BUBBLE_CONFIG_KEY,
  BUBBLE_LIST_SLOTS,
  CHAT_KIT_KEY,
  MESSAGE_ACTION_KEY,
  MESSAGE_ACTIONS_KEY,
  useChatPageInputs,
} from '@/shared/context'
import { normalizeChatRenderMessages } from '@/runtime/chat-kit/chatRenderMessages'
import { useSlotFilter } from './useSlotFilter'
import type { ChatListVariant, TrChatMessageListProps } from '@/types'
import { triStateBooleanProp } from '@/shared/utils'

defineOptions({ name: 'TrChatMessageList', inheritAttrs: false })

const props = defineProps({
  compatibilityRelay: triStateBooleanProp,
  autoScroll: triStateBooleanProp,
  variant: String as PropType<ChatListVariant>,
  messageActions: null as unknown as PropType<TrChatMessageListProps['messageActions']>,
  messageActionsMode: String as PropType<TrChatMessageListProps['messageActionsMode']>,
  onActionClick: Function as PropType<TrChatMessageListProps['onActionClick']>,
  groupStrategy: null as unknown as PropType<BubbleListProps['groupStrategy']>,
})
const pageInputs = useChatPageInputs()
const messageListInput = computed(() => pageInputs?.value.messageList)

const chatKit = inject(CHAT_KIT_KEY)!
const bubbleConfig = inject(BUBBLE_CONFIG_KEY, null)
const slots = useSlots() as Record<string, Slot | undefined>
const attrs = useAttrs()
const resolvedVariant = computed<ChatListVariant>(() => props.variant ?? messageListInput.value?.variant ?? 'bubble')
const resolvedAutoScroll = computed(() => props.autoScroll ?? messageListInput.value?.autoScroll)
const resolvedMessageActions = computed(() => props.messageActions ?? messageListInput.value?.messageActions)
const resolvedMessageActionsMode = computed(
  () => props.messageActionsMode ?? messageListInput.value?.messageActionsMode,
)
const resolvedActionClick = computed(() => props.onActionClick ?? messageListInput.value?.onActionClick)
const resolvedGroupStrategy = computed(() => props.groupStrategy ?? messageListInput.value?.groupStrategy)

provide(MESSAGE_ACTION_KEY, (payload) => {
  resolvedActionClick.value?.(payload)
})
provide(MESSAGE_ACTIONS_KEY, {
  messageActions: resolvedMessageActions,
  messageActionsMode: resolvedMessageActionsMode,
})

const messages = computed(() => normalizeChatRenderMessages(chatKit.messages.value))
const filteredSlots = useSlotFilter(slots, BUBBLE_LIST_SLOTS)

function createVariantRoleConfigs(
  baseRoleConfigs: BubbleListProps['roleConfigs'] | undefined,
  variant: ChatListVariant,
): BubbleListProps['roleConfigs'] | undefined {
  if (variant !== 'docs') {
    return baseRoleConfigs
  }

  const assistant = baseRoleConfigs?.assistant as BubbleRoleConfig | undefined
  const user = baseRoleConfigs?.user as BubbleRoleConfig | undefined

  return {
    ...baseRoleConfigs,
    assistant: {
      ...assistant,
      avatar: undefined,
      placement: assistant?.placement ?? 'start',
      shape: 'none',
    },
    user: {
      ...user,
      avatar: undefined,
      placement: user?.placement ?? 'end',
      shape: user?.shape ?? 'rounded',
    },
  }
}

const roleConfigs = computed(() => {
  const baseRoleConfigs =
    (attrs.roleConfigs as BubbleListProps['roleConfigs'] | undefined) ?? bubbleConfig?.roleConfigs.value

  return createVariantRoleConfigs(baseRoleConfigs, resolvedVariant.value)
})

const bubbleListProps = computed(() => ({
  ...attrs,
  autoScroll: resolvedAutoScroll.value,
  groupStrategy: resolvedGroupStrategy.value,
  roleConfigs: roleConfigs.value,
  'data-variant': resolvedVariant.value,
}))
</script>

<template>
  <div class="tr-chat__body" :class="`tr-chat__body--${resolvedVariant}`" :data-variant="resolvedVariant">
    <TrBubbleList class="tr-chat__bubble-list" :messages="messages" v-bind="bubbleListProps">
      <template v-for="(_, name) in filteredSlots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </TrBubbleList>
  </div>
</template>
