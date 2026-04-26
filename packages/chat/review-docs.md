# Chat 用户文档检视报告

检视范围：

- `docs/src/components/chat.md`（快速开始）
- `docs/src/components/chat-features.md`（配置）
- `docs/src/components/chat-advanced.md`（自定义）
- `docs/demos/chat/blackbox.vue`
- `docs/demos/chat/default-page.vue`
- `docs/demos/chat/page-composition.vue`
- `docs/demos/chat/custom-layout.vue`

---

## 一、示例问题

### D1. `default-page.vue` 与 `blackbox.vue` 高度重复

两者都是 `<TrChat :config="..." />`，config 结构几乎一样。`default-page.vue` 只多了 `workspace` 和 `messages.feedback`，以及外层容器从固定 `600px` 变成 `height: 100%`。作为独立全屏示例页，没有展示出与 `blackbox.vue` 的差异化价值。

### ~~D2. `default-page.vue` 的 `workspace.right` 配置组合无效~~ [已撤回]

~~`right.enabled: true` + `defaultOpen: false` + `collapseMode: 'hidden'`，右侧面板默认关闭且折叠模式是 hidden，用户在示例里看不到任何触发右侧面板的入口。~~

**修正**：`ChatHeader.vue` 里 `showRightPanelToggle` 在 `workspace.enabled && rightRegion.enabled !== false` 时会渲染一个切换按钮（`IconMenu2`），即使 `defaultOpen: false` + `collapseMode: 'hidden'`，Header 右侧仍然有按钮可以打开右侧面板。此条判断不成立。

### D3. `page-composition.vue` 的 config 与 `default-page.vue` 几乎完全相同

两个 demo 的 config 只有 `defaultModelId` 和 `welcome.title/description` 不同。核心差异是 `TrChat` vs `TrChat.Root + TrChat.Page`，但 config 的高度相似让用户很难看出这条路径的独特价值。

### D4. `page-composition.vue` 没有体现 `Root + Page` 路径的核心优势

`Root + Page` 的核心价值是"自己持有 runtime，可以在外部访问和操作它"。但 demo 里 `resolution` 创建完就直接传给 `TrChat.Root`，没有展示任何外部访问 runtime 的场景（比如在外部按钮里调用 `resolution.runtime.conversation.send()`，或者读取消息列表）。

### D5. `custom-layout.vue` 使用了文档中未介绍的 `TrChat.WorkspaceLayout`

demo 里用了 `TrChat.WorkspaceLayout`，但三个文档页里完全没有介绍这个组件。用户看到 demo 代码后无法理解 `#left`、`#right` 这些 slot 从哪里来。

### D6. `custom-layout.vue` 使用了文档中未介绍的 `TrChat.Header` `#extra` slot

demo 里用了 `<template #extra>` 往 Header 里插入自定义 badge，但 `TrChatHeaderSlots` 里的 `extra` slot 在文档里完全没有提及。

### D7. 四个 demo 之间的语言不统一

`blackbox.vue` 的 welcome 文案是中文（"欢迎使用 Chat 套件"），其余三个 demo 是英文（"Welcome to the Chat Suite"、"Official Page Composition"、"Custom Layout"）。作为同一组文档示例，语言应该统一。

### D8. `blackbox.vue` 的 welcome description 包含内部术语

`description: '这个示例直接使用 target TrChatConfig 走官方黑盒入口。'`——"target TrChatConfig"和"黑盒入口"是内部重构术语，不应出现在面向用户的示例里。

### D9. 三个全屏示例页没有被文档正文引用 [已修正]

`chat-default-page`、`chat-page-composition`、`chat-custom-layout` 已在 `themeConfig.ts` 的 sidebar 里注册，站点里可以通过侧边栏找到。但 `chat.md`、`chat-features.md`、`chat-advanced.md` 的正文里没有任何显式链接指向它们，用户在阅读文档时不会自然地发现这些示例页。

---

## 二、Slots 文档完全缺失

这是目前文档最大的空白。

### S1. `TrChat.Page` 的 16 个 slots 没有任何文档

`TrChatPageSlots` 定义了以下 slots，全部没有文档：

