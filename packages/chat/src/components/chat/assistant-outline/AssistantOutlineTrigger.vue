<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { useAssistantOutlineContext } from './context'

defineOptions({ name: 'TrChatAssistantOutlineTrigger' })

const MAX_TEXT_WIDTH = 220
const OUTLINE_GUTTER = -10

const props = defineProps({
  role: {
    type: String,
    default: undefined,
  },
  messageIndexes: {
    type: Array as PropType<number[] | undefined>,
    default: undefined,
  },
})

const context = useAssistantOutlineContext()
const rootRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const isExpanded = ref(false)
const hoveredIndex = ref<string | null>(null)
const isHoveredTruncated = ref(false)
const messageIndex = computed(() => props.messageIndexes?.[0])
const isAssistant = computed(() => props.role === 'assistant')
const isActive = computed(() => {
  return Boolean(context && isAssistant.value && context.activeMessageIndex.value === messageIndex.value)
})
const items = computed(() => (isActive.value && context ? context.items.value : []))
const activeItemId = computed(() => (isActive.value && context ? context.activeItemId.value : undefined))

function handleSelect(itemId: string) {
  if (!context || messageIndex.value === undefined) {
    return
  }

  context.selectItem(messageIndex.value, itemId)
}

function onItemMouseEnter(event: MouseEvent, itemId: string) {
  hoveredIndex.value = itemId
  const button = event.currentTarget as HTMLElement
  const textSpan = button.querySelector('.tr-assistant-outline__item-label') as HTMLElement | null

  if (textSpan && textSpan.scrollWidth > MAX_TEXT_WIDTH) {
    isHoveredTruncated.value = true
  } else {
    isHoveredTruncated.value = false
  }
}

function onItemMouseLeave(itemId: string) {
  if (hoveredIndex.value === itemId) {
    hoveredIndex.value = null
    isHoveredTruncated.value = false
  }
}

