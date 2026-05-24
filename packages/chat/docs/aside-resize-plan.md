# Aside 拖拽改宽方案

## 1. 目标

为 `Chat.Layout` 的左右 `aside` 增加桌面端拖拽改宽能力：

- 鼠标移到 `aside` 与 `main` 边界时显示 `col-resize`
- 拖拽过程中实时修改 `expandedWidth`
- 支持最小/最大宽度约束
- 保持现有 `leftAside / rightAside` 受控模型不变

## 2. 最终边界

### 2.1 状态归属

`aside` 宽度状态归属 `ChatLayout`，不是 `ChatAside`。

原因：

- 对外配置入口是 `ChatLayoutProps.leftAside / rightAside`
- 实际改动的是 `ChatAsideConfig.expandedWidth`
- 拖拽依赖 layout 根容器、对侧面板宽度、main 最小宽度

结论：

- `resizable / minExpandedWidth / maxExpandedWidth` 放 `ChatAsideConfig`
- `aside-resize-*` 事件放 `ChatLayout`
- `ChatAside` 保持展示层

### 2.2 组件边界

- `ChatLayout.vue`
  - 接收 `leftAside / rightAside`
  - 创建 layout store
  - 提供 `aside-resize-start / aside-resize / aside-resize-end`
  - 渲染左右 resize trigger

- `ChatAside.vue`
  - 只负责 aside 展示壳
  - 不承接 resize 逻辑和事件

- `ChatAsideResizeTrigger.vue`
  - 内部实现组件
  - 不对外导出

## 3. 对外 API

文件：`packages/chat/src/types/layout.ts`

```ts
export interface ChatAsideConfig {
  layoutMode?: ChatAsideLayoutMode
  expanded?: boolean
  expandedWidth?: number | string
  collapsedWidth?: number | string
  resizable?: boolean
  minExpandedWidth?: number | string
  maxExpandedWidth?: number | string
}

export interface ChatAsideResizeEventDetail {
  placement: ChatPlacement
  width: number
}

export interface ChatLayoutProps {
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}

export interface ChatLayoutEmits {
  'aside-resize-start': [detail: ChatAsideResizeEventDetail]
  'aside-resize': [detail: ChatAsideResizeEventDetail]
  'aside-resize-end': [detail: ChatAsideResizeEventDetail]
}
```

## 4. 交互规则

只在以下条件下允许拖拽：

- `layoutMode === 'dock'`
- `expanded === true`
- `resizable === true`

不支持拖拽：

- `drawer`
- `dock + hidden`

拖拽时只修改：

- `expandedWidth`

不联动修改：

- `collapsedWidth`
- `layoutMode`
- `expanded`

宽度规则：

- 左侧：`nextWidth = startWidth + deltaX`
- 右侧：`nextWidth = startWidth - deltaX`

约束规则：

```ts
effectiveMax = min(configMax, containerWidth - mainMinWidth - oppositeDockWidth)
```

其中：

- `startWidth` 从真实渲染宽度读取
- `mainMinWidth` 从 `--tr-chat-layout-main-min-width` 读取
- `oppositeDockWidth` 统计另一侧当前 dock 占位宽度

## 5. 代码结构

### 5.1 公开类型

文件：`packages/chat/src/types/layout.ts`

- `ChatAsideConfig`
- `ChatAsideResizeEventDetail`
- `ChatLayoutProps`
- `ChatLayoutEmits`

### 5.2 内部共享契约

文件：`packages/chat/src/types/layout.internal.ts`

- `ChatLayoutPanelApi`
- `ChatLayoutStore`
- `ChatLayoutAsideStoreInput`
- `CreateChatLayoutStoreOptions`

### 5.3 store

文件：`packages/chat/src/composables/createChatLayoutStore.ts`

职责：

- 解析 left/right aside 配置
- 生成 panel 运行时 API
- 暴露：
  - `resizable`
  - `minExpandedWidth`
  - `maxExpandedWidth`
  - `setExpandedWidth(nextWidth)`

默认值：

- left: `expandedWidth=300px`, `min=200px`, `max=560px`
- right: `expandedWidth=320px`, `min=240px`, `max=640px`

### 5.4 layout helper

文件：`packages/chat/src/layout/utils.ts`

职责：

