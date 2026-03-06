# Chat Kit 详细实施方案

> 基于 `chat-kit-design.md` v1.1 + `chat-kit-changelog.md` | 生成日期：2026-03-05

---

## 前置说明

### 包映射关系

| 设计文档名称 | 实际包路径 | 包名 |
|---|---|---|
| `@opentiny/tiny-robot` | `packages/components/` | UI 组件层（已有） |
| `@opentiny/tiny-robot-kit` | `packages/kit/` | 逻辑层（已有） |
| `@opentiny/tiny-robot-chat` | `packages/chat/` | 套件层（待建） |

### 关键现有 API（实施前必读）

**`useConversation` 返回值**（`packages/kit/src/vue/conversation/useConversation.ts`）：
- `conversations`, `activeConversationId`, `activeConversation`
- `createConversation(params?)` — 同步创建并自动切换，已内置 `activeConversationId.value = id`
- `switchConversation(id)`, `deleteConversation(id)`, `updateConversationTitle(id, title?)`
- `sendMessage(content)` — 便捷方法，转发给 `activeConversation.engine.sendMessage`
- `abortActiveRequest()` — 转发给 `activeConversation.engine.abortRequest()`

**`useMessage` 返回值**（`packages/kit/src/vue/message/useMessage.ts`）：
- `requestState: Ref<'idle' | 'processing' | 'completed' | 'aborted' | 'error'>`
- `processingState: Ref<'requesting' | 'completing' | undefined>`
- `isProcessing: ComputedRef<boolean>` — `requestState === 'processing'`
- `messages: Ref<ChatMessage[]>`
- `sendMessage(content)`, `abortRequest()`

**`responseProvider` 实际签名**（与设计文档略有差异）：
```ts
// 实际签名（packages/kit/src/vue/message/types.ts）
responseProvider: <T = ChatCompletion>(
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
) => Promise<T> | AsyncGenerator<T> | Promise<AsyncGenerator<T>>
```
> ⚠️ 设计文档中 `ResponseProvider` 返回 `ReadableStream<string>`，但底层实际接受 `AsyncGenerator<ChatCompletion>`。
> `createOpenAIProvider` 工厂函数需要将 OpenAI 流式响应适配为 `AsyncGenerator<ChatCompletion>`，而非 `ReadableStream<string>`。


---

## Step 1.1 — 工程配置

### `packages/chat/package.json`

```json
{
  "name": "@opentiny/tiny-robot-chat",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./style": "./dist/style.css"
  },
  "files": ["dist"],
  "sideEffects": ["*.css"],
  "scripts": {
    "dev": "vue-tsc && vite build --watch",
    "build": "vue-tsc && vite build"
  },
  "peerDependencies": {
    "vue": "^3.3.11"
  },
  "dependencies": {
    "@opentiny/tiny-robot": "workspace:*",
    "@opentiny/tiny-robot-kit": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.2",
    "less": "^4.2.2",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "vite-plugin-dts": "^4.5.3",
    "vue": "^3.3.11",
    "vue-tsc": "^2.2.8"
  }
}
```

### `packages/chat/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "paths": {
      "@opentiny/tiny-robot": ["../components/src/index.ts"],
      "@opentiny/tiny-robot-kit": ["../kit/src/index.ts"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

### `packages/chat/vite.config.ts`

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({ include: ['src'], insertTypesEntry: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', '@opentiny/tiny-robot', '@opentiny/tiny-robot-kit'],
      output: { preserveModules: false },
    },
    cssCodeSplit: false, // 所有 CSS 合并到 dist/style.css
  },
})
```


---

## Step 1.2 — 类型与上下文

### `packages/chat/src/types.ts`

```ts
import type { Component, VNode } from 'vue'
import type { ConversationStorageStrategy, ChatMessage } from '@opentiny/tiny-robot-kit'
import type { UseMessagePlugin, MessageRequestBody, ChatCompletion } from '@opentiny/tiny-robot-kit'
import type { UseConversationReturn } from '@opentiny/tiny-robot-kit'

// ===== ResponseProvider =====
// 注意：实际底层签名接受 AsyncGenerator<ChatCompletion>，与设计文档中的 ReadableStream<string> 不同
// createOpenAIProvider 工厂函数负责将 SSE 流适配为 AsyncGenerator<ChatCompletion>
export type ResponseProvider = (
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
) => Promise<ChatCompletion> | AsyncGenerator<ChatCompletion> | Promise<AsyncGenerator<ChatCompletion>>

// ===== ChatStatus 四态 =====
// 从底层 requestState 推导：
//   idle / completed / aborted → 'ready'
//   processing + processingState='requesting' → 'submitted'
//   processing + processingState='completing' → 'streaming'
//   error → 'error'
export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

// ===== useChatKit 选项 =====
export interface UseChatKitOptions {
  responseProvider: ResponseProvider
  plugins?: UseMessagePlugin[]
  storage?: ConversationStorageStrategy
  initialMessages?: ChatMessage[]
  onFinish?: (message: ChatMessage) => void
  onError?: (error: Error) => void
}

