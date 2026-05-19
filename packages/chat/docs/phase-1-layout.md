# 阶段一：Chat 布局层

## 1. 目标

阶段一只解决聊天产品的布局壳层问题，重点是把 `packages/chat` 的页面结构、响应式行为和布局级 UI state 做扎实。

当前不处理：

- 会话、消息、模型等业务数据
- 发送、流式输出、联网等业务流程
- `ChatApp` 高层封装
- `Teleport`
- `body scroll lock`
- focus trap

## 2. 当前组件

当前对外保留 6 个布局原语：

- `Chat.Layout`
- `Chat.Header`
- `Chat.Main`
- `Chat.Footer`
- `Chat.Aside`
- `Chat.AsideToggle`

职责划分：

- `Chat.Layout`
  - 对外唯一布局入口
  - 内部创建布局 store、提供断点结果
  - 提供固定骨架、左右侧布局、移动端 overlay 和 backdrop
- `Chat.Header / Chat.Main / Chat.Footer`
  - 提供语义化区域容器
- `Chat.Aside`
  - 提供统一的左/右侧内容壳
- `Chat.AsideToggle`
  - 提供统一的左/右侧开关行为

## 3. 状态模型

布局层当前只维护纯 UI 状态：

```ts
type ChatAsideState = 'hidden' | 'collapsed' | 'expanded' | 'overlay'

interface ChatLayoutPanelApi {
  state: Readonly<Ref<ChatAsideState>>
  isOpen: Readonly<Ref<boolean>>
  open: () => void
  close: () => void
  toggle: () => void
}

interface ChatLayoutStore {
  isMobile: Readonly<Ref<boolean>>
  left: ChatLayoutPanelApi
  right: ChatLayoutPanelApi
  closeOverlays: () => void
}
```

状态语义：

- `left.state` 会在 `hidden / collapsed / expanded / overlay` 之间切换
- `right.state` 现在也支持 `hidden / collapsed / expanded / overlay`
- `overlay` 是移动端运行时派生状态，不作为默认配置项对外暴露
- mobile 下左右 overlay 互斥
- `left.open() / close() / toggle()` 和 `right.open() / close() / toggle()` 暴露意图动作
- `closeOverlays()` 统一关闭移动端 overlay

## 4. 对外 API

### 4.1 `Chat.Layout`

props：

- `mobileBreakpoint?: number`
- `left?: { defaultState?: 'hidden' | 'collapsed' | 'expanded'; restingState?: 'collapsed' | 'hidden' }`
- `right?: { defaultState?: 'hidden' | 'collapsed' | 'expanded'; restingState?: 'collapsed' | 'hidden' }`
- `a11y?: { backdropLabel?: string; leftPanelLabel?: string; rightPanelLabel?: string }`

默认值：

- `mobileBreakpoint = 959`
- `left.defaultState = 'expanded'`
- `left.restingState = 'collapsed'`
- `right.defaultState = 'hidden'`
- `right.restingState = 'hidden'`

说明：

- `left.defaultState` / `right.defaultState` 只描述 desktop 初始状态
- `left.restingState` / `right.restingState` 描述 desktop 在执行 `close()` 后应该落到 `collapsed` 还是 `hidden`
- `a11y` 统一收口布局层的无障碍文案

slots：

- `left-sidebar`
- `header`
- `main`
- `footer`
- `right-panel`
- `page-layer`

### 4.2 `Chat.Aside`

props：

- `side: 'left' | 'right'`

slot props：

```ts
{
  state: 'hidden' | 'collapsed' | 'expanded' | 'overlay'
  isMobile: boolean
  isOpen: boolean
}
```

说明：

- `state` 是布局层的主状态表达，推荐优先消费
- `isOpen` 是从 `state` 派生出来的高频布尔值

### 4.3 `Chat.AsideToggle`

props：

- `side: 'left' | 'right'`
- `ariaLabel?: string`

slot props：

```ts
{
  isOpen: boolean
}
```

## 5. CSS 变量策略

布局行为走 props，视觉尺寸走 CSS variables。

设计原则：

