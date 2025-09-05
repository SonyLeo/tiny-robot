<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Tabs, ContentArea } from './components'
import type {
  McpToolManagerProps,
  McpToolManagerEmits,
  PluginDataItem,
  PluginInfo,
  TabItem,
  PluginData,
} from './index.type'

const props = withDefaults(defineProps<McpToolManagerProps>(), {
  allowPluginToggle: true,
  allowToolToggle: true,
  allowPluginDelete: true,
  allowPluginAdd: true,
  loading: false,
})

const emit = defineEmits<McpToolManagerEmits>()

const getDefaultActiveTab = (pluginData: PluginData): string | undefined => {
  const firstEnabledTab = pluginData.find((tab) => !tab.disabled)
  return firstEnabledTab?.type
}

const findTabByType = (pluginData: PluginData, type: string): PluginDataItem | undefined => {
  return pluginData.find((tab) => tab.type === type)
}

// 当前激活的标签页
const activeTab = ref(props.defaultActiveTab || getDefaultActiveTab(props.pluginData) || '')

// 转换 pluginData 为 TabItem 数组
const tabs = computed<TabItem[]>(() => {
  return props.pluginData.map((item) => ({
    key: item.type,
    name: item.name,
    disabled: item.disabled || false,
  }))
})

// 获取当前激活标签页的数据
const currentTabData = computed<PluginDataItem | undefined>(() => {
  return findTabByType(props.pluginData, activeTab.value)
})

// 获取当前标签页的插件列表
const currentPluginList = computed(() => {
  return currentTabData.value?.pluginList || []
})

// 获取当前标签页的搜索配置
const currentSearchConfig = computed(() => {
  return currentTabData.value?.search
})

// 获取当前标签页的模式
const currentMode = computed<'installed' | 'market'>(() => {
  return (currentTabData.value?.type as 'installed' | 'market') || 'installed'
})

// 监听 defaultActiveTab 变化
watch(
  () => props.defaultActiveTab,
  (newActiveTab) => {
    if (newActiveTab && newActiveTab !== activeTab.value) {
      activeTab.value = newActiveTab
    }
  },
)

// 处理标签页切换
const handleTabChange = (tabKey: string) => {
  activeTab.value = tabKey
  const tabData = findTabByType(props.pluginData, tabKey)
  if (tabData) {
    emit('tab-change', tabData)
  }
}

// 处理搜索
const handleSearch = (query: string) => {
  if (currentTabData.value) {
    emit('search', query, currentTabData.value)
  }
}

// 处理插件操作
const handlePluginToggle = (plugin: PluginInfo, enabled: boolean) => {
  if (currentTabData.value) {
    emit('plugin-toggle', plugin, enabled, currentTabData.value)
  }
}

const handlePluginAdd = (plugin: PluginInfo) => {
  if (currentTabData.value) {
    emit('plugin-add', plugin, currentTabData.value)
  }
}

const handlePluginDelete = (plugin: PluginInfo) => {
  if (currentTabData.value) {
    emit('plugin-delete', plugin, currentTabData.value)
  }
}

const handleToolToggle = (plugin: PluginInfo, toolId: string, enabled: boolean) => {
  if (currentTabData.value) {
    emit('tool-toggle', plugin, toolId, enabled, currentTabData.value)
  }
}
</script>

<template>
  <div class="mcp-tool-manager__container">
    <!-- 标签页导航 -->
    <Tabs :tabs="tabs" :active-tab="activeTab" @tab-change="handleTabChange" class="mcp-tool-manager__tabs">
      <!-- 内容区域 -->
      <div class="mcp-tool-manager__content">
        <ContentArea
          :plugin-list="currentPluginList"
          :search-config="currentSearchConfig"
          :mode="currentMode"
          :loading="props.loading"
          :allow-plugin-toggle="props.allowPluginToggle"
          :allow-tool-toggle="props.allowToolToggle"
          :allow-plugin-delete="props.allowPluginDelete"
          :allow-plugin-add="props.allowPluginAdd"
          @search="handleSearch"
          @plugin-toggle="handlePluginToggle"
          @plugin-add="handlePluginAdd"
          @plugin-delete="handlePluginDelete"
          @tool-toggle="handleToolToggle"
        />
      </div>
    </Tabs>
  </div>
</template>

<style lang="less" scoped>
.mcp-tool-manager {
  width: 100%;

  &__container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 100vh;
    overflow: hidden;
  }

  &__tabs {
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    min-height: 0;
    overflow: hidden;

    height: 100%;
  }
}
</style>
