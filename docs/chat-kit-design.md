# Chat 对话套件设计方案

> 版本：v1.0 | 日期：2026-03-03 | 状态：待评估

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
- `useChatKit` 的状态设计参考其四态模型
- `responseProvider` 的抽象思路与 Transport 模式一致，已有良好基础
- 消息 parts 结构值得在 BubbleList 渲染层面对齐

---

### 1.2 Ant Design X — 组件分层架构

**来源**：[x.ant.design](https://x.ant.design/components/overview/)

Ant Design X 将 AI 对话 UI 分为三层：

| 层级 | 内容 | 对应本项目 |
|------|------|-----------|
| 原子组件层 | Bubble、Sender、Attachments、Prompts | `@opentiny/tiny-robot`（已有） |
| 逻辑 Hook 层 | useXChat、useXAgent | `@opentiny/tiny-robot-kit`（已有） |
| 套件/模板层 | 无（缺失） | `@opentiny/tiny-robot-chat`（待建） |

Ant Design X 本身**没有提供套件层**，用户需要自己组合原子组件和 Hook，这正是 ProChat（已废弃）试图解决的问题。ProChat 的核心 API：

```jsx
<ProChat
  request={async (messages) => {
    return streamResponse; // 支持流式和非流式
  }}
/>
```

ProChat 的教训：过度封装导致定制性差，最终被废弃，官方推荐直接用 Ant Design X 原子组件。
**本方案的改进**：通过复合组件模式（Compound Components）同时支持黑盒和白盒两种用法，避免 ProChat 的过度封装问题。

---

### 1.3 CometChat UI Kit — 复合组件分层

**来源**：[cometchat.com/docs/ui-kit/react/v6/components-overview](https://www.cometchat.com/docs/ui-kit/react/v6/components-overview)

CometChat 将组件分为两类：

- **Base Components**：单一职责的原子组件（MessageBubble、MessageInput 等）
- **Composite Components**：组合多个 Base/Composite 组件，提供完整功能区域（ConversationsWithMessages、MessageList 等）

事件系统采用**解耦架构**：组件间通过事件通信，不直接引用，便于扩展和定制。

**对本方案的启示**：`ChatKit` 就是一个 Composite Component，内部组合了已有的 Base Components（TrBubbleList、TrSender、TrHistory 等）。

---

### 1.4 shadcn/ui — 复合组件模式（Compound Components）

**来源**：[vercel.com/academy/shadcn-ui/compound-components-and-advanced-composition](https://vercel.com/academy/shadcn-ui/compound-components-and-advanced-composition)

复合组件模式的核心价值：

> "Instead of cramming all functionality into a single component with dozens of props, compound components distribute responsibility across multiple cooperating components."

关键实现要点：
- **共享 Context**：Root 组件通过 `provide` 注入状态，子组件通过 `inject` 消费，避免 prop drilling
- **分离频繁变化的状态与静态配置**：防止不必要的重渲染
- **TypeScript 类型安全**：复合组件的组合错误在编译期捕获

适用场景（完全符合本方案）：
- 有大量配置项的复杂组件
- 多个独立 UI 区域可以灵活组合
- 功能可选或条件渲染
- 需要在不同配置下复用

---

### 1.5 create-vue — CLI Scaffold 实现

**来源**：[github.com/vuejs/create-vue](https://github.com/vuejs/create-vue)

create-vue 的核心设计原则：

- **纯脚手架工具**：只负责复制模板文件，不包含运行时依赖
- **交互式 prompts**：用 `prompts` 库实现，支持 `--flag` 跳过交互
- **模板即文件**：模板就是真实的项目文件，不用模板引擎，用条件文件名（`_gitignore` → `.gitignore`）
- **依赖版本硬编码**：模板的 `package.json` 写死版本，通过 CI 自动更新
- **零运行时依赖**：CLI 本身只依赖 `prompts` 和 `kolorist`（颜色输出）

**对本方案的启示**：`create-tiny-robot-app` 完全参照此模式实现，轻量、可靠。

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
│  用户 clone/init 的完整应用，~30 行代码即可运行      │
├─────────────────────────────────────────────────────┤
│  Layer 2: Chat 套件 (@opentiny/tiny-robot-chat)      │
│  开箱即用的 <ChatKit> 组件 + useChatKit composable   │
├─────────────────────────────────────────────────────┤
│  Layer 1: 已有基础层（不改动）                       │
│  @opentiny/tiny-robot（UI）                          │
│  @opentiny/tiny-robot-kit（逻辑）                    │
└─────────────────────────────────────────────────────┘
```

### 3.2 包结构

```
packages/
├── chat-kit/                          ← @opentiny/tiny-robot-chat
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatKit.vue            ← 黑盒入口（默认导出）
│   │   │   ├── ChatKitRoot.vue        ← 白盒根组件（provide 状态）
│   │   │   ├── ChatKitHeader.vue      ← 顶部栏（新建/历史按钮）
│   │   │   ├── ChatKitBody.vue        ← 消息区（Welcome/BubbleList 自动切换）
│   │   │   ├── ChatKitFooter.vue      ← 底部容器
│   │   │   ├── ChatKitSender.vue      ← 白盒 Sender（支持完整 TrSender props）
│   │   │   ├── ChatKitMessageList.vue ← 白盒 MessageList（支持完整 BubbleList props）
│   │   │   └── ChatKitHistory.vue     ← Drawer + TrHistory
│   │   ├── composables/
│   │   │   └── useChatKit.ts          ← 核心逻辑 composable（可独立使用）
│   │   ├── providers/
│   │   │   ├── openai.ts              ← createOpenAIProvider
│   │   │   └── deepseek.ts            ← createDeepSeekProvider
│   │   ├── styles/
│   │   │   ├── variables.css          ← --chat-kit-* CSS 变量
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
    │   ├── with-mcp/                  ← 规划（coming soon）
    │   └── with-rag/                  ← 规划（coming soon）
    └── package.json
```

---

## 四、`useChatKit` — 核心逻辑层

### 4.1 设计原则

- 对 `useConversation` 的**薄封装**，不重复实现已有逻辑
- 额外管理**套件级 UI 状态**（inputValue、showHistoryDrawer、currentTemplate）
- 提供**便捷方法**，封装"首次发送自动创建会话"等常见逻辑
- **可独立使用**：不依赖任何 UI 组件，用户可以完全自定义 UI

### 4.2 接口定义

```ts
// 输入选项
interface UseChatKitOptions {
  responseProvider: ResponseProvider       // 必须
  plugins?: UseMessagePlugin[]             // 工具调用等插件
  storage?: ConversationStorageStrategy    // 持久化策略，不传则不持久化
  initialMessages?: ChatMessage[]          // 初始消息
  roleConfigs?: Record<string, BubbleRoleConfig>  // 角色头像/位置配置
  welcome?: WelcomeConfig                  // 欢迎页配置
  prompts?: PromptProps[]                  // 引导词
}

// 返回值
interface UseChatKitReturn {
  // === 来自 useConversation（直接透传）===
  conversations: Ref<ConversationInfo[]>
  activeConversationId: Ref<string | null>
  activeConversation: ComputedRef<Conversation | null>
  createConversation: (params?) => Conversation
  switchConversation: (id: string) => Promise<Conversation | null>
  deleteConversation: (id: string) => Promise<void>
  updateConversationTitle: (id: string, title?: string) => void
  abortActiveRequest: () => Promise<void>

  // === 消息相关（从 activeConversation 派生）===
  messages: ComputedRef<ChatMessage[]>
  isProcessing: ComputedRef<boolean>

  // === UI 状态（套件层新增）===
  inputValue: Ref<string>
  showHistoryDrawer: Ref<boolean>
  currentTemplate: Ref<UserItem[]>
  // 动态管理传给 TrSender 的 extensions，用户可在运行时 push/replace
  // 典型场景：点击 pill 按钮后动态注入 Template 扩展
  senderExtensions: Ref<Extension[]>

  // === 便捷方法（套件层新增）===
  // 组合了：首次发送自动创建会话 + sendMessage + 清空输入
  handleSend: (content?: string) => void
  handleNewConversation: () => void
  handleAbort: () => void
  openHistory: () => void
  closeHistory: () => void
}
```

### 4.3 handleSend 内部逻辑

```
handleSend(content) {
  1. 取 content 或 inputValue.value
  2. 若 activeConversationId 为 null → createConversation({ title: content.slice(0,10) })
  3. activeConversation.engine.sendMessage(content)
  4. 清空 inputValue 和 currentTemplate
}
```

---

## 五、`ChatKit` 黑盒组件

### 5.1 Props 设计

```ts
interface ChatKitProps {
  // === 必须 ===
  responseProvider: ResponseProvider

  // === 会话逻辑 ===
  plugins?: UseMessagePlugin[]
  storage?: ConversationStorageStrategy
  initialMessages?: ChatMessage[]

  // === 角色/头像配置 ===
  roleConfigs?: Record<string, BubbleRoleConfig>

  // === 欢迎页 ===
  welcome?: {
    title: string
    description?: string
    icon?: VNode | Component
  }
  prompts?: PromptProps[]

  // === Sender 高频 props（平铺，优先级高于 senderProps）===
  placeholder?: string          // default: '请输入您的问题'
  maxLength?: number
  senderMode?: 'single' | 'multiple'

  // === Sender 高级功能（平铺语法糖，内部自动组装进 extensions）===
  // Mention：内部调用 TrSender.mention(mentions) 追加到 extensions
  mentions?: MentionItem[] | Ref<MentionItem[]>
  // Suggestion：内部调用 TrSender.suggestion(suggestions) 追加到 extensions
  suggestions?: SenderSuggestionItem[] | Ref<SenderSuggestionItem[]>
  // Template：不平铺。TemplateItem[] 结构复杂且通常动态变化（如点击 pill 按钮触发）
  // 通过 senderProps.extensions 传入，或通过 useChatKit 暴露的 senderExtensions ref 动态管理

  // === BubbleList 高频 props（平铺，优先级高于 bubbleListProps）===
  autoScroll?: boolean          // default: true
  groupStrategy?: BubbleListProps['groupStrategy']

  // === 功能开关 ===
  showHistory?: boolean         // default: true
  fullscreen?: boolean          // default: false

  // === 低频透传对象（平铺 props 优先级更高）===
  senderProps?: Partial<SenderProps>
  bubbleListProps?: Partial<BubbleListProps>
  historyProps?: Partial<HistoryProps>
}
```

**Props 优先级规则**：平铺 props > 透传对象 props。例如 `placeholder` 会覆盖 `senderProps.placeholder`。

### 5.2 Slots 设计

```
// 布局区域替换
#header                                      替换整个顶部栏
#header-extra                                顶部栏右侧追加操作
#welcome                                     替换整个欢迎页
#empty                                       无消息且无欢迎配置时的占位
#footer-extra                                输入框上方区域（pills、工具栏等）
#sender="{ send, abort, isProcessing }"      替换整个输入区
#message-list="{ messages, roleConfigs }"    替换整个消息列表

// BubbleList slots 动态透传（用户在 ChatKit 上写，自动穿透到内部 BubbleList）
#prefix="{ messages, role, messageIndexes }"
#suffix="{ messages, role, messageIndexes }"
#after="{ messages, role, messageIndexes }"
#content-footer="{ messages, role, contentIndex, messageIndexes }"
```

**动态透传实现**：

```vue
<!-- ChatKit.vue 内部 BubbleList 处 -->
<TrBubbleList :messages="messages" v-bind="mergedBubbleListProps">
  <template v-for="(_, name) in bubbleListSlots" #[name]="slotProps">
    <slot :name="name" v-bind="slotProps" />
  </template>
</TrBubbleList>
```

### 5.3 黑盒用法示例

```vue
<!-- 最简用法 -->
<ChatKit :response-provider="responseProvider" />

<!-- 完整配置 -->
<ChatKit
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
>
  <!-- 追加顶部操作 -->
  <template #header-extra>
    <MySettingsButton />
  </template>

  <!-- 输入框上方放 pills -->
  <template #footer-extra>
    <TrSuggestionPills>...</TrSuggestionPills>
  </template>

  <!-- Template 扩展：点击 pill 动态注入模板 -->
  <!-- 白盒模式下通过 useChatKit 的 senderExtensions 动态管理 -->
  <!-- 黑盒模式下通过 senderProps.extensions 传入静态模板，或用 #sender slot 完全接管 -->

  <!-- 每条消息底部加反馈框架（操作按钮 + 反馈动作 + 来源链接）-->
  <template #content-footer="{ messages }">
    <TrFeedback
      :operations="[
        { name: 'edit', label: '编辑' },
        { name: 'delete', label: '删除' }
      ]"
      :actions="[
        { name: 'copy', label: '复制', icon: 'copy' },
        { name: 'like', label: '有用', icon: 'like' },
        { name: 'dislike', label: '无用', icon: 'dislike' }
      ]"
      :sources="[
        { label: '参考文档1', link: 'https://...' },
        { label: '参考文档2', link: 'https://...' }
      ]"
      @operation="handleOperation"
      @action="handleAction"
    />
  </template>
</ChatKit>
```

---

## 六、白盒复合组件

### 6.1 设计原则

基于 shadcn/ui 的复合组件模式：
- `ChatKit.Root` 通过 `provide` 注入 `useChatKit()` 的完整返回值
- 所有子组件通过 `inject` 消费共享状态，无 prop drilling
- 子组件支持完整的底层组件 props（方案A），不做二次封装限制

### 6.2 组件树

```
ChatKit.Root          provide useChatKit 状态，接受所有 UseChatKitOptions
├── ChatKit.Header    顶部栏，props: showHistory?, showNewChat?
│                     slot: #extra（追加操作）
├── ChatKit.Body      消息区，props: welcome?, prompts?
│   └── ChatKit.MessageList  支持完整 TrBubbleList props + 所有 slots
├── ChatKit.Footer    底部容器
│   └── ChatKit.Sender       支持完整 TrSender props
└── ChatKit.History   Drawer + TrHistory，支持完整 TrHistory props
```

### 6.3 白盒用法示例

```vue
<ChatKit.Root :response-provider="fn" :storage="storage">

  <ChatKit.Header>
    <template #extra>
      <MyCustomButton />
    </template>
  </ChatKit.Header>

  <ChatKit.Body :welcome="welcome" :prompts="prompts">
    <ChatKit.MessageList
      :role-configs="roles"
      :group-strategy="'divider'"
      auto-scroll
    >
      <!-- 完整支持 BubbleList 的所有 slots -->
      <template #content-footer="{ messages }">
        <TrFeedback
          :operations="[{ name: 'edit', label: '编辑' }]"
          :actions="[
            { name: 'copy', label: '复制', icon: 'copy' },
            { name: 'like', label: '有用', icon: 'like' }
          ]"
          @operation="handleOperation"
          @action="handleAction"
        />
      </template>
    </ChatKit.MessageList>
  </ChatKit.Body>

  <ChatKit.Footer>
    <!-- 输入框上方自定义区域 -->
    <template #extra>
      <MySuggestionPills />
    </template>
    <!-- 完整支持 TrSender 的所有 props -->
    <ChatKit.Sender
      :max-length="2000"
      :show-word-limit="true"
      sender-mode="autosize"
    />
  </ChatKit.Footer>

  <ChatKit.History />

