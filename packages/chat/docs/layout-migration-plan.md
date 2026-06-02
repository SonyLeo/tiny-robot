# Layout 迁移方案

## 1. 背景

当前 layout 能力已经具备通用基础组件特征，应该沉淀到 `packages/components`，而不是继续停留在 `packages/chat`。

当前需要沉淀的能力包括：

- `normal / floating` 两种 surface 模式
- left / right aside 的 `dock / drawer / rail / hidden`
- dock aside 改宽
- floating surface 拖拽、左右改宽、视口边界约束
- `LayoutMain` 的 `scrollHost` 协议和虚拟滚动条
- `header / main / footer / aside` 插槽编排

这次迁移的关键前提有两个：

- `components` 当前 CSS 架构不是 `chat` 这种集中式全局 owner CSS
- `chat` 当前实现只是参考来源，不是迁移约束

结论：

- 迁移目标是先在 `components` 落一套标准 layout 实现
- 后续 `chat` 第一阶段直接使用这个实现

## 2. `components` 当前 CSS 架构结论

`components` 现在是混合模式：

- 全局 token 层
- 组件变量注册层
- 组件内 scoped 结构层

对应现状：

- 全局基础入口
  - `packages/components/src/styles/root.css`
  - `packages/components/src/styles/variables.css`
- 组件变量注册层
  - `packages/components/src/styles/components/index.css`
  - `packages/components/src/styles/components/*.less`
- 结构样式层
  - 各组件 `.vue` 内的 `scoped` style

这套模式的核心特征是：

- 变量全局化
- 结构本地化
- 类名保留 `tr-*` 语义
- 外部通过 CSS var 定制
- 不依赖大型集中式全局结构样式文件

所以 layout 迁移的直接结论是：

- 不要把 `packages/chat/src/styles/*.css` 原样整体搬进 `components`
- 要改成“token 在外，结构在内”

## 3. 第一阶段目标

- 在 `packages/components` 中沉淀 layout 基础组件
- 保留当前已经验证过的交互语义
- 保留 `scrollHost` 强约束
- 保留 floating 只支持左右改宽
- CSS 架构对齐 `components` 当前主流模式
- 让 `chat` 后续直接消费这套组件

## 4. 第一阶段非目标

- 不要求保留 `chat` 当前的文件组织
- 不要求保留 `chat` 当前的集中式全局 owner CSS 方案
- 不在迁移期处理 `chat` 的兼容包装层
- 不内置 localStorage 持久化
- 不新增 public imperative methods
- 不支持上下或四角缩放
- 不把 `left-edge / right-edge` 这类业务语义做进组件

结论：

- 第一阶段是“在 `components` 建标准实现”
- 不是“把 `chat` 原样搬家”

## 5. 迁移边界

### 5.1 组件

- `packages/chat/src/layout/ChatLayout.vue`
- `packages/chat/src/layout/ChatMain.vue`
- `packages/chat/src/layout/ChatAside.vue`
- `packages/chat/src/layout/ChatAsideToggle.vue`
- `packages/chat/src/layout/ChatAsideResizeTrigger.vue`
- `packages/chat/src/layout/ChatSurfaceResizeTrigger.vue`

### 5.2 composables

- `packages/chat/src/composables/createChatLayoutStore.ts`
- `packages/chat/src/composables/useChatAside.ts`
- `packages/chat/src/composables/useChatAsideResize.ts`
- `packages/chat/src/composables/useChatLayout.ts`
- `packages/chat/src/composables/useChatLayoutInteractions.ts`
- `packages/chat/src/composables/useChatLayoutViewState.ts`
- `packages/chat/src/composables/useChatMainScrollbar.ts`
- `packages/chat/src/composables/useChatSurface.ts`

### 5.3 utils / helpers

