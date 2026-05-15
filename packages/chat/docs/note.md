# packages/chat 设计总览

## 1. 基本原则

- UI 和业务逻辑分离。修改业务 state 的逻辑不进入 `packages/chat`。
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
- `ChatLeftPanel`
- `ChatLeftPanelToggle`
- `ChatRightPanel`
- `ChatRightPanelToggle`

### 3.2 第二层：AI UI 组合层

职责：

- 基于布局层和 `@opentiny/tiny-robot` 的基础组件搭建聊天应用 UI。
- 对底层组件做聊天场景下的页面级组合。
- 仍然保持纯 UI 组件定位。

建议组件：

- `ChatTopbar`
- `ChatHistoryPanel`
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
- 本文件保留总体设计、关键决策和分层总览。
- 后续如果阶段二、阶段三继续细化，再分别拆出专项文档。

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

- 阶段二各面板组件的最小 props 面。
- `TrHistory`、`TrSender`、`TrBubbleList` 的透传边界。
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
- demo 通过 Node API 脚本调用 Vite，避免单独维护一份 demo 配置文件。
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
    build.mjs
    dev.mjs
    preview.mjs
    viteOptions.mjs
    public/
    src/
      main.ts
      App.vue
      examples/
        layout-only/
        chat-ui-only/
      chat-app/
      shared/
        icons/
        mocks/
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
      ChatLeftPanel.vue
      ChatLeftPanelToggle.vue
      ChatRightPanel.vue
      ChatRightPanelToggle.vue
    panels/
      index.ts
      ChatHistoryPanel.vue
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
  - `ChatLeftPanel.vue`
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
