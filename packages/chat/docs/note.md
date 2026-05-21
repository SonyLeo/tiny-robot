# packages/chat Stage 1 Overview

当前 `packages/chat` 只保留阶段一布局层实现。

## 当前范围

- `Chat.Layout`
- `Chat.Header`
- `Chat.Main`
- `Chat.Footer`
- `Chat.Aside`
- `Chat.AsideToggle`

解决的问题：

- 页面级聊天布局骨架
- 左右 aside 的 `dock / drawer` 布局模式
- `rail / hidden` 关闭态
- dock / drawer 的纯 UI 状态切换
- 布局级 CSS 变量契约

## 当前公共模型

```ts
type ChatAsidePlacement = 'left' | 'right'
type ChatAsideLayoutMode = 'dock' | 'drawer'
type ChatAsideClosedMode = 'rail' | 'hidden'

interface ChatAsideConfig {
  layoutMode?: ChatAsideLayoutMode
  expanded?: boolean
  closedMode?: ChatAsideClosedMode
  expandedWidth?: number | string
  collapsedWidth?: number | string
}

interface ChatLayoutProps {
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}
```

关键语义：

- `dock`：打开时占布局
- `drawer`：打开时不占布局
- `expanded`：当前是否打开
- `closedMode = 'rail' | 'hidden'`：只对 `dock` 生效

## 当前实现结论

- `ChatGPT rail` 已沉淀为 layout 官方能力
- `collapsedWidth` 只表达 rail 宽度，不再表达 hidden
- `DeepSeek` 左侧改为 `drawer`
- `page-layer`、`mobileBreakpoint`、`a11y` 已移除
- layout 只负责结构和基础动效契约，产品级交互留在案例侧

## 主要文件

- 设计文档：[phase-1-layout.md](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/docs/phase-1-layout.md:1>)
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