- `packages/chat/src/utils/chatSurfaceGeometry.ts`
- `packages/chat/src/utils/chatSurfaceResize.ts`
- `packages/chat/src/utils/cssLength.ts`
- `packages/chat/src/utils/domInteraction.ts`
- `packages/chat/src/utils/math.ts`
- `packages/chat/src/layout/utils.ts`

### 5.4 types

- `packages/chat/src/types/layout.ts`
- `packages/chat/src/types/layout.internal.ts`

### 5.5 styles

下面这些文件只作为规则来源，不作为目标结构直接保留：

- `packages/chat/src/styles/tokens.css`
- `packages/chat/src/styles/layout-shell.css`
- `packages/chat/src/styles/aside.css`
- `packages/chat/src/styles/aside-resize.css`
- `packages/chat/src/styles/surface.css`

结论：

- 样式要重新分配 owner
- 不是复制旧文件

## 6. 目标目录结构

推荐目标结构如下：

```text
packages/components/src/
  layout/
    Layout.vue
    LayoutMain.vue
    LayoutAside.vue
    LayoutAsideToggle.vue
    index.ts
    index.type.ts
    internal.type.ts
    components/
      AsideResizeTrigger.vue
      SurfaceResizeTrigger.vue
    composables/
      createLayoutStore.ts
      useLayout.ts
      useLayoutAside.ts
      useLayoutAsideResize.ts
      useLayoutInteractions.ts
      useLayoutViewState.ts
      useLayoutSurface.ts
      useLayoutMainScrollbar.ts
    utils/
      chatSurfaceGeometry.ts
      chatSurfaceResize.ts
      cssLength.ts
      domInteraction.ts
      math.ts
      createLayoutAsideStoreInput.ts
```

变量注册层新增：

```text
packages/components/src/styles/components/
  layout.less
```

同时在：

- `packages/components/src/styles/components/index.css`

追加：

- `@import './layout.less';`

## 7. 导出规划

### 7.1 `packages/components/src/layout/index.ts`

建议导出：

- `Layout`
- `LayoutMain`
- `LayoutAside`
- `LayoutAsideToggle`

不对外导出：

- `components/AsideResizeTrigger.vue`
- `components/SurfaceResizeTrigger.vue`
- `createLayoutStore`
- `useLayout*`
- `chatSurfaceGeometry`
- `chatSurfaceResize`
- `internal.type.ts`

### 7.2 `packages/components/src/index.ts`

新增：

- layout 组件导出
- layout 对应类型导出

结论：

- 迁移目标只落在 `components`
- `chat` 不作为本轮导出设计约束

## 8. 公共 API 基线

下面的 contract 以当前 layout 语义为基线。

第一阶段结论：

- props / emits / slots 语义保持稳定
- 类型命名可按 `components` 风格整理
- 但行为不要改

## 8.1 `Layout`

### Props

```ts
export interface ChatLayoutProps {
  mode?: ChatLayoutMode
  floating?: ChatFloatingConfig
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}
```

### Emits

```ts
export interface ChatLayoutEmits {
  'update:mode': [value: ChatLayoutMode | undefined]
  'update:floating': [value: ChatFloatingConfig | undefined]
  'update:leftAside': [value: ChatAsideConfig | undefined]
  'update:rightAside': [value: ChatAsideConfig | undefined]
  'floating-resize-start': [detail: ChatFloatingResizeEventDetail]
  'floating-resize': [detail: ChatFloatingResizeEventDetail]
  'floating-resize-end': [detail: ChatFloatingResizeEventDetail]
  'aside-resize-start': [detail: ChatAsideResizeEventDetail]
  'aside-resize': [detail: ChatAsideResizeEventDetail]
  'aside-resize-end': [detail: ChatAsideResizeEventDetail]
}
```

### Slots

```ts
export interface ChatLayoutSlots {
  'left-aside'?: () => VNode[]
  header?: () => VNode[]
  main?: () => VNode[]
  footer?: () => VNode[]
  'right-aside'?: () => VNode[]
}
```