| Slot | 类型 | 用途 | Slot Props |
|---|---|---|---|
| `header` | replace | 替换整个默认 header 区域 | 无 |
| `header-extra` | augment | 在 header 右侧注入内容 | 无 |
| `message-list` | replace | 替换默认消息列表 | `{ messages: ReadonlyRef<ChatMessage[]> }` |
| `welcome` | replace | 替换默认欢迎区 | 无 |
| `empty` | replace | 无 welcome 配置时的空状态 | 无 |
| `prefix` | bubble 级 | 消息气泡前缀 | `TrChatPageBubbleSlotProps` |
| `suffix` | bubble 级 | 消息气泡后缀 | `TrChatPageBubbleSlotProps` |
| `after` | bubble 级 | 消息气泡后方 | `TrChatPageBubbleSlotProps` |
| `content-footer` | bubble 级 | 消息内容底部 | `TrChatPageBubbleSlotProps` |
| `sender` | replace | 替换默认 sender 区域 | `TrChatPageSenderSlotProps` |
| `footer-extra` | augment | 在 sender 上方注入内容 | 无 |
| `left` | workspace | 替换桌面端左侧面板 | 无 |
| `left-rail` | workspace | 替换桌面端左侧 rail | 无 |
| `right` | workspace | 替换桌面端右侧面板 | 无 |
| `mobile-left` | workspace | 替换移动端左侧 sheet | 无 |
| `mobile-right` | workspace | 替换移动端右侧 sheet | 无 |

`chat-advanced.md` 里只有一句"TrChat.Page 的页面级 slots"，完全没有展开。

### S2. `TrChat.Header` 的 slots 没有文档

`TrChatHeaderSlots` 定义了 `title` 和 `extra` 两个 slot，文档里没有任何提及。

### S3. `TrChat.Sender` 的 `footer-right` slot 没有文档

`TrChatSenderSlots` 定义了 `footer-right` slot，这是用户最常用来放自定义按钮（语音、上传）的位置，文档里没有提及。

### S4. `TrChat.Footer` 的 `extra` slot 没有文档

`ChatFooter.vue` 有 `<slot name="extra" />`，在 `TrChat.Page` 里通过 `footer-extra` 透传。文档里没有任何提及。

### S5. `TrChat.WorkspaceLayout` 的 slots 没有文档

`ChatWorkspaceLayout.vue` 有 `left`、`left-rail`、`right`、`mobile-left`、`mobile-right` 和默认 slot，全部没有文档。

### S6. `WorkspaceShell` 的 slot props 没有文档

`WorkspaceShell.vue` 的 `left`/`right` slot 有 slot props `{ collapsed, toggle, collapse, expand }`，`left-rail`/`right-rail` 有 `{ expand }`。这是用户自定义侧边栏时控制折叠状态的关键接口，文档完全没有。

### S7. 用户有两种方式自定义 workspace 侧边栏，文档没有说明区别

1. 用 `TrChat.Page` 的 `#left`、`#right` slots（保留官方页面结构）
2. 用 `TrChat.WorkspaceLayout` 直接替换（完全自己组合）

`custom-layout.vue` 用的是方式 2，但文档里没有介绍方式 1，也没有说明什么时候该用哪种。

---

## 三、公开组件目录缺失

### C1. 没有完整的公开组件列表

`index.ts` 导出了 14 个 `TrChat.*` 子组件 + 3 个独立导出，但文档里没有任何一处列出完整目录。

| 组件 | 文档状态 |
|---|---|
| `TrChat` | ✅ 有介绍 |
| `TrChat.Root` | ✅ 有介绍 |
| `TrChat.Page` | ✅ 有介绍 |
| `TrChat.Provider` | ✅ 有介绍 |
| `TrChat.Layout` | ⚠️ 仅出现在代码示例里，无独立说明 |
| `TrChat.WorkspaceLayout` | ❌ 无 |
| `TrChat.Header` | ⚠️ 仅出现在代码示例里，无独立说明 |
| `TrChat.Welcome` | ⚠️ 仅出现在代码示例里，无独立说明 |
| `TrChat.MessageList` | ⚠️ 仅出现在代码示例里，无独立说明 |
| `TrChat.Footer` | ⚠️ 仅出现在代码示例里，无独立说明 |
| `TrChat.Sender` | ⚠️ 仅出现在代码示例里，无独立说明 |
| `TrChat.Attachments` | ❌ 无 |
| `TrChat.History` | ❌ 无 |
| `TrChat.WorkspaceShell` | ❌ 无 |
| `TrChat.WorkspaceRightSheet` | ❌ 无 |
| `TrMcpTrigger`（独立导出） | ⚠️ 仅被提及，无说明 |
| `TrChatFeedback`（独立导出） | ⚠️ 仅被提及，无说明 |
| `useMcpManager`（独立导出） | ⚠️ 仅被提及，无说明 |

