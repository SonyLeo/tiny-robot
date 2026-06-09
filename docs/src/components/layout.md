---
outline: [1, 3]
---

# Layout 布局

`Layout` 用来组织带有头部、主内容区、底部和左右侧栏的页面。适合聊天页、工作台、详情页这类结构固定的界面。

它主要解决四类场景：

- 标准页面骨架
- 可收起的左右侧栏
- 主区滚动同步
- 可拖动、可改宽的浮层布局

## 受控与非受控

`Layout` 和 `Layout.Aside` 都支持非受控初始化和受控同步两种写法：

- 非受控：使用 `defaultFloating`、`defaultOpen`、`defaultWidth` 提供初始值
- 受控：使用 `mode`、`floating`、`open`、`width` 持续驱动状态，并监听对应的 `update:*` 事件

使用时注意：

- 同一组状态里，受控写法和初始值写法只能二选一，例如不要同时传 `floating` 和 `defaultFloating`
- `defaultFloating`、`defaultOpen`、`defaultWidth` 都只在首次挂载时读取一次
- `Layout` 负责布局模式和浮层位置，`Layout.Aside` 负责单个侧栏的开关和宽度

## 基础布局

基础布局适合最常见的桌面端页面：

- 顶部放工具栏或标题
- 中间放主内容
- 左右两侧按需放导航或信息栏
- 底部放状态栏或操作栏

`Layout` 本身只负责分区，不限制各区域的内容。

<demo vue="../../demos/layout/basic.vue" title="基础布局" description="最小布局示例。" />

