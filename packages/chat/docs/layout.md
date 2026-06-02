# Layout 组件

## 1. 组件定位

`Layout` 是布局壳层原语，负责：

- `normal / floating` 两种 surface 模式
- left / right aside 的 `dock / drawer / rail / hidden`
- dock aside 左右改宽
- floating surface 拖拽、左右改宽、视口边界约束
- `Layout.Main` 虚拟滚动条

对外公开 4 个布局原语：

- `Layout`
- `Layout.Main`
- `Layout.Aside`
- `Layout.AsideToggle`

## 2. 组件组成

### 2.1 `Layout`

布局入口，负责：

- surface 承载
- 左右 aside 编排
- header / main / footer slot 编排
- drawer backdrop
- aside resize
- floating drag / resize

### 2.2 `Layout.Main`

主区壳层，负责：

- 主区内容承载
- 监听真实滚动宿主
- 渲染和同步右侧虚拟滚动条

### 2.3 `Layout.Aside`

侧栏内容壳层，负责：

- 侧栏内容滚动
- `overlay / slide` 收起效果
- 向默认插槽暴露 `isExpanded`

### 2.4 `Layout.AsideToggle`

侧栏开关，负责：

- 切换对应侧栏展开状态
- 向默认插槽暴露 `isExpanded`

## 3. 公开模型

```ts
export type LayoutPlacement = 'left' | 'right'
export type LayoutAsideMode = 'dock' | 'drawer'
export type LayoutAsideCollapseEffect = 'overlay' | 'slide'
export type LayoutMode = 'normal' | 'floating'

export interface LayoutAsideConfig {
  layoutMode?: LayoutAsideMode
  expanded?: boolean
  expandedWidth?: number | string
  collapsedWidth?: number | string
  resizable?: boolean
  minExpandedWidth?: number | string
  maxExpandedWidth?: number | string
}

export interface LayoutFloatingConfig {
  x?: number
  y?: number
  width?: number | string
  height?: number | string
  draggable?: boolean
  resizable?: boolean
  minWidth?: number | string
  maxWidth?: number | string
}
```

状态语义：

- `dock`：占据布局列宽。
- `drawer`：浮在布局上层，不占据主内容宽度。
- `expanded = true`：当前展开。
- `expanded = false`：当前收起。
- `collapsedWidth > 0`：仅对 `dock` 生效，收起后保留 rail。
- `collapsedWidth` 为空或 `0`：仅对 `dock` 生效，收起后完全隐藏。
- `mode = 'normal'`：surface 在布局流内。
- `mode = 'floating'`：surface 贴住 viewport 独立定位。

## 4. Props / Emits / Slots

### 4.1 `Layout`

props：

- `mode`
- `floating`
- `leftAside`
- `rightAside`

events：

- `update:mode`
- `update:floating`
- `update:leftAside`
- `update:rightAside`
- `aside-resize-start`
- `aside-resize`
- `aside-resize-end`
- `floating-resize-start`
- `floating-resize`
- `floating-resize-end`

slots：

- `left-aside`
- `header`
- `main`
- `footer`
- `right-aside`

### 4.2 `Layout.Main`

props：

```ts
import type { ComponentPublicInstance } from 'vue'

export type LayoutMainScrollHostComponent = Pick<ComponentPublicInstance, '$el'>

export type LayoutMainScrollHost = HTMLElement | LayoutMainScrollHostComponent | null | undefined

export interface LayoutMainProps {
  scrollHost: LayoutMainScrollHost
}
```

slots：

- 默认插槽

### 4.3 `Layout.Aside`

props：

```ts
export interface LayoutAsideProps {
  placement: 'left' | 'right'
  collapseEffect?: 'overlay' | 'slide'
}
```

slot props：

```ts
{
  isExpanded: boolean
}
```

### 4.4 `Layout.AsideToggle`

props：

```ts
export interface LayoutAsideToggleProps {
  placement: 'left' | 'right'
  ariaLabel?: string
}
```

slot props：

```ts
{
  isExpanded: boolean
}
```

## 5. 使用约束

### 5.1 `scrollHost`

`Layout.Main` 必须显式传入 `scrollHost`。

`scrollHost` 必须满足：

- 它是 `Layout.Main` 内唯一真实滚动容器
- 它自己负责 `overflow: auto` 或 `overflow-y: auto`
- 它自己负责 `width: 100%`
- 推荐同时提供 `height: 100%`、`min-height: 0`、`box-sizing: border-box`
- 如果传的是组件 ref，组件根节点本身就必须是滚动容器

### 5.2 aside resize

只有同时满足以下条件才会显示 resize trigger 并允许拖拽：

- 对应插槽存在内容
- `layoutMode === 'dock'`
- `expanded === true`
- `resizable === true`

### 5.3 floating resize

当前 floating 只支持：

- 左边改宽
- 右边改宽

不支持：

- 上下缩放
- 四角缩放

### 5.4 drawer 行为

- drawer 打开时会显示 backdrop
- 按 `Escape` 会关闭当前 drawer
- 左右两侧都为 `drawer` 时，打开一侧会先关闭另一侧

## 6. 推荐模式

### 6.1 基础布局

适合：

- 有 header / main / footer 主骨架
- 左右侧栏只承担导航、历史、信息补充

建议：