- `Chat.Layout` 的 props 只负责状态和行为
- 宽度、限宽、padding、对齐方式通过 CSS variables 覆盖
- 优先使用原生 CSS + CSS variables；当前不引入 `less`，避免把编译时变量和运行时布局变量混在一起
- demo 和业务侧更推荐通过组件类名 + 本地 `<style>` 覆盖变量，而不是在模板里堆长串内联 `style`
- `header / main / footer` 的可配宽度作用在各自的 `*-inner` 内容容器上，不会改变左右 aside 所在的 grid 列结构

### 5.1 Aside 宽度与区域背景

| 变量 | 生效范围 | 作用 |
| --- | --- | --- |
| `--tr-chat-layout-left-sidebar-width` | desktop 左侧，`left.state === 'expanded'` | 控制左侧展开宽度 |
| `--tr-chat-layout-left-rail-width` | desktop 左侧，`left.state === 'collapsed'` | 控制左侧收起宽度 |
| `--tr-chat-layout-right-panel-width` | desktop 右侧，`right.state === 'expanded'` | 控制右侧展开宽度 |
| `--tr-chat-layout-right-rail-width` | desktop 右侧，`right.state === 'collapsed'` | 控制右侧收起宽度 |
| `--tr-chat-layout-mobile-left-width` | mobile 左侧 overlay | 控制左侧抽屉宽度 |
| `--tr-chat-layout-mobile-right-width` | mobile 右侧 overlay | 控制右侧抽屉宽度 |
| `--tr-chat-layout-left-bg` | 左侧 aside 容器 | 控制左侧背景色 |
| `--tr-chat-layout-right-bg` | 右侧 aside 容器 | 控制右侧背景色 |

默认语义：

- mobile `left` 默认更像 drawer，宽度跟随 `--tr-chat-layout-mobile-left-width`，默认值是 `66.67vw`
- mobile `right` 默认更像 full-screen takeover overlay，宽度跟随 `--tr-chat-layout-mobile-right-width`，默认值是 `100vw`
- 如果业务真的需要半屏或更窄的右侧抽屉，可以覆盖 `--tr-chat-layout-mobile-right-width`，但这应该视为产品侧特化，而不是布局层默认语义

### 5.2 Header / Main / Footer 内容宽度

这些变量都作用在 `tr-chat-layout__header-inner`、`tr-chat-layout__main-inner`、`tr-chat-layout__footer-inner` 上。

| 变量 | 生效范围 | 作用 |
| --- | --- | --- |
| `--tr-chat-layout-content-max-width` | header / main / footer 的公共 fallback | 提供统一的内容最大宽度默认值 |
| `--tr-chat-layout-header-max-width` | header inner | 单独控制 header 内容最大宽度 |
| `--tr-chat-layout-main-max-width` | main inner | 单独控制 main 内容最大宽度 |
| `--tr-chat-layout-footer-max-width` | footer inner | 单独控制 footer 内容最大宽度 |
| `--tr-chat-layout-inner-padding-inline` | header / main / footer 的公共 fallback | 提供统一的水平内边距默认值 |
| `--tr-chat-layout-header-padding-inline` | header inner | 单独控制 header 水平内边距 |
| `--tr-chat-layout-main-padding-inline` | main inner | 单独控制 main 水平内边距 |
| `--tr-chat-layout-footer-padding-inline` | footer inner | 单独控制 footer 水平内边距 |

### 5.3 Header / Main / Footer 对齐方式

这些变量同样作用在对应的 `*-inner` 内容容器上，主要通过 `margin-inline-start / margin-inline-end` 改变对齐方式。

| 变量 | 生效范围 | 作用 |
| --- | --- | --- |
| `--tr-chat-layout-header-margin-inline-start` | header inner | 控制 header 内容起始侧外边距 |
| `--tr-chat-layout-header-margin-inline-end` | header inner | 控制 header 内容结束侧外边距 |
| `--tr-chat-layout-main-margin-inline-start` | main inner | 控制 main 内容起始侧外边距 |
| `--tr-chat-layout-main-margin-inline-end` | main inner | 控制 main 内容结束侧外边距 |
| `--tr-chat-layout-footer-margin-inline-start` | footer inner | 控制 footer 内容起始侧外边距 |
| `--tr-chat-layout-footer-margin-inline-end` | footer inner | 控制 footer 内容结束侧外边距 |

典型用途：

- 保持居中：使用默认的 `auto / auto`
- 左对齐：`margin-inline-start: 0; margin-inline-end: auto`
- 右对齐：`margin-inline-start: auto; margin-inline-end: 0`

