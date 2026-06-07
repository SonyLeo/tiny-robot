import { computed, onBeforeUnmount, ref, toValue, watch } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import type { TrMarkdownHtmlPreviewStreamingMode } from '../../index.type'
import { containsScript, isHtmlContentClosed } from './utils'

const DEFAULT_THROTTLE_MS = 250

export interface TrMarkdownHtmlPreviewStreamSession {
  headClosed: Ref<boolean>
  liveCommitted: Ref<boolean>
  pendingReason: ComputedRef<'defer' | 'head' | 'script' | 'stable'>
  previewPending: ComputedRef<boolean>
  renderContent: ComputedRef<string>
  scriptLocked: Ref<boolean>
  stable: ComputedRef<boolean>
}

export const useHtmlPreviewStreamSession = (
  content: MaybeRefOrGetter<string>,
  active: MaybeRefOrGetter<boolean>,
  streamingMode: MaybeRefOrGetter<TrMarkdownHtmlPreviewStreamingMode | undefined>,
  throttleMs: MaybeRefOrGetter<number> = DEFAULT_THROTTLE_MS,
): TrMarkdownHtmlPreviewStreamSession => {
  const headClosed = ref(false)
  const liveCommitted = ref(false)
  const scriptLocked = ref(false)
  const throttledContent = ref(toValue(content))
  let previousContent = toValue(content)

  let commitTimer: ReturnType<typeof setTimeout> | null = null
  let lastCommitAt = 0

  const clearCommitTimer = () => {
    if (commitTimer) {
      clearTimeout(commitTimer)
      commitTimer = null
    }
  }

  const resetSession = () => {
    headClosed.value = false
    liveCommitted.value = false
    scriptLocked.value = false
    throttledContent.value = toValue(content)
    lastCommitAt = 0
    clearCommitTimer()
  }

  const commitLatestContent = () => {
    throttledContent.value = toValue(content)
    lastCommitAt = Date.now()
  }

  const resolvedMode = computed(() => toValue(streamingMode) || 'auto')
  const contentClosed = computed(() => isHtmlContentClosed(toValue(content)))
  const previewReady = computed(() => {
    if (!Boolean(toValue(active))) {
      return true
    }

    if (contentClosed.value) {
      return true
    }

    if (!headClosed.value) {
      return false
    }

    if (resolvedMode.value === 'defer') {
      return false
    }

    if (resolvedMode.value === 'auto' && scriptLocked.value) {
      return false
    }

    return true
  })
  const liveReady = computed(() => Boolean(toValue(active)) && !contentClosed.value && previewReady.value)

  watch(
    () => Boolean(toValue(active)),
    (nextActive, previousActive) => {
      if (nextActive && !previousActive) {
        resetSession()
        return
      }

      if (!nextActive) {
        clearCommitTimer()
        commitLatestContent()
        liveCommitted.value = false
      }
    },
    {
      immediate: true,
    },
  )

  watch(
    () => toValue(content),
    (nextContent) => {
      if (!Boolean(toValue(active))) {
        throttledContent.value = nextContent
        previousContent = nextContent
        return
      }

      const isRewriteReset =
        Boolean(previousContent) &&
        (nextContent.length < previousContent.length || !nextContent.startsWith(previousContent))

      if (isRewriteReset) {
        resetSession()
      }

      if (!scriptLocked.value && containsScript(nextContent)) {
        scriptLocked.value = true
      }

      if (!headClosed.value) {
        const lowered = nextContent.toLowerCase()
        if (lowered.includes('</head>') || lowered.includes('</style>')) {
          headClosed.value = true
          clearCommitTimer()
          commitLatestContent()
        }
      }

      previousContent = nextContent
    },
    {
      immediate: true,
    },
  )

  watch(
    [
      () => toValue(content),
      () => Boolean(toValue(active)),
      () => headClosed.value,
      () => scriptLocked.value,
      resolvedMode,
      contentClosed,
    ],
    ([nextContent, nextActive, nextHeadClosed, nextScriptLocked, nextMode, nextClosed]) => {
      if (!nextActive) {
        throttledContent.value = nextContent
        return
      }

      if (nextClosed) {
        clearCommitTimer()
        commitLatestContent()
        return
      }

      if (!nextHeadClosed) {
        clearCommitTimer()
        return
      }

      if (nextMode === 'defer' || (nextMode === 'auto' && nextScriptLocked)) {
        clearCommitTimer()
        return
      }

      const now = Date.now()
      const throttle = Math.max(80, Number(toValue(throttleMs)) || DEFAULT_THROTTLE_MS)
      const elapsed = now - lastCommitAt

      if (elapsed >= throttle) {
        clearCommitTimer()
        commitLatestContent()
        return
      }

      if (!commitTimer) {
        commitTimer = setTimeout(
          () => {
            commitTimer = null
            commitLatestContent()
          },
          Math.max(0, throttle - elapsed),
        )
      }
    },
    {
      immediate: true,
    },
  )

  watch(
    liveReady,
    (nextLiveReady) => {
      if (nextLiveReady) {
        liveCommitted.value = true
      }
    },
    {
      immediate: true,
    },
  )

  const stable = computed(() => {
    return !Boolean(toValue(active)) || contentClosed.value || previewReady.value
  })

  const previewPending = computed(() => Boolean(toValue(active)) && !previewReady.value)

  const pendingReason = computed<'defer' | 'head' | 'script' | 'stable'>(() => {
    if (!previewPending.value) {
      return 'stable'
    }

    if (!headClosed.value) {
      return 'head'
    }

    if (resolvedMode.value === 'defer') {
      return 'defer'
    }

    if (resolvedMode.value === 'auto' && scriptLocked.value) {
      return 'script'
    }

    return 'stable'
  })

  const renderContent = computed(() => {
    if (liveReady.value) {
      return throttledContent.value
    }

    return toValue(content)
  })

  onBeforeUnmount(clearCommitTimer)

  return {
    headClosed,
    liveCommitted,
    pendingReason,
    previewPending,
    renderContent,
    scriptLocked,
    stable,
  }
}
