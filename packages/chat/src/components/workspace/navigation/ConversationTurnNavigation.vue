<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch, watchEffect } from 'vue'
import type { ChatConversationTurnNavigationItem, TrChatConversationTurnNavigationProps } from '@/types'
import ContentNavigationHost from './ContentNavigationHost.vue'
import { coerceContentNavigationItemId } from '@/utils/contentNavigation'
import { resolveConversationTurnNavigationItems } from './turn-navigation'

defineOptions({ name: 'TrChatConversationTurnNavigation' })

const props = withDefaults(defineProps<TrChatConversationTurnNavigationProps>(), {
  enabled: true,
  minItems: 2,
  topOffset: 100,
  title: 'Turns',
  subtitle: 'Current conversation',
})

const emit = defineEmits<{
  select: [item: ChatConversationTurnNavigationItem]
  'update:activeMessageIndex': [value: number]
}>()

const state = reactive<{
  items: ChatConversationTurnNavigationItem[]
  activeItemId?: string
}>({
  items: [],
  activeItemId: undefined,
})
const uncontrolledActiveMessageIndex = ref<number | undefined>(props.activeMessageIndex)
const hostRef = ref<HTMLElement | null>(null)
const floatingOffset = ref(0)
const floatingStyle = computed(() => ({
  transform: `translate3d(0, ${floatingOffset.value}px, 0)`,
}))

watchEffect(() => {
  state.items = resolveConversationTurnNavigationItems(props.messages)
  state.activeItemId = coerceContentNavigationItemId({
    items: state.items,
    requestedId: state.items.find(
      (item) => item.messageIndex === (props.activeMessageIndex ?? uncontrolledActiveMessageIndex.value),
    )?.id,
  })
})

watch(
  () => props.activeMessageIndex,
  (nextValue) => {
    if (nextValue !== undefined) {
      uncontrolledActiveMessageIndex.value = nextValue
    }
  },
)

watch(
  () => state.items,
  (nextItems) => {
    if (!nextItems.length) {
      uncontrolledActiveMessageIndex.value = undefined
      return
    }

    if (props.activeMessageIndex === undefined) {
      const current = nextItems.find((item) => item.messageIndex === uncontrolledActiveMessageIndex.value)
      uncontrolledActiveMessageIndex.value = current?.messageIndex ?? nextItems[nextItems.length - 1].messageIndex
    }
  },
  { immediate: true },
)

function getUserBubbleElements() {
  const container = props.scrollContainer
  if (!container) {
    return []
  }

  return Array.from(container.querySelectorAll<HTMLElement>('.tr-bubble[data-role="user"]'))
}

function getHighlightTarget(bubbleEl: HTMLElement) {
  return bubbleEl.querySelector<HTMLElement>('.tr-bubble__box') ?? bubbleEl
}

function setActiveMessageIndex(nextMessageIndex: number) {
  if (props.activeMessageIndex === undefined) {
    uncontrolledActiveMessageIndex.value = nextMessageIndex
  }

  emit('update:activeMessageIndex', nextMessageIndex)
}

function updateActiveByScroll() {
  const container = props.scrollContainer
  if (!container || !state.items.length) {
    return
  }

  const bubbles = getUserBubbleElements()
  if (!bubbles.length) {
    return
  }

  const containerRect = container.getBoundingClientRect()

  // Default to the first message if scrolled way above
  let activeTurn = state.items[0]

  for (let index = 0; index < Math.min(bubbles.length, state.items.length); index += 1) {
    const bubbleRect = bubbles[index].getBoundingClientRect()
    // By the time it has entered the screen, it becomes active.
    // If multiple are on screen, the loop continues and the later one overwrites it,
    // effectively selecting the newest visible user bubble.
    if (bubbleRect.top < containerRect.bottom - 40) {
      activeTurn = state.items[index]
    } else {
      break
    }
  }

  setActiveMessageIndex(activeTurn.messageIndex)
}

