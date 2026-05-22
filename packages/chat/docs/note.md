# packages/chat Stage 1 Overview

当前 `packages/chat` 只保留阶段一布局层实现。

## 当前范围

- `Chat.Layout`
- `Chat.Main`
- `Chat.Aside`
- `Chat.AsideToggle`

## 当前公共模型

```ts
type ChatAsidePlacement = 'left' | 'right'
type ChatAsideLayoutMode = 'dock' | 'drawer'

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
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}
```

## 当前结论

- `dock`：打开时占布局
- `drawer`：打开时不占布局
- `collapsedWidth > 0`：仅对 `dock` 生效，关闭后保留 rail
- `collapsedWidth = 0` 或未配置：仅对 `dock` 生效，关闭后完全隐藏
- aside 改宽能力放在 `ChatLayout` 壳层，不放进 `Chat.Aside`

## 主要文档

- 设计文档：[phase-1-layout.md](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/docs/phase-1-layout.md:1>)
- TODO：[todo.md](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/docs/todo.md:1>)
- 主区滚动方案：[chat-main-scroll-plan.md](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/docs/chat-main-scroll-plan.md:1>)
- Aside 拖拽方案：[aside-resize-plan.md](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/docs/aside-resize-plan.md:1>)
- 顶层形态方案：[layout-surface-plan.md](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/docs/layout-surface-plan.md:1>)
- 顶层形态 V2 扩展：[layout-surface-v2-plan.md](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/docs/layout-surface-v2-plan.md:1>)

## 主要文件

- 类型定义：[src/types/layout.ts](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/types/layout.ts:1>)
- 内部类型：[src/types/layout.internal.ts](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/types/layout.internal.ts:1>)
- store：[src/composables/createChatLayoutStore.ts](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/composables/createChatLayoutStore.ts:1>)
- 布局骨架：[src/layout/ChatLayout.vue](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/layout/ChatLayout.vue:1>)
- aside：[src/layout/ChatAside.vue](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/layout/ChatAside.vue:1>)
- toggle：[src/layout/ChatAsideToggle.vue](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/layout/ChatAsideToggle.vue:1>)
- 样式：[src/styles/layout.css](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/styles/layout.css:1>)
- 默认变量：[src/styles/tokens.css](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/styles/tokens.css:1>)

## 当前案例

- `DeepSeek`
  - 左侧 drawer
  - 右侧 desktop dock / mobile drawer
- `ChatGPT`
  - 左侧 dock + rail
  - 右侧 desktop dock / mobile drawer
