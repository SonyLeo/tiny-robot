# Chat Surface

## 1. 范围

当前 surface 只保留两种承载模式：

- `embedded`
- `detached`

不再保留旧的附着态、贴边态和对应公开语义。

## 2. 公开 API

```ts
export type ChatSurfaceMode = 'embedded' | 'detached'

export interface ChatDetachedBounds {
  x?: number
  y?: number
  width?: number | string
  height?: number | string
}

export interface ChatLayoutProps {
  surfaceMode?: ChatSurfaceMode
  detachedBounds?: ChatDetachedBounds
  detachedDraggable?: boolean
  detachedResizable?: boolean
  minDetachedWidth?: number | string
  maxDetachedWidth?: number | string
}

export interface ChatDetachedResizeEventDetail {
  edge: 'left' | 'right'
  width: number
}
```

相关事件：

- `update:surfaceMode`
- `update:detachedBounds`
- `detached-resize-start`
- `detached-resize`
- `detached-resize-end`

## 3. 两种模式

### 3.1 `embedded`

- surface 跟随布局流，占据正常主承载区域。
- 不显示 drag bar。
- 不显示 resize handle。
- 不读取 `detachedBounds` 和 `detached*` 交互能力。

### 3.2 `detached`

- surface 在 `.tr-chat-layout-surface-host` 内绝对定位。
- 位置和尺寸由 `detachedBounds` 表达。
- `detachedDraggable !== false` 时允许顶部拖拽。
- `detachedResizable === true` 时显示左右改宽 handle。

## 4. 默认几何与边界

默认值：

- 默认宽度：`420`
- 默认高度：`80vh`
- 默认顶部偏移：`24`
- 默认左右边距：`24`
- 默认最小宽度：`320`

运行时规则：

- 切到 `detached` 时，如果 `detachedBounds` 不完整，会自动补齐默认值。
- `width` 会被夹在 `[minDetachedWidth, maxDetachedWidth]` 与 host 可用宽度之间。
- `height` 不会超出 host 高度减去顶部偏移和底部 gap。
- `x / y` 会被 clamp 在 host 边界内。
- host 尺寸变化后会自动重新 clamp 当前 bounds。

## 5. 拖拽与改宽

### 5.1 拖拽

- 只有顶部 drag bar 能发起拖拽。
- `detachedDraggable !== false` 时才可拖。
- 改宽过程中 drag bar 会禁用。

### 5.2 改宽

- 只支持左边和右边改宽。
- `detachedResizable === true` 时才显示 handle。
- 改宽过程中会锁定 `body.cursor = 'col-resize'` 和 `body.userSelect = 'none'`。

### 5.3 位移消耗

- 优先消耗位移做宽度变化。
- 宽度触到边界后，剩余位移继续推动整个 detached surface 平移。
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
- `embedded`
- `detached`

重点观察：

- host 切换后 detached 是否始终受当前 host 约束
- 拖拽和改宽后 `detachedBounds` 是否稳定同步
- 长内容场景下 surface 与主区滚动是否仍然正常