function updateFloatingPosition() {
  const hostEl = hostRef.value
  const container = props.scrollContainer
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

function scrollToTurn(item: ChatConversationTurnNavigationItem) {
  const container = props.scrollContainer
  if (!container) {
    return
  }

  const occurrenceIndex = state.items.findIndex((turn) => turn.id === item.id)
  if (occurrenceIndex === -1) {
    return
  }

  const bubbles = getUserBubbleElements()
  const bubbleEl = bubbles[occurrenceIndex]
  if (!bubbleEl) {
    return
  }

  const bubbleRect = bubbleEl.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const targetScrollTop = container.scrollTop + (bubbleRect.top - containerRect.top) - props.topOffset

  container.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: 'smooth',
  })

  setActiveMessageIndex(item.messageIndex)
  emit('select', item)

  const highlightTarget = getHighlightTarget(bubbleEl)
  const clearHighlight = () => {
    highlightTarget.classList.remove('is-navigation-highlight')
  }

  highlightTarget.removeEventListener('animationend', clearHighlight)
  highlightTarget.classList.remove('is-navigation-highlight')
  void highlightTarget.offsetWidth // Trigger reflow so repeated clicks restart the animation cleanly
  highlightTarget.classList.add('is-navigation-highlight')
  highlightTarget.addEventListener('animationend', clearHighlight, { once: true })
}

function handleSelect(itemId: string) {
  const item = state.items.find((entry) => entry.id === itemId)
  if (!item) {
    return
  }

  scrollToTurn(item)
}

let boundContainer: HTMLElement | null = null
let scheduledFrame: number | null = null
let hostResizeObserver: ResizeObserver | null = null
let containerResizeObserver: ResizeObserver | null = null

function scheduleLayoutUpdate() {
  if (scheduledFrame !== null) {
    cancelAnimationFrame(scheduledFrame)
  }

  scheduledFrame = requestAnimationFrame(() => {
    scheduledFrame = null
    updateActiveByScroll()
    updateFloatingPosition()
  })
}

function bindHostResizeObserver(element: HTMLElement | null) {
  hostResizeObserver?.disconnect()
  hostResizeObserver = null

  if (!element || typeof ResizeObserver === 'undefined') {
    return
  }

  hostResizeObserver = new ResizeObserver(() => {
    scheduleLayoutUpdate()
  })
  hostResizeObserver.observe(element)
}

function bindContainerResizeObserver(element: HTMLElement | null) {
  containerResizeObserver?.disconnect()
  containerResizeObserver = null

  if (!element || typeof ResizeObserver === 'undefined') {
    return
  }

  containerResizeObserver = new ResizeObserver(() => {
    scheduleLayoutUpdate()
  })
  containerResizeObserver.observe(element)
}

function bindContainer(container: HTMLElement | null) {
  if (boundContainer === container) {
    return
  }

  if (boundContainer) {
    boundContainer.removeEventListener('scroll', scheduleLayoutUpdate)
  }

  boundContainer = container

  if (boundContainer) {
    boundContainer.addEventListener('scroll', scheduleLayoutUpdate, { passive: true })
  }

  bindContainerResizeObserver(boundContainer)
}

watch(
  () => props.scrollContainer ?? null,
  (container) => {
    bindContainer(container)
    scheduleLayoutUpdate()
  },
  { immediate: true },
)

watch(
  () => state.items,
  () => {
    scheduleLayoutUpdate()
  },
)

watch(hostRef, (element) => {
  bindHostResizeObserver(element)
  scheduleLayoutUpdate()
})

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', scheduleLayoutUpdate, { passive: true })
  }
})

onBeforeUnmount(() => {
  if (boundContainer) {
    boundContainer.removeEventListener('scroll', scheduleLayoutUpdate)
  }

  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', scheduleLayoutUpdate)
  }

  if (scheduledFrame !== null) {
    cancelAnimationFrame(scheduledFrame)
  }

  hostResizeObserver?.disconnect()
  containerResizeObserver?.disconnect()
})
</script>

<template>
  <div
    ref="hostRef"
    class="tr-conversation-turn-navigation"
    data-testid="conversation-turn-navigation"
    :style="floatingStyle"
  >
    <ContentNavigationHost
      :items="state.items"
      :active-item-id="state.activeItemId"
      :min-items="props.minItems"
      placement="right"
      :title="props.title"
      :subtitle="props.subtitle"
      @select="handleSelect"
    />
  </div>
</template>

<style scoped>
.tr-conversation-turn-navigation {
  pointer-events: auto;
  will-change: transform;
}
</style>

<style>
@keyframes tr-chat-bubble-highlight-pulse {
  0% {
    background-color: rgba(47, 123, 246, 0.14);
    box-shadow: 0 0 0 1px rgba(47, 123, 246, 0.16);
  }

  100% {
    background-color: var(--tr-bubble-box-bg, transparent);
    box-shadow: none;
  }
}

.tr-bubble__box.is-navigation-highlight {
  animation: tr-chat-bubble-highlight-pulse 1.5s ease-out;
}
</style>
