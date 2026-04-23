<script setup lang="ts">
import { computed, useSlots, type Slot } from 'vue'
import { TrChatRoot } from '@/root'
import { TrChatPage } from '@/page'
import { createRuntimeFromConfig } from '@/runtime/config'
import { resolveRootPageBlackboxConfig } from '@/runtime/config/blackboxEntry'
import type { TrChatProps } from '@/types'

defineOptions({ name: 'TrChat', inheritAttrs: false })

const props = defineProps<TrChatProps>()
const slots = useSlots() as Record<string, Slot | undefined>

const blackboxResolution = computed(() => {
  const config = resolveRootPageBlackboxConfig(props.config)
  if (!config) {
    throw new Error(
      '[TrChat] The blackbox entry now accepts only target TrChatConfig or serialized target TrChatConfig. Use TrChat.Root + TrChat.Page or TrChat.Root + primitives for whitebox composition.',
    )
  }

  return createRuntimeFromConfig(config)
})
</script>

<template>
  <TrChatRoot :runtime="blackboxResolution.runtime" :ui="blackboxResolution.ui">
    <TrChatPage>
      <template v-for="(_, name) in slots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </TrChatPage>
  </TrChatRoot>
</template>
