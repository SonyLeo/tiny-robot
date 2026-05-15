# 阶段一汇报：Chat 布局层

## 1. 阶段目标

阶段一聚焦 `packages/chat` 的布局层建设，目标是先把聊天应用的页面骨架做扎实，形成后续阶段二、阶段三都能复用的基础壳层。

本阶段重点解决：

- desktop / mobile 两套聊天页面骨架
- 左侧区域的 `open / rail / drawer` 行为
- 右侧区域的 desktop 固定列与 mobile overlay 行为
- `header / main / footer` 的稳定布局关系
- `ChatMain` 作为唯一主滚动根
- `contentMaxWidth` 对内容内层的统一约束
- 布局级 UI store 与统一状态入口

## 2. 范围边界

阶段一只做 UI 布局，不做数据层，不做聊天业务逻辑。

明确不在本阶段处理：

- 会话数据、消息数据、模型数据
- 提交 / 取消 / 流式输出 / 联网等业务行为
- 高层 `ChatApp` 最终 API
- 嵌入式容器模式
- `Teleport`
- `body scroll lock`
- focus trap

## 3. 当前实现结论

当前代码已经收敛到下面这套阶段一实现形态。

### 3.1 布局原语

- `Chat.Root`
- `Chat.Layout`
- `Chat.Header`
- `Chat.Main`
- `Chat.Footer`
- `Chat.LeftSidebar`
- `Chat.LeftSidebarToggle`
- `Chat.RightPanel`
- `Chat.RightPanelToggle`

### 3.2 左侧区域建模

左侧不再按“`panel` 和 `rail` 两棵平行树”建模，而是统一收成一个 `LeftSidebar` 语义区域。

当前实现里：

- `ChatLeftSidebar` 只保留一个默认 slot
- 通过状态暴露当前形态，而不是在布局层强制切换两套内容结构
- rail 被视为左侧区域的一种收起态，而不是独立组件

这套建模更接近当前真实需求，也更利于阶段二承载 `History / Tabs / 自定义内容`。

### 3.3 右侧区域建模

右侧继续保留 `ChatRightPanel` 命名。

当前实现里：

- desktop 下作为固定右列参与布局
- `rightPanelOpen = false` 时列宽归零，内容不渲染
- mobile 下作为从右向左展开的 overlay 面板

### 3.4 状态模型

对外暴露的布局 store 以“统一入口、分离状态”为原则：

```ts
interface ChatLayoutStore {
  leftSidebarOpen: Ref<boolean>
  leftDrawerOpen: Ref<boolean>
  leftSidebarVisible: Ref<boolean>
  rightPanelOpen: Ref<boolean>
  isMobile: Ref<boolean>
  mobileBreakpoint: Ref<number>
  setLeftSidebarOpen: (value: boolean) => void
  toggleLeftSidebar: () => void
  setLeftDrawerOpen: (value: boolean) => void
  toggleLeftDrawer: () => void
  setRightPanelOpen: (value: boolean) => void
  toggleRightPanel: () => void
  closeOverlayPanels: () => void
}
```

语义说明：

- `leftSidebarOpen`
  - desktop 下左侧是否展开
- `leftDrawerOpen`
  - mobile 下左侧 drawer 是否打开
- `leftSidebarVisible`
  - 左侧统一可见性派生状态
  - desktop 下等于 `leftSidebarOpen`
  - mobile 下等于 `leftDrawerOpen`
- `rightPanelOpen`
  - 对外统一的右侧区域开关
  - 内部已区分 desktop / mobile 行为

### 3.5 滚动与限宽

当前实现明确了两条重要约束：

- `ChatMain` 是唯一主滚动根
- `contentMaxWidth` 由 `ChatLayout` 自动施加到：
  - `header-inner`
  - `main-inner`
  - `footer-inner`

这样调用层不需要再自己补一层限宽容器。

## 4. 当前对外 API

### 4.1 `Chat.Root`

props：

