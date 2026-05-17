# packages/chat 设计总览

## 1. 基本原则

- UI 和业务逻辑分离。修改业务真值或业务 state 的逻辑不进入 `packages/chat`。
- 布局开关、抽屉显隐、面板展开、断点结果等纯 UI state 可以留在 `Root` 提供的 UI store 中。
- UI 只映射属性和事件。
- 逻辑分离后在 `Root` 作用域都可以用。
- `Root` 作为顶层提供 store 的地方，所有配置在此注入。
- Chat 组件是 robot 组件的扩展，属性需要满足扩展原则。原有组件的配置能力不能减少，只能在其基础上增加额外能力。

## 2. 已确认决策

- `packages/chat` 强依赖 `@opentiny/tiny-robot`，不做完全独立的通用布局库。
- 最终交付物同时包含可组合组件和高层成品，不只交付单一 `ChatApp`。
- 移动端右侧扩展区默认隐藏，按需扩展。
- 移动端左侧面板从左向右展开，默认宽度为视口的 `2/3`。
- 移动端右侧操作面板从右向左展开，默认铺满可视区域。
- 布局层 API 采用显式 slots / 显式区域组件，不依赖运行时扫描 vnode 自动识别区域。
- 阶段一左右区域采用两个语义组件，不再保留通用 `ChatSidebar` 抽象。
- 基于 `@opentiny/tiny-robot` 的封装统一采用透传策略，不削减底层组件已有能力。
- `contentMaxWidth` 覆盖 `header / main / footer` 的内容内层。
- 左右区域的尺寸参数统一由 `ChatLayout` 管理，不在子区域组件重复声明。
- 左侧 `desktop collapse` 和移动端 `drawer` 采用“统一入口、分离状态”的实现方式。
- 左侧 `desktop collapse` 的收起结果由 `leftRailWidth` 决定：`0` 为完全关闭，`> 0` 为 rail。
- `ChatRightPanel` 名称保留。
- `ChatHeader` 默认推荐存在，但不是强制；如果缺失，调用方必须自己保证左右区域入口可达。
- desktop 下 `ChatRightPanel` 作为布局中的固定右列，不采用 overlay。
- desktop 下 `rightPanelOpen = false` 时，右侧列宽归零且区域内容不渲染，不保留占位。
- `leftRailWidth = 0` 时，左侧重新打开入口默认推荐放在 `ChatHeader` 的 leading 区域。
- 阶段一 a11y 只做到基础语义，不进入 focus trap。
- `drawer Teleport` 与 `body scroll lock` 暂不纳入阶段一默认能力。
- 阶段一先不处理嵌入式容器模式，只聚焦页面级聊天布局。
- 整体实现分三阶段推进：
  1. 布局层
  2. AI 前端 UI 组合层
  3. `ChatApp` 高层抽象层

## 3. 分层总览

### 3.1 第一层：布局原语层

职责：

- 提供页面布局和响应式结构。
- 管理纯 UI 的布局状态。
- 作为阶段 2 和阶段 3 的基础骨架。

建议组件：

- `ChatRoot`
- `ChatLayout`
- `ChatHeader`
- `ChatMain`
- `ChatFooter`
- `ChatLeftSidebar`
- `ChatLeftSidebarToggle`
- `ChatRightPanel`
- `ChatRightPanelToggle`

### 3.2 第二层：AI UI 组合层

职责：

- 基于布局层和 `@opentiny/tiny-robot` 的基础组件搭建聊天应用 UI。
- 对底层组件做聊天场景下的页面级组合。
- 仍然保持纯 UI 组件定位。

建议组件：

- `ChatTopbar`
- `ChatSidebarPanel`
- `ChatHistoryList`
- `ChatConversationPanel`
- `ChatComposerPanel`
- `ChatWelcomePanel`
- `ChatUiShell`

### 3.3 第三层：高层成品层

职责：

- 面向外部用户提供开箱即用的聊天应用 UI 外壳。
- 组合阶段 2 的典型结构。
- 保留足够的透传能力和 slots 扩展能力。

建议组件：

- `ChatApp`

## 4. 目标与范围

### 4.1 总目标

1. 先完成聊天应用的布局层。
2. 再引入 `components` 的基础组件，完成纯 UI 的 AI 前端应用层。
3. 最后再抽象为 `ChatApp` 形态，对外暴露更高层的 props、slots、events。

### 4.2 当前范围

- 当前只做 UI 层。
- 不做数据层。
- 不做消息请求、会话存储、模型调用、流式数据处理。
- 不在 `packages/chat` 内维护业务真值。

### 4.3 非目标

- 不在阶段 1 直接设计成完整聊天业务页面。
- 不在阶段 2 引入业务 store。
- 不在阶段 3 为了高层封装而牺牲 `TrHistory`、`TrSender`、`TrBubbleList` 的扩展能力。