### C2. `TrChat.WorkspaceLayout` 和 `TrChat.WorkspaceShell` 的区别没有说明

两者都在 `index.ts` 里导出。`WorkspaceLayout` 是高层封装（内部用了 `WorkspaceShell`，自动处理 mobile sheet、sidebar 默认内容等），`WorkspaceShell` 是底层 shell。文档里没有解释它们的区别和各自的适用场景。

### C3. `TrChat.WorkspaceRightSheet` 完全没有文档

独立导出的组件，作用是在移动端提供右侧 sheet 抽屉。文档里完全没有提及。

---

## 四、`chat.md`（快速开始）问题

### Q1. 入口选择表格中 `TrChat.Provider` 的定位可以更清晰 [已降级]

表格只有三行，`TrChat.Provider` 在表格下方用一句话带过。`README.md` 里明确将 Provider 定位为"bounded advanced helper surface"，与前三条官方入口是有意的产品分层，不是文档遗漏。

**修正**：原始检视倾向于把 Provider 提升到和前三条并列，但这不符合包的产品故事。此条从"缺失"降级为"建议"——文档可以更清楚地说明 Provider 的定位（比如在表格下方补一句"如果你只想替换 transport 层，可以用 `TrChat.Provider`，它是一个独立的高级入口"），但不需要把它加进表格。

### Q2. `Root + Page` 和 `Root + primitives` 的升级场景描述没有 demo 支撑

文字描述了两条路径的适用场景，但没有链接到对应的示例页（`page-composition` 和 `custom-layout`）。

### Q3. "最常改的配置"列表缺少 `conversation`

列了 8 个字段但漏掉了 `conversation`，而 `conversation.initialMessages` 是非常常用的配置。

---

## 五、`chat-features.md`（配置）问题

### F1. `messages.transforms` 没有任何示例

`messages` 字段列了 `transforms`，但没有给出任何示例。`ChatMessageTransforms` 有 `onChunk` 和 `onFinish` 两个钩子，是比较复杂的能力。

### ~~F2. `messages.transforms` 当前实际上不可用~~ [已撤回]

~~`config-bridge-matrix.md` 明确标注 `messages.transforms` 的 bridge 状态是 `deferred`。~~

**修正**：`createRuntimeFromConfig.ts` 已经把 `config.messages?.transforms` 桥接到 `useChatKit` 的 `messageTransforms` 参数，且 `root-runtime.test.mjs` 有专门测试证明它在 Root 路径上是生效的。`config-bridge-matrix.md` 里的 `deferred` 标注本身已经过时，但原始检视报告没有去验证代码，直接引用了那个过时的内部文档。此条判断不成立。

### F3. `request.transport` 的完整字段没有列出

`TrChatTransportConfig` 还有 `baseURL`、`apiPath`、`headers`、`credentials`、`temperature`、`maxTokens` 等字段，文档只提到了 `type`、`endpoint`、`systemPrompt`。

### F4. `lifecycle.afterReceive` 的参数类型没有说明

`afterReceive` 接收的是 `ChatMessage`（来自 `@opentiny/tiny-robot-kit`），不是 `ChatUIMessage`。这个区别对用户很重要。

### F5. `lifecycle` 的执行顺序没有说明

`api-runtime.md` 里明确冻结了执行顺序：`beforeSend` → `conversation.send` → `afterReceive` → `messages.transforms`。`chat-features.md` 里只列了字段名，没有说明执行顺序。

### F6. `lifecycle` 缺少 `afterReceive` 的示例

`lifecycle` 的最小示例只有 `beforeSend` 和 `error`，没有 `afterReceive`。

### F7. 各字段的子字段类型没有说明

每个配置域只列了"最常用的"子字段名，但没有说明它们的类型和可选值。例如：
- `transport.type` 只有 `'openai-compatible'` 一个值，但文档没有说明
- `sender.mode` 可选 `'single' | 'multiple'`，但文档没有说明
- `appearance.mode` 可选 `'light' | 'dark' | 'system'`，但文档没有说明
- `workspace.defaultView` 可选 `'stacked' | 'workspace'`，但文档没有说明

### F8. `conversation.persistence` 没有说明如何使用

