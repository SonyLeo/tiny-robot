# 阶段一专项设计：布局层

## 1. 文档目标

本文件只讨论阶段一：聊天应用布局层。

目标：

- 先把聊天页面的布局骨架设计清楚。
- 让阶段一只聚焦布局，不引入过多与布局无关的抽象。
- 吸收当前 chat demo 中已经验证过的优点。
- 在开始实现前，尽量把会导致返工的设计问题先对齐。

本阶段只做 UI 布局，不做数据层，不做业务组件编排。

## 2. 阶段一范围

### 2.1 解决的问题

- 桌面端聊天页面的稳定骨架。
- 移动端聊天页面的稳定骨架。
- 左侧区域的 desktop collapse 与 mobile drawer。
- 右侧区域的 desktop panel 与 mobile full overlay panel。
- `header / main / footer` 的区域划分。
- 主内容区的唯一滚动根。
- `contentMaxWidth` 对内容内层的统一约束。
- 统一的布局级 UI store。

### 2.2 不解决的问题

- 会话数据如何组织。
- 消息数据如何组织。
- 输入框值、提交、取消、模型切换、联网等业务行为。
- `ChatApp` 的最终高层 API。
- 嵌入式容器模式。
- `Teleport`、`body scroll lock`、focus trap 等增强能力。

### 2.3 当前已确认结论

- `contentMaxWidth` 覆盖 `header / main / footer` 的内容内层。
- 左右区域的尺寸参数统一由 `ChatLayout` 管理，不在子区域组件重复声明。
- 左侧 desktop collapse 和 mobile drawer 采用“统一入口、分离状态”。
- 左侧 desktop collapse 的收起结果由 `leftRailWidth` 决定：
  - `0` 表示完全关闭
  - `> 0` 表示进入 rail
- 移动端左侧面板从左向右展开，默认宽度为视口的 `2/3`。
- 移动端右侧操作面板从右向左展开，默认铺满可视区域。
- `ChatRightPanel` 名称保留。
- `ChatHeader` 默认推荐存在，但不是强制；如果缺失，调用方必须自己保证左右区域开关入口可达。
- desktop 下 `ChatRightPanel` 明确作为布局中的固定右列，不采用 overlay 模式。
- desktop 下 `rightPanelOpen = false` 时，右侧列宽归零且区域内容不渲染，不保留占位。
- `leftRailWidth = 0` 时，左侧重新打开入口默认推荐放在 `ChatHeader` 的 leading 区域。
- 阶段一 a11y 只做到基础语义，不进入 focus trap。
- `Teleport` 与 `body scroll lock` 暂不纳入阶段一默认能力。
- 阶段一先不处理嵌入式容器模式，只聚焦页面级聊天布局。

## 3. 对当前方案的 review 结论

这一节不是新需求，而是对前一版文档的收敛。

### 3.1 需要删掉或延后的东西

- 不保留通用 `target` 型 toggle API。
- 不保留 `fullHeight / fillParent / heightMode` 这类宿主模式抽象。
- 不保留 `mode / variant / desktop-only / overlayOnMobile` 这类模式型 props。
- 不保留“`ChatMain` 或其内部容器滚动”这种模糊说法，必须明确唯一滚动根。

### 3.2 需要收紧的设计

- 左侧和右侧区域改成两个语义组件，不再混成一个通用 sidebar 抽象。
- 左侧 rail 不是独立区域，而是左侧区域在 `leftRailWidth > 0` 时的收起态表现。
- `contentMaxWidth` 的实现方式必须明确，不留“大家自己包 inner wrapper”的空间。
- 阶段一默认就是页面级全屏聊天布局，不同时处理嵌入式容器模式。

## 4. 吸收当前 chat demo 的优点

参考：

- `packages/cli/templates/basic/src/App.vue`
- `packages/cli/templates/basic/src/components/ConversationHistory.vue`
- `packages/cli/templates/basic/src/components/HistoryDrawerButton.vue`
- `packages/chat/src/App.vue`