## 5. 文档索引

- 阶段一布局专项设计：`docs/phase-1-layout.md`
- 阶段二 AI UI 组合层规划：`docs/phase-2-ai-ui.md`
- 本文件保留总体设计、关键决策和分层总览。
- 后续如果阶段三继续细化，再拆出专项文档。

## 6. 当前产物规划

### 6.1 组件产物

- 布局原语层组件
- AI UI 组合层组件
- `ChatApp`

### 6.2 样式产物

- `@tiny-robot/chat/style.css`
- 与 `@opentiny/tiny-robot` 一致的主题变量对接方式

### 6.3 类型产物

- 每个对外组件的 props 类型
- 常用数据结构类型
- 透传 props 类型

### 6.4 示例产物

- layout-only 示例
- chat-ui-only 示例
- chat-app 示例

## 7. 后续讨论重点

- 阶段二左侧区域骨架、动效基线与内容适配层的边界。
- 阶段二增强输入能力的透传边界。
- 阶段三 `ChatApp` 的顶层 props 与 slots 收敛。

## 8. 目录与文件组织建议

### 8.1 目标

- 尽早把“库源码”和“本地 demo / playground”分开。
- 让阶段一、阶段二、阶段三可以沿着同一套目录结构自然演进。
- 目录结构贴近 `packages/components` 现有风格，但保留 `chat` 自己的分层语义。

### 8.2 顶层目录建议

```txt
packages/chat/
  docs/
  demo/
  src/
  package.json
  vite.config.ts
  tsconfig.json
```

说明：

- `docs/` 继续承载阶段设计文档。
- `demo/` 只放本地运行入口、示例页面和调试资源。
- demo 与库构建共用同一份 `vite.config.ts`，通过 `root` 指向 `demo/`。
- `src/` 只放最终要参与库构建的源码。

### 8.3 推荐整体结构

```txt
packages/chat/
  docs/
    phase-1-layout.md
    phase-2-ai-ui.md
    phase-3-chat-app.md
  demo/
    index.html
    src/
      main.ts
      App.vue
      components/
      composables/
      styles/
  src/
    index.ts
    namespace.ts
    styles/
      index.css
      tokens.css
      layout.css
    types/
      layout.ts
      panels.ts
      app.ts
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
      ChatLeftSidebar.vue
      ChatLeftSidebarToggle.vue
      ChatRightPanel.vue
      ChatRightPanelToggle.vue
    panels/
      index.ts
      ChatSidebarPanel.vue
      ChatHistoryList.vue
      ChatConversationPanel.vue
      ChatComposerPanel.vue
      ChatTopbar.vue
      ChatWelcomePanel.vue
    app/
      index.ts
      ChatApp.vue
```

说明：

- `layout/` 对应阶段一。
- `panels/` 对应阶段二。
- `app/` 对应阶段三。
- 阶段一实现时不要求一次性把 `panels/`、`app/` 全建出来，但整体分层方向先固定。

### 8.4 根入口建议

- `src/index.ts`
  - 作为包的总入口。
  - 统一导出组件、类型、命名空间对象和样式入口。

- `src/namespace.ts`
  - 专门维护 `Chat.Root`、`Chat.Layout` 这一类命名空间导出。
  - 避免总入口同时承载过多拼装逻辑。

### 8.5 命名规则建议

- 组件文件统一使用 PascalCase：
  - `ChatRoot.vue`
  - `ChatLayout.vue`
  - `ChatLeftSidebar.vue`
- 组件按分层放入对应目录，不再给每个组件单独创建目录。
- composable 统一使用 `useXxx.ts`。
- 公共类型统一放到 `src/types/`，而不是分散在每个组件目录里。
- context 文件使用语义化命名：
  - `layoutContext.ts`
  - `keys.ts`
- 不继续保留过宽泛的名字，例如：
  - `components/`
  - `context.ts`
  - `style.css`

### 8.6 关于 demo 资源

- demo 自用图标、mock 数据、临时样式不进入库源码。
- 当前 `src/App.vue`、`src/main.ts`、`src/icons/` 更适合迁移到 `demo/src/` 下。
- 只有真正属于库对外能力的资源，才保留在 `src/` 中。

## 9. 借鉴 `demo/chat-suit` 的设计结论

参考对象：`demo/chat-suit`

这里的“借鉴”主要指设计思想和实现取向，不是原样复制旧组件架构。

### 9.1 核查结论

