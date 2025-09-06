<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import type { TabsProps, TabsEmits, TabItem } from '../index.type'

const props = withDefaults(defineProps<TabsProps>(), {
  tabs: () => [],
  activeTab: '',
})

const emit = defineEmits<TabsEmits>()

// 内部激活状态
const internalActiveTab = ref(props.activeTab)
// 下划线元素引用
const underlineRef = ref<HTMLDivElement | null>(null)

// 计算当前激活的标签页
const currentActiveTab = computed({
  get: () => internalActiveTab.value || getDefaultActiveTab(),
  set: (value: string) => {
    internalActiveTab.value = value
    emit('tab-change', value)
    // 当激活标签改变时更新下划线位置
    updateUnderlinePosition()
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
      // 外部激活标签改变时更新下划线位置
      updateUnderlinePosition()
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

// 更新下划线位置和宽度
const updateUnderlinePosition = () => {
  nextTick(() => {
    // 获取当前激活的标签元素
    const activeTabEl = document.querySelector(`.mcp-tabs__item--active`)
    if (activeTabEl && underlineRef.value) {
      // 获取激活标签的位置信息
      const rect = activeTabEl.getBoundingClientRect()
      // 获取导航容器的位置信息
      const navRect = activeTabEl.parentElement?.getBoundingClientRect()

      if (navRect) {
        // 设置下划线样式
        underlineRef.value.style.width = `${rect.width}px`
        underlineRef.value.style.left = `${rect.left - navRect.left}px`
      }
    }
  })
}

// 初始化和监听窗口大小变化时更新下划线
watch(
  () => props.tabs,
  () => {
    // 当标签数据变化时更新下划线
    nextTick(updateUnderlinePosition)
  },
  { deep: true },
)

// 窗口大小改变时更新下划线位置
window.addEventListener('resize', updateUnderlinePosition)

// 组件挂载时初始化下划线位置
updateUnderlinePosition()
</script>

<template>
  <div class="mcp-tabs">
    <!-- 标签页头部 -->
    <div class="mcp-tabs__header">
      <!-- 导航容器添加ref -->
      <div class="mcp-tabs__nav" ref="navRef">
        <div v-for="tab in tabs" :key="tab.key" :class="getTabClasses(tab)" @click="handleTabClick(tab)">
          <span class="mcp-tabs__item-title">{{ tab.name }}</span>
        </div>

        <!-- 下划线元素 -->
        <div ref="underlineRef" class="mcp-tabs__item-underline mcp-tabs__item-underline--active" />
      </div>
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
    height: 100%;
    display: flex;
    align-items: flex-start;
    gap: 32px;
  }

  &__item {
    position: relative;
    cursor: pointer;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    text-align: left;
    padding-bottom: 10px;

    &-title {
      font-size: 14px;
      color: #191919;
      line-height: 22px;
      transition: color 0.3s ease;
      user-select: none;
    }

    &-underline {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 20px;
      height: 2px;
      background-color: transparent;
      transition: all 0.3s ease;

      &--active {
        background-color: #191919;
      }
    }

    &--active {
      .mcp-tabs__item-title {
        font-weight: 600;
      }

      .mcp-tabs__item-underline {
        background-color: #191919;
      }
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.5;

      .mcp-tabs__item-title {
        color: #c2c2c2;
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
</style>
