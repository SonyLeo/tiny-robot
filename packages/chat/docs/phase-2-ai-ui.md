# 阶段二规划：AI UI 组合层

## 1. 阶段目标

阶段二聚焦 `packages/chat` 的 AI UI 组合层，目标是在阶段一布局原语之上接入 `@opentiny/tiny-robot` 的核心对话组件，形成可组合、可透传、可渐进增强的聊天 UI 基座。

本阶段优先解决：

- 把历史、消息列表、输入框、顶部栏接入当前 `Chat.Root + Chat.Layout`。
- 先明确左侧区域的动效基线，再开始接入阶段二核心组件。
- 保持 UI 和业务逻辑分离，所有业务真值由调用方或 `packages/kit` 管理。
- 保持底层 `Tr*` 组件的 props、events、slots 透传能力。
- 让 MCP 和附件先作为输入增强入口接入，不提前做完整运行时闭环。
- 为阶段三 `ChatApp` 保留可收敛的 UI 基座。

## 2. 范围边界

阶段二仍然只做 UI 组合，不做业务运行时。

明确不在本阶段处理：

- 会话数据的创建、切换、删除和持久化。
- 消息请求、流式输出、停止生成、重新生成等业务流程。
- 文件上传、文件解析、文件存储。
- 真实 MCP server 连接、安装、启停、工具 schema 转换和工具调用。
- `useMessage`、`useConversation`、`toolPlugin` 的内置绑定。
- 最终开箱即用的 `ChatApp` 高层抽象。

阶段二组件可以读取布局层 UI state，例如 `isMobile`、`leftSidebarOpen`、`rightPanelOpen`，但不维护消息、会话、附件、工具等业务真值。

## 3. 实现原则

- 薄封装优先：`Chat*` 组件主要负责聊天场景结构、样式和插槽组织。
- 透传优先：底层 `TrHistory`、`TrBubbleList`、`TrSender`、`TrFeedback` 等已有能力不能减少。
- 事件外传：用户操作通过 emits 交给调用方处理，不在 `packages/chat` 内部完成业务副作用。
- 插槽显式：继续保持显式 slots，不做 vnode 扫描和自动区域识别。
- 增强可选：附件、建议、MCP、反馈等能力应能按需组合，不成为核心链路的强依赖。
- 不重复发明状态：阶段二组件尽量消费阶段一 layout store，不新建另一套 panel open / drawer / collapse 状态。
- 动效同语法、分职责：共享统一的 motion token，但 panel、header、content 各自承担不同层级的动画责任。

## 4. 三步接入规划

### 4.0 前置步骤：左侧区动效基线

目标：

- 在开始接入阶段二组件前，先确定左侧区的结构动效和内容动效边界。
- 先把 demo 调整到一个足够顺滑、可复用的 rail / open / drawer 视觉基线。
- 用更少的几何重排换取更连贯的动效体验。

设计结论：

- 使用统一的 motion token
  - duration 建议收敛在 `160ms` 和 `220ms`
  - easing 建议统一为 `cubic-bezier(0.2, 0, 0, 1)` 或同等节奏
  - 后续由 layout / panel / header 共享，但不强制复用同一段 transition

- `ChatLayout` 负责结构动效
  - 左右区域宽度变化
  - mobile drawer 进出场
  - backdrop fade
  - 不承担 sidebar 内部内容的复杂形变

- `ChatSidebarPanel` 负责左侧内容动效
  - `header`
  - `primary-action`
  - `content`
  - 不再同时触发大量内部重排

- `ChatSidebarHeader` 与 `ChatTopbar` 共享动效语言，但不共享同一套动画逻辑
  - 两者共享 duration / easing / hover / focus 的节奏
  - `ChatSidebarHeader` 更偏向 `opacity`、轻位移、交叉淡入淡出
  - `ChatTopbar` 只保留轻量内容过渡，不承担 rail / drawer 切换

- 一个主几何动画 + 少量透明度切换
  - `open -> rail` 以左侧宽度变化为主
  - 内部内容以 `opacity` 或 `opacity + max-width` 为主
  - 避免同一个元素同时改 `width / padding / radius / gap / min-height`

