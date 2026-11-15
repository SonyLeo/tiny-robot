---
outline: [1, 3]
badge: deprecated
---

# MCP Server Picker 插件选择器

> [!WARNING]
> `McpServerPicker` 自 v1.0 起弃用，未来会移除。迁移到 `ExtensionManager` 请参见 [McpServerPicker 迁移指南](../migration/v1.0/mcp-server-picker)。

MCP Server Picker 组件是一个用于展示和管理插件的组件，支持已安装插件和插件市场两个标签页，可以进行插件的添加、删除和启用/禁用操作。

## 基础用法 {#mcp-server-picker-basic}

<demo vue="../../demos/mcp-server-picker/basic-usage.vue" />

<span id="插件添加状态"></span>

### 插件添加状态 {#mcp-server-picker-add-state}

市场插件支持三种添加状态，提供更好的用户体验：

- **idle**: 未添加状态，显示"添加"按钮，用户可以点击添加
- **loading**: 添加中状态，显示"添加中"按钮，按钮不可点击，适用于网络请求等异步操作
- **added**: 已添加状态，显示"已添加"按钮，按钮不可点击

通过 `addState` 属性控制插件的添加状态，开发者可以在添加插件的异步过程中动态更新状态，提升用户体验。

<span id="状态控制示例"></span>

#### 状态控制示例 {#mcp-server-picker-add-state-example}

```typescript
const handlePluginAdd = (plugin: PluginInfo) => {
  const targetPlugin = marketPlugins.value.find((p) => p.id === plugin.id)!

  // 设置为加载状态
  targetPlugin.addState = 'loading'

  // 异步添加插件
  addPluginToServer(plugin)
    .then(() => {
      // 添加成功
      targetPlugin.addState = 'added'
      // 添加到已安装列表
      installedPlugins.value.push(newPlugin)
    })
    .catch(() => {
      // 添加失败，重置为idle状态，用户可以重新尝试
      targetPlugin.addState = 'idle'
    })
}
```

<span id="弹出方式"></span>

## 弹出方式 {#mcp-server-picker-popup}

> MCP Server Picker 组件支持两种弹出方式， 即 `Fixed` 模式和 `Drawer` 模式，通过 `popupConfig` 配置对象统一管理

<demo vue="../../demos/mcp-server-picker/popup-config.vue" />


## Props {#mcp-server-picker-props}

