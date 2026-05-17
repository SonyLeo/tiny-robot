<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { ChatTopbarProps, ChatTopbarSlots } from '@/types/ui'

defineOptions({
  name: 'ChatTopbar',
})

const props = defineProps<ChatTopbarProps>()
defineSlots<ChatTopbarSlots>()

const slots = useSlots()
const hasTitle = computed(() => Boolean(props.title) || Boolean(slots.title))
</script>

<template>
  <div class="tr-chat-topbar">
    <div class="tr-chat-topbar__main">
      <div v-if="$slots.leading" class="tr-chat-topbar__leading">
        <slot name="leading" />
      </div>

      <div v-if="hasTitle" class="tr-chat-topbar__title-shell">
        <slot name="title">
          <span class="tr-chat-topbar__title">{{ props.title }}</span>
        </slot>
      </div>

      <div v-if="$slots.actions" class="tr-chat-topbar__actions">
        <slot name="actions" />
      </div>
    </div>

    <div v-if="$slots.extra" class="tr-chat-topbar__extra">
      <slot name="extra" />
    </div>
  </div>
</template>
