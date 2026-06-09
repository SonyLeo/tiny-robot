**1. 这次改造的真正目标**

不是单纯改类型名，是把 `aside` 的状态 owner 从 [`LayoutAside.vue`](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/layout/LayoutAside.vue) 挪到 [`Layout.vue`](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/layout/Layout.vue)。

改完以后，数据流应当是：

- `Layout` 持有 `leftAside/rightAside` 状态
- `store` 只做代理和协调
- `left-aside/right-aside` 插槽只消费 slot props
- `LayoutAsideToggle` 继续通过 store 控制

**2. 当前定下来的方向**

- `aside` 走 root state 模型
- `floating` 对外统一为 anchor model
- `floating` 的受控和非受控都使用同一套 `LayoutFloating`
- 内部几何计算仍然可以继续使用 rect
- `floating-*` 事件回传 anchor 数据，不再直接对外暴露 rect

这里统一的是 public API 语义，不是强制把内部拖拽和 resize 算法改成 anchor。

**3. 类型收敛**

```ts
import type { VNode } from 'vue'

export type LayoutMode = 'normal' | 'floating'
export type LayoutPlacement = 'left' | 'right'
export type LayoutAsideMode = 'dock' | 'drawer'

export type LayoutFloatingPlacement =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'

export type LayoutFloatingResizeHandle =
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'ne'
  | 'nw'
  | 'se'
  | 'sw'

export interface LayoutFloating {
  placement?: LayoutFloatingPlacement
  offsetX?: number
  offsetY?: number
  width?: number
  height?: number
  draggable?: boolean
  resizable?: boolean
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
}

export interface LayoutAsideProps {
  mode?: LayoutAsideMode
  open?: boolean
  defaultOpen?: boolean
  expandedWidth?: number
  defaultExpandedWidth?: number
  minExpandedWidth?: number
  maxExpandedWidth?: number
  collapsedWidth?: number
  resizable?: boolean
}

export interface LayoutAsideValue {
  open: boolean
  expandedWidth: number | undefined
}

export interface LayoutProps {
  mode?: LayoutMode
  leftAside?: LayoutAsideProps
  rightAside?: LayoutAsideProps
  floating?: LayoutFloating
  defaultFloating?: LayoutFloating
}

export interface LayoutAsideSlotProps {
  placement: LayoutPlacement
  mode: LayoutAsideMode
  open: boolean
  expandedWidth: number | undefined
  collapsedWidth: number | undefined
  resizable: boolean
  toggle: () => void
  setOpen: (next: boolean) => void
  setExpandedWidth: (next: number) => void
}

export interface LayoutSlots {
  'left-aside'?: (slotProps: LayoutAsideSlotProps) => VNode | VNode[]
  'right-aside'?: (slotProps: LayoutAsideSlotProps) => VNode | VNode[]
  header?: () => VNode | VNode[]
  main?: () => VNode | VNode[]
  footer?: () => VNode | VNode[]
}

export type LayoutFloatingDragEventDetail = LayoutFloating

export type LayoutFloatingResizeEventDetail = LayoutFloating & {
  handle: LayoutFloatingResizeHandle
}

export interface LayoutEmits {
  'update:mode': [value: LayoutMode]
  'update:leftAside': [value: LayoutAsideValue]
  'update:rightAside': [value: LayoutAsideValue]
  'update:floating': [value: LayoutFloating]
  'floating-drag-start': [detail: LayoutFloatingDragEventDetail]
  'floating-drag': [detail: LayoutFloatingDragEventDetail]
  'floating-drag-end': [detail: LayoutFloatingDragEventDetail]
  'floating-resize-start': [detail: LayoutFloatingResizeEventDetail]
  'floating-resize': [detail: LayoutFloatingResizeEventDetail]
  'floating-resize-end': [detail: LayoutFloatingResizeEventDetail]
}
```

这里再明确一层：

- `LayoutAsideRuntimeProps` 不再单独存在
- 输入配置统一收敛到 `LayoutAsideProps`
- `update:leftAside/update:rightAside` 不直接回传 `LayoutAsideProps`
- 运行时变化只回传 `LayoutAsideValue`