### Methods

没有 public `defineExpose`。

### 语义结论

- `mode='normal'`：surface 在布局流内
- `mode='floating'`：surface `Teleport` 到 `body`，独立定位
- `floating`：控制位置、尺寸和浮层交互能力
- `leftAside / rightAside`：控制两侧栏状态和宽度边界

## 8.2 `LayoutMain`

### Props

```ts
export type ChatMainScrollHostComponent = Pick<ComponentPublicInstance, '$el'>

export type ChatMainScrollHost = HTMLElement | ChatMainScrollHostComponent | null | undefined

export interface ChatMainProps {
  scrollHost: ChatMainScrollHost
}
```

### Slots

- 默认插槽

### Methods

没有 public `defineExpose`。

### 语义结论

- `LayoutMain` 只做主区壳层和虚拟滚动条
- 真正滚动必须由 `scrollHost` 承担
- 不恢复成内部猜测 `.tr-bubble-list` 的模式

## 8.3 `LayoutAside`

### Props

```ts
export interface ChatAsideProps {
  placement: 'left' | 'right'
  collapseEffect?: 'overlay' | 'slide'
}
```

### Slots

```ts
export interface ChatAsideSlots {
  default?(slotProps: { isExpanded: boolean }): VNode[]
}
```

### Methods

没有 public `defineExpose`。

### 语义结论

- `placement` 绑定左右侧 store
- `collapseEffect='overlay'`：rail 保留宽度，内容覆盖
- `collapseEffect='slide'`：内容滑向 rail 宽度

## 8.4 `LayoutAsideToggle`

### Props

```ts
export interface ChatAsideToggleProps {
  placement: 'left' | 'right'
  ariaLabel?: string
}
```

### Slots

```ts
export interface ChatAsideToggleSlots {
  default?(slotProps: { isExpanded: boolean }): VNode[]
}
```

### Methods

没有 public `defineExpose`。

### 语义结论

- 默认点击切换对应侧栏
- 左右同为 `drawer` 时，打开一侧会先关闭另一侧

## 8.5 组件命名建议

公开组件建议保留 `Layout*` 前缀：

- `Layout.vue`
- `LayoutMain.vue`
- `LayoutAside.vue`
- `LayoutAsideToggle.vue`

原因：

- 它们是对外公开原语
- 在仓库内搜索和辨识度更高
- 避免出现 `Main.vue`、`Aside.vue` 这类过于泛的文件名

内置组件建议下沉到 `layout/components/`，并去掉 `Layout` 前缀：

- `components/AsideResizeTrigger.vue`
- `components/SurfaceResizeTrigger.vue`

原因：

- 它们不是 public primitive
- 目录已经提供了 layout 语义
- 继续保留 `Layout` 前缀会重复

结论：

- public primitive：保留 `Layout*`
- internal child：放进 `layout/components/`，去掉 `Layout` 前缀

## 8.6 Internal triggers

这两个组件保持 internal：

- `AsideResizeTrigger`
- `SurfaceResizeTrigger`

不作为 public API。

## 9. 内部状态和 composables 规划

## 9.1 内部 store contract

```ts
export interface ChatLayoutPanelApi {
  placement: ChatPlacement
  layoutMode: ChatAsideLayoutMode
  isExpanded: boolean
  isDock: boolean
  isDrawer: boolean
  isRail: boolean
  isHidden: boolean
  canResize: boolean
  expandedWidth: string
  collapsedWidth: string
  resizable: boolean
  minExpandedWidth: string
  maxExpandedWidth: string
  setExpandedWidth: (nextWidth: number) => void
  open: () => void
  close: () => void
  toggle: () => void
}

export interface ChatLayoutStore {
  left: ChatLayoutPanelApi
  right: ChatLayoutPanelApi
  isDrawerVisible: boolean
  closeDrawers: () => void
}
```

结论：

- 这些 methods 保持 internal runtime API
- 不暴露成组件 ref methods

