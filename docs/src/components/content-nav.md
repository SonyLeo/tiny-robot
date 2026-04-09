---
outline: [1, 3]
---

# TrContentNav 内容导航组件

`TrContentNav` 用于长内容区域或长对话场景的目录导航。

它只消费一个 `source`，所以接入时只需要先准备好：

- 目录项列表
- 每个目录项对应的目标节点

推荐接入方式：

- `TrBubbleList` 场景：优先使用 `contentNav + bubbleListRef.getContentNavSource()`
- 普通滚动容器：使用 `useContentNavSource`

## 代码示例

### BubbleList

聊天场景推荐直接使用 `BubbleList` 内建的 `contentNav` 能力。你只需要决定哪些分组进入目录，以及目录显示什么文本。

<demo
  vue="../../demos/content-nav/controlled-search.vue"
  :vueFiles="['../../demos/content-nav/controlled-search.vue']"
/>

使用建议：

- 参与导航的消息尽量提供稳定的 `id`
- 通过 `contentNav.itemResolver` 定制 `label / searchText / tooltipText`
- `bubbleListRef.getContentNavSource()` 可以直接提供给 `TrContentNav`

### 通用内容

普通内容区域推荐使用 `useContentNavSource`。它会同时返回：

- `source`：传给 `TrContentNav`
- `bindTarget(id)`：绑定到实际滚动目标

<demo
  vue="../../demos/content-nav/basic-source.vue"
  :vueFiles="['../../demos/content-nav/basic-source.vue']"
/>

如果你想在 `BubbleList` 外部完全接管目录项和目标绑定，也可以使用同样的方式，在 slot 中通过 `bindTarget(id)` 绑定到自定义目标节点。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `source` | `ContentNavSource` | - | 目录数据源。通常由 `useContentNavSource` 或 `BubbleList.getContentNavSource()` 提供 |
| `scrollContainer` | `HTMLElement \| null` | `null` | 滚动容器 |
| `search` | `false \| ContentNavSearchOptions` | `false` | 是否显示搜索区，以及搜索配置 |
| `activeId` | `string` | 非受控 | 当前激活项。传入后进入受控模式 |
| `expanded` | `boolean` | 非受控 | 展开状态。传入后进入受控模式 |
| `query` | `string` | 非受控 | 搜索词。传入后进入受控模式 |
| `placement` | `'left' \| 'right'` | `'right'` | 停靠位置 |
| `emptyText` | `string` | `'No matching items'` | 搜索无结果文案 |

## Slots

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| `item` | `{ item, segments, active, expanded, highlighted }` | 自定义目录项内容 |
| `marker` | `{ item, active }` | 自定义目录点 |
| `search` | `{ query, setQuery, options }` | 自定义搜索区 |
| `empty` | - | 自定义空结果内容 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:activeId` | `value: string \| undefined` | 当前激活项变化 |
| `update:expanded` | `value: boolean` | 展开状态变化 |
| `update:query` | `value: string` | 搜索词变化 |
| `select` | `item: ContentNavItem` | 点击或确认选中目录项 |
| `activate` | `item: ContentNavItem` | 目录项触发激活 |

## Types

### ContentNavItem

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 唯一标识，同时用于匹配目标节点 |
| `label` | `string` | 目录显示文本 |
| `searchText` | `string` | 搜索时额外匹配的文本 |
| `tooltipText` | `string` | 自定义 tooltip 文案 |
| `meta` | `Record<string, unknown>` | 自定义透传数据 |

### ContentNavSource

通常不需要手写这个对象，优先通过 `useContentNavSource` 或 `BubbleList.getContentNavSource()` 获取。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `items` | `Readonly<Ref<ContentNavItem[]>>` | 目录项列表 |
| `resolveTarget` | `(id: string) => HTMLElement \| null` | 根据 id 返回目标节点 |
| `revision` | `Readonly<Ref<number>>` | 目标映射变更标记，通常由 helper 自动维护 |

### ContentNavSearchOptions

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `placeholder` | `string` | 搜索框占位文案 |
| `matcher` | `ContentNavSearchMatcher` | 自定义搜索匹配逻辑 |
| `clearOnCollapse` | `boolean` | 收起时是否清空搜索词 |

## CSS 变量

| CSS 变量 | 说明 |
| --- | --- |
| `--tr-content-nav-width-collapsed` | 折叠态宽度 |
| `--tr-content-nav-width-expanded` | 展开态宽度 |
| `--tr-content-nav-surface-radius` | 面板圆角 |
| `--tr-content-nav-item-radius` | 目录项圆角 |
| `--tr-content-nav-marker-width` | 目录点宽度 |
| `--tr-content-nav-marker-height` | 目录点高度 |
| `--tr-content-nav-marker-radius` | 目录点圆角 |
| `--tr-content-nav-marker-track-size` | 目录点轨道尺寸 |
| `--tr-content-nav-bg` | 面板背景色 |
| `--tr-content-nav-border` | 面板边框色 |
| `--tr-content-nav-shadow` | 面板阴影 |
| `--tr-content-nav-item-color` | 目录项文本色 |
| `--tr-content-nav-item-color-active` | 激活目录项文本色 |
| `--tr-content-nav-item-bg-hover` | 目录项 hover 背景色 |
| `--tr-content-nav-marker-color` | 默认目录点颜色 |
| `--tr-content-nav-marker-color-active` | 激活目录点颜色 |
| `--tr-content-nav-tooltip-bg` | tooltip 背景色 |
| `--tr-content-nav-tooltip-color` | tooltip 文本色 |
| `--tr-content-nav-tooltip-shadow` | tooltip 阴影 |
| `--tr-content-nav-search-bg` | 搜索框背景色 |
| `--tr-content-nav-search-color` | 搜索框文本色 |
| `--tr-content-nav-search-border` | 搜索框边框色 |
| `--tr-content-nav-search-border-focus` | 搜索框聚焦边框色 |
| `--tr-content-nav-search-focus-ring` | 搜索框聚焦外环 |
| `--tr-content-nav-search-radius` | 搜索框圆角 |
| `--tr-content-nav-empty-color` | 空结果文本色 |
| `--tr-content-nav-focus-ring` | 目录项聚焦外环 |
| `--tr-content-nav-highlight-color` | 搜索高亮色 |
