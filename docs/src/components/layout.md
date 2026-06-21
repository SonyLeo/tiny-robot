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

`Layout` 用于定义页面结构，区域中的具体内容可按需配置。

<demo vue="../../demos/layout/basic.vue" title="基础布局" description="最小布局示例。" />

## 侧栏

### 展示形态

用 `leftAside` / `rightAside` 配置侧栏。

- `dock`：占据页面空间
- `drawer`：覆盖在内容上方

`drawer` 的宽度通过 `--tr-layout-drawer-width` 控制。

<demo vue="../../demos/layout/aside-modes.vue" title="显示模式" description="左侧占据页面空间，右侧覆盖在内容上方。" />

### 收起行为

`collapsedWidth` 控制收起后还保留多少宽度，`collapseEffect` 控制收起时的动画效果。

- `collapsedWidth > 0`：收起后保留一条窄栏
- `collapsedWidth = 0`：收起后完全隐藏
- `overlay`：内容留在原位
- `slide`：内容跟着一起移动

<demo
  vue="../../demos/layout/aside-collapse-effect.vue"
  title="收起行为"
  description="对比 overlay 和 slide 两种收起动画。"
/>

### 状态控制

用 `leftAside` / `rightAside` 控制开关和宽度。

侧栏内容通过 `left-aside` / `right-aside` 提供，插槽本身不暴露侧栏状态。

由外部控制时，状态变化后要同步更新传入值。侧栏内部需要切换开关时，可以使用 `Layout.AsideToggle`，它的默认插槽会提供当前开关状态。

<demo
  vue="../../demos/layout/aside-slot-props.vue"
  title="状态控制"
  description="通过 leftAside、rightAside 和事件同步侧栏状态。"
/>

### 宽度调整

`resizable` 可以开启 `dock` 侧栏的拖拽改宽，宽度范围由 `minExpandedWidth` 和 `maxExpandedWidth` 控制。

<demo vue="../../demos/layout/aside-resizable.vue" title="宽度调整" description="拖动分隔线查看当前宽度和边界。" />

## 主区滚动

`Layout.ProxyScrollbar` 用来显示主区滚动条，`scrollTarget` 指向实际滚动的内容区域。

> 适合消息区居中的对话页：内容可以居中，滚动条仍固定在主区右侧，视觉更整齐。

- `scrollTarget` 传实际滚动元素，或对应组件实例的 `ref`
- 该元素需自行设置尺寸、`box-sizing` 和滚动样式
- 使用 `Layout.ProxyScrollbar` 时，建议同时隐藏该元素的原生滚动条，例如：

```css
.scroll-host {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scroll-host::-webkit-scrollbar {
  display: none;
}
```

<demo
  vue="../../demos/layout/main-scroll.vue"
  :vueFiles="[
    '../../demos/layout/main-scroll.vue',
    '../../demos/layout/main-scroll-bubble.vue',
    '../../demos/layout/main-scroll-div.vue'
  ]"
  title="主区滚动"
  description="演示内容区居中后，滚动条仍固定在主区右侧。"
/>

## 浮层

适合临时面板或悬浮工作区，只在 `mode="floating"` 时生效。

### 基本用法

`defaultFloatingState` 设置初始位置和大小，`floatingOptions` 设置拖动、缩放和尺寸范围。

- `defaultFloatingState`：只设置初始值
- `floatingState`：由外部控制位置和大小

传 `floatingState` 时，需要在 `update:floatingState` 中同步最新值。

<demo
  vue="../../demos/layout/floating.vue"
  title="基本用法"
  description="打开时通过 defaultFloatingState 设置初始位置和大小。"
/>

### 浮层工作区

浮层里同样可以放入侧栏、头部和主区。常见用法是把左右两侧都做成按需展开的 drawer。

<demo
  vue="../../demos/layout/floating-panels.vue"
  title="浮层工作区"
  description="在浮层里组合左右 drawer，适合临时工作区、对话面板或侧边操作台。"
/>

## Props