- `ChatSidebarSwitch` 的价值，更准确地说是“行为封装、视觉外置”，而不是严格意义上的“配置驱动 UI”。
- 旧版 `ChatSidebarSwitch` 内部只关心切换侧边栏状态，图标、文案、按钮长相由调用方通过 slot 决定。
- 旧版 `ChatSidebarSwitch` 的 `position` prop 在当时实现中并没有真正参与逻辑，这个点不属于值得继承的部分。
- 左侧 `panel / rail` 的切换，不是单纯依赖元素隐藏，而是“容器宽度变化 + 内容显隐切换”的组合。
- 旧版 rail 效果是在同一个左侧语义区域内部完成的，而不是额外再建一套完全平行的侧边栏系统。

### 9.2 值得借鉴的设计思想

- 行为组件只管行为，不抢视觉决定权。
- 布局组件只提供结构和布局状态，不负责具体业务内容。
- 布局状态通过 slot props 暴露给内容层，让内容层自己决定 open / rail / compact 时的具体呈现。
- rail 应该被理解为左侧区域的一种收起态表达，而不是另一套平行的区域组件。
- 能在同一棵内容树内完成的 open / rail 切换，尽量不要过早拆成两套完全不连续的内容结构。
- 尺寸、过渡时长等布局参数适合经由 CSS 变量进入样式层，而不是写死在内容组件内部。

### 9.3 不建议直接继承的部分

- 不继承 vnode 扫描 + 按组件名自动分发区域的实现方式。
- 不把 `opacity: 0` 这类 demo 式 `hidden` 策略直接当作正式 rail 解决方案。
- 不继承“声明了 prop 但实际不参与逻辑”的模式。
- 不因为旧基座较轻就回退当前已经明确的 mobile / right-panel / overlay 状态模型。

## 10. 基于借鉴结论的当前优化清单

这一节不是新架构，而是在当前 `packages/chat` 已确认方向上的可执行优化。

### 10.1 阶段一可以继续微调的项

- `ChatLeftSidebarToggle` 和 `ChatRightPanelToggle` 继续保持“行为组件”定位。
- toggle 组件的 slot 后续可以考虑暴露更多状态，例如：`expanded`、`isMobile`、`side`。
- `ChatLeftSidebar` 已经通过 `mode: 'open' | 'rail' | 'drawer'` 暴露状态，后续重点是保持内容层围绕这套状态表达实现，而不是重新拆出第二棵 rail 组件树。
- 左右两侧 panel 的 slot props 语义可以继续对齐，避免后续面板组件在使用上出现左右不对称的感受。

### 10.2 更适合阶段二吸收的点

- `HistoryPanel` 这类真实内容组件，可以更多采用“同一内容树 + 局部显隐”的方式处理 open / rail 切换。
- `Topbar`、`HistoryPanel`、`ComposerPanel` 等组件延续“行为内聚、视觉外置”的设计原则。
- 阶段二组件尽量直接消费布局层状态，不重复发明另一套 panel open / collapse / drawer 状态。

### 10.3 当前路线的总体判断

- 当前 `packages/chat` 的阶段一架构已经比旧基座更完整，不应回退到旧基座的组件划分方式。
- 旧基座最值得吸收的是设计原则，不是原样的 API 或 DOM 组织方式。
- 当前方向应该继续保持：显式 slots、清晰的 layout store、左右语义区域分离、mobile / desktop 状态分离。

## 11. 当前实现快照

当前仓库里的阶段一实现已经对齐到下面这套 API：

- `Chat.Root`
  - `mobileBreakpoint`
  - `defaultLeftSidebarOpen`
  - `defaultRightPanelOpen`
- `Chat.Layout`
  - `leftSidebarWidth`
  - `leftRailWidth`
  - `rightPanelWidth`
  - `mobileLeftSidebarWidth`
  - `mobileRightPanelWidth`
  - `contentMaxWidth`
  - `transitionDuration`
  - `overlayBackdropAriaLabel`
  - `mobileLeftSidebarAriaLabel`
  - `mobileRightPanelAriaLabel`
- `Chat.Layout` 使用显式 named slots：
  - `left-sidebar`
  - `header`
  - `main`
  - `footer`
  - `right-panel`
- `ChatLeftSidebar`
  - 只保留一个默认 slot
  - 通过 `mode: 'open' | 'rail' | 'drawer'`、`open`、`collapsed` 向内容层暴露状态
- `ChatLeftSidebarToggle`
  - desktop 下控制 `leftSidebarOpen`
  - mobile 下控制 `leftDrawerOpen`
- `ChatMain`
  - 作为唯一主滚动根

当前本地开发与校验脚本也已经收敛为：

- `pnpm -F @tiny-robot/chat dev`
- `pnpm -F @tiny-robot/chat build`
- `pnpm -F @tiny-robot/chat lint`
- `pnpm -F @tiny-robot/chat type-check`
- `pnpm -F @tiny-robot/chat check`
