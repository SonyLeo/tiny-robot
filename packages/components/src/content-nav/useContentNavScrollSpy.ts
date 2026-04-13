import { useEventListener, usePreferredReducedMotion, useResizeObserver } from '@vueuse/core'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { defaultContentNavActiveResolver } from './defaults'
import type { ContentNavScrollSpyOptions } from './internal.type'

export function useContentNavScrollSpy(options: ContentNavScrollSpyOptions) {
  const localActiveId = ref<string | undefined>(options.activeId?.value)
  const floatingOffset = ref(0)
  let scheduledFrame: number | null = null
  let suppressScrollSpyUntil = 0

  const activeId = computed(() => options.activeId?.value ?? localActiveId.value)
  const preferredReducedMotion = usePreferredReducedMotion()

  function setActiveId(value: string | undefined) {
    if (options.activeId?.value === undefined) {
      localActiveId.value = value
    }

    options.onUpdateActiveId?.(value)
  }

  function sortAnchorsByDocumentOrder(anchors: Array<{ id: string; el: HTMLElement }>) {
    return [...anchors].sort((left, right) => {
      if (left.el === right.el) {
        return 0
      }

      const position = left.el.compareDocumentPosition(right.el)
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1
      }

      if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1
      }

      return left.el.getBoundingClientRect().top - right.el.getBoundingClientRect().top
    })
  }

  function resolveAnchorTarget(id: string) {
    return options.resolveTarget(id)
  }

  function resolveFloatingElements() {
    const hostEl = options.host.value
    const floatingEl = hostEl?.firstElementChild

    if (!(floatingEl instanceof HTMLElement)) {
      return {
        hostEl: hostEl ?? null,
        floatingEl: null,
        measuredEl: null,
      }
    }

    const measuredEl =
      floatingEl.querySelector<HTMLElement>('.tr-content-nav__surface') ??
      floatingEl.querySelector<HTMLElement>('.tr-content-nav__panel') ??
      floatingEl

    return {
      hostEl: hostEl ?? null,
      floatingEl,
      measuredEl,
    }
  }

  const floatingResizeTargets = computed(() => {
    const { hostEl, floatingEl, measuredEl } = resolveFloatingElements()
    const targets: HTMLElement[] = []

    if (hostEl) {
      targets.push(hostEl)
    }

    if (floatingEl) {
      targets.push(floatingEl)
    }

    if (measuredEl && measuredEl !== floatingEl) {
      targets.push(measuredEl)
    }

    return targets
  })

  function updateFloatingPosition() {
    const { hostEl, floatingEl, measuredEl } = resolveFloatingElements()
    const container = options.container.value
    const frameEl = hostEl?.parentElement

    if (!hostEl || !container || !frameEl || !floatingEl || !measuredEl) {
      floatingOffset.value = 0
      return
    }

    const frameRect = frameEl.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const floatingHeight = measuredEl.getBoundingClientRect().height || 0

    if (!containerRect.height || !floatingHeight) {
      floatingOffset.value = 0
      return
    }

    const containerTop = containerRect.top - frameRect.top
    const containerBottom = containerRect.bottom - frameRect.top
    const viewportCenter = containerTop + containerRect.height / 2
    const idealTop = viewportCenter - floatingHeight / 2
    const minTop = containerTop + 24
    const maxTop = Math.max(minTop, containerBottom - floatingHeight - 24)

    floatingOffset.value = Math.max(minTop, Math.min(idealTop, maxTop))
  }

  function syncActiveId() {
    const container = options.container.value
    if (!container || Date.now() < suppressScrollSpyUntil) {
      return
    }

    const anchors = sortAnchorsByDocumentOrder(
      options.items.value.flatMap((item) => {
        const target = resolveAnchorTarget(item.id)
        return target ? [{ id: item.id, el: target }] : []
      }),
    )
    const nextId = defaultContentNavActiveResolver({
      container,
      anchors,
      items: options.items.value,
    })

    if (nextId !== undefined) {
      setActiveId(nextId)
    }
  }

  function resolveTargetScrollOffset(target: HTMLElement) {
    const scrollMarginTop = Number.parseFloat(window.getComputedStyle(target).scrollMarginTop || '0')
    return Number.isFinite(scrollMarginTop) ? scrollMarginTop : 0
  }

  function scrollTo(id: string) {
    const container = options.container.value
    const target = resolveAnchorTarget(id)

    if (!container || !target) {
      return
    }

    const targetRect = target.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const targetTop = container.scrollTop + (targetRect.top - containerRect.top) - resolveTargetScrollOffset(target)

    suppressScrollSpyUntil = Date.now() + 500
    setActiveId(id)

    container.scrollTo({
      top: Math.max(0, targetTop),
      behavior: preferredReducedMotion.value === 'reduce' ? 'auto' : 'smooth',
    })

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

  useEventListener(options.container, 'scroll', scheduleSync, { passive: true })
  useEventListener('resize', scheduleSync, { passive: true })
  useResizeObserver(options.container, () => {
    scheduleSync()
  })
  useResizeObserver(floatingResizeTargets, () => {
    scheduleSync()
  })

  watch(
    () => options.container.value,
    () => {
      scheduleSync()
    },
    { immediate: true },
  )

  watch(
    () => options.host.value,
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

  onBeforeUnmount(() => {
    if (scheduledFrame !== null) {
      cancelAnimationFrame(scheduledFrame)
    }
  })

  return {
    activeId,
    floatingOffset,
    scrollTo,
    scheduleSync,
  }
}