- `mobileBreakpoint?: number`
- `defaultLeftSidebarOpen?: boolean`
- `defaultRightPanelOpen?: boolean`

职责：

- 提供布局级 store
- 提供断点结果
- 注入布局上下文

### 4.2 `Chat.Layout`

props：

- `leftSidebarWidth?: number`
- `leftRailWidth?: number`
- `rightPanelWidth?: number`
- `mobileLeftSidebarWidth?: number | string`
- `mobileRightPanelWidth?: number | string`
- `contentMaxWidth?: number | string`
- `transitionDuration?: string`

slots：

- `left-sidebar`
- `header`
- `main`
- `footer`
- `right-panel`

默认值：

- `leftSidebarWidth = 300`
- `leftRailWidth = 48`
- `rightPanelWidth = 320`
- `mobileLeftSidebarWidth = '66.67vw'`
- `mobileRightPanelWidth = '100vw'`

### 4.3 `Chat.LeftSidebar`

默认 slot props：

```ts
{
  isMobile: boolean
  open: boolean
  collapsed: boolean
  mode: 'open' | 'rail' | 'drawer'
}
```

说明：

- `default` 统一承载 desktop open、desktop rail 和 mobile drawer 内容
- 内容层自行决定在不同 `mode` 下如何表现
- 宽度始终由 `ChatLayout` 控制

### 4.4 `Chat.LeftSidebarToggle`

props：

- `ariaLabel?: string`

默认 slot props：

```ts
{
  expanded: boolean
  isMobile: boolean
  side: 'left'
}
```

说明：

- desktop 下切换 `leftSidebarOpen`
- mobile 下切换 `leftDrawerOpen`
- 当前实现已经回到“行为组件 + slot 自定义内容”的轻量模式

### 4.5 `Chat.RightPanel`

默认 slot props：

```ts
{
  isMobile: boolean
  open: boolean
  mode: 'panel' | 'drawer'
}
```

### 4.6 `Chat.RightPanelToggle`

props：

- `ariaLabel?: string`

默认 slot props：

```ts
{
  expanded: boolean
  isMobile: boolean
  side: 'right'
}
```

## 5. 关键设计取舍

### 5.1 为什么左侧收成 `LeftSidebar`

这是阶段一最重要的一次抽象收敛。

最终没有继续保留“`LeftPanel + Rail` 双树方案”，而是收成一个 `LeftSidebar`，原因是：

- rail 本质上是左侧区域的一种收起态
- 后续左侧未必一定是 history list，也可能是 tabs 或混合内容
- 单一 sidebar 更利于内容连续性和状态保留
- 更适合阶段二做“同一内容树 + 局部显隐”

### 5.2 为什么 toggle 回到 slot 模式

之前做过 icon-only 方案，但最后又收回到了 slot 方式。

最终判断是：

- toggle 更适合作为行为组件
- 它应该提供开关逻辑和状态
- 视觉内容应交给使用方

所以当前实现选择：

- 保留 `usePanelToggle` 共享行为逻辑
- `LeftSidebarToggle / RightPanelToggle` 保持 very thin wrapper
- 内容通过 slot 自定义

### 5.3 为什么阶段一不引入 Less

当前 `chat` 的样式层还主要是：

- CSS variables
- 布局壳层样式
- demo scoped 样式

阶段一遇到的问题主要是样式结构设计问题，不是预处理器问题，因此没有引入 Less。

### 5.4 为什么保持显式 slots

没有采用旧 demo 那种“扫描 vnode 自动识别区域”的方式，而是使用显式 named slots。

原因是：

- 更稳定
- 更适合组件库
- 对调试和文档表达更清晰

## 6. 响应式行为

### 6.1 desktop

- 左侧常驻
- 左侧收起后：
  - `leftRailWidth = 0` 时完全关闭
  - `leftRailWidth > 0` 时进入 rail
- 主区占据剩余空间
- `ChatMain` 独立滚动
- 右侧作为固定右列参与布局

