---
outline: [1, 3]
---

# TrContentNav 内容导航组件

`TrContentNav` 用于长内容区域的目录导航，适合和 `TrBubbleList`、`TrBubble` 或文章内容一起使用。

对于 `BubbleList` 场景，当前推荐的最小接入方式是：

1. 自己准备 `items`
2. 在 `BubbleList` 的 `after` slot 里放一个声明式锚点
3. 使用 `vContentNavAnchor` 绑定到真实 `Bubble`

## 代码示例

### 受控搜索与展开态

示例演示了以下能力：

- `v-model:active-id` 同步当前激活项
- `v-model:expanded` 控制展开态
- `v-model:query` 控制搜索词
- `scrollContainer` 显式传入滚动容器
- `vContentNavAnchor` 在 `BubbleList` 中声明式绑定锚点
- `search` 按需启用内置搜索区
- `select` 事件用于业务侧跳转反馈
- `placement` 切换左侧或右侧停靠

<demo
  vue="../../demos/content-nav/controlled-search.vue"
  :vueFiles="['../../demos/content-nav/controlled-search.vue']"
/>

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `ContentNavItem[]` | - | 目录项列表 |
| `registry` | `ContentNavRegistry` | 内部 registry | 高级用法的锚点注册表，默认不需要手动传 |
| `scrollContainer` | `HTMLElement \| null` | `null` | 滚动容器 |
| `search` | `false \| ContentNavSearchOptions` | `false` | 搜索区配置 |
| `activeId` | `string` | 非受控 | 当前项 |
| `expanded` | `boolean` | 非受控 | 展开态 |
| `query` | `string` | 非受控 | 搜索词 |
| `placement` | `'left' \| 'right'` | `'right'` | 停靠位置 |
| `emptyText` | `string` | `'No matching items'` | 搜索空结果文案 |

### ContentNavItem

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 唯一标识，同时用于匹配目标节点 |
| `label` | `string` | 目录展示文本 |
| `searchText` | `string` | 搜索时额外匹配的文本 |
| `tooltipText` | `string` | 自定义 tooltip 文案 |
| `meta` | `Record<string, unknown>` | 自定义透传数据 |

### ContentNavSearchOptions

- `placeholder`：搜索框占位文案
- `matcher`：自定义匹配器
- `clearOnCollapse`：收起时是否清空搜索词

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
| `update:activeId` | `value: string \| undefined` | 当前项变化 |
| `update:expanded` | `value: boolean` | 展开态变化 |
| `update:query` | `value: string` | 搜索词变化 |
| `select` | `item: ContentNavItem` | 点击或确认选中目录项 |
| `activate` | `item: ContentNavItem` | 目录项触发激活 |

## 推荐接入

### BubbleList 最小接入

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { vContentNavAnchor } from '@opentiny/tiny-robot'

const scrollContainerRef = ref<HTMLElement | null>(null)

const items = computed(() =>
  turns.map((turn) => ({
    id: turn.id,
    label: turn.user,
    searchText: `${turn.user} ${turn.assistant}`,
  })),
)

</script>

<template>
  <div ref="scrollContainerRef">
    <tr-bubble-list :messages="messages">
      <template #after="{ messages: groupMessages }">
        <span
          v-if="groupMessages[0]?.role === 'user'"
          v-content-nav-anchor="groupMessages[0]?.id || ''"
          aria-hidden="true"
        />
      </template>
    </tr-bubble-list>
  </div>

  <tr-content-nav :items="items" :scroll-container="scrollContainerRef" />
</template>
```

`vContentNavAnchor` 默认会把 `data-content-nav-id` 绑定到最近的 `.tr-bubble`。因此用户只需要在 slot 里放一个很轻的锚点占位元素，不需要再自己管理 registry。

### vContentNavAnchor

```vue
<script setup lang="ts">
import { vContentNavAnchor } from '@opentiny/tiny-robot'
</script>

<template>
  <span v-content-nav-anchor="'section-1'" />
</template>
```

如果你想绑定到当前元素本身，而不是最近的 `.tr-bubble`，可以传对象：

```vue
<span v-content-nav-anchor="{ id: 'section-1', closest: false }" />
```

### useContentNavRegistry

`useContentNavRegistry` 仍然可以用于更高级的自定义定位场景，但对 `BubbleList` 目录导航，通常更推荐上面的最小接入方式。

```ts
import { useContentNavRegistry } from '@opentiny/tiny-robot'

const registry = useContentNavRegistry()
registry.register('section-1', element)
```

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
