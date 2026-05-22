# ChatLayout 顶层形态方案

## 1. 目标

为 `Chat.Layout` 增加顶层展示形态能力，支持 3 个运行态：

- `fullscreen`：铺满 PC 视口
- `floating`：固定宽高悬浮窗，顶部 drag bar 可拖动
- `edge-right`：释放到右侧阈值内后，吸附到页面右边，顶部 drag bar 也可拖动

本方案只解决：

- 顶层形态切换
- 悬浮拖拽
- 右侧吸附

本方案不解决：

- `aside` 改宽
- 悬浮窗缩放
- 多边吸附

## 2. 当前结构结论

当前 `Chat.Layout` 只承载内部区域配置：

```ts
interface ChatLayoutProps {
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}
```

结论：

- `leftAside / rightAside` 只表达内部侧栏，不适合承载顶层窗口形态
- 顶层形态必须是 `Chat.Layout` 自己的新配置
- 该能力与 `TrContainer` 无直接关系，不复用其 props 语义

## 3. 成熟方案对比

### 3.1 Dockview

结论：

- `floating groups` 和 `edge groups` 是两个独立状态
- 浮窗可以在 viewport 范围内移动
- 整体状态可序列化

对我们有用的点：

- `floating` 和 `edge-right` 必须拆开
- 需要保存 `lastFloatingRect`
- 顶层 `surface` 需要可控更新入口

参考：

- Floating Groups
  - https://dockview.dev/docs/core/groups/floatingGroups/
- Edge Groups
  - https://dockview.dev/docs/core/groups/edgeGroups/

### 3.2 Golden Layout

结论：

- 顶层窗口状态会被序列化为 config
- 容器移动后会触发统一状态更新

对我们有用的点：

- `surface` 不应该只是只读 props
- 必须补 `update:surface`

参考：

- https://golden-layout.com/docs/

### 3.3 VueUse `useDraggable`

结论：

- 已支持 `handle`
- 已支持 `containerElement`
- 已支持拖拽生命周期回调

对我们有用的点：

- v1 不需要引入新拖拽库
- 可以直接用来完成顶部拖拽和边界限制

参考：

- https://vueuse.org/core/usedraggable/

### 3.4 interact.js

结论：

- 适合做 drag + resize + restriction + snap modifiers
- 对当前需求偏重

对我们有用的点：

- 只有未来要一起做“缩放 + 多边吸附 + 更复杂 snap”时，才值得升级

参考：

- Restriction
  - https://interactjs.io/docs/restriction/
- Snapping
  - https://interactjs.io/docs/snapping/

## 4. 对当前方案的优化结论

基于成熟方案和当前场景，当前方案需要收口 4 个点：

- `surface` 必须是可控状态，而不是单纯配置对象
- `floating` 和 `edge-right` 必须独立建模
- 必须保存 `lastFloatingRect`
- v1 继续使用 `useDraggable`，不引入新库

## 5. 最小 props 方案

推荐继续使用单个顶层配置对象：

```ts
export type ChatSurfaceMode = 'fullscreen' | 'floating' | 'edge-right'

export interface ChatSurfaceRect {
  x?: number
  y?: number
  width?: number | string
  height?: number | string
}

export interface ChatSurfaceConfig {
  mode?: ChatSurfaceMode
  draggable?: boolean
  floatingRect?: ChatSurfaceRect
  edgeWidth?: number | string
  snapThreshold?: number
}

export interface ChatLayoutProps {
  surface?: ChatSurfaceConfig
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}
```

字段职责：

- `mode`
  - 当前顶层形态
- `draggable`
  - 是否允许悬浮拖拽
- `floatingRect`
  - 悬浮窗位置和尺寸
- `edgeWidth`
  - 右侧吸附态宽度
- `snapThreshold`
  - 距右边缘多少像素内判定为可吸附

## 6. 对外事件与绑定方式

这一点是对现有方案最重要的优化。

`surface` 既然会在运行中变化，就必须有对外更新出口。

推荐：

```ts
export interface ChatLayoutProps {
  surface?: ChatSurfaceConfig
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}
```

```ts
export interface ChatLayoutEmits {
  'update:surface': [value: ChatSurfaceConfig | undefined]
}
```

组件侧建议直接使用：

```ts
const surfaceState = defineModel<ChatSurfaceConfig>('surface')
```

结论：

- `surface` 走和 `leftAside / rightAside` 一样的受控模式
- 不额外发明 `surface-change`
- 统一使用 `v-model:surface`

## 7. 状态模型

### 7.1 对外状态

对外只保留：

- `mode`
- `floatingRect`
- `edgeWidth`
- `draggable`
- `snapThreshold`

### 7.2 内部运行时状态

内部额外保存：

- `lastFloatingRect`
- `isDraggingSurface`
- `pendingSnapPlacement`

规则：

- `fullscreen -> floating`
  - 使用 `floatingRect`
- `floating -> edge-right`
  - 先保存 `lastFloatingRect`
- `edge-right -> floating`
  - 恢复 `lastFloatingRect`

结论：