建议吸收的点：

- 页面壳层与业务区块分离。
- 左侧区域与主聊天区域并列。
- 主聊天区内部再分 `header / main / footer`。
- 主内容区外层自适应，内容内层限宽。
- 移动端头部左按钮 + 居中标题的处理方式。
- 左侧桌面收起宽度可配置，既能保留 rail，也能直接关闭。
- 局部 UI 状态不进入业务 store。

## 5. 简化后的阶段一组件模型

阶段一只保留下面这些布局组件：

- `ChatRoot`
- `ChatLayout`
- `ChatHeader`
- `ChatMain`
- `ChatFooter`
- `ChatLeftPanel`
- `ChatLeftPanelToggle`
- `ChatRightPanel`
- `ChatRightPanelToggle`

说明：

- 左右区域采用两个语义组件。
- 左侧 rail 不单独做成区域组件，而是 `ChatLeftPanel` 的一种可配置收起态内容。
- 不再保留通用 `ChatSidebar` / `ChatSidebarToggle` 设计。

## 6. 组件职责

### 6.1 `ChatRoot`

职责：

- 提供布局级 UI store。
- 提供断点判断结果。
- 向后代组件注入统一布局上下文。

不负责：

- 页面结构渲染。
- 任何业务数据。

### 6.2 `ChatLayout`

职责：

- 定义页面级整体布局结构。
- 负责 desktop / mobile 两套布局切换。
- 负责统一生成 `header / main / footer` 的 inner wrapper。
- 负责统一管理左右区域的尺寸参数。
- 负责主区限宽、左右区宽度和过渡时长。

不负责：

- 左右区域的具体内容。
- 业务逻辑。

### 6.3 `ChatHeader`

职责：

- 头部语义容器。
- 后续阶段二承载标题、移动端左入口、右上角操作区。

说明：

- `ChatHeader` 可选。
- 默认推荐渲染 `ChatHeader`。
- 但如果不渲染 `ChatHeader`，调用层必须在别处提供可见的 `ChatLeftPanelToggle`，并在需要时提供 `ChatRightPanelToggle`。

### 6.4 `ChatMain`

职责：

- 主内容语义容器。
- 作为阶段一唯一的主滚动根。

说明：

- 阶段一明确以 `ChatMain` 作为唯一 scroll root。
- 后续阶段二消息区直接挂载在这里，不再重新定义页面级滚动容器。

### 6.5 `ChatFooter`

职责：

- 底部语义容器。
- 后续阶段二默认承载输入区。

### 6.6 `ChatLeftPanel`

职责：

- 承载左侧主区域。
- 在 desktop 下支持 panel / rail / fully-closed 三种结果。
- 在 mobile 下支持 drawer 表现。

说明：

- 左侧 panel、left rail、fully-closed 都属于同一个语义区域的不同展示结果。
- `leftRailWidth = 0` 时，desktop 收起后直接关闭。
- `leftRailWidth > 0` 时，desktop 收起后进入 rail。
- rail 承载内容与 panel 可以不同。

### 6.7 `ChatLeftPanelToggle`

职责：

- 提供左侧区域的统一开关入口。
- desktop 下控制 `leftPanelOpen`。
- mobile 下控制 `leftDrawerOpen`。

命名说明：

- 我建议使用 `ChatLeftPanelToggle`，而不是保留带 `target` 的通用 toggle。
- 如果后续团队希望更强调语义，也可以考虑 `ChatNavigationToggle`。
- 但以阶段一的聚焦程度来说，`ChatLeftPanelToggle` 更直接、更稳定。

### 6.8 `ChatRightPanel`

职责：

- 承载右侧次级区域 / 扩展区域。
- desktop 下作为布局中的固定右列面板。
- mobile 下作为右侧全屏覆盖区域。

说明：

