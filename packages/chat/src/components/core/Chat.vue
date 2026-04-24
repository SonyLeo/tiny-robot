<script setup lang="ts">
import { useSlots, type Slot } from 'vue'
import { TrChatRoot } from '@/root'
import { TrChatPage } from '@/page'
import { useTrChatConfigRuntimeResolution } from '@/runtime/config/useTrChatConfigRuntimeResolution'
import type { TrChatProps } from '@/types'

defineOptions({ name: 'TrChat', inheritAttrs: false })

const props = defineProps<TrChatProps>()
const slots = useSlots() as Record<string, Slot | undefined>
const runtimeResolution = useTrChatConfigRuntimeResolution(() => props.config)
</script>

<template>
  <TrChatRoot :runtime="runtimeResolution.runtime" :ui="runtimeResolution.ui">
    <TrChatPage>
      <template v-for="(_, name) in slots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </TrChatPage>
  </TrChatRoot>
</template>