配置详见：[Layout Props](#layout-props)、[Layout Slots](#layout-slots)

## 侧栏模式

`Layout.Aside` 支持两种展示方式：

- `dock`：占位侧栏，会参与布局宽度分配，适合桌面端常驻侧栏
- `drawer`：覆盖侧栏，不参与布局宽度分配，适合移动端或临时面板

:::info `dock` 和 `drawer` 怎么选
- 需要常驻导航、工具栏、信息栏时，用 `dock`
- 需要临时展开的面板，不希望挤压主区时，用 `drawer`
:::

当侧栏使用 `dock` 时，还可以通过 `collapsedWidth` 控制收起后保留下来的窄栏宽度：

- `collapsedWidth > 0`：收起后保留一条窄栏
- `collapsedWidth = 0`：收起后完全隐藏

:::tip `collapsedWidth` 的作用
它只在 `dock` 模式下生效，用来控制“收起后是否还保留一条可点击的窄栏”。
:::

覆盖侧栏的宽度不通过 `width` 控制，而是通过 `--tr-layout-drawer-width` 设置。

<demo vue="../../demos/layout/aside-modes.vue" title="侧栏形态" description="左侧保留窄栏，右侧覆盖抽屉。" />

配置详见：[Layout.Aside Props](#layout-aside-props)、[Layout.AsideToggle Props](#layout-aside-toggle-props)、[Layout.Aside Events](#layout-aside-events)、[CSS 变量](#layout-css-content)

## 侧栏拖拽

`resizable` 用来开启 `dock` 侧栏的拖拽改宽，宽度范围由 `minWidth` 和 `maxWidth` 约束。

<demo vue="../../demos/layout/aside-resizable.vue" title="侧栏宽度调整" description="拖动分隔线调整 dock 侧栏宽度。" />

配置详见：[Layout.Aside Props](#layout-aside-props)、[Layout.Aside Events](#layout-aside-events)、[Layout Events](#layout-layout-events)

## 主区滚动

`Layout.Main` 用来接管主区滚动条，但它不制造滚动。真正发生滚动的仍然是你传入的 `scrollHost`，也就是真实滚动容器。

:::tip `scrollHost` 怎么理解
把 `scrollHost` 当成“真正出现滚动条的那个元素”。

- 如果你自己写的是 `div`，就把 `div` 的 `ref` 传进来
- 如果你传的是组件 `ref`，这个组件的根元素需要就是滚动容器
:::

下面分别展示 `BubbleList` 和普通 `div` 作为滚动容器时的写法。

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

## 浮层模式

浮层模式适合临时工作区、对话框式页面或可移动面板。

:::warning 生效前提
`defaultFloating` 和 `floating` 只有在 `mode="floating"` 时才生效。

只传 `defaultFloating` 或 `floating`，不会自动切到浮层模式。
:::

如果只需要设置默认位置和尺寸，使用 `defaultFloating`。它只在首次挂载时读取一次，按 `placement + offset + size` 解析出第一份浮层的位置和尺寸。初始化完成后，窗口不会继续按 placement 自动贴边，只会在视口变化时把浮层限制在浏览器可视区域内。

如果需要在外部持续同步当前实际位置和尺寸，使用 `floating` 并监听 `update:floating`。`floating` 表示完整的位置和尺寸对象，适合受控场景。

:::info 受控与非受控的区别
- `defaultFloating` 只负责初始化第一份位置和尺寸
- `floating` 表示当前实际位置和尺寸；如果你使用受控写法，需要在 `update:floating` 后自行回写
:::

<demo vue="../../demos/layout/floating.vue" title="浮层模式" description="只传初始值的浮层示例。" />

配置详见：[Layout Props](#layout-props)、[Types](#types)、[Layout Events](#layout-layout-events)、[CSS 变量](#layout-css-basics)

## Props

<a id="layout-props"></a>
### Layout

:::info 浮层属性的生效条件
`defaultFloating` 和 `floating` 只在 `mode="floating"` 时生效。
:::

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `mode` | 布局模式，设为 `floating` 时启用浮层交互 | `'normal' \| 'floating'` | `'normal'` |
| `defaultFloating` | 非受控浮层的初始化配置，仅首次挂载读取一次 | `LayoutDefaultFloatingConfig` | `-` |
| `floating` | 受控浮层的运行时 rect，需配合 `update:floating` 使用 | `LayoutFloatingRect` | `-` |

<a id="layout-main-props"></a>
### Layout.Main

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `scrollHost` | 真实滚动容器的元素或组件实例 ref | `HTMLElement \| ComponentPublicInstance \| null` | `-` |

<a id="layout-aside-props"></a>
### Layout.Aside

#### 通用字段

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `placement` | 侧栏位置 | `'left' \| 'right'` | `-` |
| `mode` | 侧栏模式 | `'dock' \| 'drawer'` | `'dock'` |
| `open` | 外部控制侧栏开关 | `boolean` | `-` |
| `defaultOpen` | 默认开关状态 | `boolean` | `left: true` / `right: false` |

#### `dock` 专属字段

:::info 字段适用范围
`width`、`defaultWidth`、`collapsedWidth`、`minWidth`、`maxWidth`、`resizable`、`collapseEffect` 只在 `dock` 模式下生效。

`drawer` 模式下的宽度通过 `--tr-layout-drawer-width` 控制。
:::

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `width` | 外部控制的侧栏宽度 | `number` | `-` |
| `defaultWidth` | 默认侧栏宽度 | `number` | `-` |
| `collapsedWidth` | 收起后保留的窄栏宽度 | `number` | `0` |
| `minWidth` | 最小宽度 | `number` | `left: 200` / `right: 240` |
| `maxWidth` | 最大宽度 | `number` | `left: 560` / `right: 640` |
| `resizable` | 是否允许拖动改宽 | `boolean` | `false` |
| `collapseEffect` | 收起时的动画效果；`overlay` 保留原位覆盖收起，`slide` 连同内容一起滑出 | `'overlay' \| 'slide'` | `'overlay'` |

<a id="layout-aside-toggle-props"></a>
### Layout.AsideToggle

:::info 作用范围
`Layout.AsideToggle` 只会控制同一个 `Layout` 上下文里、`placement` 相同的那个侧栏。
:::

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `placement` | 控制的侧栏位置 | `'left' \| 'right'` | `-` |
| `ariaLabel` | 切换按钮的无障碍文本 | `string` | `left: 'Toggle left panel'` / `right: 'Toggle right panel'` |

## Slots

<a id="layout-slots"></a>
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
| `update:mode` | 布局模式变化 | `(value: LayoutMode)` |
| `update:floating` | 浮层位置或尺寸变化 | `(value: LayoutFloatingRect)` |
| `aside-resize-start` | 开始调整侧栏宽度 | `(detail: LayoutAsideResizeDetail)` |
| `aside-resize` | 调整侧栏宽度时持续触发 | `(detail: LayoutAsideResizeDetail)` |
| `aside-resize-end` | 结束调整侧栏宽度 | `(detail: LayoutAsideResizeDetail)` |
| `floating-drag-start` | 开始拖动浮层 | `(detail: LayoutFloatingDragDetail)` |
| `floating-drag` | 拖动浮层时持续触发 | `(detail: LayoutFloatingDragDetail)` |
| `floating-drag-end` | 结束拖动浮层 | `(detail: LayoutFloatingDragDetail)` |
| `floating-resize-start` | 开始调整浮层尺寸 | `(detail: LayoutFloatingResizeDetail)` |
| `floating-resize` | 调整浮层尺寸时持续触发 | `(detail: LayoutFloatingResizeDetail)` |
| `floating-resize-end` | 结束调整浮层尺寸 | `(detail: LayoutFloatingResizeDetail)` |

所有浮层拖拽和 resize 事件中的坐标都以浏览器可视区域（viewport）为基准。

#### 侧栏 resize 事件字段

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `placement` | 当前被调整的侧栏位置 | `'left' \| 'right'` |
| `width` | 当前侧栏宽度 | `number` |

#### 浮层 drag 事件字段

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `x` | 当前距视口左侧的偏移 | `number` |
| `y` | 当前距视口顶部的偏移 | `number` |

#### 浮层 resize 事件字段

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `handle` | 当前拖动的边或角 | `'n' \| 's' \| 'e' \| 'w' \| 'ne' \| 'nw' \| 'se' \| 'sw'` |
| `x` | 当前距视口左侧的偏移 | `number` |
| `y` | 当前距视口顶部的偏移 | `number` |
| `width` | 当前宽度 | `number` |
| `height` | 当前高度 | `number` |

<a id="layout-aside-events"></a>
### Layout.Aside

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `update:open` | 侧栏开关变化 | `(value: boolean)` |
| `update:width` | `dock` 宽度变化 | `(value: number)` |

<a id="types"></a>
## Types

<a id="layout-floating-config"></a>
<a id="layout-floating-fields"></a>
### 浮层字段

`defaultFloating` 用于初始化，`floating` 表示当前实际位置和尺寸。下面按字段职责拆开说明。

:::info 阅读方式
下面 3 张表是同一套浮层配置的拆分视图：

- `LayoutDefaultFloatingConfig` 只列初始化专属字段
- `LayoutFloatingRect` 只列当前实际位置和尺寸专属字段
- “共享尺寸与交互字段”同时适用于两者
:::

<a id="layout-default-floating-config"></a>
#### LayoutDefaultFloatingConfig

| 字段 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `placement` | 初始停靠位置 | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' \| 'center'` | `'center'` |
| `offset` | 非 `center` 时的初始边距 | `number` | `24` |

<a id="layout-floating-rect"></a>
#### LayoutFloatingRect

| 字段 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `x` | 当前距视口左侧的偏移，基于浏览器可视区域（viewport）坐标系 | `number` | `-` |
| `y` | 当前距视口顶部的偏移，基于浏览器可视区域（viewport）坐标系 | `number` | `-` |

#### 共享尺寸与交互字段

| 字段 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `width` | 宽度；在 `defaultFloating` 中表示初始值，在 `floating` 中表示当前值 | `number` | `420` |
| `height` | 高度；在 `defaultFloating` 中表示初始值，在 `floating` 中表示当前值 | `number` | `560` |
| `draggable` | 是否允许拖动浮层 | `boolean` | `true` |
| `resizable` | 是否允许通过 8 个方向手柄调整尺寸 | `boolean` | `false` |
| `minWidth` | 最小宽度 | `number` | `320` |
| `maxWidth` | 最大宽度 | `number` | `视口宽度 - 48` |
| `minHeight` | 最小高度 | `number` | `240` |
| `maxHeight` | 最大高度 | `number` | `视口高度 - 48` |

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