// ===== useChatKit 返回值 =====
export interface UseChatKitReturn
  extends Pick<
    UseConversationReturn,
    | 'conversations'
    | 'activeConversationId'
    | 'activeConversation'
    | 'createConversation'
    | 'switchConversation'
    | 'deleteConversation'
    | 'updateConversationTitle'
  > {
  messages: import('vue').ComputedRef<ChatMessage[]>
  status: import('vue').ComputedRef<ChatStatus>
  sendMessage: (content: string) => void
  abort: () => Promise<void>
}

// ===== TrChat 黑盒组件 Props =====
export interface WelcomeConfig {
  title: string
  description?: string
  icon?: VNode | Component
}

export interface TrChatProps {
  responseProvider: ResponseProvider
  plugins?: UseMessagePlugin[]
  storage?: ConversationStorageStrategy
  initialMessages?: ChatMessage[]
  onFinish?: (message: ChatMessage) => void
  onError?: (error: Error) => void
  welcome?: WelcomeConfig
  prompts?: Array<{ title?: string; description: string }>
  placeholder?: string
  maxLength?: number
  senderMode?: 'single' | 'multiple'
  autoScroll?: boolean
  showHistory?: boolean
  fullscreen?: boolean
}

// ===== Provider 工厂函数选项 =====
export interface OpenAIProviderOptions {
  apiKey: string
  model?: string
  baseURL?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface DeepSeekProviderOptions {
  apiKey: string
  model?: string
  systemPrompt?: string
  temperature?: number
}
```

### `packages/chat/src/context.ts`

```ts
import type { InjectionKey, Ref } from 'vue'
import type { UseChatKitReturn } from './types'

// 主状态注入 key：由 TrChatRoot provide，所有子组件 inject
export const CHAT_KIT_KEY: InjectionKey<UseChatKitReturn> = Symbol('chatKit')

// UI 状态注入 key：由 TrChat.vue / TrChatRoot.vue provide，供 Header/History 使用
export const CHAT_UI_KEY: InjectionKey<{
  showHistoryDrawer: Ref<boolean>
}> = Symbol('chatUI')
```


---

## Step 1.3 — 核心 Composable

### `packages/chat/src/composables/useChatKit.ts`

```ts
import { computed } from 'vue'
import { useConversation } from '@opentiny/tiny-robot-kit'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import type { ChatStatus, UseChatKitOptions, UseChatKitReturn } from '../types'

export function useChatKit(options: UseChatKitOptions): UseChatKitReturn {
  const { responseProvider, plugins = [], storage, initialMessages = [], onFinish, onError } = options

  // onFinish / onError 通过插件机制注入到 useMessage 生命周期
  const lifecyclePlugin = {
    name: 'chatkit-lifecycle',
    onTurnEnd(ctx: { messages: ChatMessage[] }) {
      if (!onFinish) return
      // 取最后一条 assistant 消息作为完成消息
      const last = [...ctx.messages].reverse().find((m) => m.role === 'assistant')
      if (last) onFinish(last)
    },
    onError(ctx: { error: unknown }) {
      onError?.(ctx.error instanceof Error ? ctx.error : new Error(String(ctx.error)))
    },
  }

  const conversation = useConversation({
    useMessageOptions: {
      responseProvider,
      plugins: [...plugins, lifecyclePlugin],
      initialMessages,
    },
    autoSaveMessages: !!storage,
    storage,
  })

  // ===== ChatStatus 四态推导 =====
  // 从 activeConversation.engine.requestState + processingState 推导
  const status = computed<ChatStatus>(() => {
    const engine = conversation.activeConversation.value?.engine
    if (!engine) return 'ready'

    const rs = engine.requestState.value
    const ps = engine.processingState.value

    if (rs === 'error') return 'error'
    if (rs === 'processing') {
      return ps === 'completing' ? 'streaming' : 'submitted'
    }
    return 'ready' // idle / completed / aborted 均视为 ready
  })

  // ===== messages 从 activeConversation 派生 =====
  const messages = computed<ChatMessage[]>(
    () => conversation.activeConversation.value?.engine.messages.value ?? [],
  )

  // ===== sendMessage：首次发送自动创建会话 =====
  function sendMessage(content: string): void {
    if (!content.trim()) return
    if (!conversation.activeConversationId.value) {
      conversation.createConversation({ title: content.slice(0, 20) })
    }
    // createConversation 已自动切换 activeConversationId，直接发送
    conversation.activeConversation.value?.engine.sendMessage(content)
  }

  // ===== abort：立即置 ready，网络层异步关闭 =====
  async function abort(): Promise<void> {
    await conversation.abortActiveRequest()
  }

  return {
    // 透传 useConversation 的会话管理 API
    conversations: conversation.conversations,
    activeConversationId: conversation.activeConversationId,
    activeConversation: conversation.activeConversation,
    createConversation: conversation.createConversation,
    switchConversation: conversation.switchConversation,
    deleteConversation: conversation.deleteConversation,
    updateConversationTitle: conversation.updateConversationTitle,
    // 套件层新增
    messages,
    status,
    sendMessage,
    abort,
  }
}
```

**关键实现说明**：

- `onFinish` / `onError` 通过内置插件 `chatkit-lifecycle` 注入，不污染 composable 返回值
- `status` 四态推导：`processing + requesting → submitted`，`processing + completing → streaming`，其余均为 `ready`
- `abort()` 直接调用底层 `abortActiveRequest()`，底层 watch 会等待 `isProcessing` 变 false 后 resolve
- `sendMessage` 是同步入队（`void`），流式输出异步进行，调用方可在调用后立即清空 `inputValue`


---

## Step 1.4 — Providers

### `packages/chat/src/providers/openai.ts`

```ts
import { sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import type { ResponseProvider, OpenAIProviderOptions } from '../types'

export function createOpenAIProvider(options: OpenAIProviderOptions): ResponseProvider {
  const {
    apiKey,
    model = 'gpt-4o-mini',
    baseURL = 'https://api.openai.com/v1',
    systemPrompt,
    temperature,
    maxTokens,
  } = options

  return async function* (requestBody, abortSignal) {
    const messages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...requestBody.messages]
      : requestBody.messages

    const body: Record<string, unknown> = {
      model,
      messages,
      stream: true,
    }
    if (temperature !== undefined) body.temperature = temperature
    if (maxTokens !== undefined) body.max_tokens = maxTokens

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
      signal: abortSignal,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`OpenAI API error ${response.status}: ${text}`)
    }

