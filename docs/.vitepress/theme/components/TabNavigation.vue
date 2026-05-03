<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

interface TabItem {
  key: string
  name: string
  link?: string
  disabled?: boolean
}

interface TabsProps {
  tabs: TabItem[]
  activeTab?: string
}

interface TabsEmits {
  'tab-change': [value: string]
  'tab-click': [tab: TabItem]
}

const props = withDefaults(defineProps<TabsProps>(), {
  tabs: () => [],
  activeTab: '',
})

const emit = defineEmits<TabsEmits>()

const internalActiveTab = ref(props.activeTab)
const underlineRef = ref<HTMLDivElement | null>(null)
const navRef = ref<HTMLDivElement | null>(null)

const getDefaultActiveTab = (): string => {
  const firstEnabledTab = props.tabs.find((tab) => !tab.disabled)
  return firstEnabledTab?.key || ''
}

const currentActiveTab = computed({
  get: () => internalActiveTab.value || getDefaultActiveTab(),
  set: (value: string) => {
    internalActiveTab.value = value
    emit('tab-change', value)
    updateUnderlinePosition()
  },
})

watch(
  () => props.activeTab,
  (newActiveTab) => {
    if (newActiveTab && newActiveTab !== internalActiveTab.value) {
      internalActiveTab.value = newActiveTab
      updateUnderlinePosition()
    }
  },
)

watch(
  () => props.tabs,
  () => {
    nextTick(updateUnderlinePosition)
  },
  { deep: true },
)

const handleTabClick = (tab: TabItem) => {
  if (tab.disabled) return
  currentActiveTab.value = tab.key
  emit('tab-click', tab)
}

const isTabActive = (tabKey: string): boolean => currentActiveTab.value === tabKey

const getTabClasses = (tab: TabItem) => ({
  'custom-tabs__item': true,
  'custom-tabs__item--active': isTabActive(tab.key),
  'custom-tabs__item--disabled': tab.disabled,
})

const updateUnderlinePosition = () => {
  nextTick(() => {
    if (!navRef.value || !underlineRef.value) return

    const activeTabEl = navRef.value.querySelector<HTMLElement>('.custom-tabs__item--active')
    if (!activeTabEl) return

    const rect = activeTabEl.getBoundingClientRect()
    const navRect = navRef.value.getBoundingClientRect()

    underlineRef.value.style.width = `${rect.width}px`
    underlineRef.value.style.left = `${rect.left - navRect.left}px`
  })
}

let resizeHandler: (() => void) | null = null

onMounted(() => {
  updateUnderlinePosition()

  resizeHandler = () => updateUnderlinePosition()
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
})
</script>

<template>
  <div class="custom-tabs">
    <div class="custom-tabs__header">
      <div ref="navRef" class="custom-tabs__nav">
        <div v-for="tab in tabs" :key="tab.key" :class="getTabClasses(tab)" @click="handleTabClick(tab)">
          <span class="custom-tabs__item-title">{{ tab.name }}</span>
        </div>

        <div ref="underlineRef" class="custom-tabs__item-underline custom-tabs__item-underline--active" />
      </div>
    </div>

    <div class="custom-tabs__body">
      <slot :activeTab="currentActiveTab" :isTabActive="isTabActive" :tabs="tabs" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.custom-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    position: relative;
    flex-shrink: 0;
    height: var(--vp-nav-bottom-height, 48px);
  }

  &__nav {
    position: relative;
    display: flex;
    align-items: stretch;
    height: 100%;
    gap: 1.5rem;
  }

  &__item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 100%;
    color: var(--vp-c-text-2);
    font-size: 0.875rem;
    font-weight: 500;
    line-height: var(--vp-nav-bottom-height, 48px);
    white-space: nowrap;
    cursor: pointer;
    transition:
      color 0.2s ease,
      opacity 0.2s ease;

    &-title {
      display: inline-flex;
      align-items: center;
      color: inherit;
      transition: color 0.2s ease;
      user-select: none;
    }

    &-underline {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 0;
      height: 3px;
      border-radius: 999px;
      background: var(--tr-doc-top-nav-accent);
      transition:
        left 0.3s ease,
        width 0.3s ease,
        background-color 0.2s ease;

      &--active {
        background: var(--tr-doc-top-nav-accent);
      }
    }

    &:hover:not(&--disabled) {
      color: var(--vp-c-text-1);
    }

    &--active {
      color: var(--tr-doc-top-nav-accent);
      font-weight: 600;

      .custom-tabs__item-title {
        color: inherit;
        font-weight: 600;
      }
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.5;

      .custom-tabs__item-title {
        color: var(--vp-c-text-3);
      }
    }
  }

  &__body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  &__content {
    height: 100%;
    display: none;

    &--active {
      display: block;
    }
  }
}

@media (max-width: 768px) {
  .custom-tabs {
    &__header {
      padding: 0 12px;
    }

    &__nav {
      gap: 0.9rem;
    }

    &__item {
      padding: 0 2px;
      font-size: 13px;
    }
  }
}
</style>
