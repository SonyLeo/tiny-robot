# Chat Surface

## 1. 范围

当前 surface 只保留两种承载模式：

- `normal`
- `floating`

不再保留旧的附着态、贴边态和对应公开语义。

## 2. 公开 API

```ts
export type ChatLayoutMode = 'normal' | 'floating'

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

export interface ChatLayoutProps {
  mode?: ChatLayoutMode
  floating?: ChatFloatingConfig
}

export interface ChatFloatingResizeEventDetail {
  edge: 'left' | 'right'
  width: number
}
```

相关事件：

- `update:mode`
- `update:floating`
- `floating-resize-start`
- `floating-resize`
- `floating-resize-end`

## 3. 两种模式

### 3.1 `normal`

- surface 跟随布局流，占据正常主承载区域。
- 不显示 drag bar。
- 不显示 resize handle。
- 不读取 `floating` 交互能力。

### 3.2 `floating`

- surface 通过 `Teleport` 挂到 `body`，并使用 `fixed` 相对视口定位。
- 位置和尺寸由 `floating` 表达。
- `floating.draggable !== false` 时允许顶部拖拽。
- `floating.resizable === true` 时显示左右改宽 handle。

## 4. 默认几何与边界

默认值：

- 默认宽度：`420`
- 默认高度：`80vh`
- 默认顶部偏移：`24`
- 默认左右边距：`24`
- 默认最小宽度：`320`

运行时规则：

- 切到 `floating` 时，如果 `floating` 不完整，会自动补齐默认值。
- `width` 会被夹在 `[floating.minWidth, floating.maxWidth]` 与 viewport 可用宽度之间。
- `height` 不会超出 viewport 高度减去顶部偏移和底部 gap。
- `x / y` 会被 clamp 在 viewport 边界内。
- viewport 尺寸变化后会自动重新 clamp 当前 bounds。

## 5. 拖拽与改宽

### 5.1 拖拽

- 只有顶部 drag bar 能发起拖拽。
- `floating.draggable !== false` 时才可拖。
- 改宽过程中 drag bar 会禁用。

### 5.2 改宽

- 只支持左边和右边改宽。
- `floating.resizable === true` 时才显示 handle。
- 改宽过程中会锁定 `body.cursor = 'col-resize'` 和 `body.userSelect = 'none'`。

### 5.3 位移消耗

- 优先消耗位移做宽度变化。
- 宽度触到边界后，剩余位移继续推动整个 floating surface 平移。
- 左右两侧 handle 都遵守这一规则。

## 6. 样式变量

- `--tr-chat-surface-radius`
- `--tr-chat-surface-shadow`
- `--tr-chat-surface-drag-hit-width`
- `--tr-chat-surface-drag-hit-height`
- `--tr-chat-surface-drag-pill-width`
- `--tr-chat-surface-drag-pill-height`
- `--tr-chat-surface-drag-pill-bg`
- `--tr-chat-surface-drag-pill-shadow`
- `--tr-chat-surface-drag-hover-bg`
- `--tr-chat-surface-drag-hover-border`
- `--tr-chat-surface-drag-hover-shadow`
- `--tr-chat-surface-resize-hit-area-size`
- `--tr-chat-surface-resize-indicator-width`
- `--tr-chat-surface-resize-indicator-height`
- `--tr-chat-surface-resize-indicator-bg`
- `--tr-chat-surface-resize-indicator-border`
- `--tr-chat-surface-resize-indicator-active-bg`
- `--tr-chat-surface-resize-indicator-active-border`
- `--tr-chat-surface-resize-indicator-active-shadow`

## 7. 案例与验证

[SurfaceLayoutDemo.vue](../demo/src/layout-demos/SurfaceLayoutDemo.vue) 当前覆盖：

- `page` host
- `container` host
- `normal`
- `floating`

重点观察：

- host 切换后 floating 是否始终贴住当前 viewport
- 拖拽和改宽后 `floating` 是否稳定同步
- 长内容场景下 surface 与主区滚动是否仍然正常
