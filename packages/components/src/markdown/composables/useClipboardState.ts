import { computed, onBeforeUnmount, ref, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export interface UseClipboardStateOptions {
  timeoutMs?: MaybeRefOrGetter<number | undefined>
  value: MaybeRefOrGetter<string>
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

export const useClipboardState = (options: UseClipboardStateOptions) => {
  const state = ref<'idle' | 'copied' | 'error'>('idle')
  const timeoutMs = computed(() => Math.max(0, toValue(options.timeoutMs) ?? 1800))

  let timer: ReturnType<typeof setTimeout> | null = null

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const restore = () => {
    clearTimer()
    timer = setTimeout(() => {
      state.value = 'idle'
      timer = null
    }, timeoutMs.value)
  }

  const copy = async () => {
    const value = toValue(options.value)

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        fallbackCopy(value)
      }
      state.value = 'copied'
    } catch {
      try {
        fallbackCopy(value)
        state.value = 'copied'
      } catch {
        state.value = 'error'
      }
    }

    restore()
  }

  onBeforeUnmount(clearTimer)

  return {
    copy,
    state,
  }
}