- `lastFloatingRect` 是运行时必需状态
- 不建议一开始暴露到 props

## 8. 形态规则

### 8.1 fullscreen

- 铺满视口
- 不参与拖拽

### 8.2 floating

- 仅顶部 drag bar 可拖
- 不允许整块内容区域拖动
- 拖拽时限制在 viewport 内
- 至少保留 drag bar 可见

### 8.3 edge-right

- 释放时进入右侧阈值范围则吸附
- 吸附后固定到页面右边
- 默认只保留 `edgeWidth` 可配置
- 从 `edge-right` 回到 `floating` 时恢复上次 `floatingRect`
- 顶部 drag bar 可作为拖拽起点
- 从 `edge-right` 开始拖拽时，先切回 `floating` 再继续拖动

## 9. 吸附规则

推荐规则：

- 拖拽中只显示预备态，不立刻切到 `edge-right`
- `pointerup` 时再根据阈值决定是否吸附
- 默认 `snapThreshold` 建议 `24` 到 `32`
- v1 只支持右侧吸附
- 从 `edge-right` 拖离时，继续沿用同一套右侧吸附判定

结论：

- 当前场景没必要做实时强切
- “预览 + 松手提交”最稳

## 10. 命名方案

### 10.1 推荐

```ts
interface ChatLayoutProps {
  surface?: ChatSurfaceConfig
}

interface ChatSurfaceConfig {
  mode?: 'fullscreen' | 'floating' | 'edge-right'
  draggable?: boolean
  floatingRect?: ChatSurfaceRect
  edgeWidth?: number | string
  snapThreshold?: number
}
```

原因：

- 贴近当前 `leftAside / rightAside` 风格
- 层级少
- 命名直接

### 10.2 不采用

```ts
surfaceConfig
dragEnabled
edge: { width, threshold }
```

原因：

- 更重
- 嵌套更深
- 不如当前 API 风格统一

## 11. 实现位置

### 11.1 类型层

文件：

- `packages/chat/src/types/layout.ts`

新增：

- `ChatSurfaceMode`
- `ChatSurfaceRect`
- `ChatSurfaceConfig`
- `surface?: ChatSurfaceConfig`
- `update:surface`

### 11.2 逻辑层

新增 composable：

- `packages/chat/src/composables/useChatSurface.ts`

职责：

- 读取/写回 `surface`
- 管理 `lastFloatingRect`
- 管理 `pendingSnapPlacement`
- 封装 `useDraggable`
- 负责 `edge-right -> floating` 的拖拽切换
- 输出 `surfaceStyle / surfaceClass / dragBarClass`

结论：

- `surface` 不进入 `createChatLayoutStore.ts`
- `surface` 是独立于 `aside` 的另一条顶层能力线

### 11.3 组件层

文件：

- `packages/chat/src/layout/ChatLayout.vue`
- `packages/chat/src/styles/layout.css`

职责：

- 渲染 drag bar
- 切换 `fullscreen / floating / edge-right`
- 消费 `useChatSurface`

## 12. 拖拽实现方案

v1 采用：

- `@vueuse/core`
- `useDraggable`

使用方式：

- 只绑定 drag bar 为 handle
- `containerElement` 指向 viewport/容器
- 在 `onEnd` 中提交 snap 判断

结论：

- `useDraggable` 足够覆盖 v1
- 不需要为此引入 `interact.js`

## 13. 默认值建议

```ts
surface: {
  mode: 'fullscreen',
  draggable: true,
  floatingRect: {
    width: 420,
    height: '80vh',
  },
  edgeWidth: 380,
  snapThreshold: 28,
}
```

## 14. 最终方案

最终采用：

- `ChatLayoutProps.surface?: ChatSurfaceConfig`
- `ChatLayoutEmits['update:surface']`
- `mode = 'fullscreen' | 'floating' | 'edge-right'`
- `surface` 走 `v-model:surface`
- 顶部 drag bar 拖拽基于 `useDraggable`
- 只做顶部拖拽
- 只做右侧吸附
- `edge-right` 拖离时会切回 `floating`
- 吸附在 `pointerup` 时提交
- 内部保留 `lastFloatingRect`

## 15. 评审只需确认 7 点

- 是否接受顶层能力放在 `surface`
- 是否接受 `surface` 走 `v-model:surface`
- 是否接受 `fullscreen / floating / edge-right` 三态模型
- 是否接受 `floating` 和 `edge-right` 独立建模
- 是否接受 v1 只支持顶部拖拽
- 是否接受 v1 只支持右侧吸附
- 是否接受 v1 继续使用 `useDraggable`

## 16. 参考

- VueUse `useDraggable`
  - https://vueuse.org/core/usedraggable/
- Dockview Floating Groups
  - https://dockview.dev/docs/core/groups/floatingGroups/
- Dockview Edge Groups
  - https://dockview.dev/docs/core/groups/edgeGroups/
- Golden Layout
  - https://golden-layout.com/docs/
- Interact.js Restriction
  - https://interactjs.io/docs/restriction/
- Interact.js Snapping
  - https://interactjs.io/docs/snapping/