- 左侧固定区优先使用双态叠层切换
  - `open` 版本和 `rail` 版本共用位置
  - 通过交叉淡入淡出切换
  - 不要求单个按钮在一个节点内做完整 morph

- rail 应被视为紧凑入口态，而不是缩小版 open 态
  - rail 只保留最关键入口
  - 内容区退场后不再强行压缩保留完整信息

前置步骤交付：

- demo 左侧区动效调整完成，并可作为阶段二 sidebar 动效基线。
- 文档明确 layout、sidebar panel、sidebar header、topbar 的动效职责。
- 后续核心组件实现默认沿用这套动效规则。

### 4.1 第一步：核心对话骨架

目标：

- 让 demo 从 layout-only 进入 chat-ui-only 骨架。
- 先完成一个正常 AI 对话页面最基本的四个区域：顶部栏、左侧区、消息区、输入区。
- 仍然使用本地 mock 数据，不接入 `packages/kit` 的业务运行时。

建议组件：

- `ChatTopbar`
  - 对应 header 区域。
  - 提供 `leading`、`title`、`actions`、`extra` 等 slots。
  - 推荐承载 `Chat.LeftSidebarToggle`、`Chat.RightPanelToggle` 的放置位置。
  - 不内置新会话、模型切换等业务行为。

- `ChatSidebarPanel`
  - 对应左侧区域的通用组合骨架，不绑定 `history` 语义。
  - 用于承载品牌区、toggle、主操作按钮和内容区。
  - 结合 `Chat.LeftSidebar` 暴露的 `mode: 'open' | 'rail' | 'drawer'` 做展示适配。
  - 提供 `header`、`primary-action`、`default` 等 slots。
  - 内部可以包含 `ChatSidebarHeader` 一类固定头部结构，但不要求首批作为公共组件导出。

- `ChatHistoryList`
  - 基于 `TrHistory`。
  - 作为 `ChatSidebarPanel` 的一种内容适配层。
  - 透传 `data`、`selected`、`showRenameControls`、`renameControlOnClickOutside`、`menuItems`、`menuListGap`。
  - 透传 `item-click`、`item-title-change`、`item-action`。
  - 透传 `item-prefix`、`item-title` slots。
  - 不负责左侧固定头部、主按钮和 rail 布局骨架。

- `ChatConversationPanel`
  - 基于 `TrBubbleList`。
  - 用于主消息区。
  - 透传 `messages`、`groupStrategy`、`dividerRole`、`fallbackRole`、`roleConfigs`、`contentRenderMode`、`contentResolver`、`autoScroll`。
  - 透传 `state-change`。
  - 透传 `prefix`、`suffix`、`after`、`content-footer` slots。
  - 增加 `empty` slot，用于外部放置欢迎态或空态。

- `ChatComposerPanel`
  - 基于 `TrSender`。
  - 用于 footer / composer 区域。
  - 支持 `v-model`、`submit`、`cancel`、`focus`、`blur`、`clear`、`input`。
  - 透传 `placeholder`、`disabled`、`loading`、`autofocus`、`enterkeyhint`、`mode`、`autoSize`、`maxLength`、`showWordLimit`、`clearable`、`extensions`、`size`、`stopText`、`defaultActions`、`submitType`。
  - 透传 `header`、`prefix`、`content`、`actions-inline`、`footer`、`footer-right` slots。

第一步交付：

- 新增 `src/panels/`。
- 新增 `src/types/panels.ts`。
- 新增 `src/styles/panels.css`。
- 更新 `src/index.ts`、`src/namespace.ts`、`src/styles/index.css`。
- demo 用四个核心组件替换当前占位内容。
- 阶段二文档记录组件边界和透传策略。

### 4.2 第二步：输入增强能力

目标：

- 让输入区接近真实 AI 对话应用。
- 附件、建议、MCP 先作为 UI 增强入口接入。
- 所有上传、工具调用、安装连接等复杂业务仍由外部处理。

建议组件：

- `ChatWelcomePanel`
  - 基于 `TrWelcome + TrPrompts`。
  - 用于空态欢迎和推荐问题。
  - 只负责展示，不判断何时显示。
  - 推荐问题点击通过事件外传。

