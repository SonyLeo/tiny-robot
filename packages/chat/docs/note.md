# packages/chat Stage 1 Overview

这个分支只保留阶段一布局层实现，不再承载组合 UI 层和更高层 `ChatApp` 规划。

## 当前范围

- `Chat.Layout`
- `Chat.Header`
- `Chat.Main`
- `Chat.Footer`
- `Chat.Aside`
- `Chat.AsideToggle`

当前阶段只解决：

- 页面级聊天布局骨架
- desktop / mobile 响应式结构
- 左右 aside 的纯 UI 状态
- overlay、backdrop、基础 a11y 语义
- 布局层宽度、限宽和区域级 CSS 合同

当前阶段不处理：

- 会话、消息、模型等业务数据
- 输入框、历史列表、消息列表等组合 UI
- `ChatApp` 高层封装
- `Teleport`
- `body scroll lock`
- focus trap

## 关键设计

- `Chat.Layout` 是唯一公共入口，内部负责创建并提供布局 store。
- 布局 API 直接围绕状态模型设计：
  - `left.defaultState`
  - `left.restingState`
  - `right.defaultState`
  - `right.restingState`
- 左右两侧统一收敛到 `Chat.Aside`，开关行为统一收敛到 `Chat.AsideToggle`。
- 布局 store 采用 `isMobile + left + right` 的结构：
  - `left` / `right` 暴露 `state`、`isOpen`、`open()`、`close()`、`toggle()`
- `header / main / footer` 的宽度、内边距和对齐优先通过 CSS 变量覆盖，而不是继续扩 props。

## 主要文件

- 详细设计文档：[phase-1-layout.md](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/docs/phase-1-layout.md:1>)
- 类型定义：[src/types/layout.ts](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/types/layout.ts:1>)
- 内部 slot 类型：[src/types/layout.internal.ts](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/types/layout.internal.ts:1>)
- 布局 store：[src/composables/createChatLayoutStore.ts](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/composables/createChatLayoutStore.ts:1>)
- 布局骨架：[src/layout/ChatLayout.vue](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/layout/ChatLayout.vue:1>)
- aside 契约：[src/layout/ChatAside.vue](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/layout/ChatAside.vue:1>)
- toggle 行为：[src/layout/ChatAsideToggle.vue](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/layout/ChatAsideToggle.vue:1>)
- 样式入口：[src/styles/layout.css](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/styles/layout.css:1>)
- 默认变量：[src/styles/tokens.css](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/styles/tokens.css:1>)

## 当前 demo

当前 demo 使用两套布局示例验证组件能力：

- `DeepSeek Layout`
- `ChatGPT Layout`

重点对比：

- 左侧历史区与导航区
- 右侧 desktop 固定列
- 主回答区与底部输入区的组合
- mobile overlay
- 通过 CSS variable 做区域级限宽和尺寸覆写

## 当前遗留点

- `Chat.Layout` 目前只判断 slot 是否声明，不探测 slot 最终是否真的渲染出内容。
- 右侧虽然已经支持 collapsed 状态，但具体 rail 里显示什么仍然由业务侧自己决定。
- 产品级 launcher、浮动按钮、品牌化 toolbar 仍然属于页面层，不属于布局层能力。
