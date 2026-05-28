# Layout

`Layout` 是布局壳层原语，负责：

- `normal / floating` 两种 surface 模式
- left / right aside 的 `dock / drawer / rail / hidden`
- dock aside 左右改宽
- floating surface 拖拽、左右改宽、视口边界约束
- `Layout.Main` 虚拟滚动条

## 组件组成

- `Layout`
- `Layout.Main`
- `Layout.Aside`
- `Layout.AsideToggle`

## 最小用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BubbleList, Layout, type LayoutMainScrollHost } from '@opentiny/tiny-robot'

const scrollHostRef = ref<LayoutMainScrollHost>(null)

const messages = [
  { role: 'assistant', content: 'Hello' },
  { role: 'user', content: 'Hi' },
]

const leftAside = ref({
  layoutMode: 'dock',
  expanded: true,
  expandedWidth: 280,
  collapsedWidth: 48,
  resizable: true,
})
</script>

<template>
  <Layout :left-aside="leftAside">
    <template #left-aside>
      <Layout.Aside placement="left">
        <div>History</div>
      </Layout.Aside>
    </template>

    <template #main>
      <Layout.Main :scroll-host="scrollHostRef">
        <BubbleList ref="scrollHostRef" :messages="messages" />
      </Layout.Main>
    </template>
  </Layout>
</template>
```

## `scrollHost` 约束

- `Layout.Main` 只负责监听滚动宿主和渲染虚拟滚动条。
- 真正滚动必须由 `scrollHost` 承担。
- `scrollHost` 必须是唯一真实滚动容器。
- `scrollHost` 需要自己提供 `overflow: auto`、`width: 100%` 和可用高度。
- `scrollHost` 可以是 `HTMLElement`，也可以是带 `$el` 的组件实例。

## 稳定 hook

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

## CSS 变量

### 布局基础

- `--tr-layout-bg`
- `--tr-layout-left-bg`
- `--tr-layout-right-bg`
- `--tr-layout-header-bg`
- `--tr-layout-main-bg`
- `--tr-layout-footer-bg`
- `--tr-layout-divider-color`
- `--tr-layout-text-primary`
- `--tr-layout-transition-duration`
- `--tr-layout-transition-easing`
- `--tr-layout-panel-shadow`
- `--tr-layout-overlay-bg`
- `--tr-layout-z-index-overlay`

### 内容区域

- `--tr-layout-content-max-width`
- `--tr-layout-inner-padding-inline`
- `--tr-layout-inner-padding-block`
- `--tr-layout-header-max-width`
- `--tr-layout-main-max-width`
- `--tr-layout-footer-max-width`
- `--tr-layout-header-padding-inline`
- `--tr-layout-main-padding-inline`
- `--tr-layout-footer-padding-inline`
- `--tr-layout-header-margin-inline-start`
- `--tr-layout-header-margin-inline-end`
- `--tr-layout-main-margin-inline-start`
- `--tr-layout-main-margin-inline-end`
- `--tr-layout-footer-margin-inline-start`
- `--tr-layout-footer-margin-inline-end`

### Aside 尺寸

- `--tr-layout-left-expanded-width`
- `--tr-layout-left-collapsed-width`
- `--tr-layout-right-expanded-width`
- `--tr-layout-right-collapsed-width`
- `--tr-layout-main-min-width`

### Aside resize

- `--tr-layout-resize-trigger-size`
- `--tr-layout-resize-line-color`
- `--tr-layout-resize-line-hover-color`
- `--tr-layout-resize-line-active-color`
- `--tr-layout-resize-indicator-width`
- `--tr-layout-resize-indicator-height`
- `--tr-layout-resize-indicator-bg`
- `--tr-layout-resize-indicator-border`
- `--tr-layout-resize-indicator-active-bg`
- `--tr-layout-resize-indicator-active-border`
- `--tr-layout-resize-indicator-active-shadow`
- `--tr-layout-resize-indicator-idle-opacity`
- `--tr-layout-resize-indicator-idle-offset`

### Surface 视觉

- `--tr-layout-surface-z-index`
- `--tr-layout-surface-radius`
- `--tr-layout-surface-shadow`
- `--tr-layout-surface-drag-hit-width`
- `--tr-layout-surface-drag-hit-height`
- `--tr-layout-surface-drag-pill-width`
- `--tr-layout-surface-drag-pill-height`
- `--tr-layout-surface-drag-pill-bg`
- `--tr-layout-surface-drag-pill-shadow`
- `--tr-layout-surface-drag-hover-bg`
- `--tr-layout-surface-drag-hover-border`
- `--tr-layout-surface-drag-hover-shadow`
- `--tr-layout-surface-resize-hit-area-size`
- `--tr-layout-surface-resize-indicator-width`
- `--tr-layout-surface-resize-indicator-height`
- `--tr-layout-surface-resize-indicator-bg`
- `--tr-layout-surface-resize-indicator-border`
- `--tr-layout-surface-resize-indicator-active-bg`
- `--tr-layout-surface-resize-indicator-active-border`
- `--tr-layout-surface-resize-indicator-active-shadow`
- `--tr-layout-surface-resize-indicator-idle-opacity`
- `--tr-layout-surface-resize-indicator-hover-opacity`
- `--tr-layout-surface-resize-indicator-idle-offset`

### Main 滚动条

- `--tr-layout-main-scrollbar-width`
- `--tr-layout-main-scrollbar-inline-end`
- `--tr-layout-main-scrollbar-thumb-inset`
- `--tr-layout-main-scrollbar-thumb-bg`
- `--tr-layout-main-scrollbar-thumb-bg-hover`
- `--tr-layout-main-scrollbar-thumb-bg-active`

### 预留变量

- `--tr-layout-surface-floating-width`
- `--tr-layout-surface-floating-height`
- `--tr-layout-surface-floating-top`
- `--tr-layout-surface-floating-gap`

这些变量当前只注册默认值，floating 几何默认值仍由运行时逻辑和 `floating` prop 控制。

## 实现约定

- 组件结构样式在各自 `.vue` 的 `scoped less` 中维护。
- 公共默认变量在 `packages/components/src/styles/components/layout.less` 中注册。
- `Layout.vue` 负责 shell / surface / grid / drawer 容器。
- `LayoutAside.vue` 负责 aside 内容滚动与 `overlay / slide` 表现。
- `Layout.Main` 不再猜测 `.tr-bubble-list`，只认 `scrollHost`。