<a id="layout-props"></a>
### Layout

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `mode` | 布局模式；`normal` 参与普通布局，`floating` 会脱离普通布局，不占原来的位置空间 | `'normal' \| 'floating'` | `'normal'` |
| `leftAside` | 左侧栏配置 | `LayoutAsideProps` | `-` |
| `rightAside` | 右侧栏配置 | `LayoutAsideProps` | `-` |
| `floatingState` | 受控浮层状态，需配合 `update:floatingState` 回写 | `LayoutFloatingState` | `-` |
| `defaultFloatingState` | 非受控浮层初始状态，仅首次挂载读取一次 | `LayoutFloatingState` | `-` |
| `floatingOptions` | 浮层拖拽、缩放和尺寸约束配置 | `LayoutFloatingOptions` | `-` |

<a id="layout-proxy-scrollbar-props"></a>
### Layout.ProxyScrollbar

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `scrollTarget` | 真实滚动容器的元素，或对应组件实例的 ref | `LayoutScrollTarget` | `-` |

<a id="layout-aside-toggle-props"></a>
### Layout.AsideToggle

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `side` | 控制的侧栏位置 | `'left' \| 'right'` | `-` |

它是一个现成的开关按钮，只能在 `Layout` 内部使用，通常放在 `left-aside` / `right-aside` 插槽中。需要自己控制侧栏内容和交互时，优先用 `left-aside` / `right-aside` 插槽。

## Slots

<a id="layout-slots"></a>
### Layout

| 插槽名 | 说明 | 作用域参数 |
| ------ | ---- | ---------- |
| `left-aside` | 左侧栏内容 | `-` |
| `header` | 顶部区域 | `-` |
| `main` | 主区内容 | `-` |
| `footer` | 底部区域 | `-` |
| `right-aside` | 右侧栏内容 | `-` |

### Layout.AsideToggle

| 插槽名 | 说明 | 作用域参数 |
| ------ | ---- | ---------- |
| `default` | 自定义切换按钮内容 | `{ isOpen: boolean }` |

## Events

<a id="layout-layout-events"></a>
### Layout

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `update:floatingState` | 浮层位置或尺寸变化 | `(value: LayoutFloatingState)` |
| `aside-open-change` | 侧栏开关变化 | `(detail: LayoutAsideOpenEventDetail)` |
| `left-aside-open-change` | 左侧栏开关变化 | `(detail: LayoutAsideSideOpenEventDetail)` |
| `right-aside-open-change` | 右侧栏开关变化 | `(detail: LayoutAsideSideOpenEventDetail)` |
| `aside-resize-start` | 开始调整侧栏宽度 | `(detail: LayoutAsideResizeEventDetail)` |
| `aside-resize` | 调整侧栏宽度时持续触发 | `(detail: LayoutAsideResizeEventDetail)` |
| `aside-resize-end` | 结束调整侧栏宽度 | `(detail: LayoutAsideResizeEventDetail)` |
| `left-aside-resize-start` | 开始调整左侧栏宽度 | `(detail: LayoutAsideSideResizeEventDetail)` |
| `left-aside-resize` | 调整左侧栏宽度时持续触发 | `(detail: LayoutAsideSideResizeEventDetail)` |
| `left-aside-resize-end` | 结束调整左侧栏宽度 | `(detail: LayoutAsideSideResizeEventDetail)` |
| `right-aside-resize-start` | 开始调整右侧栏宽度 | `(detail: LayoutAsideSideResizeEventDetail)` |
| `right-aside-resize` | 调整右侧栏宽度时持续触发 | `(detail: LayoutAsideSideResizeEventDetail)` |
| `right-aside-resize-end` | 结束调整右侧栏宽度 | `(detail: LayoutAsideSideResizeEventDetail)` |
| `floating-drag-start` | 开始拖动浮层 | `(detail: LayoutFloatingDragEventDetail)` |
| `floating-drag` | 拖动浮层时持续触发 | `(detail: LayoutFloatingDragEventDetail)` |
| `floating-drag-end` | 结束拖动浮层 | `(detail: LayoutFloatingDragEventDetail)` |
| `floating-resize-start` | 开始调整浮层尺寸 | `(detail: LayoutFloatingResizeEventDetail)` |
| `floating-resize` | 调整浮层尺寸时持续触发 | `(detail: LayoutFloatingResizeEventDetail)` |
| `floating-resize-end` | 结束调整浮层尺寸 | `(detail: LayoutFloatingResizeEventDetail)` |

