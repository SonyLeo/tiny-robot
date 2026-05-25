# Chat Aside Resize

## 1. 范围

aside 改宽能力由 `Chat.Layout` 统一负责，只作用于桌面端 `dock` 侧栏。

不支持：

- `drawer` 改宽
- hidden 状态改宽
- rail 宽度拖拽

## 2. 公开 API

```ts
export interface ChatAsideConfig {
  layoutMode?: 'dock' | 'drawer'
  expanded?: boolean
  expandedWidth?: number | string
  collapsedWidth?: number | string
  resizable?: boolean
  minExpandedWidth?: number | string
  maxExpandedWidth?: number | string
}

export interface ChatAsideResizeEventDetail {
  placement: 'left' | 'right'
  width: number
}
```

相关事件：

- `aside-resize-start`
- `aside-resize`
- `aside-resize-end`

## 3. 触发条件

只有同时满足以下条件才会显示 resize trigger 并允许拖拽：

- 对应插槽存在内容
- `layoutMode === 'dock'`
- `expanded === true`
- `resizable === true`

## 4. 宽度规则

宽度更新只写回 `expandedWidth`。

计算规则：

- 左侧：`nextWidth = startWidth + deltaX`
- 右侧：`nextWidth = startWidth - deltaX`

最终宽度会被限制在：

```ts
effectiveMax = min(configMax, containerWidth - mainMinWidth - oppositeDockWidth)
```

其中：

- `configMax` 来自 `maxExpandedWidth`
- `mainMinWidth` 来自 `--tr-chat-layout-main-min-width`
- `oppositeDockWidth` 是对侧当前 `dock` 占位宽度

默认边界：

- left: `expandedWidth=300px`、`min=200px`、`max=560px`
- right: `expandedWidth=320px`、`min=240px`、`max=640px`

## 5. 运行时行为

- 起拖宽度来自真实渲染宽度 `getBoundingClientRect().width`。
- 字符串长度会先解析成像素再参与计算。
- 拖拽期间通过 `requestAnimationFrame` 节流写回宽度。
- 拖拽期间会锁定 `body.cursor = 'col-resize'` 和 `body.userSelect = 'none'`。
- 拖拽结束时会补一次最终宽度写回，并触发 `aside-resize-end`。

## 6. 样式变量

- `--tr-chat-layout-main-min-width`
- `--tr-chat-layout-resize-trigger-size`
- `--tr-chat-layout-resize-line-color`
- `--tr-chat-layout-resize-line-hover-color`
- `--tr-chat-layout-resize-line-active-color`
- `--tr-chat-layout-resize-indicator-width`
- `--tr-chat-layout-resize-indicator-height`
- `--tr-chat-layout-resize-indicator-bg`
- `--tr-chat-layout-resize-indicator-border`
- `--tr-chat-layout-resize-indicator-active-bg`
- `--tr-chat-layout-resize-indicator-active-border`
- `--tr-chat-layout-resize-indicator-active-shadow`

## 7. 验证点

- 左右侧 `dock` 改宽时，主区宽度始终不小于 `--tr-chat-layout-main-min-width`。
- 左右同时存在时，单侧改宽不会挤爆对侧和主区。
- `drawer` 与 hidden 状态下不出现改宽触发器。