| 属性                       | 类型                      | 默认值                                                            | 说明                                         |
| -------------------------- | ------------------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| [`installedPlugins`](#mcp-server-picker-basic) | `PluginInfo[]` | `[]` | 已安装插件列表 |
| [`marketPlugins`](#mcp-server-picker-basic) | `PluginInfo[]` | `[]` | 市场插件列表 |
| [`enableSearch`](#mcp-server-picker-basic) | `boolean` | `true` | 是否启用搜索功能 |
| [`searchPlaceholder`](#mcp-server-picker-basic) | `string` | `'搜索插件'` | 搜索框占位符 |
| [`installedSearchFn`](#mcp-server-picker-basic) | `(query: string, item: PluginInfo) => boolean` | - | 已安装插件搜索函数 |
| [`marketSearchFn`](#mcp-server-picker-basic) | `(query: string, item: PluginInfo) => boolean` | - | 市场插件搜索函数 |
| [`enableMarketCategoryFilter`](#mcp-server-picker-basic) | `boolean` | `true` | 是否启用市场分类筛选功能 |
| [`marketCategoryOptions`](#mcp-server-picker-basic) | `MarketCategoryOption[]` | `[]` | 市场分类选项列表 |
| [`marketCategoryPlaceholder`](#mcp-server-picker-basic) | `string` | `'按照分类筛选'` | 分类筛选下拉框占位符 |
| [`visible`](#mcp-server-picker-basic) | `boolean` | `false` | 是否显示整个组件面板（支持 v-model:visible） |
| [`activeCount`](#mcp-server-picker-basic) | `number` | - | 激活插件数量（支持 v-model:activeCount） |
| [`defaultActiveTab`](#mcp-server-picker-basic) | `'installed' \| 'market'` | `'installed'` | 默认激活的标签页 |
| [`showInstalledTab`](#mcp-server-picker-basic) | `boolean` | `true` | 是否显示已安装标签页 |
| [`showMarketTab`](#mcp-server-picker-basic) | `boolean` | `true` | 是否显示市场标签页 |
| [`installedTabTitle`](#mcp-server-picker-basic) | `string` | `'已安装插件'` | 已安装标签页标题 |
| [`marketTabTitle`](#mcp-server-picker-basic) | `string` | `'市场'` | 市场标签页标题 |
| [`popupConfig`](#mcp-server-picker-popup) | `PopupConfig` | `{ type: 'fixed', position: {}, drawer: { direction: 'right' } }` | 弹出配置对象 |
| [`title`](#mcp-server-picker-basic) | `string` | `'插件'` | 组件标题 |
| [`showCustomAddButton`](#mcp-server-picker-basic) | `boolean` | `true` | 是否显示自定义添加按钮 |
| [`customAddButtonText`](#mcp-server-picker-basic) | `string` | `'自定义添加'` | 自定义添加按钮文本 |
| [`allowPluginToggle`](#mcp-server-picker-basic) | `boolean` | `true` | 是否允许切换插件状态 |
| [`allowToolToggle`](#mcp-server-picker-basic) | `boolean` | `true` | 是否允许切换工具状态 |
| [`allowPluginDelete`](#mcp-server-picker-basic) | `boolean` | `true` | 是否允许删除插件 |
| [`allowPluginAdd`](#mcp-server-picker-basic) | `boolean` | `true` | 是否允许添加插件 |
| [`loading`](#mcp-server-picker-basic) | `boolean` | `false` | 已安装插件加载状态 |
| [`marketLoading`](#mcp-server-picker-basic) | `boolean` | `false` | 市场插件加载状态 |


<span id="slots"></span>

## Slots {#mcp-server-picker-slots}

| 插槽名称          | 描述                             | 默认内容                |
| ----------------- | -------------------------------- | ----------------------- |
| [`header-actions`](#mcp-server-picker-basic) | 头部右侧操作区插槽 | 无 |

## Events {#mcp-server-picker-events}

| 事件名                   | 说明                   | 回调参数                                                |
| ------------------------ | ---------------------- | ------------------------------------------------------- |
| [`market-category-change`](#mcp-server-picker-basic) | 市场分类筛选变化 | `(category: string)` |
| [`update:visible`](#mcp-server-picker-basic) | 面板显示状态变化 | `(visible: boolean)` |
| [`update:activeCount`](#mcp-server-picker-basic) | 激活插件数量变化 | `(count: number)` |
| [`tab-change`](#mcp-server-picker-basic) | 标签页切换 | `(activeTab: 'installed' \| 'market')` |
| [`plugin-toggle`](#mcp-server-picker-basic) | 插件启用/禁用 | `(plugin: PluginInfo, enabled: boolean)` |
| [`plugin-delete`](#mcp-server-picker-basic) | 删除插件 | `(plugin: PluginInfo)` |
| [`plugin-add`](#mcp-server-picker-add-state) | 市场插件添加 | `(plugin: PluginInfo)` |
| [`plugin-create`](#mcp-server-picker-basic) | 插件创建 | `(type: 'form' \| 'code', data: PluginCreationData)` |
| [`tool-toggle`](#mcp-server-picker-basic) | 工具启用/禁用 | `(plugin: PluginInfo, toolId: string, enabled: boolean)` |
| [`refresh`](#mcp-server-picker-basic) | 刷新请求 | `(tab: 'installed' \| 'market')` |

## Types {#mcp-server-picker-types}

**PluginInfo**

插件信息类型：

```typescript
type PluginAddState = 'idle' | 'loading' | 'added'

interface PluginInfo {
  id: string              // 插件唯一标识
  name: string            // 插件名称
  icon: string            // 插件图标URL
  description: string     // 插件描述
  enabled: boolean       // 是否启用
  expanded?: boolean      // 是否展开
  tools: PluginTool[]    // 工具列表
  addState?: PluginAddState // 市场插件添加状态(可选): 'idle' - 未添加, 'loading' - 添加中, 'added' - 已添加
  category?: string       // 插件分类(可选，用于市场分类筛选)
}
```

**PluginTool**

插件工具类型：

```typescript
interface PluginTool {
  id: string              // 工具唯一标识
  name: string            // 工具名称
  description: string     // 工具描述
  enabled: boolean        // 是否启用
}
```

**MarketCategoryOption**

市场分类选项类型：

```typescript
interface MarketCategoryOption {
  value: string           // 分类值
  label: string           // 分类显示名称
}
```

**PluginFormData**

表单方式添加插件数据类型：

```typescript
interface PluginFormData {
  name: string            // 插件名称
  description: string     // 插件描述
  type: 'sse' | 'streamableHttp'  // 插件类型, sse 或 streamableHttp
  url: string             // 插件 URL
  headers: string         // 请求头（JSON 格式字符串）
  thumbnail?: File | null // 缩略图文件（可选）
}
```

**PluginCreationData**

PluginCreationData 类型是 PluginFormData 或 string 的联合类型，用于表示插件创建的数据。

```typescript
type PluginCreationData = PluginFormData | string
```

**PopupConfig**

弹窗配置类型：

```typescript
interface PopupConfig {
  type: 'fixed' | 'drawer'
  // fixed模式配置
  position?: {
    top?: string | number
    left?: string | number
    right?: string | number
    bottom?: string | number
  }
  // drawer模式配置
  drawer?: {
    direction: 'left' | 'right'
  }
}
```

<!--@include: ./mcp-add-form.md-->
