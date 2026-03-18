<script setup lang="ts">
import { computed, inject, provide, useAttrs, useSlots } from 'vue'
import type { Slot } from 'vue'
import { TrBubbleList } from '@opentiny/tiny-robot'
import type { BubbleListProps, BubbleRoleConfig } from '@opentiny/tiny-robot'
import { BUBBLE_CONFIG_KEY, BUBBLE_LIST_SLOTS, CHAT_KIT_KEY, MESSAGE_ACTION_KEY } from '../../context'
import { useSlotFilter } from '../../composables'
import type { ChatListVariant, TrChatMessageListProps } from '../../types'

defineOptions({ name: 'TrChatMessageList', inheritAttrs: false })

const props = withDefaults(defineProps<TrChatMessageListProps>(), {
  variant: 'bubble',
})

const chatKit = inject(CHAT_KIT_KEY)!
const bubbleConfig = inject(BUBBLE_CONFIG_KEY, null)
const slots = useSlots() as Record<string, Slot | undefined>
const attrs = useAttrs()

provide(MESSAGE_ACTION_KEY, (payload) => {
  props.onActionClick?.(payload)
})

const messages = computed(() => chatKit.messages.value)
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

  return createVariantRoleConfigs(baseRoleConfigs, props.variant)
})

const bubbleListProps = computed(() => ({
  ...attrs,
  autoScroll: props.autoScroll,
  roleConfigs: roleConfigs.value,
  'data-variant': props.variant,
}))
</script>

<template>
  <div class="tr-chat__body" :class="`tr-chat__body--${props.variant}`" :data-variant="props.variant">
    <TrBubbleList :messages="messages" v-bind="bubbleListProps">
      <template v-for="(_, name) in filteredSlots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </TrBubbleList>
  </div>
</template>
