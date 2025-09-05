<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { Search, PluginCard, NoData } from './index'
import type { ContentAreaProps, ContentAreaEmits, PluginInfo, FilterConfig } from '../index.type'

const props = withDefaults(defineProps<ContentAreaProps>(), {
  pluginList: () => [],
  mode: 'installed',
  loading: false,
  allowPluginToggle: true,
  allowToolToggle: true,
  allowPluginDelete: true,
  allowPluginAdd: true,
})

watchEffect(() => {
  console.log(props.pluginList)
})

const emit = defineEmits<ContentAreaEmits>()

// 搜索状态
const searchQuery = ref('')
const selectedFilter = ref<FilterConfig | null>(null)

// 计算过滤后的插件列表
const filteredPlugins = computed(() => {
  const plugins = [...props.pluginList]

  // // 应用搜索配置
  // if (props.searchConfig?.enabled !== false) {
  //   plugins = applySearchConfig(plugins, searchQuery.value, props.searchConfig)
  // }

  // // 应用选中的过滤器
  // if (selectedFilter.value?.filterFn) {
  //   plugins = selectedFilter.value.filterFn(plugins)
  // }

  return plugins
})

// 计算是否显示搜索框
const showSearch = computed(() => {
  return props.searchConfig?.enabled !== false
})

// 计算是否显示过滤器
const showFilters = computed(() => {
  const filters = props.searchConfig?.filters
  if (!filters) return false
  return filters?.length > 0
})

// 计算搜索占位符
const searchPlaceholder = computed(() => {
  return props.searchConfig?.placeholder || (props.mode === 'installed' ? '搜索已添加插件' : '搜索市场插件')
})

// 计算是否有搜索结果
const hasResults = computed(() => {
  return filteredPlugins.value.length > 0
})

console.log(props)

// 处理搜索
const handleSearch = (query: string) => {
  searchQuery.value = query
  emit('search', query)
}

// 处理过滤器变化
const handleFilterChange = (filter: FilterConfig | null) => {
  selectedFilter.value = filter
}

// 处理插件操作
const handlePluginToggle = (plugin: PluginInfo, enabled: boolean) => {
  if (!props.allowPluginToggle) return
  emit('plugin-toggle', plugin, enabled)
}

const handlePluginAdd = (plugin: PluginInfo) => {
  if (!props.allowPluginAdd) return
  emit('plugin-add', plugin)
}

const handlePluginDelete = (plugin: PluginInfo) => {
  if (!props.allowPluginDelete) return
  emit('plugin-delete', plugin)
}

const handleToolToggle = (plugin: PluginInfo, toolId: string, enabled: boolean) => {
  if (!props.allowToolToggle) return
  emit('tool-toggle', plugin, toolId, enabled)
}
</script>

<template>
  <div class="mcp-content-area">
    <!-- 搜索区域 -->
    <div v-if="showSearch" class="mcp-content-area__search">
      <Search
        v-model="searchQuery"
        :mode="mode"
        :placeholder="searchPlaceholder"
        :show-filters="showFilters"
        @search="handleSearch"
        @filter-change="handleFilterChange"
      />
    </div>

    <!-- 内容区域 -->
    <div class="mcp-content-area__content">
      <!-- 加载状态 -->
      <div v-if="loading" class="mcp-content-area__loading">
        <div class="mcp-content-area__loading-spinner"></div>
        <span class="mcp-content-area__loading-text">加载中...</span>
      </div>

      <!-- 插件列表 -->
      <div v-else-if="hasResults" class="mcp-content-area__list">
        <PluginCard
          v-for="plugin in filteredPlugins"
          :key="plugin.id"
          :plugin="plugin"
          :mode="mode"
          :show-tool-count="mode === 'installed'"
          @toggle-plugin="(enabled: boolean) => handlePluginToggle(plugin, enabled)"
          @toggle-tool="(toolId: string, enabled: boolean) => handleToolToggle(plugin, toolId, enabled)"
          @add-plugin="handlePluginAdd"
          @delete-plugin="() => handlePluginDelete(plugin)"
        />
      </div>

      <!-- 无数据状态 -->
      <div v-else class="mcp-content-area__empty">
        <NoData :search-query="searchQuery" />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.mcp-content-area {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__search {
    flex-shrink: 0;
    padding: 16px 0;
  }

  &__content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    gap: 16px;

    &-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #f0f0f0;
      border-top: 3px solid #1476ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    &-text {
      font-size: 14px;
      color: #595959;
    }
  }

  &__list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding: 5px;
    gap: 16px;

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 6px;
    }
  }

  &__empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;

    &-content {
      text-align: center;
      max-width: 300px;
    }

    &-icon {
      margin-bottom: 16px;
      opacity: 0.6;
    }

    &-text {
      font-size: 16px;
      color: #191919;
      margin-bottom: 8px;
      font-weight: 500;
    }

    &-hint {
      font-size: 14px;
      color: #595959;
      margin: 0;
    }
  }
}
</style>
