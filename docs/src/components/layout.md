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
| `mode` | 受控布局模式 | `'normal' \| 'floating'` | `-` |
| `defaultMode` | 非受控初始布局模式 | `'normal' \| 'floating'` | `'normal'` |
| `floating` | 受控浮层配置 | `LayoutFloatingConfig` | `-` |
| `defaultFloating` | 非受控初始浮层配置 | `LayoutFloatingConfig` | `-` |

#### LayoutFloatingConfig

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
| `mode` | 侧栏模式 | `'dock' \| 'drawer'` | `'dock'` |
| `open` | 受控开合状态 | `boolean` | `-` |
| `defaultOpen` | 非受控初始开合状态 | `boolean` | `left: true` / `right: false` |
| `width` | 受控 dock 宽度 | `number` | `-` |
| `defaultWidth` | 非受控初始 dock 宽度 | `number` | `-` |
| `railWidth` | dock 收起后的 rail 宽度 | `number` | `0` |
| `minWidth` | dock 最小宽度 | `number` | `left: 200` / `right: 240` |
| `maxWidth` | dock 最大宽度 | `number` | `left: 560` / `right: 640` |
| `resizable` | 是否允许 dock 改宽 | `boolean` | `false` |
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
| `default` | 侧栏内容 | `{ isOpen: boolean; isExpanded: boolean }` |

### Layout.AsideToggle

| 插槽名 | 说明 | 作用域参数 |
| ------ | ---- | ---------- |
| `default` | 自定义切换按钮内容 | `{ isOpen: boolean; isExpanded: boolean }` |

## Events

### Layout

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `update:mode` | 布局模式更新 | `(value: LayoutMode)` |
| `update:floating` | 浮层状态更新 | `(value: LayoutFloatingConfig)` |
| `aside-resize-start` | 侧栏开始改宽 | `(detail: { placement: 'left' \| 'right'; width: number })` |
| `aside-resize` | 侧栏改宽中 | `(detail: { placement: 'left' \| 'right'; width: number })` |
| `aside-resize-end` | 侧栏改宽结束 | `(detail: { placement: 'left' \| 'right'; width: number })` |
| `floating-resize-start` | 浮层开始改宽 | `(detail: { edge: 'left' \| 'right'; width: number })` |
| `floating-resize` | 浮层改宽中 | `(detail: { edge: 'left' \| 'right'; width: number })` |
| `floating-resize-end` | 浮层改宽结束 | `(detail: { edge: 'left' \| 'right'; width: number })` |

### Layout.Aside

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `update:open` | 侧栏开合状态更新 | `(value: boolean)` |
| `update:width` | dock 宽度更新 | `(value: number)` |

## 使用说明

### 状态边界

- `Layout` 根组件只管理 `mode/defaultMode` 和 `floating/defaultFloating`。
- 单侧侧栏状态由 `Layout.Aside` 自己管理，推荐直接使用 `v-model:open` 和 `v-model:width`。
- `width/defaultWidth` 只作用于 `dock` 模式，`drawer` 宽度不进入状态轴。

### Drawer 宽度

- `drawer` 宽度通过 `--tr-layout-drawer-width` 定制。
- 推荐把变量写在具体的 `Layout.Aside` class 上，便于左右两侧分别配置。

```vue
<TrLayout.Aside
  placement="right"
  mode="drawer"
  v-model:open="rightOpen"
  class="inspector-drawer"
>
  ...
</TrLayout.Aside>

<style scoped>
.inspector-drawer {
  --tr-layout-drawer-width: min(88vw, 360px);
}
</style>
```

### Dock 改宽

- 仅当侧栏有内容、`mode='dock'`、`open=true`、`resizable=true` 时，才允许拖拽改宽。
- `railWidth > 0` 时，收起后的 dock 侧栏会保留 rail；`0` 时会完全隐藏。
- 同一时刻只会保留一个 drawer 展开；打开后支持点击遮罩或按 `Escape` 关闭。

### Layout.Main

- `scrollHost` 必须指向真实滚动容器。
- 滚动容器本身需要负责 `overflow: auto` 或 `overflow-y: auto`。
- 建议滚动容器同时设置 `width: 100%`、`height: 100%`、`box-sizing: border-box`。

## CSS 变量

### 布局基础

| 变量名 | 说明 |
| ------ | ---- |
| `--tr-layout-height` | 布局高度 |
| `--tr-layout-bg` | 容器背景 |
| `--tr-layout-left-bg` | 左侧栏背景 |
| `--tr-layout-right-bg` | 右侧栏背景 |
| `--tr-layout-header-bg` | 顶部背景 |
| `--tr-layout-main-bg` | 主区背景 |
| `--tr-layout-footer-bg` | 底部背景 |
| `--tr-layout-divider-color` | 分隔线颜色 |
| `--tr-layout-overlay-bg` | drawer 遮罩颜色 |
| `--tr-layout-panel-shadow` | drawer 阴影 |
| `--tr-layout-surface-radius` | 浮层圆角 |
| `--tr-layout-surface-shadow` | 浮层阴影 |
| `--tr-layout-surface-z-index` | 浮层层级 |

### 内容与交互

| 变量名 | 说明 |
| ------ | ---- |
| `--tr-layout-content-max-width` | 内容最大宽度 |
| `--tr-layout-inner-padding-inline` | 横向内边距 |
| `--tr-layout-inner-padding-block` | 纵向内边距 |
| `--tr-layout-main-min-width` | 主区最小宽度 |
| `--tr-layout-drawer-width` | drawer 展示宽度 |
| `--tr-layout-main-scrollbar-width` | 滚动条宽度 |
| `--tr-layout-main-scrollbar-thumb-bg` | 滚动条滑块颜色 |
| `--tr-layout-main-scrollbar-thumb-bg-hover` | 滑块悬停颜色 |
| `--tr-layout-main-scrollbar-thumb-bg-active` | 滑块激活颜色 |
