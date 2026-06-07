<script setup lang="ts">
import { IconCheck, IconCopy } from '@opentiny/tiny-robot-svgs'
import { computed } from 'vue'
import TrIconButton from '../../../icon-button'
import { useClipboardState } from '../../composables/useClipboardState'

const props = withDefaults(
  defineProps<{
    code?: string
    size?: 'small' | 'medium'
    timeout?: number
  }>(),
  {
    size: 'medium',
    timeout: 1800,
  },
)

const { copy, state } = useClipboardState({
  timeoutMs: () => props.timeout,
  value: () => props.code || '',
})
const icon = computed(() => (state.value === 'copied' ? IconCheck : IconCopy))
const buttonSize = computed(() => (props.size === 'small' ? '24px' : '24px'))
const iconSize = computed(() => (props.size === 'small' ? '14px' : '14px'))
</script>

<template>
  <TrIconButton
    class="tr-markdown__copy-button"
    :icon="icon"
    :size="buttonSize"
    :svg-size="iconSize"
    aria-label="Copy code"
    :title="state === 'copied' ? 'Copied' : 'Copy code'"
    @click="copy"
  />
</template>
