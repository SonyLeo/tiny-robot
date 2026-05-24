# packages/chat Stage 1 Overview

当前 `packages/chat` 只保留阶段一布局层实现。

## 当前范围

- `Chat.Layout`
- `Chat.Main`
- `Chat.Aside`
- `Chat.AsideToggle`

## 当前公共模型

```ts
type ChatPlacement = 'left' | 'right'
type ChatAsideLayoutMode = 'dock' | 'drawer'
type ChatSurfaceMode = 'embedded' | 'detached'

interface ChatAsideConfig {
  layoutMode?: ChatAsideLayoutMode
  expanded?: boolean
  expandedWidth?: number | string
  collapsedWidth?: number | string
  resizable?: boolean
  minExpandedWidth?: number | string
  maxExpandedWidth?: number | string
}

interface ChatLayoutProps {
  surfaceMode?: ChatSurfaceMode
  detachedBounds?: {
    x?: number
    y?: number
    width?: number | string
    height?: number | string
  }
  detachedDraggable?: boolean
  detachedResizable?: boolean
  minDetachedWidth?: number | string
  maxDetachedWidth?: number | string
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}
```

说明：

- 上面这段对应当前主线已落地的公开模型。
- `Main / BubbleList` 的单一 scroll host 改造和虚拟滚动条实现仍在后续阶段。

## 当前结论

- `dock`：打开时占布局
- `drawer`：打开时不占布局
- `collapsedWidth > 0`：仅对 `dock` 生效，关闭后保留 rail
- `collapsedWidth = 0` 或未配置：仅对 `dock` 生效，关闭后完全隐藏
- aside 改宽能力放在 `ChatLayout` 壳层，不放进 `Chat.Aside`

## 已确认口径

- 不再保留旧三态、侧吸附和对应的专用字段表达。
- `SurfaceLayoutDemo` 已收口为 `Embedded / Detached` 两种形态。
- `Main` 只负责高度和裁剪，`BubbleList` 作为唯一真实滚动宿主，`ChatMain` 内部滚动条只控制 `BubbleList`。

## 主要文档

- 设计文档：[phase-1-layout.md](./phase-1-layout.md)
- TODO：[todo.md](./todo.md)
- 主区滚动方案：[chat-main-scroll-plan.md](./chat-main-scroll-plan.md)
- Aside 拖拽方案：[aside-resize-plan.md](./aside-resize-plan.md)
- 顶层形态方案：[layout-surface-plan.md](./layout-surface-plan.md)
- 顶层形态 V2 扩展：[layout-surface-v2-plan.md](./layout-surface-v2-plan.md)

## 主要文件

- 类型定义：[src/types/layout.ts](../src/types/layout.ts)
- 内部类型：[src/types/layout.internal.ts](../src/types/layout.internal.ts)
- store：[src/composables/createChatLayoutStore.ts](../src/composables/createChatLayoutStore.ts)
- 布局骨架：[src/layout/ChatLayout.vue](../src/layout/ChatLayout.vue)
- aside：[src/layout/ChatAside.vue](../src/layout/ChatAside.vue)
- toggle：[src/layout/ChatAsideToggle.vue](../src/layout/ChatAsideToggle.vue)
- 样式：[src/styles/layout.css](../src/styles/layout.css)
- 默认变量：[src/styles/tokens.css](../src/styles/tokens.css)

## 当前案例

- `DeepSeek`
  - 左侧 drawer
  - 右侧 desktop dock / mobile drawer
- `ChatGPT`
  - 左侧 dock + rail
  - 右侧 desktop dock / mobile drawer
