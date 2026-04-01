<script setup lang="ts">
import { useSlots, type Slot } from 'vue'
import type { TrChatProps } from '@/types'
import ChatScaffold from './ChatScaffold.vue'

defineOptions({ name: 'TrChat', inheritAttrs: false })

const props = defineProps<TrChatProps>()
const slots = useSlots() as Record<string, Slot | undefined>
</script>

<template>
  <ChatScaffold
    :config="props.config"
    :runtime="props.runtime"
    :callbacks="props.callbacks"
    :preset-overrides="props.presetOverrides"
  >
    <template v-for="(_, name) in slots" #[name]="slotProps" :key="name">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </ChatScaffold>
</template>
