<script setup lang="ts">
import { useSlots, type Slot } from 'vue'
import { TrChatPage } from '@/page'

defineOptions({ name: 'TrChatDefaultRenderer', inheritAttrs: false })

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'update:model', value: string): void
}>()

const slots = useSlots() as Record<string, Slot | undefined>
</script>

<template>
  <TrChatPage @update:show="emit('update:show', $event)" @update:model="emit('update:model', $event)">
    <template v-for="(_, name) in slots" #[name]="slotProps" :key="name">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </TrChatPage>
</template>
