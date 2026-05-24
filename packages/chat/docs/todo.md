# packages/chat TODO

## 1. 顶层 Props 收口

当前会议结论：

- `ChatLayoutProps` 直接承载顶层形态字段。
- 不再保留 `surface?: ChatSurfaceConfig` 这一层包装。
- 顶层形态的公开模型收口为：

```ts
export type ChatSurfaceMode = 'embedded' | 'detached'

export interface ChatDetachedBounds {
  x?: number
  y?: number
  width?: number | string
  height?: number | string
}

export interface ChatLayoutProps {
  surfaceMode?: ChatSurfaceMode
  detachedBounds?: ChatDetachedBounds
  detachedDraggable?: boolean
  detachedResizable?: boolean
  minDetachedWidth?: number | string
  maxDetachedWidth?: number | string
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}
```

同步约定：

- `surfaceMode` 只保留 `embedded | detached` 两态。
- `detachedBounds`、`detachedDraggable`、`detachedResizable`、`minDetachedWidth`、`maxDetachedWidth` 仅在 `surfaceMode === 'detached'` 时生效。
- `embedded` 不参与 drag / resize。
- 顶层形态相关的 `defineModel` / `emit` / 类型定义 / demo 接线一起收口。

运行时接线约定：

- 走 `defineModel`
  - `surfaceMode`
  - `detachedBounds`
  - `leftAside`
  - `rightAside`
- 保持普通 props
  - `detachedDraggable`
  - `detachedResizable`
  - `minDetachedWidth`
  - `maxDetachedWidth`

对外事件约定：

- `update:surfaceMode`
- `update:detachedBounds`
- `update:leftAside`
- `update:rightAside`

需要移除的旧字段 / 旧事件：

- `ChatSurfaceConfig`
- `ChatSurfaceMode`
- `floatingRect`
- `edgeWidth`
- `snapThreshold`
- `update:surface`

涉及文件：

- [src/types/layout.ts](../src/types/layout.ts)
- [src/layout/ChatLayout.vue](../src/layout/ChatLayout.vue)
- [src/composables/useChatSurface.ts](../src/composables/useChatSurface.ts)
- [demo/src/layout-demos/SurfaceLayoutDemo.vue](../demo/src/layout-demos/SurfaceLayoutDemo.vue)

## 2. aside-resize 收口

当前会议结论：

- `ChatAsideConfig` 现有 props 不动。
- aside resize 的 owner 继续是 `Chat.Layout`。
- resize trigger 放在 `Layout`，不下沉到 `Chat.Aside`。
- 如果后面只是为了减轻模板体积，可以继续抽 `Layout` 内部壳层组件，但职责归属不变。

补充约定：

- `ChatAsideResizeTrigger.vue` 继续作为 layout 内部组件使用即可。
- `Chat.Aside` 保持内容壳定位，不接管 layout 约束计算。

涉及文件：

- [src/layout/ChatAsideResizeTrigger.vue](../src/layout/ChatAsideResizeTrigger.vue)
- [src/layout/ChatAside.vue](../src/layout/ChatAside.vue)
- [src/layout/ChatLayout.vue](../src/layout/ChatLayout.vue)
- [src/composables/useChatAsideResize.ts](../src/composables/useChatAsideResize.ts)

## 3. 顶层形态收口

当前会议结论：

- 只保留 `surfaceMode: 'embedded' | 'detached'`。
- 不再保留 `edge-right` 的公开语义。
- 右贴边能力彻底移除。
- 不再保留任何“靠右吸附为侧边”的内部状态、样式和运行时逻辑。

这一项的清理标准：

- 不能再存在 `edge-right` 相关类型和值。
- 不能再存在“拖拽中判断是否靠右吸附”的逻辑。
- 不能再存在“释放后切换到右贴边态”的逻辑。
- 不能再存在“从右贴边态恢复 detached”的逻辑。
- 不能再存在只为右贴边服务的 `edgeWidth` / `snapThreshold` / 样式分支 / demo 表达。

涉及文件：

- [src/types/layout.ts](../src/types/layout.ts)
- [src/composables/useChatSurface.ts](../src/composables/useChatSurface.ts)
- [src/styles/surface.css](../src/styles/surface.css)
- [demo/src/layout-demos/SurfaceLayoutDemo.vue](../demo/src/layout-demos/SurfaceLayoutDemo.vue)
- [layout-surface-plan.md](./layout-surface-plan.md)
- [layout-surface-v2-plan.md](./layout-surface-v2-plan.md)

## 4. detached V2-A 交互

