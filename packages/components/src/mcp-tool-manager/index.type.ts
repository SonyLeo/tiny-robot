export interface PluginTool {
  id: string
  name: string
  description: string
  enabled: boolean
}

export type PluginAddState = 'idle' | 'loading' | 'added'

export interface PluginInfo {
  id: string
  name: string
  icon: string
  description: string
  enabled: boolean
  expanded?: boolean
  tools: PluginTool[]
  addState?: PluginAddState
  category?: string
}

// 过滤器配置类型
export interface FilterConfig {
  label: string
  value: string
  filterFn?: (plugins: PluginInfo[]) => PluginInfo[]
}

// 搜索配置类型
export interface SearchConfig {
  placeholder?: string
  enabled?: boolean
  condition?: boolean
  filters?: FilterConfig[]
}

// 插件数据项类型
export interface PluginDataItem {
  type: 'installed' | 'market'
  name: string
  pluginList: PluginInfo[]
  disabled?: boolean
  search?: SearchConfig
}

// 插件数据数组类型
export type PluginData = PluginDataItem[]

// 类型验证工具函数
export const validatePluginData = (data: unknown): data is PluginData => {
  if (!Array.isArray(data)) return false

  return data.every((item) => {
    return (
      typeof item === 'object' &&
      item !== null &&
      typeof item.type === 'string' &&
      ['installed', 'market'].includes(item.type) &&
      typeof item.name === 'string' &&
      Array.isArray(item.pluginList) &&
      item.pluginList.every(validatePluginInfo)
    )
  })
}

export const validatePluginInfo = (plugin: unknown): plugin is PluginInfo => {
  if (typeof plugin !== 'object' || plugin === null) return false

  const p = plugin as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.icon === 'string' &&
    typeof p.description === 'string' &&
    typeof p.enabled === 'boolean' &&
    Array.isArray(p.tools) &&
    p.tools.every(validatePluginTool)
  )
}

export const validatePluginTool = (tool: unknown): tool is PluginTool => {
  if (typeof tool !== 'object' || tool === null) return false

  const t = tool as Record<string, unknown>
  return (
    typeof t.id === 'string' &&
    typeof t.name === 'string' &&
    typeof t.description === 'string' &&
    typeof t.enabled === 'boolean'
  )
}

// 默认值提供函数
export const getDefaultPluginData = (): PluginData => []

export const getDefaultSearchConfig = (): SearchConfig => ({
  placeholder: '搜索插件',
  enabled: true,
  condition: true,
  filters: [],
})

export const getDefaultPluginDataItem = (type: 'installed' | 'market'): PluginDataItem => ({
  type,
  name: type === 'installed' ? '已添加插件' : '插件市场',
  pluginList: [],
  disabled: false,
  search: getDefaultSearchConfig(),
})

// 响应式断点类型
export interface ResponsiveBreakpoints {
  sm?: number // 默认 640px
  md?: number // 默认 768px
  lg?: number // 默认 1024px
  xl?: number // 默认 1280px
  '2xl'?: number // 默认 1536px
}

// 主组件 Props 类型
export interface McpToolManagerProps {
  // 核心数据配置
  pluginData: PluginData

  // 标签页配置
  defaultActiveTab?: string

  // 响应式配置
  breakpoints?: ResponsiveBreakpoints

  // 行为控制
  allowPluginToggle?: boolean
  allowToolToggle?: boolean
  allowPluginDelete?: boolean
  allowPluginAdd?: boolean

  // 加载状态
  loading?: boolean
}

// 主组件 Emits 类型
export interface McpToolManagerEmits {
  // 标签页事件
  (e: 'tab-change', tab: PluginDataItem): void

  // 搜索事件
  (e: 'search', query: string, tab: PluginDataItem): void

  // 插件操作事件
  (e: 'plugin-toggle', plugin: PluginInfo, enabled: boolean, tab: PluginDataItem): void
  (e: 'plugin-add', plugin: PluginInfo, tab: PluginDataItem): void
  (e: 'plugin-delete', plugin: PluginInfo, tab: PluginDataItem): void

  // 工具操作事件
  (e: 'tool-toggle', plugin: PluginInfo, toolId: string, enabled: boolean, tab: PluginDataItem): void
}

// 子组件类型定义

// PluginCard 组件类型
export type PluginCardMode = 'installed' | 'market'

export interface PluginCardProps {
  plugin: PluginInfo
  mode?: PluginCardMode
  showToolCount?: boolean
}

export interface PluginCardEmits {
  (e: 'toggle-plugin', enabled: boolean): void
  (e: 'toggle-tool', toolId: string, enabled: boolean): void
  (e: 'add-plugin', plugin: PluginInfo): void
  (e: 'delete-plugin'): void
}

// Search 组件类型
export interface SearchProps {
  placeholder?: string
  modelValue?: string
  disabled?: boolean
}

export interface SearchEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', query: string): void
}

// Tabs 组件类型
export interface TabItem {
  key: string
  name: string
  disabled?: boolean
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab?: string
}

export interface TabsEmits {
  (e: 'tab-change', tabKey: string): void
}

// ContentArea 组件类型
export interface ContentAreaProps {
  pluginList: PluginInfo[]
  searchConfig?: SearchConfig
  mode: 'installed' | 'market'
  loading?: boolean
  allowPluginToggle?: boolean
  allowToolToggle?: boolean
  allowPluginDelete?: boolean
  allowPluginAdd?: boolean
}

export interface ContentAreaEmits {
  (e: 'search', query: string): void
  (e: 'plugin-toggle', plugin: PluginInfo, enabled: boolean): void
  (e: 'plugin-add', plugin: PluginInfo): void
  (e: 'plugin-delete', plugin: PluginInfo): void
  (e: 'tool-toggle', plugin: PluginInfo, toolId: string, enabled: boolean): void
}
