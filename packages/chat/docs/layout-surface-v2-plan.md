# ChatLayout 顶层形态 V2 扩展方案

## 1. 目标

V2 扩展为更完整的 `surface` 窗口系统。

为方便评估，V2 拆为两个阶段：

- `V2-A`
  - `floating` 模式支持左右边界改宽
  - `edge-right` 模式支持左边界改宽
  - 保留右侧吸附
  - 不引入 `interact.js`
- `V2-B`
  - 在 `V2-A` 基础上，升级为更完整的 drag/resize/snap 系统
  - 再评估是否引入 `interact.js`

V2 总体仍不解决：

- 多边吸附
- 底边/角点联合缩放
- 多个 surface 并存

## 2. 阶段拆分

### 2.1 V2-A

目标：

- `floating` 左右改宽
- `edge-right` 左边改宽
- 继续仅支持右侧吸附

特点：

- 不做 guideline/snapping 预览
- 不做多边吸附
- 不做底边/角点缩放
- 不引入 `interact.js`

结论：

- 复杂度中高
- 可继续基于现有 `Pointer Events + useDraggable` 自己实现

### 2.2 V2-B

目标：

- 在 `V2-A` 基础上继续扩展更完整的窗口系统能力

可能包含：

- guideline/snapping 预览
- 多边吸附
- 更复杂的 restriction
- 更完整的 resize handle 体系

结论：

- 复杂度明显上升
- 这时再评估 `interact.js` 才有意义

## 3. 能力边界

### 3.1 floating

- 允许左侧和右侧 resize handle
- 改宽时同步修正 `x / width`
- 到达 `maxWidth` 后，继续向拉动方向拖拽时，面板整体继续移动
- 到达 `minWidth` 后，继续向收窄方向拖拽时，面板整体继续移动
- 最大宽度不能达到全屏

### 3.2 edge-right

- 允许左侧 resize handle
- 可逐步拉宽到接近全屏
- 仍保持右侧吸附语义，不切回 `fullscreen`
- 只改 `width`，右边固定贴边

## 4. 新增配置

推荐在 `ChatSurfaceConfig` 上追加：

```ts
export interface ChatSurfaceConfig {
  mode?: ChatSurfaceMode
  draggable?: boolean
  floatingRect?: ChatSurfaceRect
  edgeWidth?: number | string
  snapThreshold?: number

  resizable?: boolean
  minWidth?: number | string
  maxWidth?: number | string
  maxFloatingWidth?: number | string
  maxEdgeWidth?: number | string
}
```

字段职责：

- `resizable`
  - 是否启用 surface resize
- `minWidth`
  - surface 最小宽度
- `maxWidth`
  - 通用最大宽度
- `maxFloatingWidth`
  - `floating` 模式专属最大宽度
- `maxEdgeWidth`
  - `edge-right` 模式专属最大宽度

## 5. 状态模型扩展

内部运行时状态增加：

- `activeResizeEdge`
- `resizeSession`
- `pendingSurfaceResize`

规则：

- `floating` 改宽后更新 `floatingRect.width`
- `edge-right` 改宽后更新 `edgeWidth`
- 模式切换时保留上一态宽度

## 6. 事件契约

推荐补齐 `surface` resize 生命周期事件：

- `surface-resize-start`
- `surface-resize`
- `surface-resize-end`

事件 detail 最小建议：

```ts
export interface ChatSurfaceResizeEventDetail {
  mode: ChatSurfaceMode
  edge: 'left' | 'right'
  width: number
}
```

职责：

- `surface-resize-start`
  - 标记一次 resize 交互开始
- `surface-resize`
  - 对外同步当前宽度
- `surface-resize-end`
  - 用于持久化、埋点和后续联动

## 7. 交互规则

### 7.1 floating resize

- 左边界拖拽
  - 优先修改 `x + width`
  - 达到 `maxWidth` 后继续向左拖，整体继续向左移动
  - 达到 `minWidth` 后继续向右拖，整体继续向右移动
- 右边界拖拽
  - 优先修改 `width`
  - 达到 `maxWidth` 后继续向右拖，整体继续向右移动
  - 达到 `minWidth` 后继续向左拖，整体继续向左移动
- 最大宽度限制为：
  - `min(maxWidth, maxFloatingWidth, viewportWidth - safeGap)`