## 9.2 composable 职责映射

### `createLayoutStore`

- 解析左右 aside config
- 产出 `dock / drawer / rail / hidden / canResize`
- 管理 `open / close / toggle`
- 写回 `expandedWidth`

### `useLayout`

- `provide/inject` layout store

### `useLayoutAside`

- `LayoutAside` 和 `LayoutAsideToggle` 的统一访问层

### `useLayoutAsideResize`

- dock aside 改宽
- 处理 `min / max / mainMinWidth / oppositeDockWidth`

### `useLayoutInteractions`

- 组合 aside resize
- 处理 `Escape` 关闭 drawer

### `useLayoutViewState`

- 派生 class
- 派生 CSS 变量
- 计算布局可见状态

### `useLayoutSurface`

- floating geometry 初始化
- 拖拽
- 左右改宽
- 视口 clamp

### `useLayoutMainScrollbar`

- 读取 `scrollHost` metrics
- 计算 thumb 高度与偏移
- 维护 thumb 拖拽和宿主标记

## 10. CSS 迁移方案

## 10.1 总原则

layout 迁移后的 CSS 架构要和 `components` 一致：

- token 在外
- 变量在外
- 结构在内

也就是：

- 全局 token 继续放在现有全局入口
- layout family 的组件级变量放在 `styles/components/layout.less`
- 结构样式回收到各自 `.vue` 的 `scoped` style

## 10.2 全局层保留什么

全局层只保留这三类东西：

- theme token
- z-index token
- layout family 的 CSS 变量默认值

不放：

- 组件结构布局
- aside 展开/收起结构规则
- floating 外壳结构规则
- resize trigger 结构规则
- scrollbar 结构规则

## 10.3 `layout.less` 放什么

`packages/components/src/styles/components/layout.less` 只负责注册默认变量值。

建议纳管：

- `--tr-chat-layout-*`
- `--tr-chat-surface-*`
- `--tr-chat-main-*`

包括但不限于：

- 布局尺寸变量
- aside 宽度变量
- resize 变量
- scrollbar 变量
- surface 变量
- 颜色变量的默认值引用

不在 `layout.less` 写结构样式。

## 10.4 结构样式 owner 重新分配

### `Layout.vue`

负责：

- host
- surface
- grid shell
- header / main / footer shell
- backdrop
- floating drag bar
- floating surface 的高层状态 class

### `LayoutMain.vue`

负责：

- main 壳层
- 虚拟滚动条轨道和 thumb
- `scrollHost` 的原生滚动条隐藏规则

### `LayoutAside.vue`

负责：

- `.tr-chat-aside` 根结构
- aside 内容滚动
- `overlay / slide` 收起效果
- aside 内部结构表现

### `LayoutAsideToggle.vue`

负责：

- toggle 按钮结构样式

### `components/AsideResizeTrigger.vue`

负责：

- aside resize trigger 的结构和交互态

### `components/SurfaceResizeTrigger.vue`

负责：

- floating resize trigger 的结构和交互态

## 10.5 旧样式文件到新 owner 的映射

### `layout-shell.css`

拆到：

- `Layout.vue`
- `LayoutMain.vue`
- `LayoutAsideToggle.vue`

### `aside.css`

拆到：

- `LayoutAside.vue`
- `Layout.vue`

说明：

- 如果是 aside 自身结构和效果，归 `LayoutAside.vue`
- 如果是 layout grid 容器上的 aside 位置信息，归 `Layout.vue`

### `aside-resize.css`

拆到：

- `components/AsideResizeTrigger.vue`

### `surface.css`

拆到：

- `Layout.vue`
- `components/SurfaceResizeTrigger.vue`

### `tokens.css`

拆到：

- `packages/components/src/styles/components/layout.less`

说明：

- 这里只搬 layout family 默认变量
- 不复制 root token

## 10.6 scoped 下的边界处理原则