- `createChatLayoutAsideStoreInput`
- 收口 `ChatLayout.vue` 内部 left/right model bridge

### 5.5 交互 composable

文件：`packages/chat/src/composables/useChatAsideResize.ts`

职责：

- 处理 `pointerdown / move / up / cancel`
- 记录 `startX / startWidth / placement`
- 计算 `effectiveMax`
- 用 `requestAnimationFrame` 节流回写宽度
- 触发：
  - `aside-resize-start`
  - `aside-resize`
  - `aside-resize-end`
- 暴露：
  - `isResizing`
  - `draggingPlacement`
  - `leftHandleProps`
  - `rightHandleProps`

实现要点：

- 使用 `Pointer Events + setPointerCapture()`
- 起拖宽度读取 `getBoundingClientRect().width`
- 字符串宽度通过临时测量元素转成 px
- 拖拽期间锁定 `body.cursor` 和 `body.userSelect`

### 5.6 layout 编排

文件：

- `packages/chat/src/composables/useChatLayoutInteractions.ts`
- `packages/chat/src/composables/useChatLayoutViewState.ts`
- `packages/chat/src/layout/ChatLayout.vue`

分工：

- `useChatLayoutInteractions`
  - 编排 resize 交互
  - 处理 `Escape` 关闭 drawer

- `useChatLayoutViewState`
  - 负责纯派生状态
  - 负责 `layoutClass / layoutStyle / asideClass / resizeVisible`

- `ChatLayout.vue`
  - 只保留宏入口、store 注入、composable 接线、模板装配

## 6. Resize Trigger 结构

文件：`packages/chat/src/layout/ChatAsideResizeTrigger.vue`

当前结构：

```vue
<button
  type="button"
  class="tr-chat-layout__resize-trigger"
  :class="`tr-chat-layout__resize-trigger--${placement}`"
  data-part="resize-trigger"
  :data-placement="placement"
  :data-dragging="isDragging ? '' : undefined"
  tabindex="-1"
  @pointerdown="emit('pointerdown', $event)"
>
  <span
    class="tr-chat-layout__resize-trigger-indicator"
    data-part="resize-trigger-indicator"
    aria-hidden="true"
  />
</button>
```

结论：

- trigger 是内部组件，不对外导出
- `ChatAsideToggle` 对外暴露，`ChatAsideResizeTrigger` 不暴露

## 7. 视觉实现

文件：

- `packages/chat/src/styles/layout.css`
- `packages/chat/src/styles/tokens.css`

当前实现对齐 Ark 风格的核心思路：

- trigger 负责命中区
- `::before` 画贯穿整高的中心细线
- indicator 只负责中间 pill

状态表现：

- 默认态：中心线透明
- hover：轻高亮
- dragging：品牌色强化

关键变量：

```css
--tr-chat-layout-main-min-width: 320px;
--tr-chat-layout-resize-trigger-size: 6px;
--tr-chat-layout-resize-line-color: transparent;
--tr-chat-layout-resize-line-hover-color: ...;
--tr-chat-layout-resize-line-active-color: ...;
--tr-chat-layout-resize-indicator-width: 6px;
--tr-chat-layout-resize-indicator-height: 22px;
--tr-chat-layout-resize-indicator-bg: #ffffff;
--tr-chat-layout-resize-indicator-border: ...;
--tr-chat-layout-resize-indicator-active-bg: ...;
--tr-chat-layout-resize-indicator-active-border: ...;
--tr-chat-layout-resize-indicator-active-shadow: ...;
```

## 8. 数据流

宽度更新链路不变：

- `update:leftAside`
- `update:rightAside`

新增事件只补语义：

- `aside-resize-start`
- `aside-resize`
- `aside-resize-end`

结论：

- 受控模型不变
- resize 生命周期增强可供埋点、持久化、联动使用

## 9. 非目标

第一阶段不做：

- 键盘拖拽
- 完整 ARIA separator 语义
- 多 panel / 嵌套 splitter
- 百分比 `size[]` 分栏模型

## 10. 当前结论

- `resizable` 继续保留在 `ChatAsideConfig`
- `aside-resize-*` 继续由 `ChatLayout` 对外抛出
- `ChatAsideResizeTrigger.vue` 保持内部组件
- resize 不下沉到 `ChatAside`
