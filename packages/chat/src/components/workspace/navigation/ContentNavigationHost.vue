<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TrChatContentNavigationHostProps } from '@/types'

defineOptions({ name: 'TrChatContentNavigationHost' })

const props = withDefaults(defineProps<TrChatContentNavigationHostProps>(), {
  enabled: true,
  placement: 'right',
  minItems: 2,
})

const emit = defineEmits<{
  select: [itemId: string]
}>()

function shouldRenderContentNavigation(minItems: number | undefined) {
  const threshold = minItems ?? 2
  return (props.items?.length ?? 0) >= threshold
}

const shouldShow = computed(() => props.enabled !== false && shouldRenderContentNavigation(props.minItems))
const searchKeyword = ref('')
const isHovered = ref(false)
const isInputFocused = ref(false)
const isExpanded = computed(() => isHovered.value || isInputFocused.value)
const filteredItems = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return props.items
  }

  return props.items.filter((item) => {
    const label = item.label.toLowerCase()
    const description = item.description?.toLowerCase() ?? ''

    return label.includes(keyword) || description.includes(keyword)
  })
})

const hoveredIndex = ref<string | null>(null)
const isHoveredTruncated = ref(false)

watch(isExpanded, (expanded) => {
  if (!expanded) {
    searchKeyword.value = ''
  }
})

function handleSelect(itemId: string) {
  emit('select', itemId)
}

function onItemMouseEnter(event: MouseEvent, itemId: string) {
  hoveredIndex.value = itemId
  const li = event.currentTarget as HTMLElement
  const textSpan = li.querySelector('.tr-content-navigation-host__label') as HTMLElement | null

  // Check if text is actually truncated based on elements scroll vs client width
  if (textSpan && textSpan.scrollWidth > textSpan.clientWidth) {
    isHoveredTruncated.value = true
  } else {
    isHoveredTruncated.value = false
  }
}

function onItemMouseLeave(itemId: string) {
  if (hoveredIndex.value === itemId) {
    isHoveredTruncated.value = false
    hoveredIndex.value = null
  }
}
</script>

<template>
  <aside
    v-if="shouldShow"
    class="tr-content-navigation-host"
    :class="[`is-${props.placement}`, { 'is-expanded': isExpanded }]"
    :data-expanded="isExpanded ? 'true' : 'false'"
    data-testid="content-navigation-host"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="tr-content-navigation-host__overlay">
      <div v-show="isExpanded" class="tr-content-navigation-host__search-shell">
        <input
          v-model="searchKeyword"
          class="tr-content-navigation-host__search"
          type="search"
          placeholder="搜索对话..."
          data-testid="content-navigation-search"
          @focus="isInputFocused = true"
          @blur="isInputFocused = false"
          @click.stop
        />
      </div>

      <ul class="tr-content-navigation-host__list">
        <li v-show="isExpanded && filteredItems.length === 0" class="tr-content-navigation-host__empty">
          未找到匹配对话
        </li>
        <li
          v-for="item in filteredItems"
          :key="item.id"
          class="tr-content-navigation-host__item"
          :class="{
            'is-active': item.id === props.activeItemId,
            'is-truncated': hoveredIndex === item.id && isHoveredTruncated,
          }"
          :data-tooltip="item.description ? `${item.label} - ${item.description}` : item.label"
          @mouseenter="onItemMouseEnter($event, item.id)"
          @mouseleave="onItemMouseLeave(item.id)"
        >
          <button
            type="button"
            class="tr-content-navigation-host__button"
            :data-item-id="item.id"
            :data-active="item.id === props.activeItemId ? 'true' : 'false'"
            data-testid="content-navigation-item"
            :aria-current="item.id === props.activeItemId ? 'true' : undefined"
            @click="handleSelect(item.id)"
          >
            <span class="tr-content-navigation-host__label">{{ item.label }}</span>
            <span class="tr-content-navigation-host__marker" />
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
.tr-content-navigation-host {
  pointer-events: auto;
  position: relative;
  display: flex;
  justify-content: flex-end;
  width: 32px;
  overflow: visible;
}

.tr-content-navigation-host.is-left {
  justify-content: flex-start;
}

.tr-content-navigation-host__overlay {
  position: relative;
  width: 32px;
  overflow: visible;
  box-sizing: border-box;
  border-radius: 12px;
  transition:
    width 0.22s ease,
    background-color 0.22s ease,
    box-shadow 0.22s ease,
    border-radius 0.22s ease;
}