- desktop 下 `rightPanelOpen = false` 时，右侧列宽归零且区域内容不渲染。
- 关闭后的右侧区域不保留占位，不参与主布局宽度分配。

### 6.9 `ChatRightPanelToggle`

职责：

- 提供右侧区域统一开关入口。
- desktop / mobile 都只控制 `rightPanelOpen`。

## 7. 状态模型

```ts
interface ChatLayoutStore {
  leftPanelOpen: Ref<boolean>
  leftDrawerOpen: Ref<boolean>
  rightPanelOpen: Ref<boolean>
  isMobile: Ref<boolean>
  mobileBreakpoint: Ref<number>
  setLeftPanelOpen: (value: boolean) => void
  toggleLeftPanel: () => void
  setLeftDrawerOpen: (value: boolean) => void
  toggleLeftDrawer: () => void
  setRightPanelOpen: (value: boolean) => void
  toggleRightPanel: () => void
  closeOverlayPanels: () => void
}
```

### 7.1 状态语义

- `leftPanelOpen`
  - desktop 下左侧区域是否展开。
  - `false` 表示进入收起态。
  - 收起态具体是 rail 还是 fully-closed，由 `leftRailWidth` 决定。

- `leftDrawerOpen`
  - mobile 下左侧 drawer 是否打开。

- `rightPanelOpen`
  - desktop 下右侧面板是否展开。
  - mobile 下右侧全屏操作面板是否打开。

- `isMobile`
  - 断点派生状态。

### 7.2 统一入口、分离状态

这次确认后的规则是：

- 左侧入口统一。
- 左侧状态分离。

也就是：

- 调用 `ChatLeftPanelToggle` 时，组件内部根据断点决定操作 `leftPanelOpen` 还是 `leftDrawerOpen`。
- 调用方不需要理解 `panel` 和 `drawer` 的内部差异。
- 调用方也不需要理解收起后是 rail 还是 fully-closed，这由宽度参数决定。

## 8. 响应式与布局规则

### 8.1 断点策略

阶段一建议只保留一档 mobile breakpoint：

- `mobileBreakpoint = 959`

规则：

- `<= 959px` 视为 mobile
- `> 959px` 视为 desktop

### 8.2 desktop 布局

结构：

```txt
+-----------------------------------------------------------+
| left panel |              main shell            | right  |
|            | +--------------------------------+ | panel  |
|            | | header                         | |        |
|            | +--------------------------------+ |        |
|            | | main scroll root               | |        |
|            | +--------------------------------+ |        |
|            | | footer                         | |        |
|            | +--------------------------------+ |        |
+-----------------------------------------------------------+
```

行为：

- 左侧区域常驻。
- 左侧收起后：
  - `leftRailWidth = 0` 时完全关闭
  - `leftRailWidth > 0` 时变为 rail
- 主区撑满剩余空间。
- `ChatMain` 独立滚动。
- `ChatFooter` 固定在主区底部。
- `ChatFooter` 作为主布局 grid 的底部区域存在，不额外引入 `sticky` / `fixed` 语义。
- `ChatRightPanel` 作为固定右列参与布局，不采用 overlay。

### 8.3 mobile 布局

结构：

```txt
+----------------------------------+
| header                           |
+----------------------------------+
| main scroll root                 |
|                                  |
+----------------------------------+
| footer                           |
+----------------------------------+

left panel: left drawer, 66.67vw
right panel: right overlay, 100vw
```

行为：

- 默认推荐渲染 `ChatHeader`，但不是强制。
- `ChatMain` 独立滚动。
- `ChatFooter` 固定到底部。
- 左侧区域从左向右展开，默认 `66.67vw`。
- 右侧区域从右向左展开，默认 `100vw`。
- 如果没有 `ChatHeader`，调用层必须在其他常驻可见区域提供左右面板开关入口。

### 8.4 开关入口规则

建议默认规则：

