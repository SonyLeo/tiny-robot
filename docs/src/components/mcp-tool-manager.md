---
outline: deep
---

# MCP Tool Manager 插件工具管理器

## 基础用法

<demo vue="../../demos/mcp-tool-manager/basic-usage.vue" />

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `pluginData` | `PluginData` | `[]` | 插件数据配置数组 |
| `defaultActiveTab` | `string` | `undefined` | 默认激活的标签页类型 |
| `breakpoints` | `ResponsiveBreakpoints` | `{ sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }` | 响应式断点配置 |
| `allowPluginToggle` | `boolean` | `true` | 是否允许切换插件状态 |
| `allowToolToggle` | `boolean` | `true` | 是否允许切换工具状态 |
| `allowPluginDelete` | `boolean` | `true` | 是否允许删除插件 |
| `allowPluginAdd` | `boolean` | `true` | 是否允许添加插件 |
| `loading` | `boolean` | `false` | 加载状态 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `tab-change` | `(tab: PluginDataItem)` | 标签页切换时触发 |
| `search` | `(query: string, tab: PluginDataItem)` | 搜索时触发 |
| `plugin-toggle` | `(plugin: PluginInfo, enabled: boolean, tab: PluginDataItem)` | 插件启用/禁用时触发 |
| `plugin-add` | `(plugin: PluginInfo, tab: PluginDataItem)` | 添加插件时触发 |
| `plugin-delete` | `(plugin: PluginInfo, tab: PluginDataItem)` | 删除插件时触发 |
| `tool-toggle` | `(plugin: PluginInfo, toolId: string, enabled: boolean, tab: PluginDataItem)` | 工具启用/禁用时触发 |

### Types

#### PluginData

插件数据数组类型：

```typescript
type PluginData = PluginDataItem[]

interface PluginDataItem {
  type: 'installed' | 'market'
  name: string
  pluginList: PluginInfo[]
  disabled?: boolean
  search?: SearchConfig
}
```

#### PluginInfo

插件信息类型：

```typescript
interface PluginInfo {
  id: string              // 插件唯一标识
  name: string            // 插件名称
  icon: string            // 插件图标URL
  description: string     // 插件描述
  enabled: boolean        // 是否启用
  expanded?: boolean      // 是否展开
  tools: PluginTool[]     // 工具列表
  addState?: PluginAddState // 市场插件添加状态
  category?: string       // 插件分类
}

type PluginAddState = 'idle' | 'loading' | 'added'
```

#### PluginTool

插件工具类型：

```typescript
interface PluginTool {
  id: string              // 工具唯一标识
  name: string            // 工具名称
  description: string     // 工具描述
  enabled: boolean        // 是否启用
}
```

#### SearchConfig

搜索配置类型：

```typescript
interface SearchConfig {
  placeholder?: string    // 搜索框占位符
  enabled?: boolean       // 是否启用搜索
  condition?: boolean     // 搜索条件
  filters?: FilterConfig[] // 过滤器配置
}

interface FilterConfig {
  label: string           // 过滤器标签
  value: string           // 过滤器值
  filterFn?: (plugins: PluginInfo[]) => PluginInfo[] // 过滤函数
}
```