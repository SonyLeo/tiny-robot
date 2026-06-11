---
outline: [1, 3]
---

# Layout 布局

`Layout` 用来组织带有头部、主内容区、底部和左右侧栏的页面。

它覆盖三类核心场景：

- 标准页面骨架
- 可收起的左右侧栏
- 可拖动、可缩放的浮层布局

## 基础布局

基础布局适合最常见的桌面端页面：

- 顶部放工具栏或标题
- 中间放主内容
- 左右两侧按需放导航或信息栏
- 底部放状态栏或操作栏

`Layout` 本身只负责分区，不限制各区域的内容。

<demo vue="../../demos/layout/basic.vue" title="基础布局" description="最小布局示例。" />

配置详见：[Layout Props](#layout-props)、[Layout Slots](#layout-slots)

## 侧栏

### 展示形态

侧栏由 `leftAside` / `rightAside` 配置，支持两种显示方式：

- `dock`：占据页面空间，适合常驻导航、工具栏或信息栏
- `drawer`：覆盖在内容上方，适合临时面板

`drawer` 的宽度通过 `--tr-layout-drawer-width` 控制。

<demo vue="../../demos/layout/aside-modes.vue" title="显示模式" description="左侧占据页面空间，右侧覆盖在内容上方。" />

### 收起行为

`dock` 侧栏关闭时，可以完全隐藏，也可以保留一条窄栏。

- `collapsedWidth > 0`：收起后保留一条窄栏
- `collapsedWidth = 0`：收起后完全隐藏
- `overlay`：内容基本留在原位
- `slide`：内容会跟着一起移动

<demo
  vue="../../demos/layout/aside-collapse-effect.vue"
  title="收起行为"
  description="对比 overlay 和 slide 两种收起动画。"
/>

### 状态控制

推荐把 `leftAside` / `rightAside` 作为侧栏状态入口。`left-aside` / `right-aside` 插槽会提供当前状态和操作方法。

受控写法下，外部不回写，界面不会变化。

<demo
  vue="../../demos/layout/aside-slot-props.vue"
  title="状态控制"
  description="通过 leftAside、rightAside 和插槽控制侧栏状态。"
/>

插槽参数字段详见 [LayoutAsideSlotProps](#layoutasideslotprops)。

### 宽度调整

`resizable` 可以开启 `dock` 侧栏的拖拽改宽，宽度范围由 `minExpandedWidth` 和 `maxExpandedWidth` 控制。

<demo vue="../../demos/layout/aside-resizable.vue" title="宽度调整" description="拖动分隔线调整 dock 侧栏宽度。" />

配置详见：[Layout Props](#layout-props)、[Layout Slots](#layout-slots)、[Layout Events](#layout-layout-events)、[CSS 变量](#layout-css-content)

## 主区滚动

`Layout.Main` 用来接管主区滚动条，但它不制造滚动。真正发生滚动的仍然是你传入的 `scrollHost`。

:::tip `scrollHost` 怎么理解
把 `scrollHost` 当成“真实出现滚动条的那个元素”。

- 如果你自己写的是 `div`，就把 `div` 的 `ref` 传进来
- 如果你传的是组件 `ref`，这个组件的根元素需要就是滚动容器
:::

使用时注意三点：

- `scrollHost` 必须指向真实滚动容器
- 滚动容器本身需要设置 `overflow: auto` 或 `overflow-y: auto`
- 建议同时设置 `width: 100%`、`height: 100%`、`box-sizing: border-box`

`Layout.Main` 会统一处理主区滚动条的展示，因此不建议再额外定制 `scrollHost` 的滚动条样式。

<demo
  vue="../../demos/layout/main-scroll.vue"
  :vueFiles="[
    '../../demos/layout/main-scroll.vue',
    '../../demos/layout/main-scroll-bubble.vue',
    '../../demos/layout/main-scroll-div.vue'
  ]"
  title="主区滚动"
  description="切换查看 BubbleList 和普通 div 两种 scrollHost 写法。"
/>

配置详见：[Layout.Main Props](#layout-main-props)、[CSS 变量](#layout-css-content)

## 浮层

适合临时面板、对话工作区等悬浮场景。相关配置只在 `mode="floating"` 时生效。

### 基本用法

`defaultFloatingState` 用来设置初始位置和大小，`floatingOptions` 用来控制是否可拖动、是否可缩放，以及尺寸范围。

<demo
  vue="../../demos/layout/floating.vue"
  title="基本用法"
  description="通过 defaultFloatingState 设置初始位置和大小，通过 floatingOptions 控制拖动和缩放。"
/>

### 状态控制

`floatingState` 配合 `update:floatingState` 可以从外部控制浮层的位置和大小。外部不回写，界面不会变化。

`placement` 为 `center` 时，第一次拖动或缩放后，会自动换成最近的角位置。

<demo
  vue="../../demos/layout/floating-controlled.vue"
  title="状态控制"
  description="通过 floatingState 和 update:floatingState 回写浮层状态。"
/>

配置详见：[Layout Props](#layout-props)、[Types](#types)、[Layout Events](#layout-layout-events)、[CSS 变量](#layout-css-basics)

## Props

<a id="layout-props"></a>
### Layout

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `mode` | 布局模式；`normal` 参与普通布局，`floating` 会脱离普通布局并 Teleport 到 `body` | `'normal' \| 'floating'` | `'normal'` |
| `leftAside` | 左侧栏配置 | `LayoutAsideProps` | `-` |
| `rightAside` | 右侧栏配置 | `LayoutAsideProps` | `-` |
| `floatingState` | 受控浮层状态，需配合 `update:floatingState` 回写 | `LayoutFloatingState` | `-` |
| `defaultFloatingState` | 非受控浮层初始状态，仅首次挂载读取一次 | `LayoutFloatingState` | `-` |
| `floatingOptions` | 浮层拖拽、缩放和尺寸约束配置 | `LayoutFloatingOptions` | `-` |

<a id="layout-main-props"></a>
### Layout.Main

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `scrollHost` | 真实滚动容器的元素或组件实例 ref | `HTMLElement \| ComponentPublicInstance \| null` | `-` |

<a id="layout-aside-props"></a>
### Layout.Aside

推荐入口是根组件的 `leftAside` / `rightAside` + slot props；`Layout.Aside` 更适合作为可选的侧栏内容容器使用，实际开关、宽度和收起效果仍建议由根组件管理。

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `placement` | 当前容器对应的侧栏位置 | `'left' \| 'right'` | `-` |
| `collapseEffect` | 可选内容容器的收起动画；通常优先使用 `leftAside` / `rightAside` 上的同名配置 | `'overlay' \| 'slide'` | `'overlay'` |

<a id="layout-aside-toggle-props"></a>
### Layout.AsideToggle

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `placement` | 控制的侧栏位置 | `'left' \| 'right'` | `-` |
| `ariaLabel` | 切换按钮的无障碍文本 | `string` | `left: 'Toggle left panel'` / `right: 'Toggle right panel'` |

## Slots

<a id="layout-slots"></a>
### Layout

| 插槽名 | 说明 | 作用域参数 |
| ------ | ---- | ---------- |
| `left-aside` | 左侧栏内容 | `LayoutAsideSlotProps` |
| `header` | 顶部区域 | `-` |
| `main` | 主区内容 | `-` |
| `footer` | 底部区域 | `-` |
| `right-aside` | 右侧栏内容 | `LayoutAsideSlotProps` |

### Layout.Aside

| 插槽名 | 说明 | 作用域参数 |
| ------ | ---- | ---------- |
| `default` | 侧栏内容 | `{ isOpen: boolean }` |

### Layout.AsideToggle

| 插槽名 | 说明 | 作用域参数 |
| ------ | ---- | ---------- |
| `default` | 自定义切换按钮内容 | `{ isOpen: boolean }` |

## Events

<a id="layout-layout-events"></a>
### Layout

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `update:leftAside` | 左侧栏运行时状态变化 | `(value: LayoutAsideState)` |
| `update:rightAside` | 右侧栏运行时状态变化 | `(value: LayoutAsideState)` |
| `update:floatingState` | 浮层位置或尺寸变化 | `(value: LayoutFloatingState)` |
| `aside-resize-start` | 开始调整侧栏宽度 | `(detail: LayoutAsideResizeEventDetail)` |
| `aside-resize` | 调整侧栏宽度时持续触发 | `(detail: LayoutAsideResizeEventDetail)` |
| `aside-resize-end` | 结束调整侧栏宽度 | `(detail: LayoutAsideResizeEventDetail)` |
| `floating-drag-start` | 开始拖动浮层 | `(detail: LayoutFloatingDragEventDetail)` |
| `floating-drag` | 拖动浮层时持续触发 | `(detail: LayoutFloatingDragEventDetail)` |
| `floating-drag-end` | 结束拖动浮层 | `(detail: LayoutFloatingDragEventDetail)` |
| `floating-resize-start` | 开始调整浮层尺寸 | `(detail: LayoutFloatingResizeEventDetail)` |
| `floating-resize` | 调整浮层尺寸时持续触发 | `(detail: LayoutFloatingResizeEventDetail)` |
| `floating-resize-end` | 结束调整浮层尺寸 | `(detail: LayoutFloatingResizeEventDetail)` |

`update:leftAside` / `update:rightAside` 只回传 `LayoutAsideState`，也就是当前运行时可控字段 `open` 和 `expandedWidth`。受控写法下，需要外部把它合并回 `leftAside` / `rightAside`。

#### 侧栏 resize 事件字段

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `placement` | 当前被调整的侧栏位置 | `'left' \| 'right'` |
| `width` | 当前侧栏宽度 | `number` |

#### 浮层 drag 事件字段

`floating-drag-start` / `floating-drag` / `floating-drag-end` 直接返回 `LayoutFloatingState`。

#### 浮层 resize 事件字段

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `handle` | 当前拖动的边或角 | `'n' \| 's' \| 'e' \| 'w' \| 'ne' \| 'nw' \| 'se' \| 'sw'` |
| `placement` | 当前锚点位置 | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' \| 'center'` |
| `offsetX` | 横向偏移；`center` 下不参与定位 | `number` |
| `offsetY` | 纵向偏移；`center` 下不参与定位 | `number` |
| `width` | 当前宽度 | `number` |
| `height` | 当前高度 | `number` |

<a id="types"></a>
## Types

### LayoutAsideProps

| 字段 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `mode` | 侧栏模式 | `'dock' \| 'drawer'` | `'dock'` |
| `open` | 受控开关状态 | `boolean` | `-` |
| `defaultOpen` | 非受控初始开关状态 | `boolean` | `left: true` / `right: false` |
| `expandedWidth` | 受控展开宽度，仅 `dock` 生效 | `number` | `-` |
| `defaultExpandedWidth` | 非受控初始展开宽度，仅 `dock` 生效 | `number` | `-` |
| `minExpandedWidth` | 最小展开宽度，仅 `dock` 生效 | `number` | `left: 200` / `right: 240` |
| `maxExpandedWidth` | 最大展开宽度，仅 `dock` 生效 | `number` | `left: 560` / `right: 640` |
| `collapsedWidth` | 收起后保留的窄栏宽度，仅 `dock` 生效 | `number` | `0` |
| `collapseEffect` | `dock` 收起到窄栏时的内容动画 | `'overlay' \| 'slide'` | `'overlay'` |
| `resizable` | 是否允许拖拽改宽，仅 `dock` 生效 | `boolean` | `false` |

### LayoutAsideState

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `open` | 当前开关状态 | `boolean` |
| `expandedWidth` | 当前展开宽度 | `number \| undefined` |

### LayoutAsideSlotProps

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `placement` | 侧栏位置 | `'left' \| 'right'` |
| `mode` | 当前侧栏模式 | `'dock' \| 'drawer'` |
| `open` | 当前是否展开 | `boolean` |
| `expandedWidth` | 当前展开宽度 | `number \| undefined` |
| `collapsedWidth` | 收起后窄栏宽度 | `number \| undefined` |
| `resizable` | 是否允许拖拽改宽 | `boolean` |
| `toggle` | 切换开关 | `() => void` |
| `setOpen` | 直接设置开关状态 | `(next: boolean) => void` |
| `setExpandedWidth` | 直接设置展开宽度 | `(next: number) => void` |

<a id="layout-floating-fields"></a>
### LayoutFloatingState

| 字段 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `placement` | 浮层锚点位置 | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' \| 'center'` | `'center'` |
| `offsetX` | 横向偏移；`center` 下不参与定位 | `number` | `24` |
| `offsetY` | 纵向偏移；`center` 下不参与定位 | `number` | `24` |
| `width` | 浮层宽度；非受控时表示初始值，受控时表示当前值 | `number` | `420` |
| `height` | 浮层高度；非受控时表示初始值，受控时表示当前值 | `number` | `560` |

### LayoutFloatingOptions

| 字段 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `draggable` | 是否允许拖动浮层 | `boolean` | `true` |
| `resizable` | 是否允许通过 8 个方向手柄调整尺寸 | `boolean` | `false` |
| `minWidth` | 最小宽度 | `number` | `320` |
| `maxWidth` | 最大宽度 | `number` | `视口宽度` |
| `minHeight` | 最小高度 | `number` | `240` |
| `maxHeight` | 最大高度 | `number` | `视口高度` |

## CSS 变量

<a id="layout-css-basics"></a>
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

<a id="layout-css-content"></a>
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