</ChatKit.Root>
```

### 6.4 纯逻辑用法（完全自定义 UI）

```vue
<script setup>
import { useChatKit } from '@opentiny/tiny-robot-chat'

const {
  messages, isProcessing, inputValue,
  handleSend, handleAbort,
  conversations, switchConversation,
  showHistoryDrawer, openHistory
} = useChatKit({ responseProvider })
</script>

<template>
  <!-- 完全自定义 UI，只用逻辑层 -->
  <MyCustomChatLayout
    :messages="messages"
    :is-processing="isProcessing"
    v-model:input="inputValue"
    @send="handleSend"
    @abort="handleAbort"
  />
</template>
```

### 6.5 导出方式

```ts
// ChatKit 同时作为黑盒组件和白盒子组件的挂载点
import { ChatKit } from '@opentiny/tiny-robot-chat'

// 黑盒
<ChatKit :response-provider="fn" />

// 白盒（子组件挂载在 ChatKit 上）
<ChatKit.Root>
  <ChatKit.Header />
  <ChatKit.Body>
    <ChatKit.MessageList />
  </ChatKit.Body>
  <ChatKit.Footer>
    <ChatKit.Sender />
  </ChatKit.Footer>
  <ChatKit.History />
</ChatKit.Root>
```

---

## 七、样式方案

### 7.1 分层原则

```
套件层（--chat-kit-*）   负责布局结构：尺寸、间距、Drawer 宽度等
    ↓ 引用
