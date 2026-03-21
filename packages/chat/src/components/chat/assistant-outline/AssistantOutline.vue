<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import type { PropType } from 'vue'
import type { ChatAssistantOutlineItem } from '@/types'
import { coerceContentNavigationItemId } from '@/utils/contentNavigation'
import { provideAssistantOutlineContext, type AssistantOutlineRegistration } from './context'
import {
  extractAssistantOutlineHeadings,
  resolveAssistantOutlineItems,
  type AssistantOutlineHeadingEntry,
} from './runtime'

defineOptions({ name: 'TrChatAssistantOutline' })

interface AssistantOutlineSource extends AssistantOutlineRegistration {
  headings: AssistantOutlineHeadingEntry[]
  items: ChatAssistantOutlineItem[]
}

const props = defineProps({
  enabled: {
    type: Boolean,
    default: true,
  },
  scrollContainer: {
    type: Object as PropType<HTMLElement | null | undefined>,
    default: undefined,
  },
  minItems: {
    type: Number,
    default: 2,
  },
  topOffset: {
    type: Number,
    default: 100,
  },
})

const emit = defineEmits<{
  select: [item: ChatAssistantOutlineItem]
  'update:activeHeadingId': [value: string]
}>()

const registrations = shallowRef(new Map<number, AssistantOutlineRegistration>())
const activeMessageIndex = ref<number | undefined>(undefined)
const items = ref<ChatAssistantOutlineItem[]>([])
const activeItemId = ref<string | undefined>(undefined)
const activeSource = shallowRef<AssistantOutlineSource | null>(null)
const enabled = computed(() => props.enabled !== false)
const minItems = computed(() => props.minItems)
const topOffset = computed(() => props.topOffset)
const scrollContainer = computed(() => props.scrollContainer ?? null)

function resolveSources() {
  return Array.from(registrations.value.values())
    .map((registration) => {
      const headings = extractAssistantOutlineHeadings(registration.bodyEl)
      if (headings.length < props.minItems) {
        return null
      }

      return {
        ...registration,
        headings,
        items: resolveAssistantOutlineItems(headings),
      } satisfies AssistantOutlineSource
    })
    .filter((source): source is AssistantOutlineSource => Boolean(source))
}

function pickActiveSource(sources: AssistantOutlineSource[]) {
  const container = scrollContainer.value
  if (!container || !sources.length) {
    return sources[0] ?? null
  }

  const containerRect = container.getBoundingClientRect()
  const viewportCenter = containerRect.top + containerRect.height / 2
  const visibleSources = sources.filter((source) => {
    const rect = source.bodyEl.getBoundingClientRect()
    return rect.bottom > containerRect.top + 32 && rect.top < containerRect.bottom - 32
  })
  const pool = visibleSources.length ? visibleSources : sources

  return pool.reduce(
    (closest, source) => {
      if (!closest) {
        return source
      }

      const closestRect = closest.bodyEl.getBoundingClientRect()
      const sourceRect = source.bodyEl.getBoundingClientRect()
      const closestDistance = Math.abs(closestRect.top + closestRect.height / 2 - viewportCenter)
      const sourceDistance = Math.abs(sourceRect.top + sourceRect.height / 2 - viewportCenter)

      return sourceDistance < closestDistance ? source : closest
    },
    null as AssistantOutlineSource | null,
  )
}

function updateActiveHeading() {
  const container = scrollContainer.value
  const source = activeSource.value
  if (!container || !source || !source.items.length) {
    activeItemId.value = undefined
    return
  }

  const containerRect = container.getBoundingClientRect()
  const threshold = containerRect.top + props.topOffset
  let nextActiveId = source.items[0].id

  for (const heading of source.headings) {
    const rect = heading.element?.getBoundingClientRect()
    if (!rect) {
      continue
    }

    if (rect.top <= threshold) {
      nextActiveId = heading.id ?? nextActiveId
      continue
    }

    break
  }

  activeItemId.value = coerceContentNavigationItemId({
    items: source.items,
    requestedId: nextActiveId,
  })

  if (activeItemId.value) {
    emit('update:activeHeadingId', activeItemId.value)
  }
}

function syncState() {
  if (!enabled.value) {
    activeSource.value = null
    activeMessageIndex.value = undefined
    items.value = []
    activeItemId.value = undefined
    return
  }

  const nextSource = pickActiveSource(resolveSources())
  activeSource.value = nextSource
  activeMessageIndex.value = nextSource?.messageIndex
  items.value = nextSource?.items ?? []
  activeItemId.value = coerceContentNavigationItemId({
    items: items.value,
    requestedId: activeItemId.value,
  })
  updateActiveHeading()
}

function scheduleSync() {
  requestAnimationFrame(() => {
    syncState()
  })
}

function registerSource(registration: AssistantOutlineRegistration) {
  registrations.value = new Map(registrations.value).set(registration.messageIndex, registration)
  scheduleSync()

  return () => {
    const next = new Map(registrations.value)
    next.delete(registration.messageIndex)
    registrations.value = next
    scheduleSync()
  }
}

function selectItem(messageIndex: number, itemId: string) {
  const source = activeSource.value
  const container = scrollContainer.value
  if (!source || !container || source.messageIndex !== messageIndex) {
    return
  }

  const item = source.items.find((entry) => entry.id === itemId)
  const targetHeading = source.headings.find((heading) => heading.id === item?.headingId)
  const targetEl = targetHeading?.element
  if (!item || !targetEl) {
    return
  }

  const containerRect = container.getBoundingClientRect()
  const targetRect = targetEl.getBoundingClientRect()
  const targetScrollTop = container.scrollTop + (targetRect.top - containerRect.top) - props.topOffset

  container.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: 'smooth',
  })

  activeItemId.value = item.id
  emit('update:activeHeadingId', item.id)
  emit('select', item)
}

let boundContainer: HTMLElement | null = null
let containerResizeObserver: ResizeObserver | null = null
let outlineMutationObserver: MutationObserver | null = null

function bindContainer(container: HTMLElement | null) {
  if (boundContainer === container) {
    return
  }

  if (boundContainer) {
    boundContainer.removeEventListener('scroll', scheduleSync)
  }
  containerResizeObserver?.disconnect()
  outlineMutationObserver?.disconnect()
  containerResizeObserver = null
  outlineMutationObserver = null

  boundContainer = container

  if (!boundContainer) {
    return
  }

  boundContainer.addEventListener('scroll', scheduleSync, { passive: true })

  if (typeof ResizeObserver !== 'undefined') {
    containerResizeObserver = new ResizeObserver(() => {
      scheduleSync()
    })
    containerResizeObserver.observe(boundContainer)
  }

  if (typeof MutationObserver !== 'undefined') {
    outlineMutationObserver = new MutationObserver(() => {
      scheduleSync()
    })
    outlineMutationObserver.observe(boundContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  }
}

watch(
  () => scrollContainer.value,
  (container) => {
    bindContainer(container)
    scheduleSync()
  },
  { immediate: true },
)

watch(
  () => props.enabled,
  () => {
    scheduleSync()
  },
)

watch(
  () => props.minItems,
  () => {
    scheduleSync()
  },
)

provideAssistantOutlineContext({
  enabled,
  minItems,
  topOffset,
  scrollContainer,
  activeMessageIndex,
  items,
  activeItemId,
  registerSource,
  selectItem,
})

onBeforeUnmount(() => {
  if (boundContainer) {
    boundContainer.removeEventListener('scroll', scheduleSync)
  }
  containerResizeObserver?.disconnect()
  outlineMutationObserver?.disconnect()
})
</script>

<template>
  <slot />
</template>
