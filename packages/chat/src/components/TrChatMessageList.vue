<script setup lang="ts">
import { inject, useSlots, computed, useAttrs } from 'vue'
import type { Slot } from 'vue'
import { TrBubbleList } from '@opentiny/tiny-robot'
import { CHAT_KIT_KEY, BUBBLE_CONFIG_KEY, BUBBLE_LIST_SLOTS } from '../context'
import { useSlotFilter } from '../composables'
import type { BubbleListProps } from '@opentiny/tiny-robot'

// 支持透传完整 TrBubbleList props（使用 v-bind="$attrs" + defineOptions inheritAttrs: false）
defineOptions({ inheritAttrs: false })

const chatKit = inject(CHAT_KIT_KEY)!
const bubbleConfig = inject(BUBBLE_CONFIG_KEY, null)
const slots = useSlots() as Record<string, Slot | undefined>
const attrs = useAttrs()

// 在 script 中解构 messages，避免模板中手动 .value
const messages = computed(() => chatKit.messages.value)

// 过滤 slots，只保留 BubbleList 允许的 slot 名
const filteredSlots = useSlotFilter(slots, BUBBLE_LIST_SLOTS)

const bubbleListProps = computed(() => ({
  ...attrs,
  roleConfigs: (attrs.roleConfigs as BubbleListProps['roleConfigs'] | undefined) ?? bubbleConfig?.roleConfigs.value,
}))
</script>

<template>
  <div class="tr-chat__body">
    <TrBubbleList :messages="messages" v-bind="bubbleListProps">
      <!-- 只透传 BubbleList 允许的 slots -->
      <template v-for="(_, name) in filteredSlots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </TrBubbleList>
  </div>
</template>