    // 复用 kit 中已有的 sseStreamToGenerator，产出 ChatCompletion chunk
    yield* sseStreamToGenerator(response, { signal: abortSignal })
  }
}
```

### `packages/chat/src/providers/deepseek.ts`

```ts
import { createOpenAIProvider } from './openai'
import type { ResponseProvider, DeepSeekProviderOptions } from '../types'

export function createDeepSeekProvider(options: DeepSeekProviderOptions): ResponseProvider {
  return createOpenAIProvider({
    ...options,
    model: options.model ?? 'deepseek-chat',
    baseURL: 'https://api.deepseek.com/v1',
  })
}
```

**实现说明**：

- `createOpenAIProvider` 返回一个 `async generator function`，直接复用 `kit` 中的 `sseStreamToGenerator`，产出标准 `ChatCompletion` chunk，与底层 `useMessage` 的 `responseProvider` 签名完全兼容
- `createDeepSeekProvider` 是 `createOpenAIProvider` 的薄封装，预设 `baseURL` 和默认 `model`
- `abortSignal` 透传给 `fetch` 和 `sseStreamToGenerator`，确保 abort 时网络请求立即取消


---

## Step 1.5 — 样式

> 使用 Less（与 `packages/components/` 保持一致），利用嵌套语法减少 BEM 前缀重复。
> CSS 变量仍保留（运行时可覆盖），Less 变量仅用于内部计算。

### `packages/chat/src/styles/variables.less`

```less
// 套件层 CSS 变量（运行时可被用户覆盖）
// --chat-* 变量全部引用 --tr-* 变量，暗色模式由 ThemeProvider 写入
// data-tr-color-mode="dark" 后 --tr-* 自动切换，--chat-* 作为引用链自动跟随，无需额外处理
:root {
  --chat-width: 100%;
  --chat-height: 100%;
  --chat-border-radius: 16px;

  --chat-header-height: 48px;
  --chat-header-padding: 0 12px;
  --chat-header-bg: var(--tr-container-bg-default, #fff);
  // ✅ 修正：--tr-color-border 不存在，正确变量名是 --tr-border-color-default
  --chat-header-border-bottom: 1px solid var(--tr-border-color-default, #c2c2c2);

  --chat-body-padding: 0;
  --chat-body-bg: var(--tr-container-bg-default, #fff);

  --chat-footer-padding: 8px 12px;
  --chat-footer-bg: var(--tr-container-bg-default, #fff);
  --chat-footer-border-top: 1px solid var(--tr-border-color-default, #c2c2c2);

  --chat-drawer-width: 280px;
  --chat-drawer-bg: var(--tr-container-bg-default, #fff);
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

### `packages/chat/src/styles/layout.less`

```less
// Less 嵌套语法：BEM 子元素嵌套在 .tr-chat 内，消除前缀重复
.tr-chat {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: var(--chat-width);
  height: var(--chat-height);
  border-radius: var(--chat-border-radius);

  &__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--chat-header-height);
    padding: var(--chat-header-padding);
    background: var(--chat-header-bg);
    border-bottom: var(--chat-header-border-bottom);
  }

  &__body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: var(--chat-body-padding);
    background: var(--chat-body-bg);
  }

  &__footer {
    flex-shrink: 0;
    padding: var(--chat-footer-padding);
    background: var(--chat-footer-bg);
    border-top: var(--chat-footer-border-top);

    &-extra {
      margin-bottom: 8px;
    }
  }
}
```

### `packages/chat/src/styles/drawer.less`

```less
.tr-chat-drawer-overlay {
  position: absolute;
  inset: 0;
  background: var(--chat-drawer-overlay-bg);
  opacity: 0;
  transition: opacity var(--chat-drawer-transition);
  pointer-events: none;
  z-index: calc(var(--chat-drawer-z-index) - 1);

  &.is-open {
    opacity: 1;
    pointer-events: auto;
  }
}

.tr-chat-drawer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--chat-drawer-width);
  background: var(--chat-drawer-bg);
  box-shadow: var(--chat-drawer-shadow);
  transform: translateX(-100%);
  transition: transform var(--chat-drawer-transition);
  z-index: var(--chat-drawer-z-index);
  display: flex;
  flex-direction: column;

  &.is-open {
    transform: translateX(0);
  }
}
```

### `packages/chat/src/styles/index.less`

```less
@import './variables.less';
@import './layout.less';
@import './drawer.less';
```


---

## Step 1.6 — TrChatRoot（白盒根组件）

### `packages/chat/src/components/TrChatRoot.vue`

```vue
<script setup lang="ts">
import { provide, ref } from 'vue'
import { useChatKit } from '../composables/useChatKit'
import { CHAT_KIT_KEY, CHAT_UI_KEY } from '../context'
import type { UseChatKitOptions, UseChatKitReturn } from '../types'

// 两种互斥模式：
// 模式 A：传 UseChatKitOptions，Root 内部创建状态
// 模式 B：传 chatKit 实例，Root 直接 provide，不重复创建
interface Props {
  // 模式 A
  responseProvider?: UseChatKitOptions['responseProvider']
  plugins?: UseChatKitOptions['plugins']
  storage?: UseChatKitOptions['storage']
  initialMessages?: UseChatKitOptions['initialMessages']
  onFinish?: UseChatKitOptions['onFinish']
  onError?: UseChatKitOptions['onError']
  // 模式 B
  chatKit?: UseChatKitReturn
}

const props = defineProps<Props>()

// 模式 B 优先；模式 A 时内部创建
const chatKit = props.chatKit ?? useChatKit({
  responseProvider: props.responseProvider!,
  plugins: props.plugins,
  storage: props.storage,
  initialMessages: props.initialMessages,
  onFinish: props.onFinish,
  onError: props.onError,
})

// UI 状态由 Root 统一管理，供 Header / History 通过 inject 消费
const showHistoryDrawer = ref(false)

provide(CHAT_KIT_KEY, chatKit)
provide(CHAT_UI_KEY, { showHistoryDrawer })
</script>

<template>
  <slot />
</template>
```

**说明**：
- 模式 B（`:chat-kit`）优先级高于模式 A，两者互斥
- `showHistoryDrawer` 由 Root 持有并 provide，Header 点击历史按钮时 toggle，History 组件读取并控制 Drawer 显隐
- Root 本身不渲染任何 DOM，只做状态注入

---

## Step 1.7 — TrChatHeader

### `packages/chat/src/components/TrChatHeader.vue`

```vue
<script setup lang="ts">
import { inject } from 'vue'
import { CHAT_KIT_KEY, CHAT_UI_KEY } from '../context'

interface Props {
  showHistory?: boolean
  showNewChat?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHistory: false,
  showNewChat: true,
})

const chatKit = inject(CHAT_KIT_KEY)!
const { showHistoryDrawer } = inject(CHAT_UI_KEY)!

function handleNewChat() {
  chatKit.createConversation()
}
</script>

<template>
  <div class="tr-chat__header">
    <!-- 左侧：历史按钮 -->
    <div class="tr-chat__header-left">
      <button v-if="props.showHistory" @click="showHistoryDrawer = !showHistoryDrawer">
        <!-- 使用 TrIconButton 或直接用 SVG icon，此处为示意 -->
        <slot name="history-icon">☰</slot>
      </button>
    </div>

    <!-- 中间：标题 slot -->
    <div class="tr-chat__header-title">
      <slot />
    </div>

    <!-- 右侧：新建按钮 + extra slot -->
    <div class="tr-chat__header-right">
      <slot name="extra" />
      <button v-if="props.showNewChat" @click="handleNewChat">
        <slot name="new-chat-icon">✏️</slot>
      </button>
    </div>
  </div>
</template>
```


---

## Step 1.8 — TrChatWelcome

### `packages/chat/src/components/TrChatWelcome.vue`

```vue
<script setup lang="ts">
import { TrWelcome, TrPrompts } from '@opentiny/tiny-robot'
import type { Component, VNode } from 'vue'

interface Props {
  title: string
  description?: string
  icon?: VNode | Component
  prompts?: Array<{ title?: string; description: string }>
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'prompt-click': [description: string] }>()
</script>

<template>
  <div class="tr-chat__welcome">
    <TrWelcome :title="props.title" :description="props.description" :icon="props.icon" />
    <TrPrompts
      v-if="props.prompts?.length"
      :items="props.prompts"
      @item-click="(item) => emit('prompt-click', item.description)"
    />
  </div>
</template>
```

**说明**：
- `emit('prompt-click', description)` 在白盒模式下由用户自行处理
- 黑盒 `TrChat.vue` 内部会自动绑定 `@prompt-click="sendMessage"`
- 组件本身不 inject chatKit，保持无副作用，可独立使用

---

## Step 1.9 — TrChatMessageList

### `packages/chat/src/components/TrChatMessageList.vue`

```vue
<script setup lang="ts">
import { inject, useSlots } from 'vue'
import { TrBubbleList } from '@opentiny/tiny-robot'
import { CHAT_KIT_KEY } from '../context'

// 支持透传完整 TrBubbleList props（使用 v-bind="$attrs" + defineOptions inheritAttrs: false）
defineOptions({ inheritAttrs: false })

const chatKit = inject(CHAT_KIT_KEY)!
const slots = useSlots()
</script>

<template>
  <div class="tr-chat__body">
    <TrBubbleList :messages="chatKit.messages.value" v-bind="$attrs">
      <!--
        动态透传所有 BubbleList slots。
        用户在 TrChatMessageList 上写的 slot 会自动穿透到内部 TrBubbleList。
        ⚠️ 风险点：带连字符的 slot 名（如 content-footer）需实测验证。
      -->
      <template v-for="(_, name) in slots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </TrBubbleList>
  </div>
</template>
```

**动态 slot 透传说明**：
- `useSlots()` 获取父级传入的所有 slot
- `v-for="(_, name) in slots"` 遍历 slot 名，`#[name]` 动态绑定到 TrBubbleList
- `slotProps ?? {}` 防止 slotProps 为 undefined 时 `v-bind` 报错
- 带连字符的 slot 名（`content-footer`、`prefix` 等）需在集成测试中验证

---

## Step 1.10 — TrChatFooter

### `packages/chat/src/components/TrChatFooter.vue`

```vue
<template>
  <div class="tr-chat__footer">
    <!-- 输入框上方自定义区域（pills、工具栏等） -->
    <div v-if="$slots.extra" class="tr-chat__footer-extra">
      <slot name="extra" />
    </div>
    <!-- 默认放置 TrChatSender -->
    <slot />
  </div>
</template>
```


---

## Step 1.11 — TrChatSender

### `packages/chat/src/components/TrChatSender.vue`

```vue
<script setup lang="ts">
import { inject, ref, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { CHAT_KIT_KEY } from '../context'

// 支持透传完整 TrSender props
defineOptions({ inheritAttrs: false })

const chatKit = inject(CHAT_KIT_KEY)!

// inputValue 由组件自己管理，不暴露给 useChatKit
const inputValue = ref('')

const isLoading = computed(
  () => chatKit.status.value === 'submitted' || chatKit.status.value === 'streaming',
)

function handleSend(content: string) {
  chatKit.sendMessage(content)
  inputValue.value = '' // sendMessage 是同步入队，可立即清空
}

function handleAbort() {
  chatKit.abort()
}
</script>

<template>
  <TrSender
    v-model="inputValue"
    :loading="isLoading"
    v-bind="$attrs"
    @submit="handleSend"
    @cancel="handleAbort"
  />
</template>
```

**说明**：
- `inputValue` 完全由组件内部管理，`useChatKit` 不感知
- `isLoading` 在 `submitted` 和 `streaming` 两态均为 true，驱动 TrSender 显示停止按钮
- `v-bind="$attrs"` 透传所有 TrSender props（`placeholder`、`maxLength`、`senderMode` 等）
- `handleSend` 调用 `sendMessage` 后立即清空 `inputValue`，因为消息已同步入队展示

---

## Step 1.12 — TrChatHistory

### `packages/chat/src/components/TrChatHistory.vue`

```vue
<script setup lang="ts">
import { inject } from 'vue'
import { TrHistory } from '@opentiny/tiny-robot'
import { CHAT_KIT_KEY, CHAT_UI_KEY } from '../context'

// 支持透传完整 TrHistory props
defineOptions({ inheritAttrs: false })

const chatKit = inject(CHAT_KIT_KEY)!
const { showHistoryDrawer } = inject(CHAT_UI_KEY)!

function handleSelect(id: string) {
  chatKit.switchConversation(id)
  showHistoryDrawer.value = false
}

function handleDelete(id: string) {
  chatKit.deleteConversation(id)
}
</script>

<template>
  <!-- 遮罩层：点击关闭 Drawer -->
  <div
    class="tr-chat-drawer-overlay"
    :class="{ 'is-open': showHistoryDrawer }"
    @click="showHistoryDrawer = false"
  />

  <!-- Drawer 面板 -->
  <div class="tr-chat-drawer" :class="{ 'is-open': showHistoryDrawer }">
    <TrHistory
      :conversations="chatKit.conversations.value"
      :active-id="chatKit.activeConversationId.value"
      v-bind="$attrs"
      @select="handleSelect"
      @delete="handleDelete"
    />
  </div>
</template>
```

**说明**：
- Drawer 使用 `position: absolute`（相对 `.tr-chat` 容器），不影响页面其他内容
- `is-open` class 驱动 CSS transition（`translateX`），零 JS 动画依赖
- 点击遮罩层关闭 Drawer，点击历史条目后自动关闭


---

## Step 1.13 — TrChat（黑盒入口组件）

### `packages/chat/src/components/TrChat.vue`

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChatKit } from '../composables/useChatKit'
import TrChatRoot from './TrChatRoot.vue'
import TrChatHeader from './TrChatHeader.vue'
import TrChatWelcome from './TrChatWelcome.vue'
import TrChatMessageList from './TrChatMessageList.vue'
import TrChatFooter from './TrChatFooter.vue'
import TrChatSender from './TrChatSender.vue'
import TrChatHistory from './TrChatHistory.vue'
import type { TrChatProps } from '../types'

const props = withDefaults(defineProps<TrChatProps>(), {
  placeholder: '请输入您的问题',
  autoScroll: true,
  showHistory: false,
  fullscreen: false,
})

// 黑盒模式：内部创建 chatKit 实例，传给 Root（模式 B）
const chatKit = useChatKit({
  responseProvider: props.responseProvider,
  plugins: props.plugins,
  storage: props.storage,
  initialMessages: props.initialMessages,
  onFinish: props.onFinish,
  onError: props.onError,
})

const showWelcome = computed(() => chatKit.messages.value.length === 0)

// 黑盒模式下自动处理引导词点击
function handlePromptClick(description: string) {
  chatKit.sendMessage(description)
}
</script>

<template>
  <TrChatRoot :chat-kit="chatKit">
    <div class="tr-chat" :style="props.fullscreen ? 'height: 100vh' : undefined">

      <!-- 顶部栏 -->
      <template v-if="$slots.header">
        <slot name="header" />
      </template>
      <TrChatHeader v-else :show-history="props.showHistory">
        <template v-if="$slots['header-extra']" #extra>
          <slot name="header-extra" />
        </template>
      </TrChatHeader>

      <!-- 消息区 / 欢迎页 -->
      <template v-if="$slots['message-list']">
        <slot name="message-list" :messages="chatKit.messages.value" />
      </template>
      <template v-else>
        <template v-if="$slots.welcome">
          <slot v-if="showWelcome" name="welcome" />
        </template>
        <TrChatWelcome
          v-else-if="showWelcome && props.welcome"
          v-bind="props.welcome"
          :prompts="props.prompts"
          @prompt-click="handlePromptClick"
        />
        <slot v-else-if="showWelcome && !props.welcome" name="empty" />

        <TrChatMessageList v-if="!showWelcome" :auto-scroll="props.autoScroll">
          <!-- 动态透传 BubbleList slots -->
          <template v-for="(_, name) in $slots" #[name]="slotProps" :key="name">
            <slot :name="name" v-bind="slotProps ?? {}" />
          </template>
        </TrChatMessageList>
      </template>

      <!-- 底部 -->
      <template v-if="$slots.sender">
        <slot name="sender" :send="chatKit.sendMessage" :abort="chatKit.abort" :status="chatKit.status.value" />
      </template>
      <TrChatFooter v-else>
        <template v-if="$slots['footer-extra']" #extra>
          <slot name="footer-extra" />
        </template>
        <TrChatSender :placeholder="props.placeholder" :max-length="props.maxLength" />
      </TrChatFooter>

      <!-- 历史 Drawer -->
      <TrChatHistory v-if="props.showHistory" />

    </div>
  </TrChatRoot>
</template>
```

**说明**：
- 黑盒内部调用 `useChatKit` 后以模式 B（`:chat-kit`）传给 `TrChatRoot`，避免状态重复创建
- `showWelcome` 由 `messages.length === 0` 驱动，自动切换欢迎页与消息列表
- `#sender` slot 暴露 `{ send, abort, status }` 供用户完全替换输入区
- BubbleList slots 通过 `v-for="(_, name) in $slots"` 动态透传，用户在 `<TrChat>` 上写的 slot 自动穿透到内部 `TrBubbleList`


---

## Step 1.14 — 导出入口

### `packages/chat/src/index.ts`

```ts
// ===== 样式（自动导入）=====
import './styles/index.less'

// ===== 黑盒组件（同时挂载白盒子组件）=====
import TrChat from './components/TrChat.vue'
import TrChatRoot from './components/TrChatRoot.vue'
import TrChatHeader from './components/TrChatHeader.vue'
import TrChatWelcome from './components/TrChatWelcome.vue'
import TrChatMessageList from './components/TrChatMessageList.vue'
import TrChatFooter from './components/TrChatFooter.vue'
import TrChatSender from './components/TrChatSender.vue'
import TrChatHistory from './components/TrChatHistory.vue'

// 挂载白盒子组件到 TrChat 上，实现复合组件模式
TrChat.Root = TrChatRoot
TrChat.Header = TrChatHeader
TrChat.Welcome = TrChatWelcome
TrChat.MessageList = TrChatMessageList
TrChat.Footer = TrChatFooter
TrChat.Sender = TrChatSender
TrChat.History = TrChatHistory

export { TrChat }

// ===== Composable =====
export { useChatKit } from './composables/useChatKit'

// ===== Providers =====
export { createOpenAIProvider } from './providers/openai'
export { createDeepSeekProvider } from './providers/deepseek'

// ===== 类型 =====
export type {
  ResponseProvider,
  ChatStatus,
  UseChatKitOptions,
  UseChatKitReturn,
  TrChatProps,
  WelcomeConfig,
  OpenAIProviderOptions,
  DeepSeekProviderOptions,
} from './types'
```

**TypeScript 类型扩展**（需在 `src/index.ts` 同目录或 `src/shims.d.ts` 中声明）：

```ts
// packages/chat/src/shims.d.ts
import type TrChatRoot from './components/TrChatRoot.vue'
import type TrChatHeader from './components/TrChatHeader.vue'
import type TrChatWelcome from './components/TrChatWelcome.vue'
import type TrChatMessageList from './components/TrChatMessageList.vue'
import type TrChatFooter from './components/TrChatFooter.vue'
import type TrChatSender from './components/TrChatSender.vue'
import type TrChatHistory from './components/TrChatHistory.vue'

declare module './components/TrChat.vue' {
  interface TrChatConstructor {
    Root: typeof TrChatRoot
    Header: typeof TrChatHeader
    Welcome: typeof TrChatWelcome
    MessageList: typeof TrChatMessageList
    Footer: typeof TrChatFooter
    Sender: typeof TrChatSender
    History: typeof TrChatHistory
  }
}
```


---

## Step 2 — CLI 工具（`packages/chat-cli/`，npm 包名 `create-tiny-robot`）

### Step 2.1 — `package.json`

```json
{
  "name": "create-tiny-robot",
  "version": "0.1.0",
  "type": "module",
  "bin": { "create-tiny-robot": "bin/index.js" },
  "files": ["bin", "templates", "scripts"],
  "dependencies": {
    "@clack/prompts": "^0.9.0",
    "picocolors": "^1.1.1"
  }
}
```

### Step 2.2 — `bin/index.js`

```js
#!/usr/bin/env node
import { intro, outro, text, select, confirm, spinner, isCancel, cancel } from '@clack/prompts'
import pc from 'picocolors'
import { copyFileSync, mkdirSync, readdirSync, statSync, renameSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, '../templates')

// coming soon 模板列表
const COMING_SOON = ['with-mcp', 'with-rag', 'with-context']

intro(pc.bgCyan(pc.black(' Create Tiny Robot App ')))

// 1. 项目名
const projectName = await text({
  message: 'Project name',
  placeholder: 'my-app',
  defaultValue: process.argv[2] || 'my-app',
})
if (isCancel(projectName)) { cancel('Cancelled.'); process.exit(0) }

// 2. 模板选择
const template = await select({
  message: 'Select a template',
  options: [
    { value: 'basic', label: 'Basic Chat Agent' },
    { value: 'with-mcp', label: 'Chat + MCP Tools', hint: 'coming soon' },
    { value: 'with-rag', label: 'Chat + RAG', hint: 'coming soon' },
    { value: 'with-context', label: 'Chat + Context Management', hint: 'coming soon' },
  ],
})
if (isCancel(template)) { cancel('Cancelled.'); process.exit(0) }
if (COMING_SOON.includes(template)) {
  cancel('This template is not available yet. Please select another.')
  process.exit(0)
}

// 3. API Provider
const provider = await select({
  message: 'Select API provider',
  options: [
    { value: 'openai', label: 'OpenAI' },
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'custom', label: 'Custom' },
  ],
})
if (isCancel(provider)) { cancel('Cancelled.'); process.exit(0) }

// 4. 安装依赖
const shouldInstall = await confirm({ message: 'Install dependencies?' })
if (isCancel(shouldInstall)) { cancel('Cancelled.'); process.exit(0) }

// 5. 复制模板
const targetDir = join(process.cwd(), projectName)
const s = spinner()
s.start('Scaffolding project...')

copyDir(join(TEMPLATES_DIR, template), targetDir)

// 重命名特殊文件
const renames = [['_gitignore', '.gitignore'], ['_env.example', '.env.example']]
for (const [from, to] of renames) {
  const src = join(targetDir, from)
  try { renameSync(src, join(targetDir, to)) } catch {}
}

// 写入 provider 选择到 App.vue（替换占位符）
patchProviderInApp(targetDir, provider)

s.stop('Project scaffolded.')

// 6. 安装依赖
if (shouldInstall) {
  const s2 = spinner()
  s2.start('Installing dependencies...')
  try {
    execSync('npm install', { cwd: targetDir, stdio: 'ignore' })
    s2.stop('Dependencies installed.')
  } catch {
    s2.stop(pc.yellow('Install failed. Run npm install manually.'))
  }
}

outro(pc.green('Done!') + `\n\n  Next steps:\n    cd ${projectName}\n    cp .env.example .env\n    npm run dev\n`)

// ===== 工具函数 =====
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true })
  for (const file of readdirSync(src)) {
    const srcPath = join(src, file)
    const destPath = join(dest, file)
    if (statSync(srcPath).isDirectory()) copyDir(srcPath, destPath)
    else copyFileSync(srcPath, destPath)
  }
}

function patchProviderInApp(dir, provider) {
  const appPath = join(dir, 'src/App.vue')
  try {
    let content = readFileSync(appPath, 'utf-8')
    content = content.replace('__PROVIDER__', provider)
    writeFileSync(appPath, content)
  } catch {}
}
```


### Step 2.3 — `templates/basic/src/App.vue`

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
import { TrChat, createOpenAIProvider, createDeepSeekProvider } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import '@opentiny/tiny-robot-chat/style'

// __PROVIDER__ 占位符由 CLI 在脚手架时替换为 openai / deepseek / custom
const responseProvider = '__PROVIDER__' === 'deepseek'
  ? createDeepSeekProvider({ apiKey: import.meta.env.VITE_API_KEY })
  : createOpenAIProvider({
      apiKey: import.meta.env.VITE_API_KEY,
      model: import.meta.env.VITE_MODEL || 'gpt-4o-mini',
      baseURL: import.meta.env.VITE_BASE_URL,
    })

const storage = localStorageStrategyFactory()

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

### Step 2.4 — `templates/basic/_env.example`

```
VITE_API_KEY=sk-your-api-key-here
VITE_MODEL=gpt-4o-mini
VITE_BASE_URL=https://api.openai.com/v1
```

### Step 2.5 — `scripts/update-versions.js`

```js
// 在 release CI 中运行，自动将 workspace 包的实际版本写入模板 package.json
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const packages = {
  '@opentiny/tiny-robot-chat': join(root, '../../chat/package.json'),
  '@opentiny/tiny-robot-kit': join(root, '../../kit/package.json'),
  '@opentiny/tiny-robot': join(root, '../../components/package.json'),
}

const versions = {}
for (const [name, pkgPath] of Object.entries(packages)) {
  const { version } = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  versions[name] = `^${version}`
}

// 更新所有模板的 package.json
const templatePkgPath = join(root, 'templates/basic/package.json')
const templatePkg = JSON.parse(readFileSync(templatePkgPath, 'utf-8'))
for (const [name, version] of Object.entries(versions)) {
  if (templatePkg.dependencies?.[name]) templatePkg.dependencies[name] = version
}
writeFileSync(templatePkgPath, JSON.stringify(templatePkg, null, 2) + '\n')
console.log('Template versions updated:', versions)
```


---

## Step 3 — 工程配置

### Step 3.1 — 根 `package.json` 补充脚本

在根 `package.json` 的 `scripts` 中追加：

```json
{
  "dev:chat": "pnpm -F @opentiny/tiny-robot-chat dev",
  "build:chat": "pnpm -F @opentiny/tiny-robot-chat build"
}
```

`build:deps` 脚本已通过 `-F @opentiny/tiny-robot-*` 通配符覆盖新包，无需额外修改。

### Step 3.2 — `pnpm-workspace.yaml`

已有 `packages/**` 通配符，`packages/chat/` 自动注册，无需修改。

---

## Less 使用规范

引入 Less 的唯一目的是**嵌套语法**，保持与 `packages/components/` 一致的技术栈。

**全局样式**（`src/styles/`）：`.css` 改为 `.less`，用 `&__element` 嵌套 BEM 子类。

**组件内样式**：`<style lang="less" scoped>`，同样用嵌套语法：

```vue
<style lang="less" scoped>
.tr-chat-drawer-overlay {
  // ...
  &.is-open { opacity: 1; }
}
</style>
```

**不使用 Less 变量**：主题定制通过 CSS 变量（`--chat-*`）在运行时覆盖，Less 变量是编译时固定的，两者职责不同，不混用。

**VueUse 评估结论**：当前实施方案逻辑已足够简单，无明显简化收益，不引入。`@vueuse/core` 已是 `packages/components/` 的依赖，`packages/chat/` 作为独立包不隐式依赖它。

---

## Step 4 — 风险处理备忘

| 风险 | 处理方案 |
|---|---|
| BubbleList slots 动态透传 | 实现后用 `content-footer`、`prefix`、`suffix` 等 slot 名写集成测试验证 |
| ChatStatus 四态推导 | `abort()` 后底层置 `aborted`，`useChatKit` 的 `status` computed 将其映射为 `ready`，无中间态 |
| `createOpenAIProvider` 浏览器端安全 | `templates/basic/README.md` 必须包含生产环境后端代理说明 |
| CLI `_gitignore` 重命名 | `bin/index.js` 中 `renameSync` 处理，失败时静默跳过（文件可能不存在） |
| TrChat 子组件挂载的 TS 类型 | `src/shims.d.ts` 中扩展 `TrChat` 类型，确保 `TrChat.Root` 等有正确类型提示 |
| `responseProvider` 签名差异 | 设计文档写的是 `ReadableStream<string>`，实际底层是 `AsyncGenerator<ChatCompletion>`；`createOpenAIProvider` 已按实际签名实现，`types.ts` 中 `ResponseProvider` 类型也已对齐实际签名 |
| 暗色模式变量名错误 | `--tr-color-border` 不存在，已修正为 `--tr-border-color-default`；`--chat-drawer-overlay-bg` 等硬编码值已在 `[data-tr-color-mode='dark']` 下覆盖 |

---

## 实施检查清单

```
Phase 1 - Step 1: packages/chat/
  ☐ 1.1  package.json + tsconfig.json + vite.config.ts
  ☐ 1.2  src/types.ts + src/context.ts
  ☐ 1.3  src/composables/useChatKit.ts
  ☐ 1.4  src/providers/openai.ts + deepseek.ts
  ☐ 1.5  src/styles/variables.less + layout.less + drawer.less + index.less
  ☐ 1.6  src/components/TrChatRoot.vue
  ☐ 1.7  src/components/TrChatHeader.vue
  ☐ 1.8  src/components/TrChatWelcome.vue
  ☐ 1.9  src/components/TrChatMessageList.vue
  ☐ 1.10 src/components/TrChatFooter.vue
  ☐ 1.11 src/components/TrChatSender.vue
  ☐ 1.12 src/components/TrChatHistory.vue
  ☐ 1.13 src/components/TrChat.vue
  ☐ 1.14 src/index.ts + src/shims.d.ts

Phase 1 - Step 2: packages/chat-cli/（npm 包名: create-tiny-robot）
  ☐ 2.1  package.json
  ☐ 2.2  bin/index.js
  ☐ 2.3  templates/basic/src/App.vue + main.ts + env.d.ts
  ☐ 2.4  templates/basic/_env.example + _gitignore + index.html + package.json + vite.config.ts + tsconfig.json + README.md
  ☐ 2.5  scripts/update-versions.js

Phase 1 - Step 3: 工程配置
  ☐ 3.1  根 package.json 补充 dev:chat / build:chat 脚本

Phase 1 - Step 4: 文档
  ☐ 4.1  docs/ 补充套件快速开始页
  ☐ 4.2  docs/ 补充 API 参考页
```
