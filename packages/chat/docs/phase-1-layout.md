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
- `right.state` 现在也支持 `collapsed`，desktop 下可以和左侧一样落到收起态
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
- `left.restingState` 描述左侧 desktop 在执行 `close()` 后应该落到 `collapsed` 还是 `hidden`
- `right.restingState` 现在也支持 `collapsed`，这样左右都可以通过配置决定关闭后是收起还是隐藏
- `a11y` 统一收口布局层的无障碍文案

slots：

- `left-sidebar`
- `header`
- `main`
- `footer`
- `right-panel`

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

## 5. 样式策略

布局行为走 props，视觉尺寸走 CSS variables。

当前默认变量定义在 [src/styles/tokens.css](</e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/styles/tokens.css:1>)，常用覆写项包括：

- `--tr-chat-layout-left-sidebar-width`
- `--tr-chat-layout-left-rail-width`
- `--tr-chat-layout-right-panel-width`
- `--tr-chat-layout-right-rail-width`
- `--tr-chat-layout-mobile-left-width`
- `--tr-chat-layout-mobile-right-width`
- `--tr-chat-layout-content-max-width`

示例：

```vue
<Chat.Layout
  :left="{ defaultState: 'expanded', restingState: 'collapsed' }"
  :right="{ defaultState: 'expanded' }"
  style="
    --tr-chat-layout-left-sidebar-width: 256px;
    --tr-chat-layout-left-rail-width: 52px;
    --tr-chat-layout-right-panel-width: 364px;
    --tr-chat-layout-content-max-width: 940px;
  "
>
```

## 6. 布局行为

### 6.1 Desktop

- 页面使用三列 grid：左侧 / 主区 / 右侧
- 左侧支持 `expanded / collapsed / hidden`
- 右侧也支持 `expanded / collapsed / hidden`
- `main-shell` 是布局级滚动区域

### 6.2 Mobile

- 主骨架收敛成单列：`header / main / footer`
- 左右侧都改为 `position: fixed` 的 overlay
- 点击 backdrop 或按 `Esc` 关闭 overlay

## 7. 当前 demo

当前 demo 保留 2 个更接近真实产品的布局展示：

- `DeepSeek Layout`
  - 展示左侧高密度历史区、中央长回答和工具型输入区
- `ChatGPT Layout`
  - 展示左侧导航、中央留白对话区和右侧文件面板

这两个 demo 重点验证：

- 左侧历史区的展开、收起和 mobile overlay
- desktop 右侧固定列
- header / main / footer 的稳定组合
- 大段回答区与底部 composer 的协同布局
- CSS variable 驱动的布局尺寸定制

## 8. 当前实现特点

- 左右侧统一收敛到 `Chat.Aside`
- `Chat.Layout` 不再依赖 `v-if + Transition` 做左右区域分发
- `Chat.Layout` 作为唯一公共入口，内部负责提供布局 store
- desktop / mobile 使用同一套 aside DOM，通过 CSS 切换状态
- desktop 真正隐藏的 aside 会补 `inert`，避免不可见内容继续接收焦点
- `Chat.AsideToggle` 统一复用一套行为逻辑

## 9. 当前限制

- slot 是否存在目前按 slot 函数是否提供判断，不检查最终是否真的渲染出内容
- 暂不处理 focus trap
- 暂不处理 `Teleport`
- 暂不处理 `body scroll lock`

## 10. 验证

当前已通过：

- `pnpm -F @tiny-robot/chat type-check`
- `pnpm -F @tiny-robot/chat build`
