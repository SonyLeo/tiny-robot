<script setup lang="ts">
import { inject, useSlots, computed } from 'vue'
import { TrBubbleList } from '@opentiny/tiny-robot'
import { CHAT_KIT_KEY, BUBBLE_LIST_SLOTS } from '../context'

// 支持透传完整 TrBubbleList props（使用 v-bind="$attrs" + defineOptions inheritAttrs: false）
defineOptions({ inheritAttrs: false })

const chatKit = inject(CHAT_KIT_KEY)!
const slots = useSlots()

// 在 script 中解构 messages，避免模板中手动 .value
const messages = computed(() => chatKit.messages.value)

// 过滤 slots，只保留 BubbleList 允许的 slot 名
const filteredSlots = computed(() =>
  Object.fromEntries(Object.entries(slots).filter(([name]) => (BUBBLE_LIST_SLOTS as readonly string[]).includes(name))),
)
</script>

<template>
  <div class="tr-chat__body">
    <TrBubbleList :messages="messages" v-bind="$attrs">
      <!-- 只透传 BubbleList 允许的 slots -->
      <template v-for="(_, name) in filteredSlots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </TrBubbleList>
  </div>
</template>
