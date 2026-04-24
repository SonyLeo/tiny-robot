<script setup lang="ts">
import { computed, shallowRef, useSlots, watch, type Slot } from 'vue'
import { TrChatRoot } from '@/root'
import { TrChatPage } from '@/page'
import { createRuntimeFromConfig } from '@/runtime/config'
import { resolveRootPageBlackboxConfig } from '@/runtime/config/blackboxEntry'
import type { TrChatProps } from '@/types'

defineOptions({ name: 'TrChat', inheritAttrs: false })

const props = defineProps<TrChatProps>()
const slots = useSlots() as Record<string, Slot | undefined>

const blackboxResolutionRef = shallowRef<ReturnType<typeof createRuntimeFromConfig> | null>(null)
const blackboxResolutionError = shallowRef<Error | null>(null)

watch(
  () => props.config,
  (nextConfig) => {
    const config = resolveRootPageBlackboxConfig(nextConfig)
    if (!config) {
      blackboxResolutionRef.value = null
      blackboxResolutionError.value = new Error(
        '[TrChat] The blackbox entry now accepts only target TrChatConfig or serialized target TrChatConfig. Use TrChat.Root + TrChat.Page or TrChat.Root + primitives for whitebox composition.',
      )
      return
    }

    blackboxResolutionError.value = null
    blackboxResolutionRef.value = createRuntimeFromConfig(config)
  },
  { immediate: true },
)

const blackboxResolution = computed(() => {
  if (blackboxResolutionError.value) {
    throw blackboxResolutionError.value
  }

  if (!blackboxResolutionRef.value) {
    throw new Error('[TrChat] Failed to initialize the blackbox runtime resolution.')
  }

  return blackboxResolutionRef.value
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
