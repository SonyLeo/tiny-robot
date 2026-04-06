---
outline: [1, 3]
---

# TrContentNav 内容导航组件

`TrContentNav` 用于长内容区域的目录导航，适合和 `TrBubble`、`TrBubbleList` 或文章章节内容一起使用。

组件依赖以下输入：

- `items`：目录项数据
- `registry`：`id -> HTMLElement` 的锚点注册表
- `scrollContainer` 或 `provideContentNavScrollContainer()`：滚动容器上下文

## 代码示例

### 受控搜索与展开态

示例演示了以下能力：

- `v-model:active-id` 控制当前项
- `v-model:expanded` 控制展开态
- `v-model:query` 控制搜索词
- `search` 按需启用内置搜索区
- `placement` 切换左侧或右侧停靠

外层容器样式仅用于演示滚动内容场景，不是使用组件的前置条件。

<demo
  vue="../../demos/content-nav/controlled-search.vue"
  :vueFiles="['../../demos/content-nav/controlled-search.vue']"
/>

## 详细说明

需要查看每个 prop、slot 的使用场景、设计理念和组合建议时，可参考 [TrContentNav 详细说明](./content-nav-detail)。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `ContentNavItem[]` | - | 目录项列表 |
| `registry` | `ContentNavRegistry` | 内部 registry | 锚点注册表 |
| `scrollContainer` | `HTMLElement \| null` | - | 滚动容器 |
| `search` | `false \| ContentNavSearchOptions` | `false` | 搜索区配置；传 `false` 时不渲染内置搜索区 |
| `activeId` | `string` | 非受控 | 当前项 |
| `expanded` | `boolean` | 非受控 | 展开态 |
| `query` | `string` | 非受控 | 搜索词 |
| `placement` | `'left' \| 'right'` | `'right'` | 停靠位置 |
| `collapsible` | `boolean` | `true` | 是否允许收起/展开 |
| `minItems` | `number` | `2` | 小于该数量时不渲染 |
| `mobileBehavior` | `'hidden' \| 'inline' \| 'drawer' \| 'sheet'` | `'hidden'` | 移动端展示策略 |
| `showTooltipOnTruncate` | `boolean` | `true` | 文本截断时是否显示 tooltip |
| `keyboardMode` | `'none' \| 'basic' \| 'roving'` | `'basic'` | 键盘模式 |
| `ariaLabel` | `string` | `'Content navigation'` | 可访问名称 |
| `emptyText` | `string` | `'No matching items'` | 空结果文案 |
| `floating` | `boolean` | `true` | 是否使用悬浮面板模式 |
| `resolveActive` | `ContentNavActiveResolver` | 默认 resolver | 当前项计算逻辑 |
| `jumpOffset` | `number \| (() => number)` | `0` | 跳转顶部偏移 |
| `smoothScroll` | `boolean` | `true` | 是否平滑滚动 |
| `jumpFeedback` | `ContentNavJumpFeedbackController \| false` | `createContentNavFlashFeedback()` | 跳转反馈控制器 |

### ContentNavSearchOptions

当 `search` 为对象时，可配置以下属性：

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
| `select` | `item: ContentNavItem` | 点击目录项 |
| `activate` | `item: ContentNavItem` | 目录项激活 |

## 组合 API

### useContentNavRegistry

```ts
import { useContentNavRegistry } from '@opentiny/tiny-robot'

const registry = useContentNavRegistry()
registry.register('section-1', element)
```

### provideContentNavScrollContainer

```ts
import { provideContentNavScrollContainer } from '@opentiny/tiny-robot'

provideContentNavScrollContainer(scrollContainerRef)
```

## CSS 变量

| CSS 变量 | 说明 |
| --- | --- |
| `--tr-content-nav-width-collapsed` | 折叠态宽度 |
| `--tr-content-nav-width-expanded` | 展开态宽度 |
| `--tr-content-nav-marker-size` | 目录点尺寸 |
| `--tr-content-nav-marker-track-size` | 目录点固定轨道尺寸 |
| `--tr-content-nav-bg` | 面板背景色 |
| `--tr-content-nav-border` | 面板边框色 |
| `--tr-content-nav-shadow` | 面板阴影 |
