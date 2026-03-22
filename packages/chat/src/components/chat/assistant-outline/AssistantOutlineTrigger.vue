<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { useAssistantOutlineContext } from './context'

defineOptions({ name: 'TrChatAssistantOutlineTrigger' })

const MAX_TEXT_WIDTH = 220
const OUTLINE_GUTTER = 0
const OUTLINE_TOP_PADDING = 48
const OUTLINE_BOTTOM_PADDING = 8

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
const outlineLabel = 'Assistant response outline'

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

function onShellFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget as Node | null
  if (!nextTarget || !listRef.value?.contains(nextTarget)) {
    isExpanded.value = false
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
  if (!bubbleEl) {
    return
  }

  // 优先使用 .tr-bubble__content 作为内容区参照，它不含 avatar 列，
  // bodyRect.left 才能正确对齐文字内容左边缘（而非 .tr-bubble__body 含 avatar 的 left）。
  // Y 轴高度仍从 .tr-bubble__body 取，保证覆盖完整内容高度。
  const bodyEl = bubbleEl.querySelector<HTMLElement>('.tr-bubble__body') ?? bubbleEl

  const rootRect = rootEl.getBoundingClientRect()
  const bodyRect = bodyEl.getBoundingClientRect()
  const listHeight = listEl.getBoundingClientRect().height || items.value.length * 18 + 12
  const containerRect = container.getBoundingClientRect()

  if (!bodyRect.height || !containerRect.height || !listHeight) {
    return
  }

  const viewportCenter = containerRect.top + containerRect.height / 2
  const idealTop = viewportCenter - listHeight / 2

  // 第一层约束（视口坐标）：outline 必须在 body 内容范围内（避免与头像重叠 / 超过内容底部）
  const minTop = bodyRect.top + OUTLINE_TOP_PADDING
  const maxTop = Math.max(minTop, bodyRect.bottom - listHeight)
  const bodyClampedTop = Math.max(minTop, Math.min(idealTop, maxTop))

  // 第二层约束（偏移空间）：限制 list 底部不超出容器可见区域（留 8px 边距）
  // 使用 rootRect.top（listEl 的实际 containing block 顶部）而非 bubbleRect.top，
  // 修复 .tr-bubble 缺少 position:relative 时 containing block 偏移导致的系统性定位误差。
  const rawOffsetY = bodyClampedTop - rootRect.top
  const maxOffsetY = containerRect.bottom - OUTLINE_BOTTOM_PADDING - listHeight - rootRect.top

  const offsetY = Math.max(0, Math.min(rawOffsetY, maxOffsetY))

  // X 轴：对齐到内容区左边缘（.tr-bubble__content），排除 avatar 列的影响
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
      role="navigation"
      :aria-label="outlineLabel"
      @mouseenter="isExpanded = true"
      @mouseleave="isExpanded = false"
      @focusin="isExpanded = true"
      @focusout="onShellFocusOut"
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
        :aria-label="`Jump to section ${item.label}`"
        :aria-current="item.id === activeItemId ? 'location' : undefined"
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
  --chat-assistant-outline-expanded-width: 248px;
  --chat-assistant-outline-shell-bg: color-mix(in srgb, var(--chat-surface-bg) 96%, white 4%);
  --chat-assistant-outline-shell-border: color-mix(in srgb, var(--chat-surface-border-subtle) 72%, transparent);
  --chat-assistant-outline-shell-shadow: 0 12px 30px color-mix(in srgb, var(--chat-text-primary) 12%, transparent);
  --chat-assistant-outline-tooltip-bg: color-mix(in srgb, var(--chat-surface-bg) 98%, white 2%);
  --chat-assistant-outline-tooltip-color: color-mix(in srgb, var(--chat-text-primary) 78%, transparent);
  --chat-assistant-outline-tooltip-shadow: 0 8px 18px color-mix(in srgb, var(--chat-text-primary) 12%, transparent);
  --chat-assistant-outline-line-color: color-mix(in srgb, var(--chat-text-primary) 18%, transparent);
  --chat-assistant-outline-label-color: color-mix(in srgb, var(--chat-text-primary) 72%, transparent);
  --chat-assistant-outline-active-color: var(--chat-accent-color);
  --chat-assistant-outline-item-hover-bg: color-mix(in srgb, var(--chat-surface-bg-hover) 72%, transparent);
  --chat-assistant-outline-label-max-width: 220px;
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
  width: var(--chat-assistant-outline-expanded-width);
  background: var(--chat-assistant-outline-shell-bg);
  border: 1px solid var(--chat-assistant-outline-shell-border);
  box-shadow: var(--chat-assistant-outline-shell-shadow);
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
  background: var(--chat-assistant-outline-tooltip-bg);
  color: var(--chat-assistant-outline-tooltip-color);
  font-size: 13px;
  line-height: 1.45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: var(--chat-assistant-outline-tooltip-shadow);
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
  background: var(--chat-assistant-outline-line-color);
  transition: background-color 0.18s ease;
}

.tr-assistant-outline__item-label {
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  color: var(--chat-assistant-outline-label-color);
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
  background: var(--chat-assistant-outline-active-color);
}

.tr-assistant-outline__item.is-active .tr-assistant-outline__item-label {
  color: var(--chat-assistant-outline-active-color);
}

.tr-assistant-outline__list-shell.is-expanded .tr-assistant-outline__item {
  padding: 6px 12px;
  overflow: visible;
}

.tr-assistant-outline__list-shell.is-expanded .tr-assistant-outline__item:hover {
  background: var(--chat-assistant-outline-item-hover-bg);
}

.tr-assistant-outline__list-shell.is-expanded .tr-assistant-outline__item.is-truncated:hover::after {
  opacity: 1;
}

.tr-assistant-outline__list-shell.is-expanded .tr-assistant-outline__item-label {
  max-width: var(--chat-assistant-outline-label-max-width);
  opacity: 1;
}

@media (max-width: 1100px) {
  .tr-assistant-outline {
    display: none;
  }
}
</style>