### 5.4 公共块内边距、色彩与 overlay

| 变量 | 生效范围 | 作用 |
| --- | --- | --- |
| `--tr-chat-layout-inner-padding-block` | header / main / footer inner | 控制上下内边距的公共默认值；header 顶部会叠加 `safe-area-inset-top`，footer 底部会叠加 `safe-area-inset-bottom` |
| `--tr-chat-layout-bg` | 布局根容器 | 控制页面级背景色 |
| `--tr-chat-layout-header-bg` | header shell | 控制 header 背景色 |
| `--tr-chat-layout-main-bg` | main shell | 控制 main 背景色 |
| `--tr-chat-layout-footer-bg` | footer shell | 控制 footer 背景色 |
| `--tr-chat-layout-divider-color` | aside / header / footer 边框 | 控制分割线颜色 |
| `--tr-chat-layout-text-primary` | 布局根容器 | 控制默认文字颜色 |
| `--tr-chat-layout-panel-shadow` | mobile overlay aside | 控制抽屉阴影 |
| `--tr-chat-layout-overlay-bg` | backdrop | 控制遮罩层背景色 |
| `--tr-chat-layout-z-index-overlay` | mobile overlay / backdrop | 控制 overlay 层级 |

### 5.5 Desktop Aside Motion Contract

desktop aside 的结构性动效现在由 layout 统一提供，目标是避免 panel 在开合时被挤压，而是以整块 panel 的方式进出。

可覆写变量：

| 变量 | 生效范围 | 作用 |
| --- | --- | --- |
| `--tr-chat-layout-transition-duration` | desktop layout / aside 过渡 | 控制 layout 默认过渡时长 |
| `--tr-chat-layout-transition-easing` | desktop layout / aside 过渡 | 控制 layout 默认过渡曲线 |

默认行为：

- `tr-chat-layout` 会对 `grid-template-columns` 做基础过渡
- desktop 下 `aside > .tr-chat-aside` 会固定到 panel / rail 宽度，再通过 `transform + opacity` 切换 hidden 状态
- 产品如果要更慢、更快或不同 easing，应当在业务侧覆写变量，而不是重复声明这套 aside 结构性补丁

## 6. 布局行为

### 6.1 Desktop

- 页面使用三列 grid：左侧 / 主页 / 右侧
- 左右两侧都支持 `expanded / collapsed / hidden`
- `main-shell` 是布局级滚动区域

### 6.2 Mobile

- 主骨架收敛成单列：`header / main / footer`
- 左右侧都改为 `position: fixed` 的 overlay
- 左侧 overlay 默认更像 drawer，右侧 overlay 默认更像 full-screen takeover
- 点击 backdrop 或按 `Esc` 关闭 overlay

## 7. 当前 demo 状态

源码里已经有两套基于 `Chat.Layout` 的 Vue 实现：

- `DeepSeek Layout`
- `ChatGPT Layout`

它们主要验证：

- 左右 aside 的展开、收起和 mobile overlay
- header / main / footer 的稳定组合
- CSS variables 驱动的区域级尺寸定制

需要注意的是：

- `packages/chat/demo/src/layout-demos/` 里是组件化的 Vue 实现
- 当前 `packages/chat/demo/src/App.vue` 入口已经直接按路由挂载这两个 Vue 布局案例：
  - `/chatgpt`
  - `/deepseek`

## 8. 当前实现特点

- 左右两侧统一收敛到 `Chat.Aside`
- `Chat.Layout` 不再依赖 `v-if + Transition` 做左右区域分发
- `Chat.Layout` 作为唯一公共入口，内部负责提供布局 store
- desktop / mobile 使用同一套 aside DOM，通过 CSS 切换状态
- desktop 真正隐藏的 aside 会补 `inert`，避免不可见内容继续接收焦点
- `Chat.AsideToggle` 统一复用一套行为逻辑

## 9. 当前限制

- slot 是否存在目前按 slot 函数是否提供判断，不检查最终是否真的渲染出内容
- 右侧虽然已经支持 collapsed 状态，但具体 rail 里显示什么仍然由业务侧自己决定
- 暂不处理 focus trap
- 暂不处理 `Teleport`
- 暂不处理 `body scroll lock`

## 10. 验证

当前已通过：

- `pnpm -F @tiny-robot/chat type-check`