**4. floating 的 public model**

`defaultFloating` 和 `floating` 都统一成 `LayoutFloating`：

- `defaultFloating`：非受控初始化配置
- `floating`：受控运行时配置
- `offsetX/offsetY`：两条线都使用同一套默认值规则
- `placement = 'center'` 时，`offsetX/offsetY` 不参与定位

也就是：

- 非受控：第一次按 `placement + offsetX + offsetY + width + height` 初始化，后续内部维护
- 受控：外部持续传入 `placement + offsetX + offsetY + width + height`，内部按这套值实时换算

默认值建议直接统一为：

- `placement` 未传时默认 `'center'`
- `offsetX` 未传时默认 `24`
- `offsetY` 未传时默认 `24`
- `width/height` 继续沿用现有默认值

**5. placement 的运行时语义**

`placement` 这里要按稳定 anchor 理解：

- 非受控模式下，拖拽和 resize 只更新 `offsetX / offsetY / width / height`
- 非受控模式下，`placement` 不会因为用户拖动而自动改写
- 受控模式下，`placement` 只有在外部显式更新 `floating` 时才发生变化
- 受控模式下，拖拽和 resize 只负责 `emit` 新的 `LayoutFloating`，外部不回写就不生效

例如：

- 初始是 `top-right`
- 用户把面板往左拖很多
- 内部仍然认为它是 `top-right + 更大的 offsetX`

**6. 事件语义**

`floating-*` 事件统一回传 anchor 数据：

- `floating-drag-*`：回传 `LayoutFloating`
- `floating-resize-*`：回传 `LayoutFloating & { handle }`

这里保留 `handle` 是合理的，因为 resize 交互里它本来就是有效语义，改动也不大。

**7. aside 这条线的收敛**

`Layout.Aside` 暂时不再作为对外主入口时，对外模型应当收敛到根组件：

- `LayoutAsideProps` 不再包含 `placement`
- `LayoutAsideProps` 不再包含 `collapseEffect`
- `leftAside/rightAside` 应当是可选的
- `LayoutAsideEmits` 不再作为主 public API 暴露
- `update:leftAside/update:rightAside` 只回传当前可控值，不回传默认值字段和静态约束字段

原因很简单：

- `placement` 已经由 `leftAside / rightAside` 天然区分
- `placement` 会通过 slot props 暴露给消费侧
- 这轮先收状态边界，不继续扩大改造面

**8. store 的目标形态**

[`createLayoutStore.ts`](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/layout/composables/createLayoutStore.ts) 后续应当从“子组件注册”改成“根状态注入”：

- `Layout` 先算出 `leftAsideState/rightAsideState`
- `createLayoutStore(leftState, rightState)` 直接基于根状态创建 API
- `store` 保留统一读取、命令转发、drawer 互斥
- `registerPanel/unregisterPanel` 可以删除

这样单向数据流会更顺。

**9. slot 入口**

[`Layout.vue`](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/layout/Layout.vue) 里应当走：

```vue
<slot name="left-aside" v-bind="leftAsideSlotProps" />
<slot name="right-aside" v-bind="rightAsideSlotProps" />
```

父组件消费方式是：

```vue
<template #left-aside="{ placement, open, expandedWidth, toggle, setOpen, setExpandedWidth }">
```

这里不再把 `Layout.Aside` 当成外部主入口，而是把状态和更新方法直接暴露给插槽消费侧。

外部控制链路应当是：

- `leftAside/rightAside` 通过 slot props 暴露 `open`、`expandedWidth`、`toggle`、`setOpen`、`setExpandedWidth`
- 根组件通过 `update:leftAside/update:rightAside` 回传运行时值
- 不再走根级 `update:open`

**10. 推荐顺序**

1. 先定 `leftAside/rightAside` root state 模型
2. 收敛 `LayoutProps`、`LayoutEmits`、`LayoutAsideProps`
3. 改 `Layout.vue` slot props 和 store，移除 registration
4. 把 `floating` 对外统一成 `LayoutFloating`
5. 调整 `floating-*` 事件回传为 anchor 数据
