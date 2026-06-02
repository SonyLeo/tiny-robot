---
outline: [1, 3]
---

# Layout 布局

`Layout` 用于组织聊天类界面的整体骨架，支持头部、主区、底部、左右侧栏，以及普通模式与浮层模式切换。

## 代码示例

### 基础布局

适合带有 header / main / footer 和左右侧栏的标准界面。

<demo vue="../../demos/layout/basic.vue" :vueFiles="['../../demos/layout/basic.vue', '../../demos/layout/demo.css']" title="基础布局" description="左侧导航、主区内容、右侧信息栏的基础布局示例。" />

### 侧栏形态

演示 `rail`、`drawer` 和 `Layout.AsideToggle` 的默认行为。

<demo vue="../../demos/layout/aside-modes.vue" :vueFiles="['../../demos/layout/aside-modes.vue', '../../demos/layout/demo.css']" title="侧栏形态" description="左侧 dock + rail、右侧 drawer，以及 AsideToggle 默认文案与关闭行为。" />

### 主区滚动

`Layout.Main` 负责同步真实滚动容器，并渲染内置滚动条。

<demo vue="../../demos/layout/main-scroll.vue" :vueFiles="['../../demos/layout/main-scroll.vue', '../../demos/layout/demo.css']" title="主区滚动" description="主区内容较长时，使用 Layout.Main 承载滚动宿主。" />

### 浮层模式

通过 `mode="floating"` 和 `floating` 配置启用浮层布局，支持拖拽和左右改宽。

<demo vue="../../demos/layout/floating.vue" :vueFiles="['../../demos/layout/floating.vue', '../../demos/layout/demo.css']" title="浮层模式" description="演示可拖拽、可改宽的浮层布局。" />

## Props

### Layout

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `mode` | 布局模式 | `'normal' \| 'floating'` | `'normal'` |
| `floating` | 浮层配置 | `LayoutFloatingConfig` | `-` |
| `leftAside` | 左侧栏配置 | `LayoutAsideConfig` | `-` |
| `rightAside` | 右侧栏配置 | `LayoutAsideConfig` | `-` |

#### LayoutAsideConfig

以下默认值中的 left / right，表示作为 `leftAside` / `rightAside` 使用时的运行时默认值。

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `layoutMode` | 侧栏模式 | `'dock' \| 'drawer'` | `'dock'` |
| `expanded` | 是否展开 | `boolean` | `left: true` / `right: false` |
| `expandedWidth` | 展开宽度 | `number \| string` | `left: '300px'` / `right: '320px'` |
| `collapsedWidth` | 收起宽度，仅 `dock` 生效 | <code>number \| `${number}px`</code> | `0` |
| `resizable` | 是否允许改宽 | `boolean` | `false` |
| `minExpandedWidth` | 最小展开宽度 | `number \| string` | `left: '200px'` / `right: '240px'` |
| `maxExpandedWidth` | 最大展开宽度 | `number \| string` | `left: '560px'` / `right: '640px'` |

#### LayoutFloatingConfig

当 `mode='floating'` 且字段缺省时，会按下列运行时默认值补齐。

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `x` | 浮层横向位置 | `number` | `视口内水平居中` |
| `y` | 浮层纵向位置 | `number` | `24` |
| `width` | 浮层宽度 | `number \| string` | `420` |
| `height` | 浮层高度 | `number \| string` | `'80vh'` |
| `draggable` | 是否可拖拽 | `boolean` | `true` |
| `resizable` | 是否可改宽 | `boolean` | `false` |
| `minWidth` | 最小宽度 | `number \| string` | `320` |
| `maxWidth` | 最大宽度 | `number \| string` | `视口宽度 - 48px` |

### Layout.Main

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `scrollHost` | 真实滚动宿主元素或组件 ref | `HTMLElement \| ComponentPublicInstance \| null` | `-` |

### Layout.Aside

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `placement` | 侧栏位置 | `'left' \| 'right'` | `-` |
| `collapseEffect` | 收起效果 | `'overlay' \| 'slide'` | `'overlay'` |

### Layout.AsideToggle

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `placement` | 控制的侧栏位置 | `'left' \| 'right'` | `-` |
| `ariaLabel` | 切换按钮无障碍文本 | `string` | `left: 'Toggle left panel'` / `right: 'Toggle right panel'` |

## Slots

### Layout

| 插槽名 | 说明 |
| ------ | ---- |
| `left-aside` | 左侧栏内容 |
| `header` | 顶部区域 |
| `main` | 主区内容 |
| `footer` | 底部区域 |
| `right-aside` | 右侧栏内容 |

