<script setup lang="ts">
import { computed, useSlots, type Slot } from 'vue'
import { TrChatRoot } from '@/root'
import { TrChatPage } from '@/page'
import { createRuntimeFromConfig } from '@/runtime/config'
import { resolveRootPageBlackboxConfig } from '@/runtime/config/blackboxEntry'
import type { TrChatProps } from '@/types'
import ChatScaffold from './ChatScaffold.vue'

defineOptions({ name: 'TrChat', inheritAttrs: false })

const props = defineProps<TrChatProps>()
const slots = useSlots() as Record<string, Slot | undefined>

const blackboxConfig = computed(() => resolveRootPageBlackboxConfig(props))
const blackboxResolution = computed(() => (blackboxConfig.value ? createRuntimeFromConfig(blackboxConfig.value) : null))
</script>

<template>
  <TrChatRoot v-if="blackboxResolution" :runtime="blackboxResolution.runtime" :ui="blackboxResolution.ui">
    <TrChatPage>
      <template v-for="(_, name) in slots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </TrChatPage>
  </TrChatRoot>

  <ChatScaffold
    v-else
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