- 左侧常用 `dock + rail`
- 右侧常用 `dock` 或 `drawer`

### 6.2 主区滚动

适合：

- 主区是真实长内容列表
- 希望统一隐藏原生滚动条并使用虚拟滚动条

建议：

- `Layout.Main` 内只放一个真实滚动宿主

### 6.3 精致全屏布局

如果想要类似官网全屏承载但中间内容更精致的效果，建议统一收敛内容轨道：

- `--tr-layout-content-max-width`
- `--tr-layout-header-max-width`
- `--tr-layout-main-max-width`
- `--tr-layout-footer-max-width`

这样 header / main / footer 会共用同一条居中内容宽度，而不是整块内容直接铺满。

## 7. 标准案例

### 7.1 基础布局

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Layout } from '@opentiny/tiny-robot'

const leftAside = ref({
  layoutMode: 'dock',
  expanded: true,
  expandedWidth: 280,
  collapsedWidth: 48,
  resizable: true,
})

const rightAside = ref({
  layoutMode: 'drawer',
  expanded: false,
  expandedWidth: 320,
})
</script>

<template>
  <Layout :left-aside="leftAside" :right-aside="rightAside">
    <template #left-aside>
      <Layout.Aside placement="left">
        <div>History</div>
      </Layout.Aside>
    </template>

    <template #header>
      <div>Header</div>
    </template>

    <template #main>
      <div>Main Content</div>
    </template>

    <template #footer>
      <div>Footer</div>
    </template>

    <template #right-aside>
      <Layout.Aside placement="right">
        <div>Inspector</div>
      </Layout.Aside>
    </template>
  </Layout>
</template>
```

### 7.2 主区滚动

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BubbleList, Layout, type LayoutMainScrollHost } from '@opentiny/tiny-robot'

const scrollHostRef = ref<LayoutMainScrollHost>(null)

const messages = [
  { role: 'assistant', content: 'Hello' },
  { role: 'user', content: 'Hi' },
]
</script>

<template>
  <Layout>
    <template #main>
      <Layout.Main :scroll-host="scrollHostRef">
        <BubbleList ref="scrollHostRef" :messages="messages" />
      </Layout.Main>
    </template>
  </Layout>
</template>
```

### 7.3 浮层模式

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Layout } from '@opentiny/tiny-robot'

const mode = ref<'normal' | 'floating'>('floating')

const floating = ref({
  x: 96,
  y: 72,
  width: 520,
  height: 620,
  draggable: true,
  resizable: true,
  minWidth: 360,
  maxWidth: 720,
})
</script>

<template>
  <Layout :mode="mode" :floating="floating">
    <template #main>
      <div>Main Content</div>
    </template>
  </Layout>
</template>
```

## 8. CSS 变量

布局主变量：

- `--tr-layout-height`
- `--tr-layout-content-max-width`
- `--tr-layout-inner-padding-inline`
- `--tr-layout-inner-padding-block`
- `--tr-layout-header-max-width`
- `--tr-layout-main-max-width`
- `--tr-layout-footer-max-width`
- `--tr-layout-header-padding-inline`
- `--tr-layout-main-padding-inline`
- `--tr-layout-footer-padding-inline`

aside 宽度变量：

- `--tr-layout-left-expanded-width`
- `--tr-layout-left-collapsed-width`
- `--tr-layout-right-expanded-width`
- `--tr-layout-right-collapsed-width`
- `--tr-layout-main-min-width`

surface 变量：

- `--tr-layout-surface-z-index`
- `--tr-layout-surface-radius`
- `--tr-layout-surface-shadow`
- `--tr-layout-surface-drag-hit-width`
- `--tr-layout-surface-drag-hit-height`
- `--tr-layout-surface-resize-hit-area-size`

滚动条变量：

- `--tr-layout-main-scrollbar-width`
- `--tr-layout-main-scrollbar-inline-end`
- `--tr-layout-main-scrollbar-thumb-inset`
- `--tr-layout-main-scrollbar-thumb-bg`
- `--tr-layout-main-scrollbar-thumb-bg-hover`
- `--tr-layout-main-scrollbar-thumb-bg-active`

## 9. 稳定 hook

### `data-part`

- `surface-host`
- `surface`
- `surface-drag-bar`
- `root`
- `aside`
- `aside-content`
- `backdrop`
- `main`
- `scrollbar`
- `scrollbar-thumb`
- `resize-trigger`
- `resize-trigger-indicator`
- `surface-resize-trigger`
- `surface-resize-trigger-indicator`

### 状态属性

- `data-resizing-edge`
  - 位置：`[data-part="surface"]`
  - 可选值：`left | right`
- `data-dragging`
  - 位置：`[data-part="root"]`
  - 可选值：`left | right`
- `data-placement`
  - 位置：`[data-part="aside"]`、`[data-part="aside-content"]`、`[data-part="resize-trigger"]`
  - 可选值：`left | right`
- `data-resizable`
  - 位置：`[data-part="aside"]`
- `data-edge`
  - 位置：`[data-part="surface-resize-trigger"]`
  - 可选值：`left | right`
- `data-active`
  - 位置：`[data-part="surface-resize-trigger"]`

## 10. 相关专题

- [main-scroll.md](./main-scroll.md)
- [layout-surface.md](./layout-surface.md)
- [aside-resize.md](./aside-resize.md)
