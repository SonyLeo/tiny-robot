---
outline: deep
---

# Chat 聊天套件

Chat 套件（`@opentiny/tiny-robot-chat`）是基于 `@opentiny/tiny-robot`（UI 组件层）与 `@opentiny/tiny-robot-kit`（逻辑层）之上建立的 **高层对话 UI 解决方案**。

它面向的核心场景是：**用最少的代码获得一个完整的、可定制的 AI 对话界面**。

## 设计理念

Chat 套件采用 **复合组件（Compound Components）** 设计模式，同时提供两种用法：

| 模式 | 适用场景 | 特点 |
|------|---------|------|
| **黑盒模式** | 快速集成，配置驱动 | 一个 `<TrChat>` 标签搞定，内部自动管理状态 |
| **白盒模式** | 深度定制，自由组合 | 使用 `TrChat.Root` + 子组件自行编排 UI 结构 |

> **何时不需要本套件？** 如果你只需要基础 UI 组件（Bubble、Sender 等），直接使用 `@opentiny/tiny-robot` 即可；如果你只需要对话逻辑，使用 `@opentiny/tiny-robot-kit` 的 `useMessage` / `useConversation`。

## 安装

```bash
pnpm add @opentiny/tiny-robot-chat
```

> 套件依赖 `@opentiny/tiny-robot` 和 `@opentiny/tiny-robot-kit`，请确保它们已安装。

## 代码示例

### 黑盒模式（开箱即用）

最简用法：只需传入 `responseProvider`，即可得到包含 Header、Welcome、MessageList、Sender、History 的完整对话 UI。

<demo vue="../../demos/chat/blackbox.vue" />

### 白盒模式（自由组合）

当黑盒模式的 Props / Slots 无法满足需求时，可以拆开使用子组件，完全掌控 UI 结构：

<demo vue="../../demos/chat/whitebox.vue" />

## 核心概念

### ResponseProvider

`ResponseProvider` 是整个套件的数据源接口，用于对接大语言模型 API。它接收请求体和中断信号，返回流式的 `ChatCompletion`：

```ts
import type { ResponseProvider } from '@opentiny/tiny-robot-chat'

// 签名
type ResponseProvider = (
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
) =>
  | Promise<ChatCompletion>
  | AsyncGenerator<ChatCompletion>
  | Promise<AsyncGenerator<ChatCompletion>>
```

其中 `MessageRequestBody` 结构为：

```ts
interface MessageRequestBody {
  messages: Partial<ChatMessage>[]
  [key: string]: any
}
```

**流式响应示例**（最常见的用法）：

```ts
const responseProvider: ResponseProvider = async function* (requestBody, abortSignal) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify(requestBody),
    signal: abortSignal,
  })

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = JSON.parse(decoder.decode(value))
    yield chunk // ChatCompletion 格式
  }
}
```

套件也内置了 **Provider 工厂函数**，可快速对接 OpenAI / DeepSeek 等模型：

```ts
import { createOpenAIProvider } from '@opentiny/tiny-robot-chat'

const responseProvider = createOpenAIProvider({
  apiKey: 'sk-xxx',
  model: 'gpt-4o-mini',
  baseURL: '/api/proxy',  // 建议通过后端代理，避免 API Key 泄露
})
```

### ChatStatus 四态

消息发送过程中，套件维护了清晰的四态状态机：

```
ready → submitted → streaming → ready
                ↘ error ↗
```

| 状态 | 含义 | UI 表现 |
|------|------|---------|
| `ready` | 空闲，可接受输入 | 发送按钮可用 |
| `submitted` | 已提交请求，等待首个 chunk | 显示加载指示 |
| `streaming` | 流式接收中 | 显示停止按钮，逐字呈现 |
| `error` | 请求出错 | 显示错误提示 |

### useChatKit

`useChatKit` 是套件的核心 Composable，封装了消息发送、流式接收、会话管理等完整逻辑：

```ts
import { useChatKit } from '@opentiny/tiny-robot-chat'

const chat = useChatKit({
  responseProvider,                // 必须：大模型数据源
  plugins: [],                     // 可选：消息处理插件
  storage: localStorageStrategy,   // 可选：会话持久化策略
  initialMessages: [],             // 可选：初始消息
  onFinish(message) {},            // 可选：流式完成回调
  onError(error) {},               // 可选：错误回调
})
```

