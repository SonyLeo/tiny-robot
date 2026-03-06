# Chat 对话套件设计方案

> 版本：v1.1 | 日期：2026-03-04 | 状态：优化中

**目录**

| 章节 | 内容 |
|------|------|
| 一 | [调研：业界最佳实践](#一调研业界最佳实践) |
| 二 | [项目现状分析](#二项目现状分析) |
| 三 | [整体架构设计](#三整体架构设计) |
| 四 | [`useChatKit` — 核心逻辑层](#四usechatkit--核心逻辑层) |
| 五 | [`TrChat` 黑盒组件](#五trchat-黑盒组件) |
| 六 | [白盒复合组件](#六白盒复合组件) |
| 七 | [样式方案](#七样式方案) |
| 八 | [Providers 设计](#八providers-设计) |
| 九 | [CLI 工具设计](#九cli-工具设计) |
| 十 | [完整导出 API](#十完整导出-api) |
| 十一 | [已确认的设计决策](#十一已确认的设计决策) |
| 十二 | [实施顺序](#十二实施顺序) |
| 十三 | [风险与注意事项](#十三风险与注意事项) |
| 十四 | [模板路线图（Phase 2+）](#十四模板路线图phase-2) |

---

## 一、调研：业界最佳实践

### 1.1 Vercel AI SDK — useChat

**来源**：[ai-sdk.dev/docs/ai-sdk-ui/chatbot](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot)

Vercel AI SDK 的 `useChat` 是目前业界最广泛使用的 AI 对话逻辑层方案，核心设计思路：

- **逻辑与 UI 完全分离**：`useChat` 只负责状态管理（messages、status、error），UI 完全由开发者自由实现
- **状态机驱动**：status 分为 `submitted / streaming / ready / error` 四态，驱动 UI 的加载、停止、禁用等交互
- **Transport 抽象**：通过 `DefaultChatTransport` / `DirectChatTransport` / `TextStreamChatTransport` 解耦请求层，支持 HTTP、直连 Agent、纯文本流等多种模式
- **事件回调**：`onFinish / onError / onData` 覆盖完整生命周期
- **消息结构**：消息用 `parts` 数组表达多模态内容（text / reasoning / file / source-url），比单一 content 字段更具扩展性

**对本方案的启示**：
- `useChat` 的 `isProcessing` 应升级为四态状态机（`submitted / streaming / ready / error`）
- `responseProvider` 的抽象思路与 Transport 模式一致，已有良好基础
- 需补充 `onFinish / onError` 事件回调，让黑盒用法也能监听生命周期

---

### 1.2 Ant Design X — 组件分层架构

**来源**：[x.ant.design](https://x.ant.design/components/overview/)

Ant Design X 将 AI 对话 UI 分为三层：

| 层级 | 内容 | 对应本项目 |
|------|------|-----------|
| 原子组件层 | Bubble、Sender、Attachments、Prompts | `@opentiny/tiny-robot`（已有） |
| 逻辑 Hook 层 | useXChat、useXAgent | `@opentiny/tiny-robot-kit`（已有） |
| 套件/模板层 | 无（缺失） | `@opentiny/tiny-robot-chat`（待建） |

Ant Design X 本身**没有提供套件层**，用户需要自己组合原子组件和 Hook，这正是 ProChat（已废弃）试图解决的问题。

ProChat 的教训：过度封装导致定制性差，最终被废弃，官方推荐直接用 Ant Design X 原子组件。
**本方案的核心区分**：通过复合组件模式（Compound Components）同时支持黑盒和白盒两种用法，避免复蹈 ProChat 覆辙。

---

### 1.3 assistant-ui — 无头 AI Chat 原语

**来源**：[github.com/assistant-ui/assistant-ui](https://github.com/assistant-ui/assistant-ui)

assistant-ui 是 2024 年兴起的影响力最大的 AI 对话 UI 库，受 Radix UI / shadcn/ui 启发：

- **无头（Headless）优先**：只提供行为和状态，样式完全由开发者控制
- **原语（Primitive）分层**：`Thread` → `ThreadMessages` → `Message` → `MessageContent` 逐层可替换
- **Generative UI**：支持将 LLM tool call 输出映射为自定义 UI 组件
- **Runtime 架构**：通过 Runtime 对象统一管理状态，组件通过 Context 消费，与 Vercel AI SDK / LangGraph 无缝集成

**对本方案的关键启示（⚠️ 需修正的设计问题）**：
- `useChatKit` 的职责应严格限定在**会话逻辑层**，`inputValue` / `showHistoryDrawer` / `senderExtensions` 等 **UI 状态不应混入 composable**，应由组件层（`TrChat.vue`）自行管理
- 参考 Runtime 概念：将来可将 `useChatKit` 升级为可注入的 Runtime 对象，使组件与逻辑完全解耦

---

### 1.4 CometChat UI Kit — 复合组件分层

**来源**：[cometchat.com/docs/ui-kit/react/v6/components-overview](https://www.cometchat.com/docs/ui-kit/react/v6/components-overview)

- **Base Components**：单一职责的原子组件（MessageBubble、MessageInput 等）
- **Composite Components**：组合多个 Base/Composite 组件，提供完整功能区域

事件系统采用**解耦架构**：组件间通过事件通信，不直接引用，便于扩展和定制。

**对本方案的启示**：`Chat` 就是一个 Composite Component，内部组合了已有的 Base Components。

---

### 1.5 shadcn/ui — 复合组件模式（Compound Components）

**来源**：[vercel.com/academy/shadcn-ui/compound-components-and-advanced-composition](https://vercel.com/academy/shadcn-ui/compound-components-and-advanced-composition)

复合组件模式的核心价值：

> "Instead of cramming all functionality into a single component with dozens of props, compound components distribute responsibility across multiple cooperating components."

关键实现要点：
- **共享 Context**：Root 组件通过 `provide` 注入状态，子组件通过 `inject` 消费，避免 prop drilling
- **分离频繁变化的状态与静态配置**：防止不必要的重渲染
- **TypeScript 类型安全**：复合组件的组合错误在编译期捕获

---

### 1.6 create-vue vs @clack/prompts — CLI 工具设计

**来源**：
- [github.com/vuejs/create-vue](https://github.com/vuejs/create-vue)
- [github.com/bombshell-dev/clack](https://github.com/bombshell-dev/clack)

**create-vue 核心设计原则**（架构参考）：
- **纯脚手架工具**：只负责复制模板文件，不包含运行时依赖
- **模板即文件**：模板就是真实的项目文件，不用模板引擎，用条件文件名（`_gitignore` → `.gitignore`）
- **依赖版本自动同步**：模板 `package.json` 中的版本号通过 CI/脚本自动更新，**不应 hardcode**
- **零运行时依赖**：CLI 本身保持极简依赖

**`@clack/prompts` vs `prompts`（⚠️ 建议更换）**：

| 维度 | `prompts`（原方案） | `@clack/prompts`（推荐） |
|---|---|---|
| 维护状态 | 低维护，近 4 年无重大更新 | 活跃，持续迭代 |
| 交互体验 | 基础终端问答 | 现代（分组、spinner、优雅取消） |
| TypeScript | 类型较弱 | 原生 TypeScript |
| 取消处理 | 手动判断返回值 | 内置 `isCancel()` 工具函数 |
| 视觉效果 | 简单 | 带框线、颜色、符号 |

**结论**：本方案采用 `@clack/prompts` + `picocolors` 替代原方案中的 `prompts` + `kolorist`。

---

## 二、项目现状分析

### 2.1 现有架构

```
@opentiny/tiny-robot          UI 组件层（已有，成熟）
  Bubble / BubbleList          消息气泡
  Sender                       输入框（含 Mention/Template/Suggestion 扩展）
  Attachments                  附件
  History                      历史会话列表
  Welcome / Prompts            欢迎页 + 引导词
  Container                    容器（支持全屏）
  Feedback                     消息反馈（左侧操作按钮 + 右侧反馈动作 + 底部来源链接）
  ThemeProvider                主题

@opentiny/tiny-robot-kit      逻辑层（已有，成熟）
  useMessage                   单会话消息管理（流式、插件系统）
  useConversation              多会话管理（切换、持久化）
  OpenAIProvider               OpenAI 兼容请求
  storage/                     LocalStorage / IndexedDB 策略
  plugins/                     thinkingPlugin、toolPlugin 等
```

### 2.2 现有痛点

`docs/demos/examples/Assistant.vue` 是目前最完整的用法示例，但存在以下问题：

- **300+ 行代码**：用户需要手动组合 10+ 个组件，绑定所有逻辑
- **无开箱即用入口**：没有一个"一行代码跑起来"的组件
- **无模板工程**：用户不知道如何快速初始化一个完整项目
- **无 CLI 工具**：项目初始化完全手动
- **无事件回调**：用户无法在黑盒模式下监听 `onFinish`、`onError` 等消息生命周期
- **状态语义模糊**：`isProcessing` 是布尔值，无法区分"已提交等待响应（submitted）"和"正在流式输出（streaming）"两种不同状态，导致 UI 无法精准响应

### 2.3 缺失的层

```
❌ 套件层（Chat Kit）    ← 封装 UI + 逻辑，开箱即用
❌ 模板工程              ← 可直接部署的最小可用产品
❌ CLI 工具              ← 快速初始化模板工程
```

---

## 三、整体架构设计

### 3.1 三层架构

```
┌─────────────────────────────────────────────────────┐
│  Layer 3: 模板工程 (create-tiny-robot-app)           │
│  通过 CLI 脚手架生成，~30 行核心代码即可运行          │
├─────────────────────────────────────────────────────┤
│  Layer 2: Chat 套件 (@opentiny/tiny-robot-chat)      │
│  开箱即用的 <TrChat> 组件 + useChatKit composable   │
├─────────────────────────────────────────────────────┤
│  Layer 1: 已有基础层（不改动）                       │
│  @opentiny/tiny-robot（UI）                          │
│  @opentiny/tiny-robot-kit（逻辑）                    │
└─────────────────────────────────────────────────────┘
```

### 3.2 包结构

```
packages/
├── chat/                              ← @opentiny/tiny-robot-chat
│   ├── src/
│   │   ├── components/
│   │   │   ├── TrChat.vue             ← 黑盒入口（同时挂载所有白盒子组件）
│   │   │   ├── TrChatRoot.vue         ← 白盒根组件（provide 状态）
│   │   │   ├── TrChatHeader.vue       ← 顶部栏（新建/历史按钮）
│   │   │   ├── TrChatWelcome.vue      ← 欢迎页（原 Body 的职责拆出）
│   │   │   ├── TrChatMessageList.vue  ← 消息列表（支持完整 BubbleList props）
│   │   │   ├── TrChatFooter.vue       ← 底部容器
│   │   │   ├── TrChatSender.vue       ← 白盒 Sender（支持完整 TrSender props）
│   │   │   └── TrChatHistory.vue      ← Drawer + TrHistory
│   │   ├── composables/
│   │   │   └── useChatKit.ts          ← 核心逻辑 composable（纯逻辑，无 UI 状态）
│   │   ├── providers/
│   │   │   ├── openai.ts              ← createOpenAIProvider
│   │   │   └── deepseek.ts            ← createDeepSeekProvider
│   │   ├── styles/
│   │   │   ├── variables.css          ← --chat-* CSS 变量
│   │   │   ├── layout.css             ← 套件布局样式
│   │   │   ├── drawer.css             ← Drawer 动画（自实现，零依赖）
│   │   │   └── index.css              ← 样式入口
│   │   ├── context.ts                 ← provide/inject symbol key
│   │   ├── types.ts                   ← 套件类型定义
│   │   └── index.ts                   ← 导出入口
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── create-tiny-robot-app/             ← CLI 工具（独立包）
    ├── bin/
    │   └── index.js                   ← CLI 入口（ESM）
    ├── scripts/
    │   └── update-versions.js         ← 自动同步模板 package.json 中的包版本
    ├── templates/
    │   ├── basic/                     ← 基础模板（本期实现）
    │   │   ├── src/
    │   │   │   ├── App.vue
    │   │   │   ├── main.ts
    │   │   │   └── env.d.ts
    │   │   ├── public/
    │   │   ├── _gitignore             ← 构建时重命名为 .gitignore
    │   │   ├── _env.example           ← 构建时重命名为 .env.example
    │   │   ├── index.html
    │   │   ├── package.json
    │   │   ├── vite.config.ts
    │   │   ├── tsconfig.json
    │   │   └── README.md
    │   ├── with-mcp/                  ← 规划（Phase 2）
    │   ├── with-rag/                  ← 规划（Phase 2）
    │   └── with-context/              ← 规划（Phase 2）
    └── package.json
```

> **⚠️ 架构变更说明**：原方案中的 `TrChatBody.vue` 被拆分为 `TrChatWelcome.vue` + `TrChatMessageList.vue`。理由：将 Welcome 和 MessageList 耦合在一个 Body 组件内，会导致白盒模式下用户无法独立控制两者的显示逻辑。拆分后用户可以完全自主控制何时显示欢迎页、何时显示消息列表。

---

## 四、`useChatKit` — 核心逻辑层

### 4.1 设计原则

- 对 `useConversation` 的**薄封装**，不重复实现已有逻辑
- **严格限定职责**：只管理会话逻辑状态，**不管理任何 UI 状态**
  - `inputValue` → `TrChat.vue` 组件内部 `ref`（与 `useChatKit` 无关）
  - `showHistoryDrawer` → `TrChat.vue` 组件内部 `ref`
  - `senderExtensions` → 由调用方通过 prop/slot 管理
- 提供**便捷方法**，封装"首次发送自动创建会话"等常见逻辑
- 提供**生命周期回调**（`onFinish`、`onError`），对齐 Vercel AI SDK 设计
- **可独立使用**：不依赖任何 UI 组件，用户可以完全自定义 UI

> **💡 为什么要剥离 UI 状态？**  
> 参考 assistant-ui 的 Runtime 架构：`useChatKit` 作为逻辑核心，应可在任意 UI 框架中使用。如果混入了 `inputValue` 这类 Vue 组件级状态，会导致：
> 1. composable 承担了两层职责，测试复杂度上升
> 2. 将来无法提取为与 UI 无关的逻辑单元
> 3. 用户自定义 UI 时，`inputValue` 的生命周期与自定义组件不匹配

### 4.2 接口定义

```ts
// ===== ResponseProvider 类型（核心扩展点）=====
// ⚠️ 实际签名与设计初稿不同：底层接受 AsyncGenerator<ChatCompletion>，而非 ReadableStream<string>
// createOpenAIProvider 工厂函数负责将 SSE 流适配为 AsyncGenerator<ChatCompletion>
type ResponseProvider = (
  requestBody: {
    messages: ChatMessage[]     // 当前全量消息列表
    [key: string]: unknown      // 可扩展自定义字段（如 RAG 文档、工具定义等）
  },
  abortSignal: AbortSignal      // 用于响应 abort() 调用
) => Promise<ChatCompletion> | AsyncGenerator<ChatCompletion> | Promise<AsyncGenerator<ChatCompletion>>
// 返回值为异步生成器，每个 chunk 为 ChatCompletion 对象（增量内容在 delta 字段中）

// 消息状态（对齐 Vercel AI SDK 四态模型）
type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'
//   ready      → 空闲，可发送
//   submitted  → 已提交，等待首个 token（显示 "Loading..." 或骨架屏）
//   streaming  → 正在接收流式输出（显示停止按钮）
//   error      → 发生错误（显示重试按钮）
// abort 后状态直接重置为 ready（不引入短暂的 aborting 中间态，避免 UI 复杂度上升）

// 输入选项
interface UseChatKitOptions {
  responseProvider: ResponseProvider       // 必须
  plugins?: UseMessagePlugin[]             // 工具调用等插件
  storage?: ConversationStorageStrategy    // 持久化策略，不传则不持久化
  initialMessages?: ChatMessage[]          // 初始消息
  // === 生命周期回调 ===
  onFinish?: (message: ChatMessage) => void  // 流式完成后触发
  onError?: (error: Error) => void           // 发生错误时触发
}

// 返回值（精简，仅保留逻辑层关心的内容）
interface UseChatKitReturn {
  // === 来自 useConversation（直接透传）===
  conversations: Ref<ConversationInfo[]>
  activeConversationId: Ref<string | null>
  activeConversation: ComputedRef<Conversation | null>
  createConversation: (params?) => Conversation  // 同步创建并自动切换到新会话，无需再调 switchConversation
  switchConversation: (id: string) => Promise<Conversation | null>
  deleteConversation: (id: string) => Promise<void>
  updateConversationTitle: (id: string, title?: string) => void

  // === 消息相关（从 activeConversation 派生）===
  messages: ComputedRef<ChatMessage[]>
  status: ComputedRef<ChatStatus>           // ← 替换原 isProcessing: boolean

  // === 便捷方法（套件层新增）===
  // 组合了：首次发送自动创建会话 + sendMessage
  // 消息入队后立即返回，流式输出异步进行，不阻塞 UI
  sendMessage: (content: string) => void
  abort: () => Promise<void>
}
```

> **⚠️ 破坏性变更**：`isProcessing: ComputedRef<boolean>` → `status: ComputedRef<ChatStatus>`  
> 组件层需用 `status.value === 'streaming' || status.value === 'submitted'` 替代原有的 `isProcessing`。

### 4.3 sendMessage 内部逻辑

```
sendMessage(content) {
  1. 若 content 为空，直接返回
  2. 若 activeConversationId 为 null → createConversation({ title: content.slice(0, 20) })
  3. activeConversation.engine.sendMessage(content)
  // inputValue 清空在 sendMessage() 调用后同步执行（安全：消息已入队，无需等待流式完成）
}
```

---

## 五、`Chat` 黑盒组件

### 5.1 Props 设计

```ts
interface TrChatProps {
  // === 必须 ===
  responseProvider: ResponseProvider

  // === 会话逻辑 ===
  plugins?: UseMessagePlugin[]
  storage?: ConversationStorageStrategy
  initialMessages?: ChatMessage[]

  // === 生命周期回调（透传给 useChatKit）===
  onFinish?: (message: ChatMessage) => void
  onError?: (error: Error) => void

  // === 角色/头像配置 ===
  roleConfigs?: Record<string, BubbleRoleConfig>

  // === 欢迎页 ===
  welcome?: {
    title: string
    description?: string
    icon?: VNode | Component
  }
  prompts?: PromptProps[]
  // 黑盒模式下，点击引导词会自动调用 sendMessage(prompt.description)
  // 白盒模式下，用户需通过 TrChat.Welcome 的 @prompt-click 事件自行处理

  // === Sender 高频 props（平铺，优先级高于 senderProps）===
  placeholder?: string          // default: '请输入您的问题'
  maxLength?: number
  senderMode?: 'single' | 'multiple'

  // === BubbleList 高频 props（平铺，优先级高于 bubbleListProps）===
  autoScroll?: boolean          // default: true
  groupStrategy?: BubbleListProps['groupStrategy']

  // === 功能开关 ===
  showHistory?: boolean         // default: false
                                // 建议：配置了 storage 时才设为 true，否则 Drawer 历史为空无实际意义
  fullscreen?: boolean          // default: false

  // === 低频透传对象（平铺 props 优先级更高）===
  senderProps?: Partial<SenderProps>
  bubbleListProps?: Partial<BubbleListProps>
  historyProps?: Partial<HistoryProps>
}
```

**Props 优先级规则**：平铺 props > 透传对象 props。

> **💡 事件监听方式**：`onFinish` / `onError` 在 Vue 3 中既可以通过 props 传入，
> 也可以通过事件监听语法使用：
> ```vue
> :on-finish="handleFinish"   <!-- props 写法 -->
> @finish="handleFinish"      <!-- 等价的事件监听写法（Vue 3 自动转换） -->
> ```
> 两种写法完全等价，推荐在 `<script setup>` 中使用 props 写法，在模板中使用 `@` 事件写法。

> **⚠️ 移除说明**：原方案中 `mentions` / `suggestions` 的平铺语法糖已移除。  
> 理由：这两个 prop 内部需要调用 `TrSender.mention()`/`TrSender.suggestion()` 组装进 `extensions`，这层转换放在黑盒组件内是隐式的黑魔法，容易引发困惑。用户应直接通过 `senderProps.extensions` 传入，更加透明。

### 5.2 Slots 设计

```
// 布局区域替换
#header                                      替换整个顶部栏
#header-extra                                顶部栏右侧追加操作
#welcome                                     替换整个欢迎页
#empty                                       无消息且无欢迎配置时的占位
#footer-extra                                输入框上方区域（pills、工具栏等）
#sender="{ send, abort, status }"            替换整个输入区（status 为解包后的 ChatStatus 字面量值，替换原 isProcessing）
#message-list="{ messages, roleConfigs }"    替换整个消息列表

// BubbleList slots 动态透传（用户在 TrChat 上写，自动穿透到内部 BubbleList）
#prefix="{ messages, role, messageIndexes }"
#suffix="{ messages, role, messageIndexes }"
#after="{ messages, role, messageIndexes }"
#content-footer="{ messages, role, contentIndex, messageIndexes }"
```

**动态透传实现**：

```vue
<!-- TrChat.vue 内部 BubbleList 处 -->
<TrBubbleList :messages="messages" v-bind="mergedBubbleListProps">
  <template v-for="(_, name) in bubbleListSlots" #[name]="slotProps">
    <slot :name="name" v-bind="slotProps" />
  </template>
</TrBubbleList>
```

### 5.3 黑盒用法示例

```vue
<!-- 最简用法 -->
<TrChat :response-provider="responseProvider" />

<!-- 完整配置 -->
<TrChat
  :response-provider="responseProvider"
  :plugins="[toolPlugin(...)]"
  :storage="localStorageStrategy"
  :role-configs="roles"
  :welcome="{ title: 'AI Assistant', description: '有什么可以帮你的？' }"
  :prompts="promptItems"
  placeholder="请输入您的问题..."
  :max-length="2000"
  show-history
  style="height: 100vh"
  @finish="handleFinish"
  @error="handleError"
>
  <!-- 追加顶部操作 -->
  <template #header-extra>
    <MySettingsButton />
  </template>

  <!-- 输入框上方放工具栏 -->
  <template #footer-extra>
    <MyToolbar />
  </template>

  <!-- 每条消息底部加反馈框架 -->
  <template #content-footer="{ messages }">
    <TrFeedback
      :actions="[
        { name: 'copy', label: '复制', icon: 'copy' },
        { name: 'like', label: '有用', icon: 'like' },
        { name: 'dislike', label: '无用', icon: 'dislike' }
      ]"
      @action="handleAction"
    />
  </template>
</TrChat>
```

---

## 六、白盒复合组件

### 6.1 设计原则

基于 shadcn/ui 的复合组件模式：
- `TrChat.Root` 通过 `provide` 注入 `useChatKit()` 的完整返回值
- 所有子组件通过 `inject` 消费共享状态，无 prop drilling
- 子组件支持完整的底层组件 props，不做二次封装限制
- **White Box = Composability**：用户可以任意调整子组件的顺序、省略某个子组件、在子组件中插入自定义内容

### 6.1.1 TrChat.Root 的两种使用模式

`TrChat.Root` 的 props 设计支持两种互斥的使用方式：

**模式 A（传 Options）**：Root 内部调用 `useChatKit`，适合无需在外部访问响应式状态的场景

```vue
<TrChat.Root :response-provider="fn" :storage="storage">
  ...
</TrChat.Root>
```

**模式 B（传实例）**：外部预先调用 `useChatKit`，通过 `:chat-kit` prop 注入，Root 直接 provide，不重复创建状态。适合需要在父组件用 `v-if="messages.length === 0"` 等条件渲染的场景

```vue
<script setup>
// 外部调用一次 useChatKit
const chat = useChatKit({ responseProvider, storage })
const { messages } = chat
</script>

<template>
  <!-- :chat-kit 接受 UseChatKitReturn 实例，Root 不再内部创建新状态 -->
  <TrChat.Root :chat-kit="chat">
    ...
  </TrChat.Root>
</template>
```

> **⚠️ 两种模式互斥**：不能同时传 `.chat` 和 `:response-provider`。

### 6.2 组件树

```
TrChat.Root   支持两种模式：传 UseChatKitOptions（内部创建状态）或传 :chat-kit（外部注入实例）
├── TrChat.Header    顶部栏，props: showHistory?, showNewChat?
│                     slot: #extra（追加操作）
├── TrChat.Welcome   欢迎页，props: title, description?, icon?（可独立控制显隐）
├── TrChat.MessageList  消息列表，支持完整 TrBubbleList props + 所有 slots
├── TrChat.Footer    底部容器（slot: #extra 用于 pills 等）
│   └── TrChat.Sender   独立 Sender，支持完整 TrSender props
└── TrChat.History   Drawer + TrHistory，支持完整 TrHistory props
```

> **⚠️ 变更说明**：`TrChat.Body` 已拆分为 `TrChat.Welcome` + `TrChat.MessageList`，用户可以独立控制两者的显示逻辑，例如：在欢迎页和消息列表之间插入置顶公告、免责声明等自定义内容。

### 6.3 白盒用法示例

```vue
<script setup lang="ts">
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/style'

// 模式 B：外部创建 chat 实例，用于顶层条件渲染
const chat = useChatKit({ responseProvider, storage })
const { messages } = chat

const roles = { /* ... */ }
function handleAction(action) { /* ... */ }
function handleFinish(msg) { /* ... */ }
function handleError(err) { /* ... */ }
</script>

<template>
  <!-- 通过 :chat-kit 注入实例，Root 不重复创建状态 -->
  <TrChat.Root :chat-kit="chat">
    <TrChat.Header>
      <template #extra>
        <MyCustomButton />
      </template>
    </TrChat.Header>

  <!-- Welcome 和 MessageList 分别独立控制 -->
  <TrChat.Welcome
    v-if="messages.length === 0"
    title="AI Assistant"
    description="有什么可以帮你的？"
  />
  <TrChat.MessageList
    v-else
    :role-configs="roles"
    :group-strategy="'divider'"
    auto-scroll
  >
    <!-- 完整支持 BubbleList 的所有 slots -->
    <template #content-footer="{ messages }">
      <TrFeedback
        :actions="[
          { name: 'copy', label: '复制', icon: 'copy' },
          { name: 'like', label: '有用', icon: 'like' }
        ]"
        @action="handleAction"
      />
    </template>
  </TrChat.MessageList>

  <TrChat.Footer>
    <!-- 输入框上方自定义区域 -->
    <template #extra>
      <MySuggestionPills />
    </template>
    <!-- 完整支持 TrSender 的所有 props -->
    <TrChat.Sender
      :max-length="2000"
      :show-word-limit="true"
      sender-mode="autosize"
    />
  </TrChat.Footer>

  <TrChat.History />

  </TrChat.Root>
</template>
```

### 6.4 纯逻辑用法（完全自定义 UI）

```vue
<script setup>
import { ref } from 'vue'
import { useChatKit } from '@opentiny/tiny-robot-chat'

const {
  messages, status,
  sendMessage, abort,
  conversations, switchConversation,
} = useChatKit({
  responseProvider,
  onFinish: (msg) => console.log('done', msg),
  onError: (err) => console.error(err),
})

// UI 状态由组件自己管理
const inputValue = ref('')
const showHistory = ref(false)

function handleSend() {
  if (!inputValue.value.trim()) return
  sendMessage(inputValue.value)   // void，无需 await
  inputValue.value = ''           // 同步清空，消息已入队展示
}
</script>

<template>
  <!-- 完全自定义 UI，只用逻辑层 -->
  <MyCustomChatLayout
    :messages="messages"
    :status="status"
    v-model:input="inputValue"
    @send="handleSend"
    @abort="abort"
  />
</template>
```

### 6.5 导出方式

```ts
// TrChat 同时作为黑盒组件和白盒子组件的挂载点
import { TrChat } from '@opentiny/tiny-robot-chat'

// 黑盒
<TrChat :response-provider="fn" />

// 白盒（子组件挂载在 TrChat 上）
<TrChat.Root>
  <TrChat.Header />
  <TrChat.Welcome v-if="messages.length === 0" title="..." />
  <TrChat.MessageList v-else />
  <TrChat.Footer>
    <TrChat.Sender />
  </TrChat.Footer>
  <TrChat.History />
</TrChat.Root>
```

---

## 七、样式方案

### 7.1 分层原则

```
套件层（--chat-*）   负责布局结构：尺寸、间距、Drawer 宽度等
    ↓ 引用
组件层（--tr-*）         负责组件本身：颜色、字体、边框等（已有，不改动）
```

**技术栈**：使用 Less（与 `packages/components/` 保持一致），利用嵌套语法减少 BEM 前缀重复。

用户定制时只需覆盖套件变量，无需了解内部组件变量：

```less
.my-chat {
  --chat-height: 100vh;
  --chat-drawer-width: 320px;
  --chat-border-radius: 0;
}
```

### 7.2 CSS 变量清单（`variables.less`）

```less
:root {
  /* 整体布局 */
  --chat-width: 100%;
  --chat-height: 100%;          /* 默认 100%，由父容器控制高度 */
  --chat-border-radius: 16px;

  /* Header */
  --chat-header-height: 48px;
  --chat-header-padding: 0 12px;
  --chat-header-bg: var(--tr-container-bg-default);
  --chat-header-border-bottom: 1px solid var(--tr-border-color-default);

  /* Body */
  --chat-body-padding: 0;
  --chat-body-bg: var(--tr-container-bg-default);

  /* Footer */
  --chat-footer-padding: 8px 12px;
  --chat-footer-bg: var(--tr-container-bg-default);
  --chat-footer-border-top: 1px solid var(--tr-border-color-default);

  /* History Drawer */
  --chat-drawer-width: 280px;
  --chat-drawer-bg: var(--tr-container-bg-default);
  --chat-drawer-shadow: 4px 0 20px rgba(0, 0, 0, 0.08);
  --chat-drawer-z-index: 100;
  --chat-drawer-transition: 0.25s ease;
  --chat-drawer-overlay-bg: rgba(0, 0, 0, 0.3);
}

// 暗色模式下覆盖硬编码值（--tr-* 引用链自动跟随，只需覆盖无法引用 --tr-* 的硬编码项）
[data-tr-color-mode='dark'] {
  --chat-drawer-shadow: 4px 0 20px rgba(0, 0, 0, 0.48);
  --chat-drawer-overlay-bg: rgba(0, 0, 0, 0.5);
}
```

### 7.3 Drawer 实现（自实现，零依赖）

使用 `position: absolute`（相对 TrChat 容器定位，不影响页面其他内容）：

```less
/* TrChat 根元素 */
.tr-chat {
  position: relative;
  overflow: hidden;
  width: var(--chat-width);
  height: var(--chat-height);
}

/* 遮罩层 */
.tr-chat-drawer-overlay {
  position: absolute;
  inset: 0;
  background: var(--chat-drawer-overlay-bg);
  opacity: 0;
  transition: opacity var(--chat-drawer-transition);
  pointer-events: none;
  z-index: calc(var(--chat-drawer-z-index) - 1);
}
.chat-drawer-overlay.is-open {
  opacity: 1;
  pointer-events: auto;
}

/* Drawer 面板 */
.chat-drawer {
  position: absolute;
  top: 0; left: 0;
  height: 100%;
  width: var(--chat-drawer-width);
  background: var(--chat-drawer-bg);
  box-shadow: var(--chat-drawer-shadow);
  transform: translateX(-100%);
  transition: transform var(--chat-drawer-transition);
  z-index: var(--chat-drawer-z-index);
  display: flex;
  flex-direction: column;
}
.chat-drawer.is-open {
  transform: translateX(0);
}
```

---

## 八、Providers 设计

### 8.1 定位

`createOpenAIProvider` / `createDeepSeekProvider` 放在 `@opentiny/tiny-robot-chat` 包中，作为面向"快速上手"的工厂函数。

与 `tiny-robot-kit` 中 `OpenAIProvider` 类的区别：

| | `tiny-robot-kit` 的 `OpenAIProvider` | `tiny-robot-chat` 的 `createOpenAIProvider` |
|---|---|---|
| 形态 | 类（Class） | 工厂函数 |
| 定位 | 底层，灵活 | 上层，便捷 |
| 返回 | Provider 实例 | `responseProvider` 函数（直接传给 ChatKit） |
| 用户 | 需要了解 Provider 体系 | 只需传配置对象 |

### 8.2 接口定义

```ts
// OpenAI 兼容（含 DeepSeek、通义千问等）
function createOpenAIProvider(options: {
  apiKey: string                    // 必须
  model?: string                    // default: 'gpt-4o-mini'
  baseURL?: string                  // default: 'https://api.openai.com/v1'
  systemPrompt?: string             // 自动注入 system message
  temperature?: number
  maxTokens?: number
}): ResponseProvider

// DeepSeek 快捷方式（预设 baseURL 和默认 model）
function createDeepSeekProvider(options: {
  apiKey: string
  model?: string                    // default: 'deepseek-chat'
  systemPrompt?: string
  temperature?: number
}): ResponseProvider
```

### 8.3 内部实现

直接复用 `tiny-robot-kit` 的 `OpenAIProvider`，包一层工厂函数：

```ts
export function createOpenAIProvider(options) {
  const provider = new OpenAIProvider({
    apiKey: options.apiKey,
    apiUrl: options.baseURL,
    defaultModel: options.model ?? 'gpt-4o-mini',
    defaultOptions: {
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    },
  })

  // 返回 responseProvider 函数签名
  return (requestBody, abortSignal) => {
    const messages = options.systemPrompt
      ? [{ role: 'system', content: options.systemPrompt }, ...requestBody.messages]
      : requestBody.messages

    // 省略了 chatStream 的其余参数（onChunk、onFinish 等回调映射），
    // 实现细节参考 tiny-robot-kit 的 OpenAIProvider.chatStream() 签名
    return provider.chatStream({ messages, options: { stream: true, signal: abortSignal } })
  }
}
```

---

## 九、CLI 工具设计

### 9.1 使用方式

```bash
npm create tiny-robot-app my-app
# 或
npx create-tiny-robot-app my-app
# 或（不指定目录名，交互式询问）
npm create tiny-robot-app
```

### 9.2 交互流程（使用 @clack/prompts）

```
$ npm create tiny-robot-app my-app

┌  Create Tiny Robot App
│
◇  Project name
│  my-app
│
◇  Select a template
│  ● Basic Chat Agent
│  ○ Chat + Context      (coming soon)
│  ○ Chat + MCP Tools    (coming soon)
│  ○ Chat + RAG          (coming soon)
│
◇  Select language
│  ● TypeScript  ○ JavaScript
│
◇  Select API provider
│  ● OpenAI  ○ DeepSeek  ○ Custom
│
◇  Install dependencies?
│  ● Yes  ○ No
│
◆  Scaffolding project in ./my-app...
│
└  Done! 🎉

  Next steps:
    cd my-app
    cp .env.example .env    # 填入你的 API Key
    npm run dev
```

**选中 coming soon 模板时的处理**：

```
◇  Select a template
│  ○ Chat + MCP Tools    (coming soon)
│
◆  This template is not available yet. Please select another.
```

> **⚠️ 与原方案的差异**：使用 `@clack/prompts` 替代 `prompts`。带框线的分组视觉效果更现代，内置 `isCancel()` 避免手动判断返回值 `undefined`，原生 TypeScript 类型更安全。

### 9.3 CLI 实现技术栈

参照 create-vue 极简设计，更新依赖：

```json
{
  "dependencies": {
    "@clack/prompts": "^0.9.0",
    "picocolors": "^1.1.1"
  }
}
```

- `@clack/prompts`：现代 CLI 交互（替代 `prompts` + `kolorist`）
- `picocolors`：终端颜色输出（比 `chalk` 更轻量）
- 模板文件：直接复制，不用模板引擎
- 特殊文件名：`_gitignore` → `.gitignore`，`_env.example` → `.env.example`

**取消处理示例**（`@clack/prompts` 的关键优势）：

```js
import { intro, outro, select, text, isCancel, cancel } from '@clack/prompts'

const template = await select({
  message: 'Select a template',
  options: [
    { value: 'basic', label: 'Basic Chat Agent' },
    { value: 'with-mcp', label: 'Chat + MCP Tools', hint: 'coming soon' },
  ],
})

if (isCancel(template)) {
  cancel('Operation cancelled.')
  process.exit(0)
}
```

### 9.4 版本自动同步

模板 `package.json` 中的依赖版本通过 CI 脚本自动同步，**不 hardcode 版本号**：

```js
// scripts/update-versions.js
// 读取 workspace 中各包的实际版本，写入所有模板的 package.json
// 在 release CI 中自动运行
```

这样每次发布新版本时，模板依赖会自动跟进，不需要人工维护。

### 9.5 模板工程结构（basic）

```
my-app/
├── src/
│   ├── App.vue          ← 核心：~30 行，直接用 <Chat>
│   ├── main.ts
│   └── env.d.ts
├── public/
├── .env.example         ← VITE_API_KEY=sk-xxx
├── .gitignore
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

**`App.vue` 目标形态**：

```vue
<template>
  <TrChat
    :response-provider="responseProvider"
    :storage="storage"
    :welcome="welcome"
    :prompts="prompts"
    show-history
    style="height: 100vh"
  />
</template>

<script setup lang="ts">
import { TrChat, createOpenAIProvider } from '@opentiny/tiny-robot-chat'
import { localStorageStrategy } from '@opentiny/tiny-robot-kit'
import '@opentiny/tiny-robot-chat/style'

const responseProvider = createOpenAIProvider({
  apiKey: import.meta.env.VITE_API_KEY,
  model: import.meta.env.VITE_MODEL || 'gpt-4o-mini',
  baseURL: import.meta.env.VITE_BASE_URL,
})

// 启用 LocalStorage 持久化，配合 show-history 使用
const storage = localStorageStrategy()

const welcome = {
  title: 'AI Assistant',
  description: '你好，我是你的 AI 助手，有什么可以帮你的？',
}

const prompts = [
  { title: '✍️ 写作', description: '帮我写一篇关于...' },
  { title: '💻 编程', description: '帮我写一个...' },
  { title: '📊 分析', description: '帮我分析...' },
  { title: '🌐 翻译', description: '帮我翻译...' },
]
</script>
```

### 9.6 模板规划

| 模板 | 核心特性 | Phase |
|------|---------|-------|
| `basic` | 纯对话，OpenAI/DeepSeek | ✅ Phase 1（本期） |
| `with-mcp` | toolPlugin + MCP 工具调用 | 📋 Phase 2 |
| `with-rag` | 自定义 responseProvider + 知识库检索 | 📋 Phase 2 |
| `with-context` | 多轮对话上下文优化、token 成本控制 | 📋 Phase 2 |

> **⚠️ 优先级修正**：原方案将 `with-context-management` 列为本期高优，但这些模板依赖 `basic` 经过充分验证后才有意义。建议 Phase 1 只做 `basic`，Phase 2 再根据用户反馈选择模板方向。

---

## 十、完整导出 API

```ts
// @opentiny/tiny-robot-chat

// ===== 组件 =====
export { TrChat }
// TrChat 同时挂载白盒子组件：
// TrChat.Root / TrChat.Header / TrChat.Welcome
// TrChat.MessageList / TrChat.Footer / TrChat.Sender / TrChat.History

// ===== Composable =====
export { useChatKit }

// ===== Providers =====
export { createOpenAIProvider }
export { createDeepSeekProvider }

// ===== 类型 =====
export type { ResponseProvider }
export type { TrChatProps }
export type { UseChatKitOptions, UseChatKitReturn }
export type { ChatStatus }
export type { OpenAIProviderOptions, DeepSeekProviderOptions }
export type { WelcomeConfig }
```

---

## 十一、已确认的设计决策

| 问题 | 决策 |
|------|------|
| 黑盒 vs 白盒 | 两者都支持，共享同一套 useChatKit 状态 |
| 套件包名 | `@opentiny/tiny-robot-chat` |
| CLI 包名 | `create-tiny-robot-app` |
| CLI 交互库 | `@clack/prompts` + `picocolors`（替代原 `prompts` + `kolorist`） |
| 模板数量（本期） | 1 个（basic），其余 Phase 2 |
| 模板工程类型 | 纯 SPA（Vite + Vue 3） |
| 模板版本同步 | CI 脚本自动同步，不 hardcode 版本号 |
| useChatKit 独立暴露 | 是，可不用任何组件纯逻辑使用 |
| useChatKit UI 状态 | **不管理**（`inputValue`/`showHistoryDrawer` 由组件层自行管理） |
| 消息状态 | `status: ChatStatus`（四态），替代原 `isProcessing: boolean` |
| 生命周期回调 | `onFinish` / `onError`（`useChatKit` options 和 TrChat props 均支持） |
| createOpenAIProvider 位置 | `tiny-robot-chat` 包，面向快速上手 |
| 历史会话面板形态 | Drawer，从左侧滑出 |
| Drawer 实现方式 | 套件自实现，position: absolute + transition，零依赖 |
| 样式方案 | Less（与 components 包保持一致），嵌套语法减少 BEM 前缀重复；`--chat-*` 引用 `--tr-*` 实现暗色模式自动切换 |
| 暗色模式 | 通过 `--tr-*` 变量引用链自动跟随 ThemeProvider，无需额外代码；硬编码值在 `[data-tr-color-mode='dark']` 下覆盖 |
| VueUse 引入 | 不引入（当前方案逻辑已足够简单，无明显简化收益） |
| ResponseProvider 实际签名 | `AsyncGenerator<ChatCompletion>`（不是设计初稿中的 `ReadableStream<string>`） |
| Props 优先级 | 平铺 props > 透传对象 props |
| `TrChat.Root` 使用模式 | 支持两种互斥模式：传 Options（内部创建状态）或传 `:chat-kit`（外部注入实例） |
| sendMessage 返回值 | `void`（同步入队，流式异步），替代原 `Promise<void>` |
| ResponseProvider 实际签名 | `AsyncGenerator<ChatCompletion>`（不是设计初稿中的 `ReadableStream<string>`） |
| TrChat.Body | **拆分**为 `TrChat.Welcome` + `TrChat.MessageList`（独立控制显隐） |
| TrChat.Root 默认高度 | `height: 100%`，由父容器控制 |
| Props 优先级 | 平铺 props > 透传对象 props |
| 平铺语法糖（mentions/suggestions） | **移除**（避免隐式转换，改为直接通过 `senderProps.extensions` 传入） |
| 白盒子组件 props | 支持完整底层组件 props，不做二次封装限制 |
| Chat.Root 使用模式 | 支持两种互斥模式：传 Options（内部创建状态）或传 `.chat`（外部注入实例） |
| ResponseProvider 类型 | 定义在 `types.ts`，核心扩展点，返回 ReadableStream<string> |
| sendMessage 返回值 | `void`（同步入队，流式异步），替代原 `Promise<void>` |

---

## 十二、实施顺序

```
Phase 1 - Step 1: packages/chat/
  1.1  package.json + tsconfig + vite.config
  1.2  types.ts（含 ChatStatus 类型）+ context.ts
  1.3  composables/useChatKit.ts（纯逻辑，无 UI 状态）
  1.4  providers/openai.ts + deepseek.ts
  1.5  styles/ (variables + layout + drawer)
  1.6  components/ChatKitRoot.vue（provide 状态）
  1.7  components/ChatKitHeader.vue
  1.8  components/ChatKitWelcome.vue（独立欢迎页，原 Body 职责拆出）
  1.9  components/ChatKitMessageList.vue（支持完整 BubbleList props）
  1.10 components/ChatKitFooter.vue
  1.11 components/ChatKitSender.vue
  1.12 components/ChatKitHistory.vue（Drawer + TrHistory）
  1.13 components/Chat.vue（黑盒，组合以上子组件，内部管理 inputValue 等 UI 状态）
  1.14 index.ts（导出入口，挂载复合组件）

Phase 1 - Step 2: packages/create-tiny-robot-app/
  2.1  package.json（依赖 @clack/prompts + picocolors）
  2.2  templates/basic/（完整模板工程）
  2.3  bin/index.js（CLI 交互逻辑，使用 @clack/prompts）
  2.4  scripts/update-versions.js（版本自动同步脚本）

Phase 1 - Step 3: 工程配置
  3.1  pnpm-workspace.yaml 注册新包
  3.2  根 package.json 补充 build:chat 等脚本
  3.3  CI 配置：在 release 时触发版本同步脚本

Phase 1 - Step 4: 文档
  4.1  docs/ 补充套件快速开始页（黑盒 / 白盒 / 纯逻辑三种用法）
  4.2  docs/ 补充 API 参考页
```

---

## 十三、风险与注意事项

1. **BubbleList slots 动态透传**：Vue 3 的动态 slot 名需要用 `v-for` + `#[name]` 实现，需要验证所有 slot 名能正确透传，特别是带连字符的 slot 名（`content-footer`）。

2. **TrChat.vue 内部 inputValue 管理**：`inputValue` 不再由 `useChatKit` 管理，而是由 `TrChat.vue` 组件内部持有。在 `sendMessage` 调用成功后，组件负责清空 `inputValue`。需确保流程清晰，避免状态不同步。

3. **ChatStatus 四态与底层 useMessage 的映射**：底层 `useMessage` 尚未直接暴露四态状态机，需在 `useChatKit` 中根据 `engine` 的现有状态（`isStreaming`、`error` 等）推导 `status`，需验证边界状态（如 abort 后的状态重置）；此外 abort() 执行后状态应立即同步置为 ready，即使流尚未实际断开（网络层的关闭是异步的）。

4. **TrChat.Welcome / TrChat.MessageList 的切换时机**：黑盒 `TrChat.vue` 内部会自动处理（`messages.length === 0` 时显示 Welcome），白盒模式下需用户自行用 `v-if/v-else` 控制，**文档必须明确说明**。

5. **createOpenAIProvider 的浏览器端安全**：直接在浏览器端使用 API Key 存在泄露风险，模板工程的 README 必须明确说明生产环境应通过**后端代理**转发请求（如建议使用 Nitro / Hono 实现代理中间层）。

6. **CLI 的 `_gitignore` 重命名**：npm publish 时 `.gitignore` 文件会被自动忽略，需用 `_gitignore` 命名后在 CLI 脚本中重命名，参照 create-vue 的处理方式。

7. **`@clack/prompts` 版本一致性**：`@clack/prompts` API 在 v0.x 阶段仍在迭代，建议 lockfile 精确锁定版本，并在升级时验证交互行为。

8. **暗色模式变量名**：`--tr-color-border` 不存在，正确变量名是 `--tr-border-color-default`；`--chat-drawer-shadow` 和 `--chat-drawer-overlay-bg` 等硬编码值需在 `[data-tr-color-mode='dark']` 下覆盖，与 components 包的处理方式保持一致。

9. **ResponseProvider 实际签名差异**：设计初稿中写的是 `ReadableStream<string>`，但底层实际接受 `AsyncGenerator<ChatCompletion>`。`createOpenAIProvider` 工厂函数已按实际签名实现，`types.ts` 中 `ResponseProvider` 类型也已对齐实际签名。

---

## 十四、模板路线图（Phase 2+）

> 以下内容为 Phase 2 及以后的规划，本期（Phase 1）不实现。  
> 详细设计在对应模板开发时再展开，此处仅说明各模板的定位。

### 14.1 `with-mcp`

**定位**：演示如何在 Chat 中使用 `toolPlugin` 集成 MCP 工具调用。  
**核心**：`responseProvider` + `toolPlugin`，ChatKit 本身无需改动。

### 14.2 `with-rag`

**定位**：演示如何写一个带文档检索步骤的 `responseProvider`（RAG 核心价值不在 Chat 配置，而在 provider 层）。  
**核心**：`rag.ts`（检索 → 注入 system prompt → 发给 LLM），使用 `TrFeedback` 的 `sources` 展示参考文档。

### 14.3 `with-context`

**定位**：演示多轮对话上下文优化（token 计数 → 超阈值时自动生成摘要 → 压缩历史）。  
**核心**：`ContextManager` 工具类 + `createContextAwareProvider`，通过 `#header-extra` slot 展示 token 统计。

### 14.4 模板组合路线

各独立模板经过充分验证后，可按需组合：

| 组合 | 适用场景 |
|------|---------|
| `with-mcp` + `with-rag` | 工具执行 + 知识检索 |
| `with-rag` + `with-context` | 知识检索 + 长对话优化 |
| `with-mcp` + `with-context` | 工具调用 + 上下文管理 |

> 组合模板推荐采用**独立模板**方式实现（不共享库），保持代码清晰可读，作为用户的完整参考示例。