- `ChatLeftPanelToggle` 默认放在 `ChatHeader` 的 leading 区域。
- `ChatRightPanelToggle` 默认放在 `ChatHeader` 的 trailing 区域。

如果 `ChatHeader` 不存在：

- 调用层必须在其他可见区域提供 `ChatLeftPanelToggle`。
- 如果页面使用右侧区域，也必须提供可见的 `ChatRightPanelToggle`。

额外约束：

- 当 desktop 下 `leftRailWidth = 0` 且左侧完全关闭时，重新打开左侧的入口必须始终可见。
- 在默认推荐实现中，这个入口放在 `ChatHeader` 的 leading 区域。

## 9. `contentMaxWidth` 规则

### 9.1 作用范围

`contentMaxWidth` 覆盖：

- `ChatHeader`
- `ChatMain`
- `ChatFooter`

但只作用于它们的内容内层，不作用于区域背景层本身。

### 9.2 实现方式

由 `ChatLayout` 自动生成三块区域的 inner wrapper。

可以理解为：

- `header` 外层负责区域背景和布局
- `header-inner` 负责内容限宽
- `main` 外层负责滚动和布局
- `main-inner` 只负责内容限宽，不承担页面级滚动
- `footer` 外层负责区域背景和布局
- `footer-inner` 负责内容限宽

### 9.3 设计结果

这意味着：

- 调用方不需要自己再包一层限宽容器。
- `contentMaxWidth` 的行为在三块区域里保持一致。
- 左右区域不受 `contentMaxWidth` 影响。
- `header-inner / main-inner / footer-inner` 使用同一套横向 padding 规则，保证视觉对齐。

## 10. API 草案

阶段一 API 目标：少而稳。

### 10.1 `ChatRoot`

props：

- `mobileBreakpoint?: number`
- `defaultLeftPanelOpen?: boolean`
- `defaultRightPanelOpen?: boolean`

slots：

- `default`

说明：

- 阶段一不提供 `defaultLeftDrawerOpen`。
- mobile drawer 默认关闭即可。

### 10.2 `ChatLayout`

props：

- `leftPanelWidth?: number`
- `leftRailWidth?: number`
- `rightPanelWidth?: number`
- `mobileLeftPanelWidth?: number | string`
- `mobileRightPanelWidth?: number | string`
- `contentMaxWidth?: number | string`
- `transitionDuration?: string`

slots：

- `left-panel`
- `header`
- `main`
- `footer`
- `right-panel`

默认建议：

- `leftPanelWidth = 300`
- `leftRailWidth = 48`
- `mobileLeftPanelWidth = '66.67vw'`
- `mobileRightPanelWidth = '100vw'`

说明：

- `leftRailWidth` 是左侧收起结果的关键参数。
- `leftRailWidth = 0` 时，desktop 收起即完全关闭。
- `leftRailWidth > 0` 时，desktop 收起进入 rail。

### 10.3 `ChatLeftPanel`

slots：

- `default`
- `rail`

slot props 建议：

```ts
{
  isMobile: boolean
  open: boolean
  collapsed: boolean
}
```

说明：

- `default` 用于 desktop 展开态与 mobile drawer 内容。
- `rail` 用于 desktop 收起且 `leftRailWidth > 0` 时的内容。
- 宽度完全由 `ChatLayout` 控制，`ChatLeftPanel` 不重复声明尺寸 props。

### 10.4 `ChatLeftPanelToggle`

props：

- 暂不提供业务化 props

slots：

- `default`

语义：

- desktop：展开 / 收起左侧 panel
- mobile：打开 / 关闭左侧 drawer

### 10.5 `ChatRightPanel`

slots：

- `default`

slot props 建议：

```ts
{
  isMobile: boolean
  open: boolean
}
```

说明：

- 宽度完全由 `ChatLayout` 控制，`ChatRightPanel` 不重复声明尺寸 props。

### 10.6 `ChatRightPanelToggle`

props：

- 暂不提供业务化 props