**返回值一览：**

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| `messages` | `ComputedRef<ChatMessage[]>` | 当前会话消息列表 |
| `status` | `ComputedRef<ChatStatus>` | 当前对话状态 |
| `sendMessage` | `(content: string) => void` | 发送新消息 |
| `abort` | `() => Promise<void>` | 中断当前流式输出 |
| `updateResponseProvider` | `(provider) => void` | 动态切换模型 |
| `createConversation` | `() => void` | 新建对话（清空消息） |
| `switchConversation` | `(id) => void` | 切换到历史会话 |
| `deleteConversation` | `(id) => void` | 删除历史会话 |
| `conversations` | `Ref<ConversationInfo[]>` | 全部会话列表 |
| `activeConversationId` | `Ref<string>` | 当前活动会话 ID |

## TrChat 黑盒 Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `responseProvider` | `ResponseProvider` | 是 | - | 大模型数据源 |
| `brand` | `BrandConfig` | 否 | - | 品牌配置，控制 Header 标题与 Welcome 区 Logo |
| `welcome` | `WelcomeConfig` | 否 | - | 欢迎页配置（标题、描述、图标） |
| `prompts` | `PromptProps[]` | 否 | `[]` | 欢迎页引导词列表 |
| `placeholder` | `string` | 否 | `'请输入您的问题'` | 输入框占位文本 |
| `maxLength` | `number` | 否 | - | 输入最大字数限制 |
| `senderMode` | `'single' \| 'multiple'` | 否 | - | 输入框单行/多行模式 |
| `autoScroll` | `boolean` | 否 | `true` | 流式输出时自动滚动到底部 |
| `showHistory` | `boolean` | 否 | `false` | 是否显示历史会话抽屉按钮 |
| `enableFullscreen` | `boolean` | 否 | `false` | 是否显示全屏切换按钮 |
| `v-model:fullscreen` | `boolean` | 否 | `false` | 全屏状态双向绑定 |
| `v-model:show` | `boolean` | 否 | - | 控制组件显隐（`v-show`） |
| `roleConfigs` | `BubbleListProps['roleConfigs']` | 否 | *内置默认* | 气泡角色配置（头像、位置） |
| `groupStrategy` | `BubbleListProps['groupStrategy']` | 否 | - | 消息分组策略 |
| `senderProps` | `SenderProps` | 否 | `{}` | 透传给底层 Sender 的额外配置 |
| `bubbleListProps` | `Omit<BubbleListProps, ...>` | 否 | `{}` | 透传给底层 BubbleList 的额外配置 |
| `plugins` | `UseMessagePlugin[]` | 否 | `[]` | 消息处理插件 |
| `storage` | `ConversationStorageStrategy` | 否 | - | 会话持久化策略 |
| `initialMessages` | `ChatMessage[]` | 否 | `[]` | 初始消息列表 |

### BrandConfig

```ts
interface BrandConfig {
  title?: string           // Header 左侧品牌标题
  logo?: VNode | Component // Welcome 区 Logo fallback
}
```

### WelcomeConfig

```ts
interface WelcomeConfig {
  title: string
  description?: string
  icon?: VNode | Component  // 优先级高于 brand.logo
}
```

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:fullscreen` | `boolean` | 全屏状态变更 |
| `update:show` | `boolean` | 显隐状态变更 |
| `finish` | `ChatMessage` | 流式输出完成 |
| `error` | `Error` | 请求发生错误 |

## Slots

| 插槽名 | 作用域参数 | 说明 |
|--------|-----------|------|
| `header` | - | 完全替换 Header 区域 |
| `header-extra` | - | Header 右侧追加自定义按钮 |
| `welcome` | - | 完全替换 Welcome 区域 |
| `empty` | - | 无 `welcome` 配置且无消息时的空状态 |
| `message-list` | `{ messages }` | 完全替换消息列表 |
| `sender` | `{ send, abort, status }` | 完全替换底部输入区 |
| `footer-extra` | - | Footer 中输入框上方的自定义区域 |
| *BubbleList slots* | 同 BubbleList | `content`, `content-footer` 等透传给气泡列表 |

## 白盒子组件

通过 `TrChat` 命名空间访问，在 `TrChat.Root` 包裹下使用：

| 子组件 | 说明 | 关键 Props |
|--------|------|-----------|
| `TrChat.Root` | 上下文注入器，包裹所有白盒子组件 | `chat-kit` 或 `response-provider` |
| `TrChat.Header` | 顶部操作栏 | `show-history`, `title`, `show-full-screen`, `show-close` |
| `TrChat.Welcome` | 欢迎引导页 | `title`, `description`, `icon`, `prompts` |
| `TrChat.MessageList` | 消息气泡列表 | `auto-scroll`, `role-configs`, 以及 BubbleList 全部 Props |
| `TrChat.Footer` | 底部容器 | Slots: `default`, `extra` |
| `TrChat.Sender` | 输入框 | `placeholder`, `mode`, 以及 Sender 全部 Props |
| `TrChat.History` | 历史会话抽屉 | 透传 History 组件 Props |

### TrChat.Root 用法

Root 组件支持两种注入模式：

```vue
<!-- 模式 A：传入配置，Root 内部自动创建 chatKit -->
<TrChat.Root :response-provider="provider" :plugins="plugins">
  <!-- 子组件 -->
