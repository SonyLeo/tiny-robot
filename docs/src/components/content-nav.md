---
outline: [1, 3]
---

# TrContentNav 内容导航组件

`TrContentNav` 用于长内容区域的目录导航，适合和 `TrBubble`、`TrBubbleList` 或文章章节内容一起使用。

这次 API 收敛后的原则很明确：

- 组件只保留目录导航的核心语义能力
- 样式型差异交给业务 CSS
- 页面判断型差异交给业务逻辑
- 高级滚动策略交给受控状态或业务层组合

## 代码示例

### 受控搜索与展开态

示例演示了以下能力：

- 业务侧同步 `activeId`
- `v-model:expanded` 控制展开态
- `v-model:query` 控制搜索词
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
| `registry` | `ContentNavRegistry` | 内部 registry | 锚点注册表 |
| `scrollContainer` | `HTMLElement \| null` | 注入值或 `null` | 滚动容器 |
| `search` | `false \| ContentNavSearchOptions` | `false` | 搜索区配置 |
| `activeId` | `string` | 非受控 | 当前项 |
| `expanded` | `boolean` | 非受控 | 展开态 |
| `query` | `string` | 非受控 | 搜索词 |
| `placement` | `'left' \| 'right'` | `'right'` | 停靠位置 |
| `ariaLabel` | `string` | `'Content navigation'` | 可访问名称 |
| `emptyText` | `string` | `'No matching items'` | 搜索空结果文案 |

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