function updateFloatingPosition() {
  const rootEl = rootRef.value
  const listEl = listRef.value
  const container = context?.scrollContainer.value

  if (!rootEl || !listEl || !container || !isActive.value) {
    return
  }

  const bubbleEl = rootEl.closest('.tr-bubble') as HTMLElement | null
  const bodyEl = bubbleEl?.querySelector<HTMLElement>('.tr-bubble__body') ?? bubbleEl
  if (!bubbleEl || !bodyEl) {
    return
  }

  const bubbleRect = bubbleEl.getBoundingClientRect()
  const bodyRect = bodyEl.getBoundingClientRect()
  const rootRect = rootEl.getBoundingClientRect()
  const listHeight = listEl.getBoundingClientRect().height || items.value.length * 18 + 12
  const containerRect = container.getBoundingClientRect()

  if (!bodyRect.height || !containerRect.height || !listHeight) {
    return
  }

  const viewportCenter = containerRect.top + containerRect.height / 2
  const idealTop = viewportCenter - listHeight / 2
  const minTop = bodyRect.top + 48
  const maxTop = Math.max(minTop, bodyRect.bottom - listHeight)
  const clampedTop = Math.max(minTop, Math.min(idealTop, maxTop))
  const offsetY = Math.max(0, clampedTop - bubbleRect.top)
  const targetLeft = bodyRect.left - OUTLINE_GUTTER
  const offsetX = Math.round(targetLeft - rootRect.left)

  listEl.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`
}

let cleanupRegistration: (() => void) | null = null
let boundContainer: HTMLElement | null = null
let listResizeObserver: ResizeObserver | null = null

function syncRegistration() {
  cleanupRegistration?.()
  cleanupRegistration = null

  if (!context || !isAssistant.value || messageIndex.value === undefined || !rootRef.value) {
    return
  }

  const bubbleEl = rootRef.value.closest('.tr-bubble') as HTMLElement | null
  const bodyEl = bubbleEl?.querySelector<HTMLElement>('.tr-bubble__body') ?? bubbleEl
  if (!bubbleEl || !bodyEl) {
    return
  }

  cleanupRegistration = context.registerSource({
    messageIndex: messageIndex.value,
    bubbleEl,
    bodyEl,
  })
}

function bindContainer(container: HTMLElement | null) {
  if (boundContainer === container) {
    return
  }

  if (boundContainer) {
    boundContainer.removeEventListener('scroll', updateFloatingPosition)
  }

  boundContainer = container

  if (boundContainer) {
    boundContainer.addEventListener('scroll', updateFloatingPosition, { passive: true })
  }
}

watch(
  [rootRef, messageIndex, isAssistant],
  () => {
    syncRegistration()
    requestAnimationFrame(updateFloatingPosition)
  },
  { immediate: true },
)

watch(
  [items, activeItemId, isActive],
  () => {
    requestAnimationFrame(updateFloatingPosition)
  },
  { deep: true },
)

watch(
  () => context?.scrollContainer.value ?? null,
  (container) => {
    bindContainer(container)
    requestAnimationFrame(updateFloatingPosition)
  },
  { immediate: true },
)

watch(listRef, (element) => {
  listResizeObserver?.disconnect()
  listResizeObserver = null

  if (!element || typeof ResizeObserver === 'undefined') {
    return
  }

  listResizeObserver = new ResizeObserver(() => {
    updateFloatingPosition()
  })
  listResizeObserver.observe(element)
})

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateFloatingPosition, { passive: true })
  }
})

onBeforeUnmount(() => {
  cleanupRegistration?.()
  if (boundContainer) {
    boundContainer.removeEventListener('scroll', updateFloatingPosition)
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateFloatingPosition)
  }
  listResizeObserver?.disconnect()
})
</script>

<template>
  <div
    v-if="context && isAssistant && messageIndex !== undefined"
    ref="rootRef"
    class="tr-assistant-outline"
    data-testid="assistant-outline"
  >
    <div
      v-if="isActive && items.length > 0"
      ref="listRef"
      class="tr-assistant-outline__list-shell"
      :class="{ 'is-expanded': isExpanded }"
      data-testid="assistant-outline-rail"
      @mouseenter="isExpanded = true"
      @mouseleave="isExpanded = false"
    >
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="tr-assistant-outline__item"
        :class="[
          {
            'is-active': item.id === activeItemId,
            'is-truncated': hoveredIndex === item.id && isHoveredTruncated,
          },
        ]"
        :data-tooltip="item.label"
        data-testid="assistant-outline-item"
        @mouseenter="onItemMouseEnter($event, item.id)"
        @mouseleave="onItemMouseLeave(item.id)"
        @click.stop="handleSelect(item.id)"
      >
        <span class="tr-assistant-outline__item-line" data-testid="assistant-outline-marker" />
        <span class="tr-assistant-outline__item-label">{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tr-assistant-outline {
  position: absolute;
  left: 0;
  top: 0;
  width: 14px;
  height: 100%;
  z-index: 4;
  pointer-events: none;
}

.tr-assistant-outline__list-shell {
  position: relative;
  width: 14px;
  padding: 6px 0;
  border-radius: 10px;
  pointer-events: auto;
  will-change: transform;
  transition:
    background-color 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease,
    width 0.22s ease;
}

.tr-assistant-outline__list-shell.is-expanded {
  width: 248px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
}

.tr-assistant-outline__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
  text-align: left;
  transition:
    background-color 0.18s ease,
    padding 0.18s ease;
}

.tr-assistant-outline__item::after {
  content: attr(data-tooltip);
  position: absolute;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 8;
  max-width: 320px;
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.98);
  color: rgba(15, 23, 42, 0.78);
  font-size: 13px;
  line-height: 1.45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.tr-assistant-outline__item-line {
  display: block;
  width: 14px;
  min-width: 14px;
  height: 2px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.18);
  transition: background-color 0.18s ease;
}

.tr-assistant-outline__item-label {
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  color: rgba(15, 23, 42, 0.72);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 1.4;
  transition:
    max-width 0.24s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.18s ease,
    color 0.18s ease;
}

.tr-assistant-outline__item.is-active .tr-assistant-outline__item-line {
  background: #2f7bf6;
}

.tr-assistant-outline__item.is-active .tr-assistant-outline__item-label {
  color: #2f7bf6;
}

.tr-assistant-outline__list-shell.is-expanded .tr-assistant-outline__item {
  padding: 6px 12px;
  overflow: visible;
}

.tr-assistant-outline__list-shell.is-expanded .tr-assistant-outline__item:hover {
  background: rgba(15, 23, 42, 0.04);
}

.tr-assistant-outline__list-shell.is-expanded .tr-assistant-outline__item.is-truncated:hover::after {
  opacity: 1;
}

.tr-assistant-outline__list-shell.is-expanded .tr-assistant-outline__item-label {
  max-width: 220px;
  opacity: 1;
}

@media (max-width: 1100px) {
  .tr-assistant-outline {
    display: none;
  }
}
</style>
