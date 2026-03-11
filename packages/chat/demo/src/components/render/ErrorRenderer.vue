<script setup lang="ts">
import { useBubbleContentRenderer, type BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { computed } from 'vue'

const props = defineProps<
  BubbleContentRendererProps<
    string,
    {
      error?: {
        message?: string
      }
    }
  >
>()

const error = computed(() => props.message.state?.error)
const messageWithoutError = computed(() => {
  return {
    ...props.message,
    state: {
      ...props.message.state,
      error: undefined,
    },
  }
})

const renderer = useBubbleContentRenderer(messageWithoutError, props.contentIndex)
</script>

<template>
  <component :is="renderer" v-bind="props" :message="messageWithoutError" />
  <div class="error-renderer">
    <code>{{ error?.message || 'An error occurred' }}</code>
  </div>
</template>

<style lang="less" scoped>
.error-renderer {
  font-size: 12px;
  padding: 0.5rem;
  margin: 0.25rem 0;
  background-color: var(--rc-color-danger-light);
  border-radius: 0.5rem;
}
</style>