slots：

- `default`

### 10.7 `ChatHeader` / `ChatMain` / `ChatFooter`

props：

- 暂不设计额外业务 props

slots：

- `default`

## 11. 样式与 token 约束

阶段一应优先复用现有 `@opentiny/tiny-robot` token：

- `--tr-z-index-drawer`
- `--tr-container-bg-default`
- `--tr-container-bg-hover`
- `--tr-border-color-disabled`
- `--tr-text-primary`
- `--tr-text-secondary`
- `--tr-radius-*`
- `--tr-spacing-*`

必要时新增 chat 布局级 token，例如：

- `--tr-chat-layout-left-bg`
- `--tr-chat-layout-right-bg`
- `--tr-chat-layout-header-bg`
- `--tr-chat-layout-footer-bg`
- `--tr-chat-layout-divider-color`

## 12. 阶段一不引入的能力

为了保证简单和聚焦，阶段一明确不引入：

- 通用 `target` 型 toggle API
- `mode / variant / desktop-only` 等模式型 props
- 嵌入式容器模式
- `Teleport`
- `body scroll lock`
- focus trap
- 自动识别 vnode 区域

## 13. 已收敛的关键约束

### 13.1 `ChatRightPanel` 名称保留

原因：

- 左右两个语义区域已经明确分离。
- 右侧 mobile 行为与左侧不同。
- 用单独语义名更利于后续阶段二复用。
- desktop 下它还是布局中的固定右列，单独命名更容易建立稳定认知。

### 13.2 `ChatHeader` 可选

约束：

- 布局在没有 `ChatHeader` 时也必须成立。
- 但调用层必须保证左右区域开关入口可达。
- 当 `leftRailWidth = 0` 时，调用层尤其要保证左侧重新打开入口始终可见。

### 13.3 a11y 只做到基础语义

阶段一先只做：

- `Esc` 关闭 overlay
- backdrop click 关闭
- `aria-label`
- `aria-expanded`
- 语义元素
- mobile overlay 至少提供可识别的 dialog 语义

阶段一不做：

- focus trap
- 更复杂的 overlay 焦点管理

## 14. 阶段一验收标准

- 布局层不依赖业务数据即可独立运行。
- desktop 左右结构稳定。
- mobile 左侧 drawer 稳定可用。
- mobile 右侧全屏操作面板稳定可用。
- `ChatMain` 是唯一主滚动根。
- `contentMaxWidth` 由 `ChatLayout` 自动施加到 `header / main / footer` 的 inner wrapper。
- `header / main / footer` 的 inner wrapper 使用统一横向 padding 规则。
- 左右区域尺寸只由 `ChatLayout` 管理。
- 左侧收起态行为稳定：
  - `leftRailWidth = 0` 时可完全关闭
  - `leftRailWidth > 0` 时可稳定进入 rail
- `ChatHeader` 缺失时，左右区域入口仍然可达。
- desktop 下 `rightPanelOpen = false` 时，右侧区域不占位且内容不渲染。
- `ChatFooter` 作为主布局底部区域存在，不额外依赖 `sticky` / `fixed`。
- API 不依赖 vnode 自动识别区域。
- 不引入与布局无关的业务抽象。
- 后续阶段二可以直接挂载 `TrHistory`、`TrBubbleList`、`TrSender`。

## 15. 阶段一目录与文件组织

### 15.1 阶段一目标

- 阶段一先把库源码和 demo 入口拆开。
- 阶段一目录只服务布局层，不提前实现阶段二、阶段三的空壳。
- 但整体目录方向要兼容后续 `panels/` 和 `app/` 的扩展。

### 15.2 阶段一最小推荐结构