只列了字段名，没有说明 `ConversationStorageStrategy` 接口是什么、从哪里导入、有哪些内置实现。

---

## 六、`chat-advanced.md`（自定义）问题

### A1. `Root + primitives` 示例缺少 `<script setup>`

示例只有 `<template>`，`runtime` 和 `ui` 从哪里来没有说明，用户无法直接运行。

### A2. `Root + primitives` 示例没有 `TrChat.History`

示例里只有 `Layout + Header + Welcome + MessageList + Footer + Sender`，没有 `TrChat.History`。在非 workspace 模式下，如果用户想要历史功能，需要手动加 `TrChat.History`，但示例没有展示。

### A3. `TrChat.Provider` 示例没有说明它是独立的 runtime 根节点

示例里 `TrChat.Provider` 直接包了 `TrChat.Layout`，但没有说明 `TrChat.Provider` 本身就是一个完整的 runtime 根节点，不需要外层 `TrChat.Root`。用户可能会困惑是否需要再套一层 `Root`。

### A4. `TrChat.Provider` 的完整 props 没有文档

`TrChatProviderProps` 除了 `transportAdapter` / `responseProvider` 之外，还有：
- `plugins`（`UseMessagePlugin[]`）
- `storage`（`ConversationStorageStrategy`）
- `initialMessages`（`ChatMessage[]`）
- `messageTransforms`（`ChatMessageTransforms`）
- `onFinish`（`(message: ChatMessage) => void`）
- `onError`（`(error: Error) => void`）
- `mcpManager`、`attachmentsManager`、`attachmentsFeature`、`senderActionsFeature`、`messages`、`shell`

文档里只提到了 `transportAdapter` / `responseProvider`。

### A5. `TrChat.Provider` 示例里 `TrChat.Layout` 缺少必要说明

示例里 `TrChat.Layout` 没有传 `appearance` 和 `content-layout`，也没有 `TrChat.Header`。用户不知道这是有意为之还是示例不完整。

### A6. `createRuntimeFromConfig` 的返回值结构没有说明

文档说它返回 `{ runtime, ui }`，但没有说明：
- `runtime` 是 `ChatRuntimeInput` 类型
- `ui` 是 `TrChatRootUiConfig` 类型
- `runtime` 里有哪些模块（`conversation`、`sender`、`message`、`history`、`models`、`workspace`、`attachments`）
- 用户可以通过 `runtime.conversation.messages` 读取消息、通过 `runtime.sender.send()` 发送消息

### A7. `TrMcpTrigger` 的使用前提没有说明

`McpTrigger.vue` 里有 `if (!mcpManager) throw new Error('mcpManager not provided')`。`TrMcpTrigger` 必须在提供了 `MCP_MANAGER_KEY` 的上下文里使用，文档里只说"常见做法是配合 `TrMcpTrigger`"，完全没有说明这个前提条件。

### A8. `TrChatFeedback` 的使用场景和 props 没有说明

独立导出的组件，文档里只在"Standalone advanced surfaces"里列了名字，没有任何说明。

### A9. "页面层和叶子层的扩展点"一节过于简略

只列了三类扩展点的名字，没有展开说明每类扩展点具体有哪些、怎么用。

---

## 七、表达与语言问题

### L1. 文档语气偏内部协作，不像面向外部用户

整体语气更像是团队内部的技术备忘录，而不是面向外部开发者的使用文档。具体表现：

- "这一页只讲当前 `TrChat` 的正式配置合同"——"正式配置合同"是内部术语，用户更习惯"配置项"或"配置参考"
- "如果你已经不打算继续用默认入口"——"默认入口"是内部概念，用户更习惯"默认方式"
- "不要把这类能力继续当成默认入口的隐式透传"——完全是内部语言

### L2. 大量使用"适合这些情况"的列表，但缺少具体场景

三个文档页里反复出现"适合这些情况"的列表，但列的都是抽象描述（"你想自己创建 runtime"），缺少具体的业务场景（"比如你需要在聊天页外部的按钮里触发发送消息"）。

### L3. "什么时候看这一页"和"什么时候进入自定义路径"的结构重复

`chat.md` 有"什么时候看这一页"，`chat-advanced.md` 有"什么时候进入自定义路径"，两者的结构和内容高度相似，都是"适合 / 如果你更关心 / 继续看"的模式。这种重复让用户感觉三个页面在说同一件事。