- `ChatSuggestionBar`
  - 基于 `TrSuggestionPills`、`TrSuggestionPillButton`、`TrSuggestionPopover`、`TrDropdownMenu`。
  - 用于快捷指令、提示词、模板入口。
  - 点击建议后只发出事件，不直接写入 sender。

- `ChatAttachmentTray`
  - 基于 `TrAttachments`、`UploadButton`、`vDropzone`。
  - 用于附件展示、选择、删除、预览、下载、重试。
  - 文件列表由外部传入。
  - 上传状态由外部维护。
  - 组件只发出选择、删除、预览、下载、重试等事件。

- `ChatMcpEntry`
  - 作为输入区或顶部栏里的轻量 MCP 入口。
  - 可展示启用工具数量、打开 MCP 面板入口、当前工具状态摘要。
  - 不连接真实 MCP server。
  - 不转换 tools schema。
  - 不调用 `toolPlugin`。
  - 不维护 enabled tools 的业务真值。

第二步交付：

- demo 增加欢迎态、建议条、附件入口、MCP 入口。
- `ChatComposerPanel` 示例展示如何通过 slots 接入附件和 MCP。
- 文档明确附件和 MCP 在阶段二只是 UI 增强，不做运行时闭环。

### 4.3 第三步：体验增强与组合壳

目标：

- 把前两步能力组合成完整但仍然纯 UI 的聊天界面。
- 为阶段三 `ChatApp` 收敛 API 做准备。

建议组件：

- `ChatFeedbackBar`
  - 基于 `TrFeedback`。
  - 用于消息底部复制、重新生成、赞踩、来源。
  - 适合通过 `ChatConversationPanel` 的 `content-footer` slot 接入。
  - 操作事件全部外传。

- `ChatMcpPanel`
  - 基于 `TrMcpServerPicker`、`TrMcpAddForm`。
  - 适合放在右侧 `Chat.RightPanel` 中。
  - 只做 MCP 管理 UI。
  - 插件列表、市场列表、启停状态、创建结果由外部管理。

- `ChatUiShell`
  - 组合 `ChatTopbar`、`ChatSidebarPanel`、`ChatHistoryList`、`ChatConversationPanel`、`ChatComposerPanel`、`ChatWelcomePanel`。
  - 提供标准聊天 UI 模板。
  - 仍然不接管消息、会话、附件、MCP、模型等业务状态。
  - 不等同于阶段三的 `ChatApp`。

第三步交付：

- `layout-only` 示例保留阶段一能力。
- `chat-ui-core` 示例展示第一步核心骨架。
- `chat-ui-enhanced` 示例展示附件、建议、MCP 入口、反馈。
- 文档补充 `ChatUiShell` 和阶段三 `ChatApp` 的边界差异。

## 5. 推荐执行顺序

优先执行第一步，只接入核心组件：

1. 先确定并验证左侧区动效基线
2. `ChatTopbar`
3. `ChatSidebarPanel`
4. `ChatHistoryList`
5. `ChatConversationPanel`
6. `ChatComposerPanel`
7. demo 替换占位内容

第一步完成后，再进入第二步输入增强：

1. `ChatWelcomePanel`
2. `ChatSuggestionBar`
3. `ChatAttachmentTray`
4. `ChatMcpEntry`

最后进入第三步体验增强和组合壳：

1. `ChatFeedbackBar`
2. `ChatMcpPanel`
3. `ChatUiShell`
4. 示例和文档收敛

## 6. 验收标准

阶段二完成后应满足：

- 可以只用 `Chat.*` 组合出一个正常 AI 对话 UI。
- 核心 `Tr*` 组件已有 props、events、slots 没有被削减。
- 消息、会话、附件、MCP、模型等业务真值不进入 `packages/chat`。
- MCP 和附件作为可选增强能力存在，不强制进入核心链路。
- demo 能清晰区分 layout-only、chat-ui-core、chat-ui-enhanced。
- 阶段三可以在此基础上继续收敛为更高层的 `ChatApp`。
