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

## 状态控制

`Layout` 和 `Layout.Aside` 都支持两种状态写法：

- 只传初始值：使用 `defaultMode`、`defaultFloating`、`defaultOpen`、`defaultWidth`
- 外部控制状态：使用 `mode`、`floating`、`open`、`width`，并回写对应的 `update:*` 事件

通常 `Layout` 负责布局模式和浮层位置，`Layout.Aside` 负责单个侧栏的开关和宽度。

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

- `dock`：侧栏占据布局空间，适合桌面端常驻侧栏
- `drawer`：侧栏覆盖在主区上方，适合移动端或临时面板

当侧栏使用 `dock` 时，还可以通过 `railWidth` 控制收起后的窄栏宽度：

- `railWidth > 0`：收起后保留一条窄栏
- `railWidth = 0`：收起后完全隐藏

抽屉侧栏的宽度不通过 `width` 控制，而是通过 `--tr-layout-drawer-width` 设置。

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

<demo vue="../../demos/layout/aside-modes.vue" title="侧栏形态" description="左侧 rail，右侧 drawer。" />

配置详见：[Layout.Aside Props](#layout-aside-props)、[Layout.AsideToggle Props](#layout-aside-toggle-props)、[Layout.Aside Events](#layout-aside-events)、[CSS 变量](#layout-css-content)

## 侧栏拖拽

`resizable` 用来开启 `dock` 侧栏的拖拽改宽，宽度范围由 `minWidth` 和 `maxWidth` 约束。

<demo vue="../../demos/layout/aside-resizable.vue" title="侧栏宽度调整" description="拖动分隔线调整 dock 侧栏宽度。" />

配置详见：[Layout.Aside Props](#layout-aside-props)、[Layout.Aside Events](#layout-aside-events)、[Layout Events](#layout-layout-events)

## 主区滚动

`Layout.Main` 用来接管主区滚动条，但它不制造滚动。真正发生滚动的仍然是你传入的 `scrollHost`。

下面分别展示 `BubbleList` 和普通 `div` 作为滚动容器时的写法。

使用时注意三点：

- `scrollHost` 必须指向真实滚动容器
- 滚动容器本身需要设置 `overflow: auto` 或 `overflow-y: auto`
- 建议同时设置 `width: 100%`、`height: 100%`、`box-sizing: border-box`

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

如果只想传初始值，使用 `defaultFloating`。如果需要在外部保存位置和宽度，使用 `floating` 并监听 `update:floating`。

<demo vue="../../demos/layout/floating.vue" title="浮层模式" description="只传初始值的浮层示例。" />

配置详见：[Layout Props](#layout-props)、[LayoutFloatingConfig](#layout-floating-config)、[Layout Events](#layout-layout-events)、[CSS 变量](#layout-css-basics)

## Props

<a id="layout-props"></a>
### Layout

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `mode` | 外部控制布局模式 | `'normal' \| 'floating'` | `-` |
| `defaultMode` | 初始布局模式，之后由组件自己维护 | `'normal' \| 'floating'` | `'normal'` |
| `floating` | 外部传入的浮层位置和尺寸 | `LayoutFloatingConfig` | `-` |
| `defaultFloating` | 浮层初始位置和尺寸 | `LayoutFloatingConfig` | `-` |

<a id="layout-floating-config"></a>
#### LayoutFloatingConfig

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `x` | 距离视口左侧的偏移 | `number` | `视口内水平居中` |
| `y` | 距离视口顶部的偏移 | `number` | `24` |
| `width` | 浮层宽度 | `number \| string` | `420` |
| `height` | 浮层高度 | `number \| string` | `'80vh'` |
| `draggable` | 是否允许拖动浮层 | `boolean` | `true` |
| `resizable` | 是否允许从左右边缘改宽 | `boolean` | `false` |
| `minWidth` | 最小宽度 | `number \| string` | `320` |
| `maxWidth` | 最大宽度 | `number \| string` | `视口宽度 - 48px` |

<a id="layout-main-props"></a>
### Layout.Main

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `scrollHost` | 真实滚动容器的元素或组件 ref | `HTMLElement \| ComponentPublicInstance \| null` | `-` |

<a id="layout-aside-props"></a>
### Layout.Aside

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `placement` | 侧栏位置 | `'left' \| 'right'` | `-` |
| `mode` | 侧栏模式 | `'dock' \| 'drawer'` | `'dock'` |
| `open` | 外部控制侧栏开关 | `boolean` | `-` |
| `defaultOpen` | 侧栏初始开关状态 | `boolean` | `left: true` / `right: false` |
| `width` | 外部控制的 `dock` 宽度 | `number` | `-` |
| `defaultWidth` | `dock` 初始宽度 | `number` | `-` |
| `railWidth` | `dock` 收起后保留的窄栏宽度 | `number` | `0` |
| `minWidth` | `dock` 最小宽度 | `number` | `left: 200` / `right: 240` |
| `maxWidth` | `dock` 最大宽度 | `number` | `left: 560` / `right: 640` |
| `resizable` | 是否允许拖动改变 `dock` 宽度 | `boolean` | `false` |
| `collapseEffect` | 收起时的动画效果 | `'overlay' \| 'slide'` | `'overlay'` |

<a id="layout-aside-toggle-props"></a>
### Layout.AsideToggle

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
| `default` | 侧栏内容 | `{ isOpen: boolean; isExpanded: boolean }` |

### Layout.AsideToggle

| 插槽名 | 说明 | 作用域参数 |
| ------ | ---- | ---------- |
| `default` | 自定义切换按钮内容 | `{ isOpen: boolean; isExpanded: boolean }` |

## Events

<a id="layout-layout-events"></a>
### Layout

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `update:mode` | 布局模式变化 | `(value: LayoutMode)` |
| `update:floating` | 浮层位置或尺寸变化 | `(value: LayoutFloatingConfig)` |
| `aside-resize-start` | 开始调整侧栏宽度 | `(detail: { placement: 'left' \| 'right'; width: number })` |
| `aside-resize` | 调整侧栏宽度时持续触发 | `(detail: { placement: 'left' \| 'right'; width: number })` |
| `aside-resize-end` | 结束调整侧栏宽度 | `(detail: { placement: 'left' \| 'right'; width: number })` |
| `floating-drag-start` | 开始拖动浮层 | `(detail: { x: number; y: number })` |
| `floating-drag` | 拖动浮层时持续触发 | `(detail: { x: number; y: number })` |
| `floating-drag-end` | 结束拖动浮层 | `(detail: { x: number; y: number })` |
| `floating-resize-start` | 开始调整浮层宽度 | `(detail: { edge: 'left' \| 'right'; width: number })` |
| `floating-resize` | 调整浮层宽度时持续触发 | `(detail: { edge: 'left' \| 'right'; width: number })` |
| `floating-resize-end` | 结束调整浮层宽度 | `(detail: { edge: 'left' \| 'right'; width: number })` |

<a id="layout-aside-events"></a>
### Layout.Aside

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `update:open` | 侧栏开关变化 | `(value: boolean)` |
| `update:width` | `dock` 宽度变化 | `(value: number)` |

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