### L4. 每个页面的开头都在做路由分发，而不是直接进入主题

三个页面的开头都花了大量篇幅告诉用户"你应该看哪一页"，而不是直接进入本页的核心内容。`chat-features.md` 的前三个 section 都在做路由分发（"如果你还没决定"、"`TrChat` 只接受什么"、"配置总览"），直到第四个 section 才开始讲具体配置。

### L5. "什么不属于 `TrChatConfig`"一节的定位不清

`chat-features.md` 末尾的"什么不属于 `TrChatConfig`"列了一堆不属于的东西，但对用户来说更有用的是"如果我需要 X 能力，应该怎么做"，而不是"X 不属于这里"。

### L6. `chat-advanced.md` 的"常见高级场景"过于简略

MCP、Sender extensions、Standalone advanced surfaces 三个小节都只有两三句话，没有代码示例，用户看完不知道具体怎么做。

### L7. 中英文混用不一致

- `chat.md` 的 demo 引用描述是中文（"默认接入"、"使用 TrChatConfig 直接跑起完整聊天页"）
- `chat-features.md` 的代码示例里 placeholder 是英文（"Ask TinyRobot anything"）
- `blackbox.vue` 的 welcome 是中文，其余三个 demo 是英文
- `chat-advanced.md` 里的代码示例 endpoint 是英文路径

作为中文文档，应该统一语言风格。

### L8. 配置字段的描述过于简短，缺少"为什么"

每个配置域的描述都是"X 负责 Y"一句话，然后直接列字段名和最小示例。缺少：
- 这个字段解决什么问题
- 常见的配置组合
- 不同值的效果区别

例如 `workspace.defaultView` 可以是 `'stacked'` 或 `'workspace'`，但文档没有说明这两个值分别是什么效果。

### L9. "下一步看哪里"在三个页面里都出现，但内容几乎相同

三个页面末尾都有"下一步看哪里"，内容都是互相指向对方。这种循环引用对用户没有实际帮助。

---

## 八、结构性问题

### R1. 三个页面的信息密度不均衡

- `chat.md`（快速开始）：信息密度低，大量篇幅在做路由分发
- `chat-features.md`（配置）：信息密度中等，但每个字段的描述过于简短
- `chat-advanced.md`（自定义）：信息密度低，大量能力只提了名字没有展开

### R2. 缺少一个"组件参考"页面

三个页面的定位是"入口选择 → 配置 → 自定义"，但缺少一个系统性的组件参考页面，列出每个公开组件的 props、slots、emits。用户在自定义路径下需要频繁查阅这些信息，目前只能去看源码。

### R3. 缺少 `TrChat.Page` slots 的专门文档

这是用户在 `Root + Page` 路径下最常用的扩展方式，但完全没有文档。应该有一个专门的 section 或页面，列出所有 slots、slot props、使用示例和升级时机。

### R4. 缺少 runtime 接口的文档

`createRuntimeFromConfig` 返回的 `runtime` 对象是用户在 `Root + Page` 和 `Root + primitives` 路径下的核心交互接口，但文档里完全没有说明 `ChatRuntimeInput` / `ChatRuntime` 的结构和各模块的能力。

---

## 九、示例重新设计方案

### 9.1 `blackbox.vue` 的处理

不移除，但改名为 `basic.vue`。"blackbox"是内部重构术语，不应出现在面向用户的文件名里。

改名后，`chat.md` 里的内嵌 demo 和全屏示例页可以引用同一个文件，只是外层容器样式不同，不需要维护两份几乎相同的代码。同时清掉 welcome description 里的内部术语（"target TrChatConfig"、"黑盒入口"），统一语言为中文。

### 9.2 三个全屏示例的文件名优化

| 现在 | 建议 | 理由 |
|---|---|---|
| `default-page.vue` | `basic.vue` | 最小配置，基础示例，和其他组件 demo 的命名惯例一致 |
| `page-composition.vue` | `runtime-and-slots.vue` | 核心教学点是"自己持有 runtime + 用 slots 扩展" |
| `custom-layout.vue` | `workspace-layout.vue` | 核心教学点是"用 WorkspaceLayout 自定义页面结构" |

`blackbox.vue` 改名为 `basic.vue` 后，可以和全屏的 `basic.vue` 合并为同一个文件。

### 9.3 三个全屏示例的教学目标重新设计

三个示例应形成清晰的递进，每个示例都有前一个做不到的事情：