当前会议结论：

- `detached` 形态按 V2-A 交互设计实现。
- 顶部 drag bar 只负责 drag。
- 左右 resize handle 只负责 resize。
- drag / resize 两套交互互斥。
- `detachedResizable === true` 时，左右边界都支持改宽。
- 宽度在 `[minDetachedWidth, maxDetachedWidth]` 范围内时，优先执行 resize。
- 宽度到达边界后，剩余位移继续推动 detached 整体移动。

对外事件约定：

- `detached-resize-start`
- `detached-resize`
- `detached-resize-end`

事件 detail 约定：

```ts
export interface ChatDetachedResizeEventDetail {
  edge: 'left' | 'right'
  width: number
}
```

实现备注：

- `useChatSurface.ts` 文件名本轮可暂时保留，不急着更名。
- 旧的 `floating + edge-right` 状态机需要瘦身成 `embedded / detached + drag / resize` 模型。

涉及文件：

- [src/composables/useChatSurface.ts](../src/composables/useChatSurface.ts)
- [src/layout/ChatLayout.vue](../src/layout/ChatLayout.vue)
- [src/styles/surface.css](../src/styles/surface.css)
- [layout-surface-v2-plan.md](./layout-surface-v2-plan.md)

## 5. resize trigger 组件策略

当前会议结论：

- aside resize trigger 和 detached resize trigger 不直接复用同一个上层组件。
- `ChatAsideResizeTrigger.vue` 继续服务于 dock aside。
- detached 左右边界单独做一套 surface trigger。
- 两者都属于 `Layout` 内部实现。

补充约定：

- 可以复用 DOM 骨架、命中区思路和视觉语言。
- 不直接复用 aside 专属的 props / 状态命名。
- 如果后面确认两套 trigger 长期只差状态映射，再抽内部 base primitive。

涉及文件：

- [src/layout/ChatAsideResizeTrigger.vue](../src/layout/ChatAsideResizeTrigger.vue)
- [src/styles/aside-resize.css](../src/styles/aside-resize.css)
- [src/styles/surface.css](../src/styles/surface.css)
- [layout-surface-v2-plan.md](./layout-surface-v2-plan.md)

## 6. 主区滚动与虚拟滚动条

当前会议结论：

- `Main` 区域直接设 `height: 100%`，只负责高度和裁剪。
- `BubbleList` 填充 `Main` 区域。
- `BubbleList` 作为主区唯一真实滚动宿主。
- `BubbleList` 内部分成两层：
  - 根层负责滚动并铺满 `Main`
  - 内容层负责 `max-width + margin-inline + padding-inline`
- 虚拟滚动条只控制 `BubbleList` 的滚动。
- 原生滚动条隐藏。

明确不做：

- 不引入 `external scroll host`
- 不新增 `scrollHost / scrollTarget` 这套 API
- 不把 `ChatMain` 升级成通用 `ScrollArea` 抽象

落地前提：

- `ChatLayout.main-shell` 不再承担真实滚动。
- `ChatMain` 需要保证 `height: 100%`、`min-height: 0`、`overflow: hidden`。
- `BubbleList` 的滚动根节点不能同时承担内容限宽职责。

涉及文件：

- [src/layout/ChatMain.vue](../src/layout/ChatMain.vue)
- [src/styles/layout-shell.css](../src/styles/layout-shell.css)
- [../../components/src/bubble/BubbleList.vue](../../components/src/bubble/BubbleList.vue)
- [../../components/src/bubble/index.type.ts](../../components/src/bubble/index.type.ts)
- [chat-main-scroll-plan.md](./chat-main-scroll-plan.md)

## 7. 案例与文档同步

当前会议结论：

- `SurfaceLayoutDemo` 只保留 `Embedded` / `Detached` 两种形态。
- 删除 `Edge Right` 按钮、文案和相关状态。
- ChatGPT / DeepSeek / Container 继续作为 layout demo 保留，但不再传递右吸附心智。
- 文档需要同步删除旧的 `edge-right` 叙述和旧绝对路径链接。

涉及文件：

- [demo/src/layout-demos/SurfaceLayoutDemo.vue](../demo/src/layout-demos/SurfaceLayoutDemo.vue)
- [demo/src/App.vue](../demo/src/App.vue)
- [note.md](./note.md)
- [layout-surface-plan.md](./layout-surface-plan.md)
- [layout-surface-v2-plan.md](./layout-surface-v2-plan.md)
- [chat-main-scroll-plan.md](./chat-main-scroll-plan.md)
