# ChatLayout 顶层形态收口方案

## 1. 目标

`packages/chat` 的顶层承载形态收口为更直接的两态模型：

- `embedded`
  - 作为普通布局内容嵌入页面
- `detached`
  - 作为顶层浮层承载在 layout host 内

本轮明确删除的旧表达：

- 嵌套的 `surface` 单对象包装
- 旧三态命名和配套字段
- 旧侧吸附语义及其恢复逻辑

## 2. 已确认的公开模型

顶层形态相关字段直接挂在 `ChatLayoutProps` 上，不再套一层 `surface` 包装：

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

字段职责：

- `surfaceMode`
  - 顶层承载模式，只保留 `embedded | detached`
- `detachedBounds`
  - `detached` 的位置和尺寸
- `detachedDraggable`
  - 是否允许通过顶部 drag bar 拖拽
- `detachedResizable`
  - 是否允许左右边界 resize
- `minDetachedWidth / maxDetachedWidth`
  - `detached` 模式下的宽度边界

## 3. 两态语义

### 3.1 `embedded`

- 占据 layout 的正常主承载区域
- 不参与 drag / resize
- 不读取 `detachedBounds` 和 `detached*` 能力

### 3.2 `detached`

- 作为顶层浮层承载在 `surface host` 内
- 位置和尺寸由 `detachedBounds` 表达
- 可选接入 `detachedDraggable`
- 可选接入 `detachedResizable`

## 4. 绑定与事件

顶层形态改为受控模型，和 aside 一样走显式绑定：

```ts
const surfaceMode = defineModel<ChatSurfaceMode>('surfaceMode')
const detachedBounds = defineModel<ChatDetachedBounds>('detachedBounds')
const leftAside = defineModel<ChatAsideConfig>('leftAside')
const rightAside = defineModel<ChatAsideConfig>('rightAside')
```

对外事件约定：

- `update:surfaceMode`
- `update:detachedBounds`
- `update:leftAside`
- `update:rightAside`

普通 props 保持直接传入：

- `detachedDraggable`
- `detachedResizable`
- `minDetachedWidth`
- `maxDetachedWidth`

本轮需要移除的旧事件：

- 单对象 surface 更新事件

## 5. 运行时约束

运行时模型同步瘦身为 `embedded / detached + drag / resize`：

- 不再保留旧吸附子状态机
- 不再保留拖拽过程中的吸附判定
- 不再保留释放后切换到附着态的逻辑
- 不再保留从附着态恢复 detached 的逻辑
- `detachedBounds` 成为 detached 几何信息的唯一公开来源

实现层备注：

- `useChatSurface.ts` 文件名本轮可以暂时保留
- 但内部职责应围绕 `surfaceMode` / `detachedBounds` 重组

## 6. Demo 与文档同步要求

- `SurfaceLayoutDemo` 只保留 `Embedded / Detached` 两个顶层按钮
- 不再展示第三种顶层按钮
- 不再在 demo 文案里传递侧吸附心智
- `note.md` 只保留新的文档入口和相对路径链接

## 7. 评审只需确认 6 点

- 是否接受顶层形态字段直接挂在 `ChatLayoutProps`
- 是否接受 `surfaceMode` 只保留 `embedded | detached`
- 是否接受 `detachedBounds` 作为 detached 几何信息的公开模型
- 是否接受 `detachedDraggable / detachedResizable / minDetachedWidth / maxDetachedWidth`
- 是否接受顶层形态走 `update:surfaceMode` 和 `update:detachedBounds`
- 是否接受彻底删除旧侧吸附相关公开语义
