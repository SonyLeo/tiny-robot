<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TabsProps, TabsEmits, TabItem } from '../index.type'

const props = withDefaults(defineProps<TabsProps>(), {
  tabs: () => [],
  activeTab: '',
})

const emit = defineEmits<TabsEmits>()

// 内部激活状态
const internalActiveTab = ref(props.activeTab)

// 计算当前激活的标签页
const currentActiveTab = computed({
  get: () => internalActiveTab.value || getDefaultActiveTab(),
  set: (value: string) => {
    internalActiveTab.value = value
    emit('tab-change', value)
  },
})

// 获取默认激活的标签页（第一个非禁用的标签页）
const getDefaultActiveTab = (): string => {
  const firstEnabledTab = props.tabs.find((tab) => !tab.disabled)
  return firstEnabledTab?.key || ''
}

// 监听外部 activeTab 变化
watch(
  () => props.activeTab,
  (newActiveTab) => {
    if (newActiveTab && newActiveTab !== internalActiveTab.value) {
      internalActiveTab.value = newActiveTab
    }
  },
)

// 处理标签页点击
const handleTabClick = (tab: TabItem) => {
  if (tab.disabled) return
  currentActiveTab.value = tab.key
}

// 检查标签页是否激活
const isTabActive = (tabKey: string): boolean => {
  return currentActiveTab.value === tabKey
}

// 获取标签页类名
const getTabClasses = (tab: TabItem) => ({
  'mcp-tabs__item': true,
  'mcp-tabs__item--active': isTabActive(tab.key),
  'mcp-tabs__item--disabled': tab.disabled,
})
</script>

<template>
  <div class="mcp-tabs">
    <!-- 标签页头部 -->
    <div class="mcp-tabs__header">
      <div class="mcp-tabs__nav">
        <div v-for="tab in tabs" :key="tab.key" :class="getTabClasses(tab)" @click="handleTabClick(tab)">
          <span class="mcp-tabs__item-title">{{ tab.name }}</span>
        </div>
      </div>
      <div class="mcp-tabs__indicator" />
    </div>

    <!-- 标签页内容区域 -->
    <div class="mcp-tabs__body">
      <slot :activeTab="currentActiveTab" :isTabActive="isTabActive" :tabs="tabs" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.mcp-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    position: relative;
    flex-shrink: 0;
    border-bottom: 1px solid #e6e6e6;

    height: 32px;
  }

  &__nav {
    display: flex;
    align-items: flex-start;
    gap: 32px;
  }

  &__item {
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    top: 7px;
    border-bottom: 2px solid transparent;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    text-align: left;

    &:hover:not(&--disabled) {
      background-color: #f5f5f5;
    }

    &--active {
      border-bottom-color: #191919;

      .mcp-tabs__item-title {
        font-weight: 600;
      }
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.5;

      .mcp-tabs__item-title {
        color: #c2c2c2;
      }
    }

    &-title {
      font-size: 14px;
      color: #191919;
      line-height: 22px;
      transition: color 0.3s ease;
      user-select: none;
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
</style>
