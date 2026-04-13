---
outline: [1, 3]
---

# TrContentNav 内容导航组件

`TrContentNav` 用于长内容区域或长对话场景的目录导航。

默认情况下，组件使用 `expandTrigger="hover"`，在鼠标悬浮或键盘聚焦时自动展开。
如果你需要完全由外部控制展开状态，请切换到 `expandTrigger="manual"`，并配合 `v-model:expanded` 使用。

它的主接入方式已经收敛为直接消费 `items`。外部只需要准备：

- 目录项列表
- 与 `id` 对应的目标元素标记（默认使用 `data-content-nav-id`）

推荐接入方式：

- `TrBubbleList` 场景：在业务侧通过 `BubbleProvider + boxRendererMatches.attributes` 给目标 box 打 `data-content-nav-id`
- 普通滚动容器：直接在章节节点上写 `data-content-nav-id`

传入 `scrollContainer` 时，组件只会在该滚动容器内部查找目标元素；未传入时才会回退到全局文档查找。
在 Bubble 场景下，`data-content-nav-id` 默认落在 Box renderer 根节点上，通常就是 `.tr-bubble__box`，而不是整个 `.tr-bubble` 消息容器。

## 代码示例

### BubbleList

聊天场景推荐在业务侧自己准备 `items`，再通过 `BubbleProvider` 给用户气泡打 `data-content-nav-id` 标记。

<demo
  vue="../../demos/content-nav/controlled-search.vue"
  :vueFiles="['../../demos/content-nav/controlled-search.vue']"
/>

使用建议：

- 参与导航的消息尽量提供稳定的 `id`
- `ContentNavItem.id` 与目标 box 根节点上的 `data-content-nav-id` 保持一致
- `label / searchText / tooltipText` 由业务侧直接生成
- 如果需要 `scroll-margin-top`、点击反馈或高亮样式，也建议落在同一个 box 目标节点上
- 默认使用 `expandTrigger="hover"`，适合聊天侧边目录这类轻量导航体验

### 通用内容

普通内容区域推荐直接给章节节点打 `data-content-nav-id`，并把 `items` 传给 `TrContentNav`。

<demo
  vue="../../demos/content-nav/basic-source.vue"
  :vueFiles="['../../demos/content-nav/basic-source.vue']"
/>

## 展开模式

- `hover`
  默认模式。鼠标悬浮或焦点进入时自动展开，离开时自动收起。
- `manual`
  手动模式。组件不再自动展开或收起，由外部通过 `expanded` / `update:expanded` 控制。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `ContentNavItem[]` | - | 主接入方式。目录项列表，组件内部默认使用 `item.id` 匹配 `[data-content-nav-id="<id>"]`，并滚动到该标记所在节点 |
| `scrollContainer` | `HTMLElement \| null` | `null` | 滚动容器。传入后目标元素只在该容器内部解析 |
| `search` | `false \| ContentNavSearchOptions` | `false` | 是否显示搜索区，以及搜索配置 |
| `activeId` | `string` | 非受控 | 当前激活项。传入后进入受控模式 |
| `expanded` | `boolean` | - | 展开状态。在 `expandTrigger="manual"` 时作为外部控制值使用 |
| `query` | `string` | 非受控 | 搜索词。传入后进入受控模式 |
| `placement` | `'left' \| 'right'` | `'right'` | 停靠位置 |
| `expandTrigger` | `'hover' \| 'manual'` | `'hover'` | 展开触发方式。`hover` 为自动展开，`manual` 为外部控制 |
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
| `update:expanded` | `value: boolean` | 展开状态变化。`manual` 模式下可用于 `v-model:expanded`，`hover` 模式下可用于监听自动展开状态 |
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