组件层（--tr-*）         负责组件本身：颜色、字体、边框等（已有，不改动）
```

用户定制时只需覆盖套件变量，无需了解内部组件变量：

```css
.my-chat {
  --chat-kit-height: 100vh;
  --chat-kit-drawer-width: 320px;
  --chat-kit-border-radius: 0;
}
```

### 7.2 CSS 变量清单（`variables.css`）

```css
:root {
  /* 整体布局 */
  --chat-kit-width: 100%;
  --chat-kit-height: 100%;          /* 默认 100%，由父容器控制高度 */
  --chat-kit-border-radius: 16px;

  /* Header */
  --chat-kit-header-height: 48px;
  --chat-kit-header-padding: 0 12px;
  --chat-kit-header-bg: var(--tr-container-bg-default);
  --chat-kit-header-border-bottom: 1px solid var(--tr-color-border);

  /* Body */
  --chat-kit-body-padding: 0;
  --chat-kit-body-bg: var(--tr-container-bg-default);

  /* Footer */
  --chat-kit-footer-padding: 8px 12px;
  --chat-kit-footer-bg: var(--tr-container-bg-default);
  --chat-kit-footer-border-top: 1px solid var(--tr-color-border);

  /* History Drawer */
  --chat-kit-drawer-width: 280px;
  --chat-kit-drawer-bg: var(--tr-container-bg-default);
  --chat-kit-drawer-shadow: 4px 0 20px rgba(0, 0, 0, 0.08);
  --chat-kit-drawer-z-index: 100;
  --chat-kit-drawer-transition: 0.25s ease;
  --chat-kit-drawer-overlay-bg: rgba(0, 0, 0, 0.3);
}
```

### 7.3 Drawer 实现（自实现，零依赖）

使用 `position: absolute`（相对 ChatKit 容器定位，不影响页面其他内容）：

```css
/* ChatKit 根元素 */
.chat-kit {
  position: relative;
  overflow: hidden;
  width: var(--chat-kit-width);
  height: var(--chat-kit-height);
}

/* 遮罩层 */
.chat-kit-drawer-overlay {
  position: absolute;
  inset: 0;
  background: var(--chat-kit-drawer-overlay-bg);
  opacity: 0;
  transition: opacity var(--chat-kit-drawer-transition);
  pointer-events: none;
  z-index: calc(var(--chat-kit-drawer-z-index) - 1);
}
.chat-kit-drawer-overlay.is-open {
  opacity: 1;
  pointer-events: auto;
}

