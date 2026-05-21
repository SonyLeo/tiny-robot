# ChatLayout 顶层形态方案

## 1. 目标

为 `Chat.Layout` 增加顶层展示形态能力，支持 3 个运行态：

- `fullscreen`：铺满 PC 视口
- `floating`：固定宽高悬浮窗，顶部拖拽条可拖动
- `edge-right`：释放到右侧阈值内后吸附到页面右边

本方案只解决：

- 顶层形态切换
- 浮窗拖拽
- 右侧吸附

本方案不解决：

- `aside` 改宽
- 浮窗缩放
- 多边吸附

## 2. 当前结构结论

当前 `Chat.Layout` 只有内部区域配置：

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

## 3. 业界结论

业界常见做法一致：

- 浮窗态和边缘吸附态是两个独立状态，不是同一个位置值的变体
- 拖拽入口放在顶部 header / drag bar，而不是整块内容区域
- 拖拽过程限制在 viewport 内
- 吸附采用“阈值判定 + 松手提交”，而不是拖拽中实时强切状态

对当前仓库最合适的实现结论：

- v1 不新增拖拽库
- 直接使用已存在依赖 `@vueuse/core` 的 `useDraggable`
- 右侧吸附逻辑自行实现

## 4. 最小 props 方案

推荐采用单个顶层配置对象：

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
  - 是否允许浮窗拖拽
- `floatingRect`
  - 浮窗的位置和尺寸
- `edgeWidth`
  - 右侧吸附态宽度
- `snapThreshold`
  - 距右边缘多少像素内判定为可吸附

这是当前需求的最小闭环。

## 5. 两组命名设计

### 5.1 方案 A：推荐

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

命名特点：

- `surface` 和 `leftAside / rightAside` 一样，都是直接对象 props
- `mode` 延续当前 `layoutMode` 的命名习惯
- `floatingRect / edgeWidth` 语义直接

### 5.2 方案 B：备选

```ts
interface ChatLayoutProps {
  surfaceConfig?: ChatSurfaceConfig
}

interface ChatSurfaceConfig {
  type?: 'fullscreen' | 'floating' | 'edge-right'
  dragEnabled?: boolean
  floating?: ChatSurfaceRect
  edge?: {
    width?: number | string
    threshold?: number
  }
}
```

命名特点：

- 更接近 `popupConfig` 这类统一配置对象风格
- 嵌套更多，表达更显式

最终结论：

- 采用方案 A
- 原因是更贴近 `Chat.Layout` 当前 API 风格，且层级更少

## 6. 状态模型

必须保存两组数据：

- `mode`
- `lastFloatingRect`

规则：

- `fullscreen -> floating`：使用 `floatingRect`
- `floating -> edge-right`：保留 `lastFloatingRect`
- `edge-right -> floating`：恢复 `lastFloatingRect`

否则会出现：

- 吸附后再恢复悬浮，位置丢失
- 每次恢复悬浮都回到默认点位

## 7. 交互规则

### 7.1 fullscreen

- 铺满视口
- 不参与拖拽

### 7.2 floating

- 仅顶部拖拽条可拖
- 只有 `draggable === true` 时允许拖拽
- 拖拽时限制在 viewport 内
- 至少保留拖拽条可见

### 7.3 edge-right

- 释放时进入右侧阈值范围则吸附
- 吸附后固定到页面右边
- 默认只保留 `edgeWidth` 可配置
- 拖离右侧后恢复到上次 `floatingRect`

## 8. 实现位置

### 8.1 类型层

文件：

- `packages/chat/src/types/layout.ts`

新增：

- `ChatSurfaceMode`
- `ChatSurfaceRect`
- `ChatSurfaceConfig`
- `surface?: ChatSurfaceConfig`

### 8.2 逻辑层

建议新增 composable：

- `packages/chat/src/composables/useChatSurface.ts`

职责：

- 管理 `mode`
- 管理 `floatingRect`
- 管理吸附判定
- 输出拖拽中的样式状态

结论：

- 不建议把顶层拖拽状态直接堆进 `createChatLayoutStore.ts`
- `surface` 和 `aside` 是两类不同职责

### 8.3 组件层

文件：

- `packages/chat/src/layout/ChatLayout.vue`
- `packages/chat/src/styles/layout.css`

职责：

- 渲染拖拽条
- 根据 `mode` 切换 `fullscreen / floating / edge-right` class
- 绑定 `useDraggable`

## 9. 拖拽实现方案

v1 采用：

- `@vueuse/core`
- `useDraggable`

原因：

- 仓库已存在依赖
- 已满足顶部拖拽、容器边界限制、位置同步需求
- 当前不需要为此引入新库

不采用新库的结论：

- `interact.js` 功能更强，但对当前需求偏重
- 只有后续确定要一起做拖拽 + 缩放 + 多边吸附时，才值得评估

## 10. 吸附规则

建议规则：

- 拖拽中只显示预备态，不立即切到 `edge-right`
- `pointerup` 时再根据阈值决定是否吸附
- 默认 `snapThreshold` 建议 `24` 到 `32`
- v1 只支持右侧吸附

这套规则最稳定，也最容易和滚动、文本选择、iframe 等问题隔离。

## 11. 默认值建议

建议默认值：

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

## 12. 最终方案

最终采用：

- `ChatLayoutProps.surface?: ChatSurfaceConfig`
- `mode = 'fullscreen' | 'floating' | 'edge-right'`
- 浮窗拖拽基于 `useDraggable`
- 只做顶部拖拽
- 只做右侧吸附
- 吸附在 `pointerup` 时提交
- 保留 `lastFloatingRect`

## 13. 评审只需确认 6 点

- 是否接受顶层能力放在 `surface`，而不是 `aside`
- 是否接受 `fullscreen / floating / edge-right` 三态模型
- 是否接受方案 A 命名
- 是否接受 v1 只支持顶部拖拽
- 是否接受 v1 只支持右侧吸附
- 是否接受 v1 直接使用 `useDraggable`，不引入新库

## 14. 参考

- VueUse `useDraggable`
  - https://vueuse.org/core/usedraggable/
- Dockview Floating Groups
  - https://dockview.dev/docs/core/groups/floatingGroups/
- Dockview Edge Groups
  - https://dockview.dev/docs/core/groups/edgeGroups/
- Interact.js Snapping
  - https://interactjs.io/docs/snapping/
- MDN `setPointerCapture()`
  - https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