### 7.2 edge-right resize

- 仅左边界可拖
- 右边固定贴边
- 向左拖为拉宽
- 向右拖为收窄
- 最大宽度限制为：
  - `min(maxWidth, maxEdgeWidth, viewportWidth - safeGap)`

### 7.3 位移消耗顺序

- 先消耗位移到 `width`
- 宽度到达 `minWidth/maxWidth` 后
  - 剩余位移再作用到 `x`
- 这条规则对 `floating-left-resize` 和 `floating-right-resize` 都固定成立

### 7.4 交互本质

`V2-A` 的 `floating` resize 不是普通的“只改宽度”，而是：

- `resize + translate` 的分段混合交互

这意味着：

- 在宽度位于 `[minWidth, maxWidth]` 范围内时，优先执行 resize
- 当宽度到达边界后，多余位移改为推动整个面板移动

### 7.5 容器边界规则

- `floating` 始终限制在 `surface host` 内
- `floating` 左右保留最小可见边距 `safeGap`
- `edge-right` 最大宽度不是全屏，而是：
  - `viewportWidth - safeGap`
- `edge-right` 最小宽度仍受 `minWidth` 约束

### 7.6 handle 规则

- `floating`
  - 左右 handle 都显示
- `edge-right`
  - 只显示左侧 handle
- hit area 建议：
  - 鼠标 `12px ~ 16px`
  - 触控 `20px+`
- handle 只负责 resize，不承担 drag

### 7.7 drag / resize 冲突规则

- 顶部 drag bar 只负责 drag
- 左右边界 handle 只负责 resize
- resize 中不做右侧吸附预判
- drag 中才做 `edge-right` 吸附判定
- dragSession 和 resizeSession 必须互斥

## 8. 技术选型

### 8.1 V2-A

继续采用：

- `@vueuse/core`
- `useDraggable`

原因：

- 当前只做：
  - 右侧吸附
  - `floating` 左右缩放
  - `edge-right` 左边缩放
- 这时核心复杂度在状态管理和分段计算，不在底层拖拽库
- 继续自己写可控、改动小

结论：

- `V2-A` 不需要 `interact.js`

### 8.2 V2-B

只有出现这些时，再评估引入：

- guideline/snapping 预览
- 多边吸附
- 底边/角点缩放
- 更复杂的 restriction / modifier 体系

这时推荐：

- `interact.js`

原因：

- drag + resize 一套事件模型
- restriction 现成
- snapping modifier 现成
- 后续扩展成本更低

结论：

- `V2-B` 才有 `interact.js` 的必要

## 9. 实现位置

新增/调整：

- `packages/chat/src/composables/useChatSurface.ts`
  - `V2-A` 升级为 drag + horizontal resize 管理器
  - 负责 `dragSession / resizeSession / activeResizeEdge`
- `V2-B` 再扩展更复杂 snap/restriction
- `packages/chat/src/layout/ChatSurfaceResizeTrigger.vue`
  - surface 边界 resize trigger
- `packages/chat/src/styles/layout.css`
  - 增加 floating / edge-right resize handle 样式

## 10. 评审拆分

### 10.1 V2-A 评审只需确认 5 点

- 是否接受 `surface.resizable`
- 是否接受 `floating` 左右边都可改宽
- 是否接受 `edge-right` 只允许左边改宽
- 是否接受 `floating` 不能拉满全屏
- 是否接受 `V2-A` 继续自己实现，不引入 `interact.js`

补充说明：

- `V2-A` 已明确采用“达到宽度边界后继续整体移动”的交互规则
- `V2-A` 已明确 drag 和 resize 为两套互斥交互
- `V2-A` 已明确需要 surface resize 生命周期事件

### 10.2 V2-B 评审只需确认 3 点

- 是否接受 `surface.resizable`
- 是否接受后续进入 guideline / 多边吸附 / 更复杂 resize 体系
- 是否接受那时再评估 `interact.js`

## 11. 参考

- Interact.js Restriction
  - https://interactjs.io/docs/restriction/
- Interact.js Snapping
  - https://interactjs.io/docs/snapping/
- Dockview Floating Groups
  - https://dockview.dev/docs/core/groups/floatingGroups/
- Dockview Edge Groups
  - https://dockview.dev/docs/core/groups/edgeGroups/
