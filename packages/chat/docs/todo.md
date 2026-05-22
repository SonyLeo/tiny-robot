# packages/chat TODO

## 1. 顶层 Props 收口

当前会议结论：

- `ChatLayoutProps` 后续要直接承载顶层形态字段。
- 不再保留 `surface?: ChatSurfaceConfig` 这一层包装。
- 目标结构以当前讨论稿为准：

```ts
export interface ChatLayoutProps {
  // DOM position 相关的类别
  // static -> 占据真实 DOM 空间；fixed -> 不占据真实 DOM 空间
  mode?: ChatSurfaceMode

  // position:fixed 情况下支持以下属性
  draggable?: boolean
  floatingRect?: ChatSurfaceRect
  resizable?: boolean

  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}
```

待处理点：

- `mode` 当前命名不准确，后续需要重命名。
- `floatingRect` 当前命名不准确，后续需要重命名。
- 顶层形态相关的 `defineModel` / `emit` / 类型定义 / demo 接线都需要一起收口。

涉及文件：

- [layout.ts](</E:/LS_WorkSpace/web/tiny-robot/packages/chat/src/types/layout.ts:1>)
- [ChatLayout.vue](</E:/LS_WorkSpace/web/tiny-robot/packages/chat/src/layout/ChatLayout.vue:1>)
- [useChatSurface.ts](</E:/LS_WorkSpace/web/tiny-robot/packages/chat/src/composables/useChatSurface.ts:1>)

## 2. aside-resize 收口

当前会议结论：

- `ChatAsideConfig` 现有 props 不动。
- `ChatAsideResizeTrigger.vue` 不再保留为单独组件。
- resize trigger 回收到 aside 区域内部处理。
- 当前讨论口径记录为：直接放到 `ChatAside` 中。

涉及文件：

- [ChatAsideResizeTrigger.vue](</E:/LS_WorkSpace/web/tiny-robot/packages/chat/src/layout/ChatAsideResizeTrigger.vue:1>)
- [ChatAside.vue](</E:/LS_WorkSpace/web/tiny-robot/packages/chat/src/layout/ChatAside.vue:1>)
- [ChatLayout.vue](</E:/LS_WorkSpace/web/tiny-robot/packages/chat/src/layout/ChatLayout.vue:1>)

## 3. 顶层形态 v1 收口

当前会议结论：

- 不再重点强调“右侧边独立模式”。
- 右侧贴边更接近悬浮态的一个变种。
- 顶层形态要往更轻的模型收敛。
- 后续实现不再继续扩张 `edge-right` 的独立语义。

现有相关文档，后续按这条讨论再收口：

- [layout-surface-plan.md](</E:/LS_WorkSpace/web/tiny-robot/packages/chat/docs/layout-surface-plan.md:1>)

## 4. 顶层形态 v2-A 交互

当前会议结论：

- 悬浮面板需要满足 `V2-A` 的交互方式。
- `floating` 下：
  - 左右边界都可拖拽改宽。
  - 宽度在 `minWidth ~ maxWidth` 范围内时，优先改宽。
  - 达到 `maxWidth` 后，继续向拖拽方向移动时，整体继续移动。
  - 达到 `minWidth` 后，继续向收窄方向移动时，整体继续移动。
- 右侧贴边变种下：
  - 左边界可改宽。
  - 右边固定贴边。

现有相关文档：

- [layout-surface-v2-plan.md](</E:/LS_WorkSpace/web/tiny-robot/packages/chat/docs/layout-surface-v2-plan.md:1>)

## 5. resize handle 显隐规则

当前会议结论：

- resize 拖拽条默认不显示。
- 光标靠近边界时再显示。
- 这条规则适用于悬浮面板左右 resize handle。
- 顶部 drag bar 与边界 resize handle 分开：
  - 顶部条负责 drag
  - 边界 handle 负责 resize

涉及文件：

- [surface.css](</E:/LS_WorkSpace/web/tiny-robot/packages/chat/src/styles/surface.css:1>)
- [useChatSurface.ts](</E:/LS_WorkSpace/web/tiny-robot/packages/chat/src/composables/useChatSurface.ts:1>)

## 6. 主区滚动与虚拟滚动条

当前会议结论：

- `Main` 区域直接设 `height: 100%`。
- `BubbleList` 填充 `Main` 区域。
- `BubbleList` 作为真实滚动宿主。
- 虚拟滚动条只控制 `BubbleList` 的滚动。
- 原生滚动条隐藏。

涉及文件：

- [ChatMain.vue](</E:/LS_WorkSpace/web/tiny-robot/packages/chat/src/layout/ChatMain.vue:1>)
- [BubbleList.vue](</E:/LS_WorkSpace/web/tiny-robot/packages/components/src/bubble/BubbleList.vue:1>)
- [chat-main-scroll-plan.md](</E:/LS_WorkSpace/web/tiny-robot/packages/chat/docs/chat-main-scroll-plan.md:1>)
