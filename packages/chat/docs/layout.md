# Chat Layout

## 1. 范围

`@opentiny/tiny-robot-chat` 当前提供的是聊天场景的布局壳层，不负责消息渲染、发送链路和业务数据管理。

对外保留 4 个布局原语：

- `Chat.Layout`
- `Chat.Main`
- `Chat.Aside`
- `Chat.AsideToggle`

## 2. 公开模型

```ts
export type ChatPlacement = 'left' | 'right'
export type ChatAsideLayoutMode = 'dock' | 'drawer'
export type ChatAsideCollapseEffect = 'overlay' | 'slide'
export type ChatLayoutMode = 'normal' | 'floating'

export interface ChatAsideConfig {
  layoutMode?: ChatAsideLayoutMode
  expanded?: boolean
  expandedWidth?: number | string
  collapsedWidth?: number | string
  resizable?: boolean
  minExpandedWidth?: number | string
  maxExpandedWidth?: number | string
}

export interface ChatFloatingConfig {
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

## 3. 组件与插槽

### 3.1 `Chat.Layout`

主要 props：

- `mode`
- `floating`
- `leftAside`
- `rightAside`

主要事件：

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

支持插槽：

- `left-aside`
- `header`
- `main`
- `footer`
- `right-aside`

### 3.2 `Chat.Main`

- 主内容壳层。
- 必须显式传入 `scrollHost`。
- 自身固定 `overflow: hidden`，不再承担真实滚动。
- 真实滚动、尺寸约束和内容滚动样式都由 `scrollHost` 自己负责。
- 如果 `scrollHost` 的滚动能力依赖组件样式或外部样式文件，对应样式也必须先加载。

props：

```ts
import type { ComponentPublicInstance } from 'vue'

export type ChatMainScrollHostComponent = Pick<ComponentPublicInstance, '$el'>

export type ChatMainScrollHost = HTMLElement | ChatMainScrollHostComponent | null | undefined

export interface ChatMainProps {
  scrollHost: ChatMainScrollHost
}
```

### 3.3 `Chat.Aside`

props：

```ts
export interface ChatAsideProps {
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

说明：

- `collapseEffect='overlay'` 时，rail 保留列宽，内容覆盖在 rail 上。
- `collapseEffect='slide'` 时，内容从完整宽度滑入 rail 宽度。

### 3.4 `Chat.AsideToggle`

props：

```ts
export interface ChatAsideToggleProps {
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

说明：

- 默认直接切换对应侧栏的展开状态。
- 当左右两侧都处于 `drawer` 模式时，打开一侧会先关闭另一侧。

## 4. 布局行为

- `Chat.Layout` 是唯一布局入口，内部维护左右 panel 的运行时视图状态。
- `drawer` 打开时会显示 backdrop，按 `Escape` 会关闭当前 drawer。
- `Chat.Layout` 使用 CSS variables 驱动列宽，不把宽度逻辑下沉到 `Chat.Aside`。
- `layout host` 使用 `--tr-chat-layout-height` 控制高度；未配置时默认占满视口高度。

## 5. CSS 变量

布局主变量：

- `--tr-chat-layout-height`
- `--tr-chat-layout-content-max-width`
- `--tr-chat-layout-inner-padding-inline`
- `--tr-chat-layout-inner-padding-block`
- `--tr-chat-layout-header-max-width`
- `--tr-chat-layout-main-max-width`
- `--tr-chat-layout-footer-max-width`
- `--tr-chat-layout-header-padding-inline`
- `--tr-chat-layout-main-padding-inline`
- `--tr-chat-layout-footer-padding-inline`

aside 宽度变量：

- `--tr-chat-layout-left-expanded-width`
- `--tr-chat-layout-left-collapsed-width`
- `--tr-chat-layout-right-expanded-width`
- `--tr-chat-layout-right-collapsed-width`
- `--tr-chat-layout-main-min-width`

视觉变量：

- `--tr-chat-layout-bg`
- `--tr-chat-layout-left-bg`
- `--tr-chat-layout-right-bg`
- `--tr-chat-layout-header-bg`
- `--tr-chat-layout-main-bg`
- `--tr-chat-layout-footer-bg`
- `--tr-chat-layout-divider-color`
- `--tr-chat-layout-panel-shadow`
- `--tr-chat-layout-overlay-bg`
- `--tr-chat-layout-z-index-overlay`
- `--tr-chat-layout-transition-duration`
- `--tr-chat-layout-transition-easing`

## 6. 当前案例

- `DeepSeek`：左侧 `drawer`，右侧桌面 `dock` / 移动端 `drawer`。
- `ChatGPT`：左侧 `dock + rail`，右侧桌面 `dock` / 移动端 `drawer`。
- `Surface`：验证全屏主区与页面右侧贴边浮层两个典型场景。