.tr-content-navigation-host.is-expanded .tr-content-navigation-host__overlay {
  width: var(--workspace-navigation-expanded-width, 258px);
  background: var(--chat-panel-bg);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.12);
  border-radius: 0 0 12px 12px;
}

.tr-content-navigation-host__search-shell {
  position: absolute;
  bottom: 100%;
  right: 0;
  left: 0;
  padding: 10px 10px 6px;
  background: var(--chat-panel-bg);
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -10px 26px -10px rgba(15, 23, 42, 0.12); /* Subtle shadow pointing upwards */
  z-index: 10;
  box-sizing: border-box;
  opacity: 0;
  visibility: hidden;
  transform: translateY(4px);
  transition:
    opacity 0.18s ease,
    transform 0.22s ease,
    visibility 0.18s;
}

.tr-content-navigation-host.is-expanded .tr-content-navigation-host__search-shell {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.tr-content-navigation-host__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 6px 0;
  width: 100%;
  background: transparent;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  /* transition on padding removed to prevent items from vertically shifting */
}

/* Empty removed from shifting state layout */
.tr-content-navigation-host__empty {
  padding: 24px 12px 18px;
  color: var(--chat-text-secondary);
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
}

.tr-content-navigation-host__search {
  width: 100%;
  height: 30px;
  border: 1px solid var(--chat-panel-border);
  border-radius: 6px;
  outline: none;
  box-sizing: border-box;
  padding: 0 10px;
  font-size: 13px;
  color: var(--chat-text-primary);
  background: var(--chat-panel-bg);
  transition: border-color 0.2s ease;
}

.tr-content-navigation-host__search::placeholder {
  color: var(--chat-text-placeholder, var(--chat-text-secondary));
}

.tr-content-navigation-host__search:focus {
  border-color: var(--chat-accent-border);
}

.tr-content-navigation-host__item {
  list-style: none;
  position: relative;
}

/* ===== Pure CSS Tooltip ===== */
.tr-content-navigation-host__item::after {
  content: attr(data-tooltip);
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 200;

  background: var(--chat-panel-bg);
  color: var(--chat-text-primary);
  font-size: 13px;
  line-height: 1.5;
  padding: 6px 12px;
  border-radius: 6px;
  width: 260px;
  text-align: left;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);

  display: -webkit-box;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;

  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

/* Placement variants */
.tr-content-navigation-host.is-right .tr-content-navigation-host__item::after,
.tr-content-navigation-host:not(.is-left) .tr-content-navigation-host__item::after {
  right: calc(100% + 8px);
}

.tr-content-navigation-host.is-left .tr-content-navigation-host__item::after {
  left: calc(100% + 8px);
}

.tr-content-navigation-host.is-expanded .tr-content-navigation-host__item.is-truncated:hover::after {
  opacity: 1;
}

.tr-content-navigation-host__button {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
  min-width: 0;
  padding: 6px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  text-align: right;
  transition: background-color 0.2s ease;
}

.tr-content-navigation-host.is-left .tr-content-navigation-host__button {
  justify-content: flex-start;
  flex-direction: row-reverse;
  text-align: left;
}

.tr-content-navigation-host.is-expanded .tr-content-navigation-host__button:hover {
  background: rgba(15, 23, 42, 0.04);
}

.tr-content-navigation-host__marker {
  width: 6px;
  min-width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--chat-panel-border);
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.tr-content-navigation-host__item.is-active .tr-content-navigation-host__marker {
  background: var(--chat-accent-border, #2f7bf6);
  transform: scale(1.3);
}

.tr-content-navigation-host__label {
  flex: 1;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  color: var(--chat-text-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 1.4;
  transition:
    max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s ease,
    color 0.2s ease;
  will-change: max-width, opacity;
}

.tr-content-navigation-host.is-right .tr-content-navigation-host__label {
  text-align: right;
}

.tr-content-navigation-host__item.is-active .tr-content-navigation-host__label {
  color: var(--chat-accent-border, #2f7bf6);
}

.tr-content-navigation-host.is-expanded .tr-content-navigation-host__label {
  max-width: calc(var(--workspace-navigation-expanded-width, 258px) - 48px);
  opacity: 1;
}

@media (max-width: 1100px) {
  .tr-content-navigation-host {
    display: none;
  }
}
</style>