#### 侧栏 open 事件字段

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `side` | 当前侧栏位置，仅 `aside-open-change` 返回 | `'left' \| 'right'` |
| `open` | 当前是否展开 | `boolean` |

#### 侧栏 resize 事件字段

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `side` | 当前被调整的侧栏位置，仅 `aside-resize-*` 返回 | `'left' \| 'right'` |
| `expandedWidth` | 当前侧栏宽度 | `number` |

#### 浮层 drag 事件字段

`floating-drag-start` / `floating-drag` / `floating-drag-end` 会返回当前浮层的位置和大小。

#### 浮层 resize 事件字段

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `handle` | 当前拖动的边或角 | `'s' \| 'e' \| 'w' \| 'ne' \| 'nw' \| 'se' \| 'sw'` |
| `placement` | 当前锚点位置 | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' \| 'center'` |
| `offsetX` | 横向偏移；`placement` 为 `center` 时不生效 | `number` |
| `offsetY` | 纵向偏移；`placement` 为 `center` 时不生效 | `number` |
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

### LayoutAsideOpenEventDetail

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `side` | 当前侧栏位置 | `'left' \| 'right'` |
| `open` | 当前是否展开 | `boolean` |

### LayoutAsideSideOpenEventDetail

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `open` | 当前是否展开 | `boolean` |

### LayoutAsideResizeEventDetail

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `side` | 当前侧栏位置 | `'left' \| 'right'` |
| `expandedWidth` | 当前侧栏宽度 | `number` |

### LayoutAsideSideResizeEventDetail

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `expandedWidth` | 当前侧栏宽度 | `number` |

### LayoutScrollTarget

`HTMLElement | Pick<ComponentPublicInstance, '$el'> | null | undefined`

<a id="layout-floating-fields"></a>
### LayoutFloatingState

| 字段 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `placement` | 浮层位置 | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' \| 'center'` | `'center'` |
| `offsetX` | 横向偏移；`placement` 为 `center` 时不生效 | `number` | `24` |
| `offsetY` | 纵向偏移；`placement` 为 `center` 时不生效 | `number` | `24` |
| `width` | 浮层宽度；非受控时表示初始值，受控时表示当前值 | `number` | `420` |
| `height` | 浮层高度；非受控时表示初始值，受控时表示当前值 | `number` | `560` |

### LayoutFloatingOptions

| 字段 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `draggable` | 是否允许拖动浮层 | `boolean` | `true` |
| `resizable` | 是否允许通过浮层边缘手柄调整尺寸 | `boolean` | `false` |
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
| `--tr-layout-left-aside-bg` | 左侧栏背景 |
| `--tr-layout-right-aside-bg` | 右侧栏背景 |
| `--tr-layout-header-bg` | 顶部背景 |
| `--tr-layout-main-bg` | 主区背景 |
| `--tr-layout-footer-bg` | 底部背景 |
| `--tr-layout-divider-color` | 分隔线颜色 |
| `--tr-layout-overlay-bg` | drawer 遮罩颜色 |
| `--tr-layout-panel-shadow` | drawer 阴影 |
| `--tr-layout-floating-radius` | 浮层圆角 |
| `--tr-layout-floating-shadow` | 浮层阴影 |
| `--tr-layout-floating-z-index` | 浮层层级 |

<a id="layout-css-content"></a>
### 内容与交互

| 变量名 | 说明 |
| ------ | ---- |
| `--tr-layout-main-min-width` | 主区最小宽度 |
| `--tr-layout-drawer-width` | drawer 展示宽度 |
| `--tr-layout-main-scrollbar-width` | 滚动条宽度 |
| `--tr-layout-main-scrollbar-thumb-bg` | 滚动条滑块颜色 |
| `--tr-layout-main-scrollbar-thumb-bg-hover` | 滑块悬停颜色 |
| `--tr-layout-main-scrollbar-thumb-bg-active` | 滑块激活颜色 |
