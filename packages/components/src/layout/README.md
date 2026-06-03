# Layout

`Layout` 是聊天 / 工作区类界面的布局原语，负责：

- `normal / floating` 两种 surface 模式
- `Layout.Aside` 的 `dock / drawer / rail / hidden`
- dock aside 左右改宽
- floating surface 拖拽、左右改宽、视口边界约束
- `Layout.Main` 滚动宿主同步和内置滚动条

## 组件组成

- `Layout`
- `Layout.Main`
- `Layout.Aside`
- `Layout.AsideToggle`

## 推荐用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BubbleList, Layout, type LayoutFloatingConfig, type LayoutMainScrollHost } from '@opentiny/tiny-robot'

const scrollHostRef = ref<LayoutMainScrollHost>(null)

const leftOpen = ref(true)
const leftWidth = ref(280)

const rightOpen = ref(false)

const floating = ref<LayoutFloatingConfig>({
  x: 80,
  y: 40,
  width: 520,
  height: 620,
  draggable: true,
  resizable: true,
})

const messages = [
  { role: 'assistant', content: 'Hello' },
  { role: 'user', content: 'Hi' },
]
</script>

<template>
  <Layout :floating="floating">
    <template #left-aside>
      <Layout.Aside
        placement="left"
        mode="dock"
        v-model:open="leftOpen"
        v-model:width="leftWidth"
        :rail-width="48"
        :min-width="220"
        :max-width="420"
        :resizable="true"
      >
        <div>History</div>
      </Layout.Aside>
    </template>

    <template #main>
      <Layout.Main :scroll-host="scrollHostRef">
        <BubbleList ref="scrollHostRef" :messages="messages" />
      </Layout.Main>
    </template>

    <template #right-aside>
      <Layout.Aside placement="right" mode="drawer" v-model:open="rightOpen" class="app-drawer">
        <div>Inspector</div>
      </Layout.Aside>
    </template>
  </Layout>
</template>

<style scoped>
.app-drawer {
  --tr-layout-drawer-width: min(88vw, 360px);
}
</style>
```

## 状态边界

- `Layout` 根组件只管理根级状态：`mode/defaultMode`、`floating/defaultFloating`
- `Layout.Aside` 自己管理单侧状态：`open/defaultOpen`、`width/defaultWidth`
- `railWidth`、`minWidth`、`maxWidth`、`resizable`、`mode` 属于 aside 配置
- `drawer` 宽度通过 `--tr-layout-drawer-width` 定制，不进入 `v-model:width`

## `scrollHost` 约束

- `Layout.Main` 只负责监听滚动宿主和渲染滚动条
- 真正滚动必须由 `scrollHost` 承担
- `scrollHost` 必须指向唯一真实滚动容器
- 建议滚动宿主自己提供 `overflow: auto`、`width: 100%` 和可用高度

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
- `data-dragging`
- `data-placement`
- `data-resizable`
- `data-edge`
- `data-active`

## 稳定 CSS 变量

### 布局基础

- `--tr-layout-height`
- `--tr-layout-bg`
- `--tr-layout-left-bg`
- `--tr-layout-right-bg`
- `--tr-layout-header-bg`
- `--tr-layout-main-bg`
- `--tr-layout-footer-bg`
- `--tr-layout-divider-color`
- `--tr-layout-overlay-bg`
- `--tr-layout-panel-shadow`
- `--tr-layout-surface-radius`
- `--tr-layout-surface-shadow`
- `--tr-layout-surface-z-index`

### 内容节奏

- `--tr-layout-content-max-width`
- `--tr-layout-inner-padding-inline`
- `--tr-layout-inner-padding-block`
- `--tr-layout-main-min-width`

### Aside / Scrollbar

- `--tr-layout-drawer-width`
- `--tr-layout-main-scrollbar-width`
- `--tr-layout-main-scrollbar-thumb-bg`
- `--tr-layout-main-scrollbar-thumb-bg-hover`
- `--tr-layout-main-scrollbar-thumb-bg-active`

## 实现约定

- 组件结构样式在各自 `.vue` 的 `scoped less` 中维护
- 公共默认变量在 `packages/components/src/styles/components/layout.less` 中注册
- `Layout.vue` 负责 shell / surface / grid / drawer 容器
- `LayoutAside.vue` 负责 aside 内容滚动与 `overlay / slide` 表现
- `Layout.Main` 不再猜测 `.tr-bubble-list`，只认 `scrollHost`