</TrChat.Root>

<!-- 模式 B：传入外部创建的 chatKit 实例（推荐） -->
<TrChat.Root :chat-kit="chat">
  <!-- 子组件 -->
</TrChat.Root>
```

> **推荐模式 B**：外部持有 `chatKit` 实例，可以在组件外部访问 `messages`、`status` 等状态，便于与其他 UI 联动。

## 全屏模式

Chat 套件内置了全屏布局支持。全屏相关有两个独立的 Props：

| Prop | 作用 | 说明 |
|------|------|------|
| `enableFullscreen` | **功能开关** | 控制 Header 是否渲染全屏按钮 |
| `v-model:fullscreen` | **视图状态** | 控制当前是否处于全屏模式 |

```vue
<!-- 开启全屏功能 -->
<TrChat
  :response-provider="provider"
  enable-fullscreen
  v-model:fullscreen="isFullscreen"
/>
```

**全屏模式的 CSS 架构：**

- Header 和 Footer **背景色 100% 贯穿**整个视口宽度
- 内容区域（Header 内部、Body、Footer 内部）通过 `max-width` 居中约束
- 可通过 CSS 变量 `--chat-content-max-width` 自定义最大宽度（默认 `1280px`）

> **与 TrContainer 的区别：** `TrChat` 的全屏模式是纯 CSS 布局能力（`position: fixed + inset: 0`），不提供拖拽、侧边弹出等高级外壳功能。如需侧边栏模式或拖拽等能力，请将 `TrChat` 包裹在 `TrContainer` 中使用。

## 默认消息布局

套件内置了默认的 `roleConfigs`，开箱即保证良好的对话排布：

- **assistant**：靠左显示，带 AI 图标头像
- **user**：靠右显示，带用户图标头像

如需自定义，通过 `roleConfigs` Prop 传入即可覆盖（浅合并）：

```vue
<TrChat
  :response-provider="provider"
  :role-configs="{
    assistant: { placement: 'start', avatar: CustomAvatar },
    user: { placement: 'end' },
  }"
/>
```

## CSS 变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `--chat-width` | - | 组件宽度 |
| `--chat-height` | - | 组件高度 |
| `--chat-border-radius` | - | 圆角 |
| `--chat-header-bg` | - | Header 背景色 |
| `--chat-header-height` | - | Header 高度 |
| `--chat-header-padding` | - | Header 内边距 |
| `--chat-header-border-bottom` | - | Header 下边框 |
| `--chat-header-title-font-size` | `14px` | 品牌标题字号 |
| `--chat-header-title-font-weight` | `600` | 品牌标题字重 |
| `--chat-header-title-color` | `var(--tr-color-text-primary)` | 品牌标题颜色 |
| `--chat-body-bg` | - | 消息区背景色 |
| `--chat-body-padding` | - | 消息区内边距 |
| `--chat-footer-bg` | - | Footer 背景色 |
| `--chat-footer-padding` | - | Footer 内边距 |
| `--chat-footer-border-top` | - | Footer 上边框 |
| `--chat-welcome-padding` | `24px` | 欢迎页内边距 |
| `--chat-welcome-prompts-max-width` | `800px` | Prompt 区域最大宽度 |
| `--chat-welcome-prompts-padding` | `16px 24px` | Prompt 区域内边距 |
| `--chat-content-max-width` | `1280px` | 全屏模式内容区最大宽度 |
| `--chat-drawer-z-index` | `100` | 全屏模式 z-index |

## 注意事项

1. **浏览器端 API Key 安全**: `createOpenAIProvider` 直接在浏览器端使用 API Key 存在泄露风险。生产环境应通过后端代理转发请求。

2. **`show` Prop 的语义**: `v-model:show` 仅提供 `v-show` 级别的显隐控制，不包含浮层动画或侧边弹出行为。如需此类功能，请使用 `TrContainer` 包裹。

3. **白盒模式的 Welcome / MessageList 切换**: 白盒模式下需要用户自行通过 `v-if` / `v-else` 控制欢迎页与消息列表的互斥显示（参考白盒示例）。黑盒模式会自动处理。

4. **白盒模式需要手动传 roleConfigs**: 内置的 `DEFAULT_ROLE_CONFIGS` 仅在黑盒模式下自动注入。白盒模式如需默认排布，请手动传 `:role-configs` 给 `TrChat.MessageList`。
