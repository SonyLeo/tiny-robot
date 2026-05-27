import { useEventListener, useMutationObserver, useResizeObserver } from '@vueuse/core'
import { computed, onBeforeUnmount, shallowRef, watch, type CSSProperties, type Ref } from 'vue'
import { lockBodyInteraction, restoreBodyInteraction, type BodyInteractionState } from '@/utils/domInteraction'
import { clamp } from '@/utils/math'

interface UseChatMainScrollbarOptions {
  scrollHostRef: Ref<HTMLElement | null>
}

interface ScrollMetrics {
  clientHeight: number
  scrollHeight: number
  scrollTop: number
  thumbHeight: number
  thumbOffset: number
  isScrollable: boolean
}

interface ThumbDragState {
  pointerId: number
  startY: number
  startScrollTop: number
  bodyState: BodyInteractionState
}

const MIN_THUMB_HEIGHT = 36

function createEmptyMetrics(): ScrollMetrics {
  return {
    clientHeight: 0,
    scrollHeight: 0,
    scrollTop: 0,
    thumbHeight: 0,
    thumbOffset: 0,
    isScrollable: false,
  }
}

export function useChatMainScrollbar(options: UseChatMainScrollbarOptions) {
  const metrics = shallowRef<ScrollMetrics>(createEmptyMetrics())
  const thumbDragState = shallowRef<ThumbDragState | null>(null)
  const isHovering = shallowRef(false)
  const pointerTarget = typeof window === 'undefined' ? undefined : window
  let frameId: number | null = null

  const showScrollbar = computed(() => metrics.value.isScrollable)
  const isDraggingThumb = computed(() => thumbDragState.value !== null)
  const scrollbarVisible = computed(() => showScrollbar.value && (isHovering.value || isDraggingThumb.value))

  function syncMetrics(): void {
    frameId = null

    const scrollHost = options.scrollHostRef.value
    if (!scrollHost) {
      metrics.value = createEmptyMetrics()
      return
    }

    const clientHeight = scrollHost.clientHeight
    const scrollHeight = scrollHost.scrollHeight
    const scrollTop = scrollHost.scrollTop
    const isScrollable = scrollHeight - clientHeight > 1

    if (!isScrollable) {
      metrics.value = {
        clientHeight,
        scrollHeight,
        scrollTop,
        thumbHeight: clientHeight,
        thumbOffset: 0,
        isScrollable: false,
      }
      return
    }

    const trackHeight = clientHeight
    const scrollRange = scrollHeight - clientHeight
    const thumbHeight = clamp((clientHeight / scrollHeight) * trackHeight, MIN_THUMB_HEIGHT, trackHeight)
    const thumbTravel = Math.max(0, trackHeight - thumbHeight)
    const thumbOffset = scrollRange > 0 ? (scrollTop / scrollRange) * thumbTravel : 0

    metrics.value = {
      clientHeight,
      scrollHeight,
      scrollTop,
      thumbHeight,
      thumbOffset,
      isScrollable: true,
    }
  }

  function scheduleSync(): void {
    if (typeof window === 'undefined') {
      syncMetrics()
      return
    }

    if (frameId !== null) {
      return
    }

    frameId = window.requestAnimationFrame(syncMetrics)
  }

  function stopThumbDrag(pointerId?: number): void {
    const dragState = thumbDragState.value
    if (!dragState || (pointerId !== undefined && dragState.pointerId !== pointerId)) {
      return
    }

    const body = document.body
    restoreBodyInteraction(body, dragState.bodyState)
    thumbDragState.value = null
  }

  function startThumbDrag(event: PointerEvent): void {
    const scrollHost = options.scrollHostRef.value
    if (!scrollHost || !metrics.value.isScrollable || event.button !== 0 || !event.isPrimary) {
      return
    }

    event.preventDefault()
    thumbDragState.value = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollTop: scrollHost.scrollTop,
      bodyState: lockBodyInteraction(document.body, 'grabbing'),
    }
  }

  useEventListener(options.scrollHostRef, 'scroll', () => {
    scheduleSync()
  })

  useEventListener(options.scrollHostRef, 'wheel', () => {
    scheduleSync()
  })

  useEventListener(pointerTarget, 'pointermove', (event: PointerEvent) => {
    const dragState = thumbDragState.value
    const scrollHost = options.scrollHostRef.value
    const currentMetrics = metrics.value
    if (!dragState || !scrollHost || event.pointerId !== dragState.pointerId || !currentMetrics.isScrollable) {
      return
    }

    const deltaY = event.clientY - dragState.startY
    const scrollRange = currentMetrics.scrollHeight - currentMetrics.clientHeight
    const thumbTravel = currentMetrics.clientHeight - currentMetrics.thumbHeight
    const ratio = thumbTravel > 0 ? scrollRange / thumbTravel : 0
    scrollHost.scrollTop = dragState.startScrollTop + deltaY * ratio
    scheduleSync()
  })

  useEventListener(pointerTarget, 'pointerup', (event: PointerEvent) => {
    stopThumbDrag(event.pointerId)
  })

  useEventListener(pointerTarget, 'pointercancel', (event: PointerEvent) => {
    stopThumbDrag(event.pointerId)
  })

  useResizeObserver(options.scrollHostRef, () => {
    scheduleSync()
  })

  useMutationObserver(
    options.scrollHostRef,
    () => {
      scheduleSync()
    },
    { childList: true, subtree: true, characterData: true, attributes: true },
  )

  watch(
    options.scrollHostRef,
    (nextHost, prevHost) => {
      stopThumbDrag()
      prevHost?.removeAttribute('data-tr-chat-scroll-host')
      nextHost?.setAttribute('data-tr-chat-scroll-host', '')
      scheduleSync()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    if (frameId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(frameId)
    }
    stopThumbDrag()
    options.scrollHostRef.value?.removeAttribute('data-tr-chat-scroll-host')
  })

  const thumbStyle = computed<CSSProperties>(() => ({
    height: `${metrics.value.thumbHeight}px`,
    transform: `translateY(${metrics.value.thumbOffset}px)`,
  }))

  const rootClass = computed(() => ({
    'tr-chat-main--scrollbar-visible': scrollbarVisible.value,
    'tr-chat-main--dragging-thumb': isDraggingThumb.value,
  }))

  return {
    showScrollbar,
    rootClass,
    thumbStyle,
    setHovering: (value: boolean) => {
      isHovering.value = value
    },
    startThumbDrag,
  }
}
