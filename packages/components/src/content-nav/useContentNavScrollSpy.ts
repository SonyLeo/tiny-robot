import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { defaultContentNavActiveResolver } from './defaults'
import type { ContentNavScrollSpyOptions } from './internal.type'

export function useContentNavScrollSpy(options: ContentNavScrollSpyOptions) {
  const localActiveId = ref<string | undefined>(options.activeId?.value)
  const floatingOffset = ref(0)
  let boundContainer: HTMLElement | null = null
  let scheduledFrame: number | null = null
  let hostResizeObserver: ResizeObserver | null = null
  let containerResizeObserver: ResizeObserver | null = null
  let suppressScrollSpyUntil = 0

  const activeId = computed(() => options.activeId?.value ?? localActiveId.value)

  function prefersReducedMotion() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

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
    return options.source.value.resolveTarget(id)
  }

  function updateFloatingPosition() {
    const hostEl = options.host.value
    const container = options.container.value
    const frameEl = hostEl?.parentElement
    const floatingEl = hostEl?.firstElementChild as HTMLElement | null
    const measuredEl =
      floatingEl?.querySelector<HTMLElement>('.tr-content-nav__surface') ??
      floatingEl?.querySelector<HTMLElement>('.tr-content-nav__panel') ??
      floatingEl

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
      options.source.value.items.value.flatMap((item) => {
        const target = resolveAnchorTarget(item.id)
        return target ? [{ id: item.id, el: target }] : []
      }),
    )
    const nextId = defaultContentNavActiveResolver({
      container,
      anchors,
      items: options.source.value.items.value,
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
      behavior: !prefersReducedMotion() ? 'smooth' : 'auto',
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

      const floatingEl = options.host.value.firstElementChild
      if (floatingEl instanceof HTMLElement) {
        hostResizeObserver.observe(floatingEl)
        const surfaceEl =
          floatingEl.querySelector<HTMLElement>('.tr-content-nav__surface') ??
          floatingEl.querySelector<HTMLElement>('.tr-content-nav__panel')
        if (surfaceEl instanceof HTMLElement) {
          hostResizeObserver.observe(surfaceEl)
        }
      }
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
    () => options.source.value,
    () => {
      scheduleSync()
    },
  )

  watch(
    () => options.source.value.revision.value,
    () => {
      scheduleSync()
    },
  )

  watch(
    () => options.source.value.items.value.map((item) => item.id).join(','),
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