| 示例 | 入口 | 自由度 | 教学重点 |
|---|---|---|---|
| `basic.vue` | `TrChat` | 零代码组合 | 最小配置 + 全屏效果 |
| `runtime-and-slots.vue` | `Root + Page` | 持有 runtime + slots 扩展 | runtime 外部访问 + Page slots |
| `workspace-layout.vue` | `Root + primitives` | 完全自定义 | WorkspaceLayout + primitive slots |

#### `basic.vue`（最小可用聊天页）

- 砍掉 `workspace`、`messages.feedback` 等非必要配置，只保留 `request` + `ui` + `sender`
- 和内嵌 demo 共用同一个文件，只是外层容器不同
- 让用户一眼看出"原来只需要这么少的配置就能跑起来"

#### `runtime-and-slots.vue`（自己持有 runtime + Page slots 扩展）

- 用 `createRuntimeFromConfig` 创建 runtime
- 在外部放一个按钮，调用 `runtime.conversation.send()` 或读取 `runtime.conversation.messages`，展示"外部访问 runtime"的价值
- 用 `TrChat.Page` 的 `#header-extra` slot 注入一个自定义元素（比如状态指示器）
- 用 `#footer-extra` slot 注入一个自定义工具栏
- 让用户看到：不需要重写整个页面，只需要通过 slots 就能扩展

#### `workspace-layout.vue`（完全自定义页面组合）

- 保留现有的 `TrChat.WorkspaceLayout` + `#left` / `#right` 自定义侧边栏
- 展示 `TrChat.Header` 的 `#extra` slot
- 展示 `TrChat.Footer` 的 `#extra` slot
- 展示 `TrChat.Sender` 的 `#footer-right` slot（新增一个自定义按钮）
- 保留 `initialMessages` 让页面一打开就有内容

### 9.4 关于 `TrChat.Provider` 路径

三个全屏示例不需要覆盖 Provider 路径。Provider 是一个正交的维度（"谁控制 transport"），不是递进梯子的一级。它更适合在 `chat-advanced.md` 里用内嵌代码块说明，不需要独立的全屏示例。

---

## 十、交叉检视修正记录

本报告经过第二轮交叉检视，以下条目已修正：

| 编号 | 原判断 | 修正结果 | 原因 |
|---|---|---|---|
| D2 | `workspace.right` 配置组合无效，用户看不到触发入口 | **撤回** | `ChatHeader.vue` 里 `showRightPanelToggle` 在 workspace 启用时会渲染切换按钮 |
| F2 | `messages.transforms` 当前不可用 | **撤回** | `createRuntimeFromConfig.ts` 已桥接且有 `root-runtime.test.mjs` 测试覆盖 |
| Q1 | 入口选择表格缺少 Provider | **降级为建议** | `README.md` 明确将 Provider 定位为"bounded advanced helper surface"，三条官方入口是有意的产品分层 |
| D9 | 三个示例页没有被文档引用 | **修正为**：sidebar 里已有入口，但文档正文里没有显式链接 | `themeConfig.ts` 已注册 |

另外，交叉检视方提出了一个本报告未覆盖的问题：

- **P1（编码损坏）**：对方报告 `chat.md`、`chat-features.md`、`chat-advanced.md` 在工作区里出现乱码。本地用 Python 检查未发现 replacement character 或 null bytes，文件开头是正常的 YAML front matter（`2D 2D 2D 0A`）。这可能是对方工作区的本地环境问题（编辑器编码设置、git checkout line ending 转换等），暂时无法在本环境复现，但如果确实存在则优先级最高。

---

## 十一、总结

按优先级排序：

1. **Slots 文档完全缺失**（S1-S7）——这是最大的空白，直接影响 `Root + Page` 和 `Root + primitives` 路径的可用性
2. **公开组件目录缺失**（C1-C3）——用户不知道有哪些组件可用
3. **`TrChat.Provider` 的完整 props 没有文档**（A4）——影响 Provider 路径的可用性
4. **`Root + primitives` 示例不完整**（A1-A2）——用户无法直接运行
5. **配置字段的类型和可选值没有说明**（F3, F7, F8）——用户需要去看源码才能知道
6. **表达语气偏内部**（L1-L9）——影响外部用户的阅读体验
7. **示例差异化不足**（D1, D3, D4）——三个全屏示例没有展示各自路径的独特价值