### 6.2 mobile

- 左侧区域表现为 drawer
- 默认宽度 `66.67vw`
- 右侧区域表现为从右向左展开的 overlay
- 默认宽度 `100vw`
- `ChatHeader` 推荐存在，但不是强制
- 如果没有 `ChatHeader`，调用层必须自行保证左右开关入口可达

## 7. a11y 与基础交互

阶段一当前只做到基础语义：

- `Esc` 关闭 overlay
- backdrop click 关闭
- `aria-label`
- `aria-expanded`
- mobile overlay 提供 dialog 语义

仍然没有进入：

- focus trap
- 更复杂的 overlay 焦点管理
- `Teleport`
- `body scroll lock`

## 8. 当前 demo 组织

当前 demo 已经从“大一坨 App”收成了更清晰的结构：

- `App.vue`
  - 只负责 `Chat.Root + Chat.Layout` 编排
- `DemoHeaderBar`
  - header 区域
- `DemoLeftSidebar`
  - 左侧区域组合
- `DemoMainContent`
  - 主区组合
- `DemoRightPanel`
  - 右侧示例区域
- `useDemoLayoutControls`
  - 布局参数控制

当前 demo 也是阶段二的预备壳：

- 左侧固定区和内容区已经拆开
- 主区参数面板和预览区已经拆开
- 后续可以逐块替换成真实 `History / Bubble / Sender`

## 9. 目录与脚本现状

### 9.1 当前目录

```txt
packages/chat/
  docs/
    phase-1-layout.md
    note.md
  demo/
    index.html
    src/
      App.vue
      components/
      composables/
      styles/
      main.ts
  src/
    index.ts
    namespace.ts
    styles/
      index.css
      tokens.css
      layout.css
    types/
      layout.ts
    context/
      layoutContext.ts
      keys.ts
    composables/
      useChatBreakpoint.ts
      useChatLayoutStore.ts
      usePanelToggle.ts
    shared/
      constants.ts
      utils.ts
    layout/
      ChatRoot.vue
      ChatLayout.vue
      ChatHeader.vue
      ChatMain.vue
      ChatFooter.vue
      ChatLeftSidebar.vue
      ChatLeftSidebarToggle.vue
      ChatRightPanel.vue
      ChatRightPanelToggle.vue
      index.ts
```

### 9.2 当前脚本

`packages/chat/package.json` 已经收敛为：

- `pnpm -F @tiny-robot/chat dev`
- `pnpm -F @tiny-robot/chat build`
- `pnpm -F @tiny-robot/chat lint`
- `pnpm -F @tiny-robot/chat type-check`
- `pnpm -F @tiny-robot/chat check`

## 10. 当前验证结果

本轮对齐后，已经验证通过：

- `pnpm -F @tiny-robot/chat check`
- `pnpm -F @tiny-robot/chat build`

并且当前源码、demo、文档里已经不再残留旧的 `LeftPanel / left-panel / leftPanelWidth / defaultLeftPanelOpen` 命名。

## 11. 阶段一成果总结

阶段一目前已经形成了一个可复用的布局基座，具备这些特点：

- 布局层边界清楚，不碰业务真值
- 左右区域语义明确
- 左侧收口为单一 `LeftSidebar`
- `ChatMain` 作为唯一滚动根
- mobile / desktop 行为已明确分离
- demo 结构已具备阶段二逐块替换基础

## 12. 下一步建议

阶段二建议沿着下面这条线推进：

1. 保持布局层不再继续发散抽象
2. 先从左侧内容区开始接真实 `History / Tabs`
3. 再把主区预览替换为真实 `Bubble / Sender`
4. 最后再考虑高层 `ChatApp` 的统一封装

如果后续继续优化体验，我建议优先关注：

- 左侧 `open -> rail` 的连续性
- 左侧真实内容组件的“同一内容树 + 局部显隐”
- demo 向阶段二真实内容组件的逐块替换
