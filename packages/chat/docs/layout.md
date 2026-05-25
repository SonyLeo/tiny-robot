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
export type ChatSurfaceMode = 'embedded' | 'detached'

export interface ChatAsideConfig {
  layoutMode?: ChatAsideLayoutMode
  expanded?: boolean
  expandedWidth?: number | string
  collapsedWidth?: number | string
  resizable?: boolean
  minExpandedWidth?: number | string
  maxExpandedWidth?: number | string
}

export interface ChatDetachedBounds {
  x?: number
  y?: number
  width?: number | string
  height?: number | string
}
```

状态语义：

- `dock`：占据布局列宽。
- `drawer`：浮在布局上层，不占据主内容宽度。
- `expanded = true`：当前展开。
- `expanded = false`：当前收起。
- `collapsedWidth > 0`：仅对 `dock` 生效，收起后保留 rail。
- `collapsedWidth` 为空或 `0`：仅对 `dock` 生效，收起后完全隐藏。
- `surfaceMode = 'embedded'`：surface 在布局流内。
- `surfaceMode = 'detached'`：surface 在 host 内独立定位。

## 3. 组件与插槽

### 3.1 `Chat.Layout`

主要 props：

- `surfaceMode`
- `detachedBounds`
- `detachedDraggable`
- `detachedResizable`
- `minDetachedWidth`
- `maxDetachedWidth`
- `leftAside`
- `rightAside`

主要事件：

- `update:surfaceMode`
- `update:detachedBounds`
- `update:leftAside`
- `update:rightAside`
- `aside-resize-start`
- `aside-resize`
- `aside-resize-end`
- `detached-resize-start`
- `detached-resize`
- `detached-resize-end`

支持插槽：

- `left-aside`
- `header`
- `main`
- `footer`
- `right-aside`

### 3.2 `Chat.Main`

- 主内容容器。
- 默认自己作为滚动容器。
- 检测到内部存在 `.tr-bubble-list` 时，会切换为裁剪层，由 `BubbleList` 接管真实滚动。

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
- `surface host` 使用 `--tr-chat-layout-height` 控制高度；未配置时默认占满视口高度。

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
- `Surface`：验证 `page / container + embedded / detached`。