### Layout.Aside

| 插槽名 | 说明 | 作用域参数 |
| ------ | ---- | ---------- |
| `default` | 侧栏内容 | `{ isExpanded: boolean }` |

### Layout.AsideToggle

| 插槽名 | 说明 | 作用域参数 |
| ------ | ---- | ---------- |
| `default` | 自定义切换按钮内容 | `{ isExpanded: boolean }` |

## Events

### Layout

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `update:mode` | 布局模式更新 | `(value: LayoutMode \| undefined)` |
| `update:floating` | 浮层状态更新 | `(value: LayoutFloatingConfig \| undefined)` |
| `update:leftAside` | 左侧栏状态更新 | `(value: LayoutAsideConfig \| undefined)` |
| `update:rightAside` | 右侧栏状态更新 | `(value: LayoutAsideConfig \| undefined)` |
| `aside-resize-start` | 侧栏开始改宽 | `(detail: { placement: 'left' \| 'right'; width: number })` |
| `aside-resize` | 侧栏改宽中 | `(detail: { placement: 'left' \| 'right'; width: number })` |
| `aside-resize-end` | 侧栏改宽结束 | `(detail: { placement: 'left' \| 'right'; width: number })` |
| `floating-resize-start` | 浮层开始改宽 | `(detail: { edge: 'left' \| 'right'; width: number })` |
| `floating-resize` | 浮层改宽中 | `(detail: { edge: 'left' \| 'right'; width: number })` |
| `floating-resize-end` | 浮层改宽结束 | `(detail: { edge: 'left' \| 'right'; width: number })` |

## 使用说明

### Layout.Main

- `scrollHost` 必须指向真实滚动容器。
- 滚动容器本身需要负责 `overflow: auto` 或 `overflow-y: auto`。
- 建议滚动容器同时设置 `width: 100%`、`height: 100%`、`box-sizing: border-box`。

### 受控状态

- 父组件传入 `leftAside`、`rightAside`、`floating` 后，如需把 Toggle、拖拽、改宽结果同步回父状态，应监听对应的 `update:*` 事件并回写。

### 侧栏改宽

- 仅当侧栏有内容、`layoutMode='dock'`、`expanded=true`、`resizable=true` 时，才允许拖拽改宽。
- `collapsedWidth` 仅在传入正数或正的 `px` 字符串时才会被识别为 rail；`0`、空值或复杂表达式会在收起时完全隐藏。
- `drawer` 打开后支持点击遮罩或按 `Escape` 关闭；同一时刻只会保留一个 drawer 展开。

### 浮层改宽

- 当前仅支持左边和右边改宽。

## CSS 变量

### 布局

| 变量名 | 说明 |
| ------ | ---- |
| `--tr-layout-height` | 布局高度 |
| `--tr-layout-content-max-width` | 内容最大宽度 |
| `--tr-layout-inner-padding-inline` | 横向内边距 |
| `--tr-layout-inner-padding-block` | 纵向内边距 |
| `--tr-layout-header-max-width` | 顶部最大宽度 |
| `--tr-layout-main-max-width` | 主区最大宽度 |
| `--tr-layout-footer-max-width` | 底部最大宽度 |
| `--tr-layout-header-padding-inline` | 顶部横向内边距 |
| `--tr-layout-main-padding-inline` | 主区横向内边距 |
| `--tr-layout-footer-padding-inline` | 底部横向内边距 |

### 侧栏

| 变量名 | 说明 |
| ------ | ---- |
| `--tr-layout-left-expanded-width` | 左侧栏展开宽度 |
| `--tr-layout-left-collapsed-width` | 左侧栏收起宽度 |
| `--tr-layout-right-expanded-width` | 右侧栏展开宽度 |
| `--tr-layout-right-collapsed-width` | 右侧栏收起宽度 |
| `--tr-layout-main-min-width` | 主区最小宽度 |

### 浮层与滚动条

| 变量名 | 说明 |
| ------ | ---- |
| `--tr-layout-surface-z-index` | 浮层层级 |
| `--tr-layout-surface-radius` | 浮层圆角 |
| `--tr-layout-surface-shadow` | 浮层阴影 |
| `--tr-layout-main-scrollbar-width` | 滚动条宽度 |
| `--tr-layout-main-scrollbar-inline-end` | 滚动条右侧偏移 |
| `--tr-layout-main-scrollbar-thumb-bg` | 滚动条滑块颜色 |
| `--tr-layout-main-scrollbar-thumb-bg-hover` | 滑块悬停颜色 |
| `--tr-layout-main-scrollbar-thumb-bg-active` | 滑块激活颜色 |