由于 layout 有这些特点：

- `Teleport`
- slot 编排
- 内部状态联动
- 宿主标记下发

scoped style 里允许少量使用：

- `:deep()`
- `:slotted()`

但原则是：

- 只在必须跨组件边界时使用
- 只针对稳定类名或稳定 `data-*` hook
- 不重新做一个全局 owner CSS 文件兜底

## 10.7 类名和 hook

为了降低迁移风险，第一阶段建议保留：

- `tr-*` 语义类名
- 现有 `data-part`
- 现有 `data-placement`
- 现有 `data-resizing-edge`
- 现有 `data-dragging`

结论：

- 样式 owner 变
- 类名语义不必一起变

## 11. CSS 变量清单

### 11.1 布局尺寸

- `--tr-chat-layout-height`
- `--tr-chat-layout-content-max-width`
- `--tr-chat-layout-inner-padding-inline`
- `--tr-chat-layout-inner-padding-block`
- `--tr-chat-layout-header-max-width`
- `--tr-chat-layout-main-max-width`
- `--tr-chat-layout-footer-max-width`
- `--tr-chat-layout-header-padding-inline`
- `--tr-chat-layout-main-padding-inline`
- `--tr-chat-layout-footer-padding-inline`
- `--tr-chat-layout-header-margin-inline-start`
- `--tr-chat-layout-header-margin-inline-end`
- `--tr-chat-layout-main-margin-inline-start`
- `--tr-chat-layout-main-margin-inline-end`
- `--tr-chat-layout-footer-margin-inline-start`
- `--tr-chat-layout-footer-margin-inline-end`

### 11.2 aside 宽度

- `--tr-chat-layout-left-expanded-width`
- `--tr-chat-layout-left-collapsed-width`
- `--tr-chat-layout-right-expanded-width`
- `--tr-chat-layout-right-collapsed-width`
- `--tr-chat-layout-main-min-width`

### 11.3 布局视觉

- `--tr-chat-layout-bg`
- `--tr-chat-layout-left-bg`
- `--tr-chat-layout-right-bg`
- `--tr-chat-layout-header-bg`
- `--tr-chat-layout-main-bg`
- `--tr-chat-layout-footer-bg`
- `--tr-chat-layout-divider-color`
- `--tr-chat-layout-text-primary`
- `--tr-chat-layout-panel-shadow`
- `--tr-chat-layout-overlay-bg`
- `--tr-chat-layout-z-index-overlay`
- `--tr-chat-layout-transition-duration`
- `--tr-chat-layout-transition-easing`

### 11.4 surface

- `--tr-chat-surface-z-index`
- `--tr-chat-surface-radius`
- `--tr-chat-surface-shadow`
- `--tr-chat-surface-drag-hit-width`
- `--tr-chat-surface-drag-hit-height`
- `--tr-chat-surface-drag-pill-width`
- `--tr-chat-surface-drag-pill-height`
- `--tr-chat-surface-drag-pill-bg`
- `--tr-chat-surface-drag-pill-shadow`
- `--tr-chat-surface-drag-hover-bg`
- `--tr-chat-surface-drag-hover-border`
- `--tr-chat-surface-drag-hover-shadow`
- `--tr-chat-surface-resize-hit-area-size`
- `--tr-chat-surface-resize-indicator-width`
- `--tr-chat-surface-resize-indicator-height`
- `--tr-chat-surface-resize-indicator-bg`
- `--tr-chat-surface-resize-indicator-border`
- `--tr-chat-surface-resize-indicator-active-bg`
- `--tr-chat-surface-resize-indicator-active-border`
- `--tr-chat-surface-resize-indicator-active-shadow`
- `--tr-chat-surface-resize-indicator-idle-opacity`
- `--tr-chat-surface-resize-indicator-hover-opacity`
- `--tr-chat-surface-resize-indicator-idle-offset`

### 11.5 resize

