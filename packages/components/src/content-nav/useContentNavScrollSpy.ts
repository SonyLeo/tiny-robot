import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { defaultContentNavActiveResolver } from './defaults'
import type { ContentNavScrollSpyOptions } from './index.type'

export function useContentNavScrollSpy(options: ContentNavScrollSpyOptions) {
  const localActiveId = ref<string | undefined>(options.activeId?.value)
  const floatingOffset = ref(0)
  let boundContainer: HTMLElement | null = null
  let scheduledFrame: number | null = null
  let hostResizeObserver: ResizeObserver | null = null
  let containerResizeObserver: ResizeObserver | null = null
  let jumpFeedbackTimeout: ReturnType<typeof setTimeout> | null = null
  let suppressScrollSpyUntil = 0

  const activeId = computed(() => options.activeId?.value ?? localActiveId.value)
  const smoothScroll = computed(() => options.smoothScroll?.value !== false)
  const resolveActive = computed(() => options.resolveActive?.value ?? defaultContentNavActiveResolver)

  function setActiveId(value: string | undefined) {
    if (options.activeId?.value === undefined) {
      localActiveId.value = value
    }

    options.onUpdateActiveId?.(value)
  }

  function updateFloatingPosition() {
    const hostEl = options.host.value
    const container = options.container.value
    const overlayEl = hostEl?.parentElement

    if (!hostEl || !container || !overlayEl) {
      floatingOffset.value = 0
      return
    }

    const overlayRect = overlayEl.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const hostHeight = hostEl.getBoundingClientRect().height || 0

    if (!containerRect.height || !hostHeight) {
      floatingOffset.value = 0
      return
    }

    const containerTop = containerRect.top - overlayRect.top
    const containerBottom = containerRect.bottom - overlayRect.top
    const viewportCenter = containerTop + containerRect.height / 2
    const idealTop = viewportCenter - hostHeight / 2
    const minTop = containerTop + 24
    const maxTop = Math.max(minTop, containerBottom - hostHeight - 24)

    floatingOffset.value = Math.max(minTop, Math.min(idealTop, maxTop))
  }

  function syncActiveId() {
    const container = options.container.value
    if (!container || Date.now() < suppressScrollSpyUntil) {
      return
    }

    const anchors = options.registry
      .getAll()
      .filter((entry) => options.items.value.some((item) => item.id === entry.id))
    const nextId = resolveActive.value({
      container,
      anchors,
      items: options.items.value,
    })

    if (nextId !== undefined) {
      setActiveId(nextId)
    }
  }

  function clearJumpFeedback() {
    if (jumpFeedbackTimeout) {
      clearTimeout(jumpFeedbackTimeout)
      jumpFeedbackTimeout = null
    }
  }

  function applyJumpFeedback(target: HTMLElement) {
    const feedback = options.jumpFeedback?.value
    if (!feedback) {
      return
    }

    clearJumpFeedback()
    feedback.clear(target)
    feedback.apply(target)

    jumpFeedbackTimeout = setTimeout(() => {
      feedback.clear(target)
      jumpFeedbackTimeout = null
    }, feedback.duration ?? 700)
  }

  function resolveJumpOffset() {
    const offset = options.jumpOffset?.value
    if (typeof offset === 'function') {
      return offset()
    }

    return offset ?? 0
  }

  function scrollTo(id: string) {
    const container = options.container.value
    const target = options.registry.get(id)

    if (!container || !target) {
      return
    }

    const targetRect = target.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const targetTop = container.scrollTop + (targetRect.top - containerRect.top) - resolveJumpOffset()

    suppressScrollSpyUntil = Date.now() + 500
    setActiveId(id)

    container.scrollTo({
      top: Math.max(0, targetTop),
      behavior: smoothScroll.value ? 'smooth' : 'auto',
    })

    applyJumpFeedback(target)
    scheduleSync()
  }

  function scheduleSync() {
    if (scheduledFrame !== null) {
      cancelAnimationFrame(scheduledFrame)
    }

    scheduledFrame = requestAnimationFrame(() => {
      scheduledFrame = null
      syncActiveId()
      updateFloatingPosition()
    })
  }

  function bindContainer(container: HTMLElement | null | undefined) {
    if (boundContainer === (container ?? null)) {
      return
    }

    if (boundContainer) {
      boundContainer.removeEventListener('scroll', scheduleSync)
    }

    boundContainer = container ?? null

    if (boundContainer) {
      boundContainer.addEventListener('scroll', scheduleSync, { passive: true })
    }
  }

  function bindResizeObservers() {
    hostResizeObserver?.disconnect()
    containerResizeObserver?.disconnect()
    hostResizeObserver = null
    containerResizeObserver = null

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    if (options.host.value) {
      hostResizeObserver = new ResizeObserver(() => {
        scheduleSync()
      })
      hostResizeObserver.observe(options.host.value)
    }

    if (options.container.value) {
      containerResizeObserver = new ResizeObserver(() => {
        scheduleSync()
      })
      containerResizeObserver.observe(options.container.value)
    }
  }

  watch(
    () => options.container.value,
    (container) => {
      bindContainer(container)
      bindResizeObservers()
      scheduleSync()
    },
    { immediate: true },
  )

  watch(
    () => options.host.value,
    () => {
      bindResizeObservers()
      scheduleSync()
    },
  )

  watch(
    () => options.registry.version.value,
    () => {
      scheduleSync()
    },
  )

  watch(
    () => options.items.value.map((item) => item.id).join(','),
    () => {
      scheduleSync()
    },
    { immediate: true },
  )

  watch(
    () => options.activeId?.value,
    (value) => {
      if (value !== undefined) {
        localActiveId.value = value
      }
    },
  )

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', scheduleSync, { passive: true })
    }
  })

  onBeforeUnmount(() => {
    if (boundContainer) {
      boundContainer.removeEventListener('scroll', scheduleSync)
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', scheduleSync)
    }

    if (scheduledFrame !== null) {
      cancelAnimationFrame(scheduledFrame)
    }

    clearJumpFeedback()
    hostResizeObserver?.disconnect()
    containerResizeObserver?.disconnect()
  })

  return {
    activeId,
    floatingOffset,
    scrollTo,
    scheduleSync,
  }
}