/* Drawer 面板 */
.chat-kit-drawer {
  position: absolute;
  top: 0; left: 0;
  height: 100%;
  width: var(--chat-kit-drawer-width);
  background: var(--chat-kit-drawer-bg);
  box-shadow: var(--chat-kit-drawer-shadow);
  transform: translateX(-100%);
  transition: transform var(--chat-kit-drawer-transition);
  z-index: var(--chat-kit-drawer-z-index);
  display: flex;
  flex-direction: column;
}
.chat-kit-drawer.is-open {
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

    return provider.chatStream({ messages, options: { stream: true, signal: abortSignal } }, ...)
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

### 9.2 交互流程

```
$ npm create tiny-robot-app my-app

✔ Project name: › my-app
✔ Select a template: ›
  ● Basic Chat Agent
  ○ Chat Agent + MCP Tools    (coming soon)
  ○ Chat Agent + RAG          (coming soon)
✔ Select language: › TypeScript
✔ Select API provider: ›
  ● OpenAI
  ○ DeepSeek
  ○ Custom (configure manually)
✔ Install dependencies now? › Yes / No

Scaffolding project in ./my-app...

Done! Next steps:
  cd my-app
  cp .env.example .env    # 填入你的 API Key
  npm run dev
```

**coming soon 模板的处理**：选中后立即提示并要求重新选择：

```
✖ 该模板尚未发布，请选择其他模板
```

### 9.3 CLI 实现技术栈

参照 create-vue，极简依赖：

```json
{
  "dependencies": {
    "prompts": "^2.4.2",
    "kolorist": "^1.8.0"
  }
}
```

- `prompts`：交互式命令行问答
- `kolorist`：终端颜色输出
- 模板文件：直接复制，不用模板引擎
- 特殊文件名：`_gitignore` → `.gitignore`，`_env.example` → `.env.example`

### 9.4 模板工程结构（basic）

```
my-app/
├── src/
│   ├── App.vue          ← 核心：~30 行，直接用 <ChatKit>
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
  <ChatKit
    :response-provider="responseProvider"
    :welcome="welcome"
    :prompts="prompts"
    show-history
    style="height: 100vh"
  />
</template>

<script setup lang="ts">
import { ChatKit, createOpenAIProvider } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/style'

const responseProvider = createOpenAIProvider({
  apiKey: import.meta.env.VITE_API_KEY,
  model: import.meta.env.VITE_MODEL || 'gpt-4o-mini',
  baseURL: import.meta.env.VITE_BASE_URL,
})

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

### 9.5 未来模板规划

| 模板 | 核心特性 | 状态 |
|------|---------|------|
| `basic` | 纯对话，OpenAI/DeepSeek | ✅ 本期实现 |
| `with-mcp` | toolPlugin + MCP 工具调用 | 📋 规划 |
| `with-rag` | 自定义 responseProvider + 本地知识库检索（mock 向量搜索） | 📋 规划 |
| `with-context-management` | 多轮对话上下文优化、token 成本控制、会话摘要 | 📋 规划 |
| `with-skills` | 模块化能力包、自动发现、延迟加载、skills 市场 | 📋 规划 |

### with-rag 说明

RAG（Retrieval-Augmented Generation，检索增强生成）的核心思路：在把用户问题发给 LLM 之前，先去知识库检索相关文档片段，将检索结果注入 prompt，让 LLM 基于真实文档回答，而非凭空生成。

`with-rag` 模板的重点**不是 ChatKit 的配置**，而是演示如何写一个带检索步骤的 `responseProvider`。ChatKit 本身无需任何改动，体现了 `responseProvider` 抽象的核心价值。

```
templates/with-rag/
├── src/
│   ├── App.vue                  ← 和 basic 完全一样，直接用 <ChatKit>
│   ├── providers/
│   │   └── rag.ts               ← 核心：带检索步骤的 responseProvider
│   ├── knowledge/
│   │   └── docs.ts              ← mock 知识库（本地 JSON 数组）
│   └── utils/
│       └── retrieval.ts         ← 简单关键词匹配（mock 向量搜索）
└── README.md                    ← 说明如何替换为真实向量数据库（Pinecone/Chroma 等）
```

`rag.ts` 核心逻辑：

```ts
export const responseProvider = async (requestBody, abortSignal) => {
  const userQuery = requestBody.messages.at(-1)?.content as string

  // Step 1: 检索相关文档（mock，README 说明如何替换）
  const relevantDocs = await retrieveDocuments(userQuery)

  // Step 2: 构建增强 prompt
  const systemPrompt = relevantDocs.length > 0
    ? `请基于以下参考文档回答，若文档中无相关信息请如实说明：\n\n${relevantDocs.map(d => d.content).join('\n\n')}`
    : '你是一个助手，请尽力回答用户的问题。'

  // Step 3: 发给 LLM（复用 createOpenAIProvider 底层逻辑）
  return openaiProvider({
    ...requestBody,
    messages: [{ role: 'system', content: systemPrompt }, ...requestBody.messages]
  }, abortSignal)
}
```

**with-rag 模板中的 Feedback 用法**：

在 `#content-footer` slot 中使用 `TrFeedback` 展示检索到的参考文档来源：

```vue
<template #content-footer="{ messages }">
  <TrFeedback
    :operations="[
      { name: 'regenerate', label: '重新生成' },
      { name: 'edit', label: '编辑' }
    ]"
    :actions="[
      { name: 'copy', label: '复制', icon: 'copy' },
      { name: 'like', label: '有用', icon: 'like' },
      { name: 'dislike', label: '无用', icon: 'dislike' }
    ]"
    :sources="extractSourcesFromMessage(messages[0])"
    @operation="handleOperation"
    @action="handleAction"
  />
</template>

<script setup>
// 从消息的 metadata 中提取参考文档来源
const extractSourcesFromMessage = (message) => {
  return message.metadata?.sources?.map(doc => ({
    label: doc.title,
    link: doc.url
  })) || []
}
</script>
```

这样用户可以直观看到 AI 回答基于哪些文档，增强了可信度。

### with-context-management 说明

多轮对话中的上下文管理是 AI 助手的核心能力。`with-context-management` 模板演示如何在长对话中维持上下文连贯性，同时优化 token 成本。

**核心特性**：
- 会话历史管理（自动截断超长历史）
- 上下文窗口优化（token 成本控制）
- 会话持久化（跨浏览器/设备恢复）
- 上下文摘要（重要信息提取）

```
templates/with-context-management/
├── src/
│   ├── App.vue                  ← 展示上下文管理的 UI
│   ├── providers/
│   │   └── contextAware.ts      ← 核心：带上下文优化的 responseProvider
│   ├── lib/
│   │   ├── contextManager.ts    ← 上下文管理逻辑
│   │   ├── tokenCounter.ts      ← token 计数工具
│   │   └── summarizer.ts        ← 上下文摘要生成
│   └── utils/
│       └── storage.ts           ← 会话持久化
└── README.md                    ← 说明上下文优化策略
```

**contextAware.ts 核心逻辑**：

```ts
export const responseProvider = async (requestBody, abortSignal) => {
  const contextManager = new ContextManager({
    maxTokens: 4000,              // 上下文窗口大小
    summaryThreshold: 3000,       // 触发摘要的 token 阈值
  })

  // Step 1: 计算当前消息历史的 token 数
  const currentTokens = countTokens(requestBody.messages)

  // Step 2: 如果超过阈值，执行上下文优化
  let optimizedMessages = requestBody.messages
  if (currentTokens > contextManager.summaryThreshold) {
    // 保留最近 N 条消息，对早期消息进行摘要
    const { recentMessages, summary } = await contextManager.optimize(
      requestBody.messages
    )
    
    optimizedMessages = [
      { role: 'system', content: `之前的对话摘要：${summary}` },
      ...recentMessages
    ]
  }

  // Step 3: 发给 LLM
  return openaiProvider({
    ...requestBody,
    messages: optimizedMessages
  }, abortSignal)
}
```

**UI 展示**：

```vue
<template>
  <ChatKit
    :response-provider="contextAwareProvider"
    show-history
    style="height: 100vh"
  >
    <!-- 展示上下文统计信息 -->
    <template #header-extra>
      <div class="context-stats">
        <span>📊 Tokens: {{ currentTokens }} / {{ maxTokens }}</span>
        <span v-if="contextOptimized" class="optimized-badge">✨ 已优化</span>
      </div>
    </template>

    <!-- 显示上下文摘要 -->
    <template #footer-extra>
      <div v-if="contextSummary" class="context-summary">
        <details>
          <summary>📝 对话摘要</summary>
          <p>{{ contextSummary }}</p>
        </details>
      </div>
    </template>
  </ChatKit>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ChatKit, createOpenAIProvider } from '@opentiny/tiny-robot-chat'
import { createContextAwareProvider } from '@/providers/contextAware'

const currentTokens = ref(0)
const maxTokens = ref(4000)
const contextOptimized = ref(false)
const contextSummary = ref('')

const baseProvider = createOpenAIProvider({
  apiKey: import.meta.env.VITE_API_KEY,
})

const contextAwareProvider = createContextAwareProvider({
  baseProvider,
  maxTokens: maxTokens.value,
  onOptimize: (stats) => {
    currentTokens.value = stats.optimizedTokens
    contextOptimized.value = true
    contextSummary.value = stats.summary
  }
})
</script>

<style scoped>
.context-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--tr-color-text-secondary);
}

.optimized-badge {
  color: var(--tr-color-success);
  font-weight: bold;
}

.context-summary {
  padding: 8px 12px;
  background: var(--tr-container-bg-secondary);
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 12px;
}

.context-summary summary {
  cursor: pointer;
  font-weight: 500;
}

.context-summary p {
  margin-top: 8px;
  line-height: 1.5;
  color: var(--tr-color-text-secondary);
}
</style>
```

### with-skills 说明

详见 `docs/skills-kit-design.md`。

简要说明：
- **UI 组件**：`TrSkills` 组件在 `@opentiny/tiny-robot` 中
- **管理器**：`SkillsManager` 支持本地/远程加载、缓存、发现
- **加载器**：可扩展的加载器系统（LocalSkillsLoader、RemoteSkillsLoader 等）
- **模板**：`with-skills` 模板展示完整实现

---

## 十、完整导出 API

```ts
// @opentiny/tiny-robot-chat

// ===== 组件 =====
export { ChatKit }
// ChatKit 同时挂载白盒子组件：
// ChatKit.Root / ChatKit.Header / ChatKit.Body
// ChatKit.MessageList / ChatKit.Footer / ChatKit.Sender / ChatKit.History

// ===== Composable =====
export { useChatKit }

// ===== Providers =====
export { createOpenAIProvider }
export { createDeepSeekProvider }

// ===== 类型 =====
export type { ChatKitProps }
export type { UseChatKitOptions, UseChatKitReturn }
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
| 模板数量（本期） | 1 个（basic），其余规划 |
| 模板工程类型 | 纯 SPA（Vite + Vue 3） |
| useChatKit 独立暴露 | 是，可不用任何组件纯逻辑使用 |
| createOpenAIProvider 位置 | `tiny-robot-chat` 包，面向快速上手 |
| 历史会话面板形态 | Drawer，从左侧滑出 |
| Drawer 实现方式 | 套件自实现，position: absolute + transition，零依赖 |
| 样式方案 | 套件层 `--chat-kit-*` 变量管布局，组件层 `--tr-*` 变量管样式 |
| ChatKit.Body 切换逻辑 | 自动处理（messages.length === 0 显示 Welcome） |
| ChatKit.Root 默认高度 | `height: 100%`，由父容器控制 |
| Props 优先级 | 平铺 props > 透传对象 props（senderProps 等） |
| coming soon 模板 | 选中后提示"该模板尚未发布，请选择其他模板" |
| 白盒子组件 props | 方案A：支持完整底层组件 props，不做二次封装限制 |
| 模板规划 | basic（本期）+ with-context-management + with-skills（后续） |
| 上下文管理 | 支持 token 计数、历史截断、摘要生成 |
| Skills 标准 | 支持本地/远程加载、缓存、可扩展加载器 |
| Skills 发现 | 基于关键词匹配，支持自定义发现策略 |
| Skills 加载 | 智能缓存，支持本地和远程加载 |

---

## 十二、实施顺序

```
Step 1: packages/chat-kit/
  1.1 package.json + tsconfig + vite.config
  1.2 types.ts + context.ts
  1.3 composables/useChatKit.ts
  1.4 providers/openai.ts + deepseek.ts
  1.5 styles/ (variables + layout + drawer)
  1.6 components/ChatKitRoot.vue（provide 状态）
  1.7 components/ChatKitHeader.vue
  1.8 components/ChatKitBody.vue（含 Welcome/BubbleList 切换）
  1.9 components/ChatKitMessageList.vue
  1.10 components/ChatKitFooter.vue
  1.11 components/ChatKitSender.vue
  1.12 components/ChatKitHistory.vue（Drawer + TrHistory）
  1.13 components/ChatKit.vue（黑盒，组合以上子组件）
  1.14 index.ts（导出入口，挂载复合组件）

Step 2: packages/create-tiny-robot-app/
  2.1 package.json
  2.2 templates/basic/（完整模板工程）
  2.3 templates/with-context-management/（上下文管理模板）
  2.4 templates/with-skills/（skills 模板）
  2.5 bin/index.js（CLI 交互逻辑）

Step 3: 工程配置
  3.1 pnpm-workspace.yaml 注册新包
  3.2 根 package.json 补充 build:chat-kit 等脚本

Step 4: 文档
  4.1 docs/ 补充套件使用示例页
```

---

## 十三、风险与注意事项

1. **BubbleList slots 动态透传**：Vue 3 的动态 slot 名需要用 `v-for` + `#[name]` 实现，需要验证所有 slot 名能正确透传，特别是带连字符的 slot 名（`content-footer`）。

2. **ChatKit.Sender 与 TrSender 的 v-model 绑定**：`inputValue` 由 `useChatKit` 管理，`ChatKit.Sender` 内部需要正确双向绑定，避免状态不同步。

3. **白盒模式下 ChatKit.Body 的 Welcome 切换**：白盒模式下用户可能不使用 `ChatKit.Body`，此时 Welcome/BubbleList 切换逻辑需要用户自己处理，文档需要说明。

4. **createOpenAIProvider 的浏览器端安全**：直接在浏览器端使用 API Key 存在安全风险，模板工程的 README 需要明确说明生产环境应通过后端代理转发请求。

5. **CLI 的 `_gitignore` 重命名**：npm publish 时会自动忽略 `.gitignore` 文件，需要用 `_gitignore` 命名后在 CLI 中重命名，参照 create-vue 的处理方式。

---

## 十四、with-context-management 模板设计

### 14.1 核心能力

多轮对话中的上下文管理是 AI 助手的基础。该模板演示如何在长对话中维持上下文连贯性，同时优化 token 成本。

**关键特性**：
- **会话历史管理**：自动截断超长历史，保留最近 N 条消息
- **Token 成本控制**：实时计数，超过阈值时触发摘要
- **上下文摘要**：自动提取重要信息，压缩历史
- **会话持久化**：跨浏览器/设备恢复对话

### 14.2 实现原理

```
用户消息 → Token 计数 → 超过阈值？
                ↓ 是
            生成摘要 → 保留最近消息 + 摘要 → 发送给 LLM
                ↓ 否
            直接发送给 LLM
```

**Token 计数**：使用 `js-tiktoken` 库估算 token 数（与实际 API 计数略有差异，但足够用于阈值判断）

**摘要生成**：调用 LLM 生成摘要，或使用简单的关键词提取算法

### 14.3 ContextManager 接口

```ts
interface ContextManager {
  // 配置
  maxTokens: number              // 上下文窗口大小（默认 4000）
  summaryThreshold: number       // 触发摘要的 token 阈值（默认 3000）
  
  // 方法
  countTokens(messages: ChatMessage[]): number
  optimize(messages: ChatMessage[]): Promise<{
    recentMessages: ChatMessage[]
    summary: string
    optimizedTokens: number
  }>
  
  // 事件回调
  onOptimize?: (stats: OptimizeStats) => void
}
```

### 14.4 UI 展示

在 ChatKit 的 `#header-extra` 和 `#footer-extra` 中展示：
- Token 使用情况（进度条）
- 是否已优化（标记）
- 对话摘要（可折叠）

---

## 十五、with-skills 模板设计

### 15.1 核心能力

Skills 是模块化的能力包，允许 AI 助手动态加载和使用特定领域的指令。

**关键特性**：
- **模块化能力**：可复用的指令包
- **自动发现**：基于关键词匹配自动发现相关 skills
- **本地/远程支持**：支持本地 skills 和远程 API 加载
- **智能缓存**：缓存已加载的 skills，优化性能
- **可扩展架构**：支持自定义加载器、发现策略、缓存策略

### 15.2 Skills 数据结构

```ts
interface Skill {
  id: string
  name: string
  description: string
  tags: string[]
  content?: string              // 完整指令内容
  source?: 'local' | 'remote' | string
  sourceUrl?: string
  version?: string
  author?: string
  dependencies?: string[]
  metadata?: Record<string, any>
}
```

### 15.3 SkillsManager 接口

```ts
interface SkillsManager {
  // 加载器管理
  registerLoader(loader: SkillsLoaderStrategy): void
  
  // Skills 查询
  getAllSkills(): Skill[]
  getSkill(skillId: string): Skill | undefined
  getSkillsByTag(tag: string): Skill[]
  getSkillsBySource(source: string): Skill[]
  
  // Skills 发现
  discoverSkills(query: string): Promise<Skill[]>
  
  // 内容加载
  loadSkillContent(skillId: string): Promise<string>
  
  // Skills 管理
  addSkill(skill: Skill): void
  updateSkill(skillId: string, updates: Partial<Skill>): void
  removeSkill(skillId: string): void
}
```

### 15.4 可扩展的加载器系统

支持多种加载器：
- `LocalSkillsLoader`：本地 skills
- `RemoteSkillsLoader`：远程 HTTP API
- `IndexedDBSkillsLoader`：浏览器 IndexedDB
- 自定义加载器：用户可实现 `SkillsLoaderStrategy` 接口

### 15.5 Skills 发现机制

基于关键词匹配计算相关性分数：

```
相关性分数 = 
  (名称匹配 × 0.5) + 
  (描述匹配 × 0.3) + 
  (标签匹配 × 0.2)
```

只有分数 > 0.3 的 skills 才会被注入系统提示

### 15.6 UI 展示

使用 `TrSkills` 组件在 ChatKit 的 `#footer-extra` 中展示：
- 可用 skills 列表
- 搜索和过滤功能
- 多选支持
- 自定义 UI slots

### 15.7 与其他模板的组合

- **with-skills-and-mcp**：Skills 提供指令，MCP 提供工具执行
- **with-skills-and-rag**：Skills 提供领域知识，RAG 提供文档检索
- **with-skills-and-context**：Skills 在长对话中保持可用

详见 `docs/skills-kit-design.md`

---

## 十六、模板优先级与时间规划

### 16.1 优先级排序

| 优先级 | 模板 | 理由 | 预计工作量 |
|--------|------|------|----------|
| 🔴 高 | `basic` | 基础模板，其他模板的参考 | 2-3 天 |
| 🔴 高 | `with-context-management` | 几乎所有应用都需要 | 3-4 天 |
| 🔴 高 | `with-skills` | 创新能力，展示 ChatKit 的扩展性 | 4-5 天 |
| 🟡 中 | `with-mcp` | 工具调用，企业应用常见 | 3-4 天 |
| 🟡 中 | `with-rag` | 知识检索，专业应用常见 | 3-4 天 |

### 16.2 建议的分阶段实现

**Phase 1（本期）**：
- ✅ `basic` 模板
- ✅ CLI 工具基础框架

**Phase 2（后续）**：
- 🔄 `with-context-management` 模板
- 🔄 `with-skills` 模板
- 🔄 CLI 支持模板选择

**Phase 3（未来）**：
- 🔄 `with-mcp` 模板
- 🔄 `with-rag` 模板
- 🔄 Skills 市场集成

---

## 十七、组合模板的必要性分析

### 17.1 组合模板的价值

根据设计中的组合效果，存在三个高价值的组合场景：

```
MCP + Skills = 工具 + 指令（完整的 Agent 能力）
RAG + Skills = 知识 + 指令（专业领域助手）
Context + Skills = 记忆 + 能力（长期学习助手）
```

这些组合不仅仅是功能叠加，而是产生了新的应用价值。

### 17.2 组合模板 vs 独立模板的对比

| 维度 | 独立模板 | 组合模板 |
|------|---------|---------|
| **学习成本** | 低（单一概念） | 中（需理解两个概念的交互） |
| **代码复用** | 高（可独立使用） | 中（需要集成逻辑） |
| **应用场景** | 通用 | 特定（但高价值） |
| **维护成本** | 低 | 中（需要同步更新） |
| **用户获益** | 基础 | 高（开箱即用的完整方案） |

### 17.3 推荐的组合模板

#### 17.3.1 `with-skills-and-mcp`（优先级：高）

**应用场景**：完整的 AI Agent，既有知识又有行动能力

**核心特性**：
- Skills 提供领域知识和指令
- MCP 工具提供实际执行能力
- 自动意图识别和工具调用

**项目结构**：
```
templates/with-skills-and-mcp/
├── src/
│   ├── App.vue
│   ├── skills/                    ← 本地 skills 库
│   │   ├── task-planning/
│   │   ├── data-analysis/
│   │   └── code-generation/
│   ├── mcp/                       ← MCP 工具配置
│   │   ├── tools.ts
│   │   └── handlers.ts
│   ├── lib/
│   │   ├── skillsRegistry.ts
│   │   ├── mcpIntegration.ts      ← 关键：Skills + MCP 集成
│   │   └── agentProvider.ts       ← 增强的 responseProvider
│   └── env.d.ts
├── .env.example
├── package.json
└── README.md
```

**核心逻辑**（agentProvider.ts）：
```ts
export function createAgentProvider(options: {
  baseProvider: ResponseProvider
  skillsManager: SkillsManager
  mcpTools: MCPTool[]
}) {
  return async (requestBody, abortSignal) => {
    const userQuery = requestBody.messages.at(-1)?.content as string
    
    // Step 1: 发现相关 skills
    const relevantSkills = await options.skillsRegistry.discover(userQuery)
    
    // Step 2: 发现相关 MCP 工具
    const relevantTools = options.mcpTools.filter(tool => 
      tool.tags.some(tag => userQuery.includes(tag))
    )
    
    // Step 3: 构建增强的系统提示
    const systemPrompt = `
你是一个 AI Agent，拥有以下能力：

【Skills（知识和指令）】
${relevantSkills.map(s => `- ${s.name}: ${s.description}`).join('\n')}

【Tools（可执行的工具）】
${relevantTools.map(t => `- ${t.name}: ${t.description}`).join('\n')}

当用户的请求与某个能力相关时，你可以：
1. 使用相关 Skill 中的指令来理解和规划
2. 调用相关 Tool 来执行具体操作
3. 组合多个 Skill 和 Tool 来完成复杂任务
    `
    
    // Step 4: 发送给 LLM（LLM 会自动选择调用哪些工具）
    return options.baseProvider({
      ...requestBody,
      messages: [
        { role: 'system', content: systemPrompt },
        ...requestBody.messages
      ]
    }, abortSignal)
  }
}
```

**使用示例**：
```vue
<script setup>
import { ChatKit, createOpenAIProvider } from '@opentiny/tiny-robot-chat'
import { SkillsRegistry } from '@/lib/skillsRegistry'
import { createAgentProvider } from '@/lib/agentProvider'

const skillsRegistry = new SkillsRegistry()
const mcpTools = [
  { name: 'execute_code', description: '执行代码', tags: ['code', 'python'] },
  { name: 'query_database', description: '查询数据库', tags: ['data', 'sql'] },
  { name: 'send_email', description: '发送邮件', tags: ['email', 'notification'] },
]

const agentProvider = createAgentProvider({
  baseProvider: createOpenAIProvider({ apiKey: import.meta.env.VITE_API_KEY }),
  skillsRegistry,
  mcpTools,
})
</script>

<template>
  <ChatKit :response-provider="agentProvider" show-history style="height: 100vh" />
</template>
```

#### 17.3.2 `with-skills-and-rag`（优先级：高）

**应用场景**：专业领域助手，既有领域知识库又有专业指令

**核心特性**：
- Skills 提供领域专业指令
- RAG 提供实时文档检索
- 自动匹配相关 skills 和文档

**项目结构**：
```
templates/with-skills-and-rag/
├── src/
│   ├── App.vue
│   ├── skills/                    ← 领域 skills
│   │   ├── medical-diagnosis/
│   │   ├── legal-analysis/
│   │   └── technical-support/
│   ├── knowledge/                 ← 知识库
│   │   ├── docs.ts
│   │   └── embeddings.ts
│   ├── lib/
│   │   ├── skillsRegistry.ts
│   │   ├── ragRetrieval.ts
│   │   └── expertProvider.ts      ← 关键：Skills + RAG 集成
│   └── env.d.ts
├── .env.example
├── package.json
└── README.md
```

**核心逻辑**（expertProvider.ts）：
```ts
export function createExpertProvider(options: {
  baseProvider: ResponseProvider
  skillsRegistry: SkillsRegistry
  retrievalFn: (query: string) => Promise<Document[]>
}) {
  return async (requestBody, abortSignal) => {
    const userQuery = requestBody.messages.at(-1)?.content as string
    
    // Step 1: 并行执行 skills 发现和文档检索
    const [relevantSkills, relevantDocs] = await Promise.all([
      options.skillsRegistry.discover(userQuery),
      options.retrievalFn(userQuery),
    ])
    
    // Step 2: 构建增强的系统提示
    const skillsContext = relevantSkills
      .map(s => `【${s.name}】\n${s.description}`)
      .join('\n\n')
    
    const docsContext = relevantDocs
      .map(d => `【${d.title}】\n${d.content}`)
      .join('\n\n')
    
    const systemPrompt = `
你是一个专业领域助手。

【专业指令】
${skillsContext}

【参考文档】
${docsContext}

请基于上述指令和文档来回答用户的问题。
    `
    
    // Step 3: 发送给 LLM
    return options.baseProvider({
      ...requestBody,
      messages: [
        { role: 'system', content: systemPrompt },
        ...requestBody.messages
      ]
    }, abortSignal)
  }
}
```

**应用示例**：医疗诊断助手、法律咨询助手、技术支持助手

#### 17.3.3 `with-skills-and-context`（优先级：中）

**应用场景**：长期学习助手，在长对话中保持 skills 可用性

**核心特性**：
- Skills 在长对话中动态加载
- 上下文优化时保留 skills 元数据
- 支持跨会话 skills 学习

**项目结构**：
```
templates/with-skills-and-context/
├── src/
│   ├── App.vue
│   ├── skills/
│   ├── lib/
│   │   ├── skillsRegistry.ts
│   │   ├── contextManager.ts
│   │   └── learningProvider.ts    ← 关键：Skills + Context 集成
│   └── env.d.ts
├── .env.example
├── package.json
└── README.md
```

**核心逻辑**（learningProvider.ts）：
```ts
export function createLearningProvider(options: {
  baseProvider: ResponseProvider
  skillsRegistry: SkillsRegistry
  contextManager: ContextManager
}) {
  return async (requestBody, abortSignal) => {
    const userQuery = requestBody.messages.at(-1)?.content as string
    
    // Step 1: 发现相关 skills
    const relevantSkills = await options.skillsRegistry.discover(userQuery)
    
    // Step 2: 优化上下文（保留 skills 元数据）
    const { optimizedMessages, summary } = await options.contextManager.optimize(
      requestBody.messages,
      {
        preserveSkillsMetadata: true,  // 关键：保留 skills 信息
        skillsMetadata: relevantSkills.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
        })),
      }
    )
    
    // Step 3: 构建系统提示
    const skillsMetadata = relevantSkills
      .map(s => `- ${s.name}: ${s.description}`)
      .join('\n')
    
    const systemPrompt = `
你是一个学习型 AI 助手。

【可用能力】
${skillsMetadata}

【对话摘要】
${summary}

在这个长对话中，你已经学到了一些信息。请利用这些信息和可用能力来回答用户的问题。
    `
    
    // Step 4: 发送给 LLM
    return options.baseProvider({
      ...requestBody,
      messages: [
        { role: 'system', content: systemPrompt },
        ...optimizedMessages
      ]
    }, abortSignal)
  }
}
```

### 17.4 组合模板的实现策略

#### 方案 A：独立模板（推荐）

**优点**：
- 代码清晰，易于理解和维护
- 用户可以选择需要的组合
- 降低单个模板的复杂度

**缺点**：
- 需要维护多个模板
- 代码重复度高

**实现方式**：
```
templates/
├── basic/
├── with-context-management/
├── with-skills/
├── with-mcp/
├── with-rag/
├── with-skills-and-mcp/        ← 新增
├── with-skills-and-rag/        ← 新增
└── with-skills-and-context/    ← 新增
```

#### 方案 B：共享库 + 组合（未来优化）

**优点**：
- 减少代码重复
- 易于维护和更新
- 支持更灵活的组合

**缺点**：
- 初期投入大
- 学习曲线陡

**实现方式**：
```
packages/
├── chat-kit/
├── create-tiny-robot-app/
└── chat-kit-integrations/       ← 新增：集成库
    ├── src/
    │   ├── skills/
    │   │   ├── registry.ts
    │   │   └── provider.ts
    │   ├── mcp/
    │   │   ├── integration.ts
    │   │   └── provider.ts
    │   ├── rag/
    │   │   ├── retrieval.ts
    │   │   └── provider.ts
    │   ├── context/
    │   │   ├── manager.ts
    │   │   └── provider.ts
    │   └── combinations/         ← 组合方案
    │       ├── skillsAndMcp.ts
    │       ├── skillsAndRag.ts
    │       └── skillsAndContext.ts
    └── package.json
```

### 17.5 建议的实现路线

**Phase 2（后续）**：
- ✅ 实现基础模板（basic、with-context-management、with-skills）
- ✅ 验证各模板的独立可用性

**Phase 3（未来）**：
- 🔄 实现 `with-skills-and-mcp` 组合模板（优先级最高）
- 🔄 实现 `with-skills-and-rag` 组合模板
- 🔄 实现 `with-skills-and-context` 组合模板

**Phase 4（长期）**：
- 🔄 提取共享集成库（chat-kit-integrations）
- 🔄 支持用户自定义组合
- 🔄 建立 skills 市场

### 17.6 组合模板的优先级排序

| 优先级 | 组合 | 应用场景 | 工作量 |
|--------|------|---------|--------|
| 🔴 高 | `with-skills-and-mcp` | 完整 Agent | 2-3 天 |
| 🔴 高 | `with-skills-and-rag` | 专业领域助手 | 2-3 天 |
| 🟡 中 | `with-skills-and-context` | 长期学习助手 | 1-2 天 |
| 🟢 低 | `with-mcp-and-rag` | 工具 + 知识 | 2-3 天 |

### 17.7 总结：是否需要组合模板？

**答案：是的，但分阶段实现**

**理由**：
1. ✅ **高价值**：组合模板解决真实应用场景，而不仅仅是功能演示
2. ✅ **用户友好**：开箱即用的完整方案，降低集成成本
3. ✅ **可维护**：独立模板易于理解和维护
4. ✅ **可扩展**：为未来的共享库做准备

**建议**：
- **本期**：完成基础模板（basic、with-context-management、with-skills）
- **下期**：优先实现 `with-skills-and-mcp` 和 `with-skills-and-rag`
- **后期**：根据用户反馈决定是否提取共享库