- `--tr-chat-layout-resize-trigger-size`
- `--tr-chat-layout-resize-line-color`
- `--tr-chat-layout-resize-line-hover-color`
- `--tr-chat-layout-resize-line-active-color`
- `--tr-chat-layout-resize-indicator-width`
- `--tr-chat-layout-resize-indicator-height`
- `--tr-chat-layout-resize-indicator-bg`
- `--tr-chat-layout-resize-indicator-border`
- `--tr-chat-layout-resize-indicator-active-bg`
- `--tr-chat-layout-resize-indicator-active-border`
- `--tr-chat-layout-resize-indicator-active-shadow`
- `--tr-chat-layout-resize-indicator-idle-opacity`
- `--tr-chat-layout-resize-indicator-idle-offset`

### 11.6 scrollbar

- `--tr-chat-main-scrollbar-width`
- `--tr-chat-main-scrollbar-thumb-inset`
- `--tr-chat-main-scrollbar-inline-end`

## 12. `chat` 的接入结论

这次迁移不把 `chat` 作为实现约束。

第一阶段正确做法是：

- 先把 layout 标准实现落到 `components`
- `chat` 后续直接消费这套组件

也就是：

- 现在不设计 `chat` 兼容包装层
- 现在不为了 `chat` 保留旧样式结构
- 现在不为了 `chat` 保留双份源码

## 13. 迁移步骤

## 13.1 第一步

在 `packages/components/src/layout/` 建立组件、类型、composables、utils 目录。

## 13.2 第二步

把当前 layout 行为逻辑迁到 `components`：

- `normal`
- `floating`
- `aside resize`
- `LayoutMain` 虚拟滚动条

## 13.3 第三步

按新 CSS owner 拆分样式：

- 新增 `styles/components/layout.less`
- 把结构样式回收到各自 `.vue` 的 `scoped` style

## 13.4 第四步

在 `packages/components/src/index.ts` 增加导出。

## 13.5 第五步

用现有 demo 场景回归行为：

- `DeepSeek`
- `ChatGPT`
- `Surface`

## 13.6 第六步

`chat` 直接切到新的 layout 组件使用。

## 14. 验收标准

- `components` 中有完整可用的 layout 原语
- `LayoutMain` 在 `normal / floating` 下滚动行为一致
- `scrollHost` 契约不变
- 左右 aside 的 `dock / drawer / rail / hidden` 不回归
- aside resize 不回归
- floating 拖拽和左右改宽不回归
- `Escape` 关闭 drawer 不回归
- CSS 变量定制能力保留
- 结构样式已经进入各自组件的 scoped style
- `styles/components/layout.less` 只承担变量注册，不承担结构样式
- `chat` 切到这套组件后可以直接满足布局需求

## 15. 风险点

### 15.1 样式 owner 切分不清

如果迁移时仍然沿用旧的按文件复制思路：

- 很容易重新形成一套全局 owner CSS

这和目标架构冲突。

### 15.2 scoped 下跨边界选择器失控

如果大量依赖 `:deep()` 兜底：

- 结构样式会重新退化成“伪全局”

所以必须把 owner 控制在组件本身。

### 15.3 `scrollHost` 契约被弱化

如果又恢复成内部猜测滚动宿主：

- `LayoutMain` 会重新和 `BubbleList` 强耦合

不能回退。

### 15.4 过早泛化

如果第一阶段顺手引入：

- localStorage 持久化
- 四边缩放
- public imperative methods
- 业务态 edge 语义

会明显放大范围。

## 16. 最终结论

最佳方案只有一个：

- 在 `packages/components` 中直接沉淀 layout 标准实现
- CSS 架构对齐 `components` 现状，采用“全局 token / 变量注册 + 组件内 scoped 结构样式”
- 不再延续 `chat` 当前的集中式全局 owner CSS 模式
- `chat` 后续直接使用这套组件，不把它作为本轮迁移约束
