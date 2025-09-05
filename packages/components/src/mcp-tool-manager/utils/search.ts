// 搜索和过滤工具函数

import type { PluginInfo, FilterConfig, SearchConfig } from '../index.type'

// 默认搜索函数：按名称和描述搜索
export const defaultSearchFunction = (query: string, plugin: PluginInfo): boolean => {
  if (!query.trim()) return true

  const searchTerm = query.toLowerCase()
  const name = plugin.name.toLowerCase()
  const description = plugin.description.toLowerCase()

  return name.includes(searchTerm) || description.includes(searchTerm)
}

// 按分类搜索
export const searchByCategory = (category: string, plugin: PluginInfo): boolean => {
  if (!category) return true
  return plugin.category === category
}

// 按工具搜索
export const searchByTools = (query: string, plugin: PluginInfo): boolean => {
  if (!query.trim()) return true

  const searchTerm = query.toLowerCase()
  return plugin.tools.some(
    (tool) => tool.name.toLowerCase().includes(searchTerm) || tool.description.toLowerCase().includes(searchTerm),
  )
}

// 按启用状态搜索
export const searchByEnabled = (enabled: boolean, plugin: PluginInfo): boolean => {
  return plugin.enabled === enabled
}

// 组合搜索函数
export const createCombinedSearchFunction = (searchFunctions: Array<(plugin: PluginInfo) => boolean>) => {
  return (plugin: PluginInfo): boolean => {
    return searchFunctions.every((fn) => fn(plugin))
  }
}

// 应用搜索配置
export const applySearchConfig = (plugins: PluginInfo[], query: string, searchConfig?: SearchConfig): PluginInfo[] => {
  if (!searchConfig?.enabled) return plugins

  let filteredPlugins = plugins

  // 应用基础搜索
  if (query.trim()) {
    filteredPlugins = filteredPlugins.filter((plugin) => defaultSearchFunction(query, plugin))
  }

  // 应用自定义过滤器
  if (searchConfig.filters && searchConfig.filters.length > 0) {
    searchConfig.filters.forEach((filter) => {
      if (filter.filterFn) {
        filteredPlugins = filter.filterFn(filteredPlugins)
      }
    })
  }

  return filteredPlugins
}

// 创建过滤器配置
export const createFilterConfig = (
  label: string,
  value: string,
  filterFn?: (plugins: PluginInfo[]) => PluginInfo[],
): FilterConfig => ({
  label,
  value,
  filterFn,
})

// 预设过滤器
export const presetFilters = {
  // 只显示已启用的插件
  enabledOnly: createFilterConfig('已启用', 'enabled', (plugins) => plugins.filter((plugin) => plugin.enabled)),

  // 只显示已禁用的插件
  disabledOnly: createFilterConfig('已禁用', 'disabled', (plugins) => plugins.filter((plugin) => !plugin.enabled)),

  // 只显示有工具的插件
  withTools: createFilterConfig('包含工具', 'with-tools', (plugins) =>
    plugins.filter((plugin) => plugin.tools.length > 0),
  ),

  // 只显示没有工具的插件
  withoutTools: createFilterConfig('不包含工具', 'without-tools', (plugins) =>
    plugins.filter((plugin) => plugin.tools.length === 0),
  ),

  // 按分类过滤
  byCategory: (category: string) =>
    createFilterConfig(`分类: ${category}`, `category-${category}`, (plugins) =>
      plugins.filter((plugin) => plugin.category === category),
    ),
}

// 搜索结果统计
export interface SearchStats {
  total: number
  filtered: number
  hasResults: boolean
  isEmpty: boolean
}

export const getSearchStats = (originalPlugins: PluginInfo[], filteredPlugins: PluginInfo[]): SearchStats => ({
  total: originalPlugins.length,
  filtered: filteredPlugins.length,
  hasResults: filteredPlugins.length > 0,
  isEmpty: originalPlugins.length === 0,
})

// 搜索高亮工具
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text

  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}
