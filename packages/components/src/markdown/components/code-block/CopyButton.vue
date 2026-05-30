<script setup lang="ts">
import { IconCheck, IconCopy } from '@opentiny/tiny-robot-svgs'
import { computed, onBeforeUnmount, ref } from 'vue'
import TrIconButton from '../../../icon-button'

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

const state = ref<'idle' | 'copied' | 'error'>('idle')
let timer: ReturnType<typeof setTimeout> | null = null

const icon = computed(() => (state.value === 'copied' ? IconCheck : IconCopy))
const buttonSize = computed(() => (props.size === 'small' ? '24px' : '24px'))
const iconSize = computed(() => (props.size === 'small' ? '14px' : '14px'))

const clearTimer = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

const fallbackCopy = (value: string) => {
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  document.body.appendChild(textarea)
  textarea.select()
  const successful = document.execCommand('copy')
  document.body.removeChild(textarea)
  if (!successful) {
    throw new Error('Copy command failed')
  }
}

const restore = () => {
  clearTimer()
  timer = setTimeout(() => {
    state.value = 'idle'
    timer = null
  }, props.timeout)
}

const copy = async () => {
  try {
    const value = props.code || ''
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
    } else {
      fallbackCopy(value)
    }
    state.value = 'copied'
    restore()
  } catch {
    try {
      fallbackCopy(props.code || '')
      state.value = 'copied'
      restore()
    } catch {
      state.value = 'error'
      restore()
    }
  }
}

onBeforeUnmount(clearTimer)
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