```txt
packages/chat/
  docs/
    phase-1-layout.md
  demo/
    index.html
    build.mjs
    dev.mjs
    preview.mjs
    viteOptions.mjs
    src/
      App.vue
      main.ts
      shared/
        icons/
  src/
    index.ts
    namespace.ts
    styles/
      index.css
      tokens.css
      layout.css
    types/
      layout.ts
    context/
      layoutContext.ts
      keys.ts
    composables/
      useChatBreakpoint.ts
      useChatLayoutStore.ts
    shared/
      constants.ts
      utils.ts
    layout/
      index.ts
      ChatRoot.vue
      ChatLayout.vue
      ChatHeader.vue
      ChatMain.vue
      ChatFooter.vue
      ChatLeftPanel.vue
      ChatLeftPanelToggle.vue
      ChatRightPanel.vue
      ChatRightPanelToggle.vue
```

### 15.3 阶段一文件职责建议

- `src/index.ts`
  - 包总入口。
  - 导出布局层组件、类型、命名空间对象。

- `src/namespace.ts`
  - 维护 `Chat.Root`、`Chat.Layout` 这种聚合导出。

- `src/styles/index.css`
  - 样式总入口。

- `src/styles/tokens.css`
  - chat 布局级 token。

- `src/styles/layout.css`
  - 布局层公共结构样式。

- `src/types/layout.ts`
  - 阶段一布局层公共类型。

- `src/context/layoutContext.ts`
  - 布局层 provide / inject 逻辑。

- `src/context/keys.ts`
  - `InjectionKey` 和共享 key 定义。

- `src/composables/useChatBreakpoint.ts`
  - 断点判断逻辑。

- `src/composables/useChatLayoutStore.ts`
  - 阶段一布局 store。

- `src/shared/constants.ts`
  - 默认宽度、默认断点、默认过渡时长等常量。

- `src/shared/utils.ts`
  - 小型纯函数工具。

- `src/layout/index.ts`
  - 布局层 barrel 文件。

### 15.4 命名规则建议

- 组件文件使用 PascalCase，例如：
  - `ChatRoot.vue`
  - `ChatLayout.vue`
  - `ChatRightPanel.vue`
- 阶段一组件直接放在 `src/layout/` 下，不再为每个组件单独创建目录。
- composable 使用 `useXxx.ts`。
- 公共类型统一放在 `src/types/` 下，例如 `layout.ts`。
- 不再继续扩展当前的 `src/components/` 大目录。

### 15.5 当前原型的迁移建议

建议迁移关系如下：

- `src/App.vue` -> `demo/src/App.vue`
- `src/main.ts` -> `demo/src/main.ts`
- `src/icons/*` -> `demo/src/shared/icons/*`
- `src/components/ChatRoot.vue` -> `src/layout/ChatRoot.vue`
- `src/components/ChatLayout.vue` -> `src/layout/ChatLayout.vue`
- `src/components/ChatHeader.vue` -> `src/layout/ChatHeader.vue`
- `src/components/ChatMain.vue` -> `src/layout/ChatMain.vue`
- `src/components/ChatFooter.vue` -> `src/layout/ChatFooter.vue`
- `src/components/ChatSidebar.vue` -> 拆分重构为 `src/layout/ChatLeftPanel.vue` 和 `src/layout/ChatRightPanel.vue`
- `src/components/ChatSidebarSwitch.vue` -> 拆分重构为 `src/layout/ChatLeftPanelToggle.vue` 和 `src/layout/ChatRightPanelToggle.vue`
- `src/components/index.ts` -> `src/layout/index.ts`
- `src/context.ts` -> 拆分为 `src/context/layoutContext.ts` 和 `src/context/keys.ts`
- `src/style.css` -> 拆分为 `src/styles/index.css`、`src/styles/tokens.css`、`src/styles/layout.css`

### 15.6 阶段一不建议做的事

- 不为了阶段二、阶段三提前创建大量空目录和空文件。
- 不继续把 demo 资源和库源码混在 `src/` 下。
- 不继续扩大 `src/components/` 这个泛化目录。
- 不在阶段一保留 `ChatSidebar` 这种即将被淘汰的命名。
