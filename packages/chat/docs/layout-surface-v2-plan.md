# ChatLayout detached V2-A 交互方案

## 1. 目标

在两态模型已经收口为 `embedded / detached` 之后，V2-A 只讨论 `detached` 的交互增强，不再引入旧的侧吸附设计。

本轮目标：

- 顶部 drag bar 负责 drag
- 左右 resize handle 负责改宽
- drag / resize 两套交互互斥
- 宽度达到边界后，多余位移继续推动 detached 整体移动

本轮不做：

- 侧吸附
- 多边吸附
- guideline 预览
- 底边或角点 resize
- `interact.js`

## 2. 适用范围

### 2.1 `embedded`

- 不参与 drag / resize
- 不读取 `detachedBounds` 以外的 detached 交互字段

### 2.2 `detached`

- 可通过顶部 drag bar 拖拽
- `detachedResizable === true` 时，左右边界都支持改宽
- 宽度约束由 `minDetachedWidth / maxDetachedWidth` 控制

## 3. 公开配置

```ts
export interface ChatLayoutProps {
  surfaceMode?: 'embedded' | 'detached'
  detachedBounds?: ChatDetachedBounds
  detachedDraggable?: boolean
  detachedResizable?: boolean
  minDetachedWidth?: number | string
  maxDetachedWidth?: number | string
}
```

说明：

- `detachedBounds`
  - detached 的唯一公开几何状态
- `detachedDraggable`
  - 顶部 drag bar 是否启用
- `detachedResizable`
  - 左右边界 resize 是否启用
- `minDetachedWidth / maxDetachedWidth`
  - detached 改宽区间

## 4. 对外事件

detached resize 生命周期事件约定为：

- `detached-resize-start`
- `detached-resize`
- `detached-resize-end`

事件 detail：

```ts
export interface ChatDetachedResizeEventDetail {
  edge: 'left' | 'right'
  width: number
}
```

用途：

- `detached-resize-start`
  - 标记一次 resize 交互开始
- `detached-resize`
  - 对外同步当前宽度
- `detached-resize-end`
  - 用于持久化、埋点和联动

## 5. 交互规则

### 5.1 drag

- 只有顶部 drag bar 能发起拖拽
- 内容区域不承担拖拽入口
- `detachedDraggable !== false` 时才允许拖拽

### 5.2 resize

- 左右边界 handle 只负责 resize
- `detachedResizable === true` 时显示
- hit area 继续按 detached 独立 trigger 设计

### 5.3 位移消耗顺序

- 宽度在 `[minDetachedWidth, maxDetachedWidth]` 内时，优先执行 resize
- 宽度达到边界后，剩余位移继续推动 detached 整体移动
- 这条规则对左边和右边 resize 都成立

### 5.4 互斥关系

- dragSession 和 resizeSession 必须互斥
- resize 中不再触发任何吸附判定
- 交互模型收口为 `detached + drag / resize`

## 6. 运行时状态

内部运行时状态可以保留：

- `activeResizeEdge`
- `resizeSession`
- `dragSession`

但不再保留：

- 旧附着态
- 旧吸附候选状态
- 旧恢复态缓存
- 任何只为侧吸附服务的样式或状态分支

备注：

- `useChatSurface.ts` 文件名本轮可暂时保留
- 但内部状态机应围绕 `detachedBounds` 重构

## 7. resize trigger 策略

- aside resize trigger 和 detached resize trigger 不直接复用同一个上层组件
- `ChatAsideResizeTrigger.vue` 继续服务于 dock aside
- detached 左右边界单独做一套 surface trigger
- 两者都属于 `Chat.Layout` 内部实现

## 8. 暂不进入 V2-B

只有在明确需要这些能力时，再单独开 V2-B：

- guideline 预览
- 多边吸附
- 更完整的 resize handle 体系
- 更复杂的 restriction / modifier
- 评估是否引入 `interact.js`

## 9. 评审只需确认 6 点

- 是否接受 V2-A 只围绕 `detached` 展开
- 是否接受顶部 drag bar 只负责 drag
- 是否接受左右边界 handle 只负责 resize
- 是否接受 `detachedResizable === true` 时支持左右改宽
- 是否接受达到宽度边界后继续推动 detached 整体移动
- 是否接受本轮不再保留任何侧吸附相关设计
