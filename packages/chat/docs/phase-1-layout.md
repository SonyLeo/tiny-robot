# 阶段一：Chat 布局层

## 1. 目标

阶段一只解决聊天页的布局壳层问题，目标是先把 `packages/chat` 的页面结构、响应式行为和布局级 UI state 做扎实。

当前不处理：

- 会话、消息、模型等业务数据
- 发送、流式输出、联网等业务流程
- `ChatApp` 高层封装
- `Teleport`
- `body scroll lock`
- focus trap

## 2. 当前组件

当前布局原语只保留 7 个：

- `Chat.Root`
- `Chat.Layout`
- `Chat.Header`
- `Chat.Main`
- `Chat.Footer`
- `Chat.Aside`
- `Chat.AsideToggle`

职责划分：

- `Chat.Root`
  - 提供布局级 store 和断点结果
- `Chat.Layout`
  - 提供固定骨架、左右侧布局、移动端 overlay 和内容限宽
- `Chat.Header / Chat.Main / Chat.Footer`
  - 提供语义化区域容器
- `Chat.Aside`
  - 提供统一的左右侧内容壳
- `Chat.AsideToggle`
  - 提供统一的左右侧开关行为

## 3. 状态模型

布局层当前只维护纯 UI 状态：

```ts
type ChatAsideState = 'hidden' | 'collapsed' | 'expanded' | 'overlay'

interface ChatAsideController {
  state: ComputedRef<ChatAsideState>
  isOpen: ComputedRef<boolean>
  open: () => void
  close: () => void
  toggle: () => void
}

interface ChatLayoutStore {
  viewport: {
    isMobile: Ref<boolean>
    mobileBreakpoint: Ref<number>
  }
  left: ChatAsideController
  right: ChatAsideController
  closeOverlays: () => void
}
```

状态语义：

- `viewport` 统一提供断点结果
- `left.state` 会在 `collapsed / expanded / overlay / hidden` 之间切换
- `right.state` 当前只会用到 `hidden / expanded / overlay`
- mobile 下左右 overlay 互斥
- `left.open() / close() / toggle()` 和 `right.open() / close() / toggle()` 暴露意图动作
- `closeOverlays()` 统一关闭移动端 overlay

## 4. 对外 API

### 4.1 `Chat.Root`

props：

- `mobileBreakpoint?: number`
- `defaultLeftSidebarOpen?: boolean`
- `defaultRightPanelOpen?: boolean`

默认值：

- `mobileBreakpoint = 959`
- `defaultLeftSidebarOpen = true`
- `defaultRightPanelOpen = false`

### 4.2 `Chat.Layout`

props：

- `leftSidebarWidth?: number`
- `leftRailWidth?: number`
- `rightPanelWidth?: number`
- `mobileLeftSidebarWidth?: number | string`
- `mobileRightPanelWidth?: number | string`
- `contentMaxWidth?: number | string`
- `overlayBackdropAriaLabel?: string`
- `mobileLeftSidebarAriaLabel?: string`
- `mobileRightPanelAriaLabel?: string`

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
- `contentMaxWidth = 960`

### 4.3 `Chat.Aside`

props：

- `side: 'left' | 'right'`

slot props：

```ts
{
  side: 'left' | 'right'
  state: 'hidden' | 'collapsed' | 'expanded' | 'overlay'
  isMobile: boolean
  isOpen: boolean
  collapsed: boolean
  mode: 'panel' | 'collapsed' | 'drawer'
}
```

说明：

- `state` 是布局层的主状态表达，推荐优先消费
- `isOpen` 是从 `state` 派生出来的高频布尔值
- `mode / collapsed` 是给内容层做视图分支时的便捷字段
- 左侧 desktop 关闭后会进入 `collapsed`
- 左侧 mobile 和右侧 mobile 都会进入 `overlay`，对应的 `mode` 为 `drawer`
- 右侧 desktop 会在 `hidden / expanded` 之间切换，对应的 `mode` 都是 `panel`

### 4.4 `Chat.AsideToggle`

props：

- `side: 'left' | 'right'`
- `ariaLabel?: string`

slot props：

```ts
{
  isOpen: boolean
  isMobile: boolean
  side: 'left' | 'right'
}
```

说明：

- `side="left"` 控制左侧
- `side="right"` 控制右侧
- 可以放在 header、aside 内部或 rail 区域

## 5. 布局行为

### 5.1 Desktop

- 页面使用三列 grid：左侧 / 主区 / 右侧
- 左侧宽度由 `leftSidebarWidth` 和 `leftRailWidth` 控制
- `leftRailWidth = 0` 时，左侧关闭后完全隐藏
- 右侧关闭后宽度归零
- `main-shell` 是布局级滚动区域

### 5.2 Mobile

- 主骨架收敛成单列：`header / main / footer`
- 左右侧都改为 `position: fixed` 的 overlay
- 左侧默认宽度 `66.67vw`
- 右侧默认宽度 `100vw`
- 点击 backdrop 或按 `Esc` 关闭 overlay

### 5.3 限宽

`contentMaxWidth` 会统一作用到：

- `header-inner`
- `main-inner`
- `footer-inner`

## 6. 当前实现特点

- 左右侧统一收敛到 `Chat.Aside`
- `Chat.Layout` 不再依赖 `v-if + Transition` 做左右区域分发
- desktop / mobile 使用同一套 aside DOM，通过 CSS 切换状态
- desktop 真正隐藏的 aside 会补 `inert`，避免不可见内容继续接收焦点
- `Chat.AsideToggle` 统一复用一套行为逻辑

## 7. 当前限制

- slot 是否存在目前按 slot 函数是否提供判断，不检查最终是否真的渲染出内容
- 暂不处理 focus trap
- 暂不处理 `Teleport`
- 暂不处理 `body scroll lock`

## 8. 验证

当前已通过：

- `pnpm -F @tiny-robot/chat type-check`
- `pnpm -F @tiny-robot/chat build`
