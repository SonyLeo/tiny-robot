---
outline: [1, 3]
---

# TrContentNav 内容导航组件

`TrContentNav` 用于长内容区域和长对话场景的目录导航。

组件通过 `items` 渲染目录项，并根据 `item.id` 定位目标节点。目标节点默认使用 `data-content-nav-id` 标记。

默认情况下，组件使用 `expandTrigger="hover"`，在鼠标悬浮或焦点进入时自动展开。若需要由外部控制展开状态，可将 `expandTrigger` 设为 `manual`，并配合 `v-model:expanded` 使用；`expanded` 仅在 `manual` 模式下作为外部输入生效，`hover` 模式下仍由组件内部维护展开态。

## 接入说明

使用组件时，通常只需要准备以下内容：

- 目录项列表
- 与 `id` 对应的目标节点标记（默认使用 `data-content-nav-id`）

推荐接入方式如下：

- `TrBubbleList` 场景：通过 `BubbleProvider` 的 `boxRendererMatches.attributes` 为目标节点设置 `data-content-nav-id`
- 普通滚动容器：直接在章节节点上设置 `data-content-nav-id`

传入 `scrollContainer` 时，组件会在该容器内查找目标节点、监听滚动并同步激活项；未传入时，会自动回退到全局文档滚动，使用页面滚动完成定位与激活同步。

在 Bubble 场景下，`data-content-nav-id` 应标记在实际滚动目标节点上。使用默认 Box renderer 时，该节点通常为 `.tr-bubble__box`，而非整个 `.tr-bubble` 容器。

## 代码示例

### BubbleList 场景

在聊天场景中，建议由调用方维护 `items`，并通过 `BubbleProvider` 为目标气泡节点设置 `data-content-nav-id`。

<demo
  vue="../../demos/content-nav/controlled-search.vue"
  :vueFiles="['../../demos/content-nav/controlled-search.vue', '../../demos/content-nav/controlled-search.messages.ts']"
/>

使用建议：

- 参与导航的消息应提供稳定的 `id`
- `ContentNavItem.id` 与目标 box 根节点上的 `data-content-nav-id` 保持一致
- `label / searchText / tooltipText` 由调用方直接生成
- 如需设置 `scroll-margin-top`、点击反馈或高亮样式，建议统一作用于同一目标节点；业务侧可通过 `targetActiveClass / targetActiveDuration` 自定义目标反馈类名和保留时长
- `expandTrigger="hover"` 适用于轻量侧边目录场景

### 普通内容场景

在普通内容场景中，可直接在章节节点上设置 `data-content-nav-id`，并将对应的 `items` 传入 `TrContentNav`。示例中同时展示了点击目录项后的滚动定位与章节高亮反馈。

<demo
  vue="../../demos/content-nav/basic-source.vue"
  :vueFiles="['../../demos/content-nav/basic-source.vue', '../../demos/content-nav/basic-source.messages.ts']"
/>

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `ContentNavItem[]` | - | 目录项列表。组件默认使用 `item.id` 匹配 `[data-content-nav-id="<id>"]`，并滚动到对应节点 |
| `scrollContainer` | `HTMLElement \| null` | `null` | 滚动容器。传入后在该容器内解析目标节点并监听其滚动；未传入时回退到页面文档滚动 |
| `search` | `false \| ContentNavSearchOptions` | `false` | 搜索区配置。传入 `false` 时不显示搜索区 |
| `tooltipDelay` | `number` | `260` | tooltip 显示延迟，避免展开动画过程中短文本被误判为截断 |
| `activeId` | `string` | 非受控 | 当前激活项。传入后进入受控模式 |
| `expanded` | `boolean` | - | 展开状态。仅在 `expandTrigger="manual"` 时作为外部控制值使用 |
| `query` | `string` | 非受控 | 搜索词。传入后进入受控模式 |
| `placement` | `'left' \| 'right'` | `'right'` | 停靠位置 |
| `expandTrigger` | `'hover' \| 'manual'` | `'hover'` | 展开方式。`hover` 为自动展开，`manual` 为外部控制 |
| `targetActiveClass` | `string` | - | 点击目录项后追加到目标节点上的样式类名 |
| `targetActiveDuration` | `number` | `700` | 目标节点样式类名保留时间，单位为毫秒 |
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
| `update:expanded` | `value: boolean` | 展开状态变化。`manual` 模式下可用于 `v-model:expanded`，`hover` 模式下仅用于监听组件内部展开状态 |
| `update:query` | `value: string` | 搜索词变化 |
| `select` | `item: ContentNavItem` | 目录项被选中时触发 |
| `activate` | `item: ContentNavItem` | 目录项被激活时触发 |

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
