# Chat 组件重构方案

## 背景

`packages/chat/demo` 中的白盒组件是基于某个阶段手动搭建的模板，功能已超前于 `packages/chat/src` 的现有实现。目标是将 demo 白盒中的通用能力抽取到 src，使黑盒（`TrChat`）和白盒（`TrChat.*`）功能对等，同时降低用户的开发成本，做到开箱即用、自由组装。

---

## 核心原则

- 黑盒是白盒的语法糖，不是两套独立实现
- 黑盒通过 props 控制功能开关，内部直接复用白盒子组件
- 用户配置优先级永远高于默认配置
- 减少用户的样板代码，composable 提供合理默认值

---

## 一、目录结构变更

```
packages/chat/src/
├── components/
│   ├── render/                        ← 新增目录，内置渲染器
│   │   ├── MarkStreamRenderer.vue     ← 从 demo 迁入（markstream-vue 作为 peerDep）
│   │   ├── ErrorRenderer.vue          ← 从 demo 迁入
│   │   ├── EditInputRenderer.vue      ← 从 demo 迁入，简化依赖 chatKit.editMessage
│   │   ├── ToolCallsRenderer.vue      ← 从 demo 迁入，作为可选模块导出
│   │   ├── ToolCallRenderer.vue       ← 同上
│   │   ├── AttachmentsRenderer.vue    ← 从 demo 迁入
│   │   └── index.ts
│   ├── TrModelSelector.vue            ← 改造，支持 providerFactories
│   ├── TrChatMcpPanel.vue             ← 新增，从 demo McpPanel 迁入（薄封装）
│   └── ...existing
├── composables/
│   ├── useChatKit.ts                  ← 新增 editMessage API
│   ├── useDefaultBubbleConfig.ts      ← 新增，提供默认 renderer 配置
│   ├── useMcpManager.ts               ← 从 demo 迁入
│   └── ...existing
└── types.ts                           ← 新增 ModelOption、ModelProviderFactory 类型
```

---

## 二、TrModelSelector 改造

### 问题

- 当前 `models` prop 为 `string[]`，只传模型 ID
- 模型切换后需要用户手动调用 `chatKit.updateResponseProvider()`，样板代码多
- 大量模型时若每个模型对应一个 provider 实例，传参臃肿且重复创建浪费

### 方案：provider 工厂函数 + 模型分组

新增类型：

```ts
interface ModelOption {
  value: string               // 模型 ID
  label?: string              // 显示名称，fallback 到 value
  provider?: string           // 用于图标匹配，如 'openai' | 'deepseek'
  disabled?: boolean
}

interface ModelProviderFactory {
  match: (model: ModelOption) => boolean          // 匹配规则
  createProvider: (model: ModelOption) => ResponseProvider  // 按需创建，内部可缓存
}
```

用法示例：

```ts
<TrModelSelector
  v-model="model"
  :models="[
    { value: 'gpt-4o',        label: 'GPT-4o',       provider: 'openai' },
    { value: 'gpt-4o-mini',   label: 'GPT-4o Mini',  provider: 'openai' },
    { value: 'deepseek-chat',                         provider: 'deepseek' },
    { value: 'deepseek-reasoner',                     provider: 'deepseek' },
  ]"
  :provider-factories="[
    {
      match: (m) => m.provider === 'openai',
      createProvider: (m) => createOpenAIProvider({ apiKey, model: m.value }),
    },
    {
      match: (m) => m.provider === 'deepseek',
      createProvider: (m) => createDeepSeekProvider({ apiKey: dsKey, model: m.value }),
    },
  ]"
/>
```

### 内部逻辑

```ts
const chatKit = inject(CHAT_KIT_KEY, null)  // 可选 inject，不强依赖

function handleSelectModel(model: ModelOption) {
  currentModel.value = model.value

  if (chatKit && props.providerFactories?.length) {
    const factory = props.providerFactories.find(f => f.match(model))
    if (factory) {
      chatKit.updateResponseProvider(factory.createProvider(model))
    }
  }

  isOpen.value = false
  // emit 作为补充通知，供外层做埋点、清空消息等额外业务逻辑
  emit('change', model)
}
```

> inject 可选：TrModelSelector 在没有 TrChatRoot 包裹的场景下也能独立使用，只是不做 provider 联动。

---

## 三、useDefaultBubbleConfig 新增

### 问题

白盒用户需要自己：
1. 引入 `BubbleProvider`
2. 手写 `boxRendererMatches` 和 `contentRendererMatches`
3. 手写 `roles` 配置

开发成本高，且容易遗漏内置能力。

### 方案：优先级注册表 + 覆盖选项

```ts
export function useDefaultBubbleConfig(options?: {
  extraContentMatches?: BubbleContentRendererMatch[]
  extraBoxMatches?: BubbleBoxRendererMatch[]
  overrideRoles?: Record<string, BubbleRoleConfig>
}) {
  const contentMatches: BubbleContentRendererMatch[] = [
    { priority: 100, find: isError,       renderer: markRaw(ErrorRenderer) },
    { priority: 90,  find: isEditing,     renderer: markRaw(EditInputRenderer) },
    { priority: 80,  find: hasToolCalls,  renderer: markRaw(ToolCallsRenderer) },
    { priority: 70,  find: isAttachment,  renderer: markRaw(AttachmentsRenderer) },
    ...(options?.extraContentMatches ?? []),
  ]

  const boxMatches: BubbleBoxRendererMatch[] = [
    {
      find: (msgs) => msgs.length === 1 && msgs[0].state?.isEditing,
      renderer: BubbleRenderers.Box,
      priority: BubbleRendererMatchPriority.NORMAL,
      attributes: { 'data-editing': 'true', 'data-shape': 'none' },
    },
    {
      find: (_, content) => content?.type === 'attachment',
      renderer: BubbleRenderers.Box,
      attributes: { 'data-box-type': 'none', 'data-shape': 'none' },
    },
    ...(options?.extraBoxMatches ?? []),
  ]

  const roles: Record<string, BubbleRoleConfig> = {
    assistant: {
      placement: 'start',
      fallbackContentRenderer: MarkStreamRenderer,  // 默认 Markdown 渲染
    },
    user:   { placement: 'end' },
    system: { hidden: true },
    ...options?.overrideRoles,
  }

  return { contentMatches, boxMatches, roles }
}
```

### 扩展方式

后续新增 renderer 只需：
1. 在 `src/components/render/` 下新建组件
2. 在 `useDefaultBubbleConfig` 里加一行 `find` + `renderer`，定好 priority
3. 用户通过 `extraContentMatches` 传入更高 priority 的规则可覆盖内置行为

### 黑盒中的合并策略

黑盒 `TrChat` 内部使用 `useDefaultBubbleConfig` 作为基础层，用户传入的 `roleConfigs` 和 `bubbleListProps` 做深合并，优先级：**用户配置 > 默认配置**。

---

## 四、useChatKit 新增 editMessage API

### 问题

`EditInputRenderer` 中直接操作 `chatKit.messages.value.splice`，属于底层操作暴露，不安全也不语义化。

### 方案

```ts
// useChatKit 新增
function editMessage(messageIndex: number, newContent: string): void {
  const msgs = messages.value
  if (messageIndex < 0 || messageIndex >= msgs.length) return

  // 删除该消息及之后的所有消息
  msgs.splice(messageIndex)

  // 重新发送编辑后的内容，触发 AI 回复
  sendMessage(newContent)
}
```

`EditInputRenderer` 改为调用 `chatKit.editMessage(index, content)`，不再直接操作消息数组。

---

## 五、MCP 能力迁入 chat 包

### 迁入内容

| 来源 | 目标 | 说明 |
|------|------|------|
| `demo/composables/useMcpManager.ts` | `src/composables/useMcpManager.ts` | 管理已安装插件、派生 getTools/callTool |
| `demo/components/McpPanel.vue` | `src/components/TrChatMcpPanel.vue` | 薄封装 TrMcpServerPicker，用户只关心数据源 |

### 依赖链

```
TrChatMcpPanel
  └── TrMcpServerPicker (@opentiny/tiny-robot)  ← 合理，chat 包本就依赖 tiny-robot
```

用户只需传入 `mcpPlugins` 数据，具体交互和流程由组件内部处理。

---

## 六、黑盒 TrChat 新增 Props

```ts
interface TrChatProps {
  // ...existing props

  // 模型选择
  models?: ModelOption[]
  defaultModel?: string
  providerFactories?: ModelProviderFactory[]

  // 附件上传
  enableAttachments?: boolean
  acceptFileTypes?: string          // 默认 '*'

  // MCP
  enableMcp?: boolean
  mcpPlugins?: PluginInfo[]

  // 消息编辑
  enableEdit?: boolean              // 控制 Feedback 里是否显示编辑按钮
}
```

黑盒内部结构：

```
TrChat (黑盒)
  └── TrChatRoot
      ├── TrChat.Header
      ├── BubbleProvider (内置 useDefaultBubbleConfig)
      │   └── TrChat.MessageList
      ├── TrChat.Footer
      │   ├── TrChat.Sender
      │   │   ├── TrModelSelector     (models prop 存在时渲染)
      │   │   └── UploadButton        (enableAttachments 时渲染)
      │   └── MCP 按钮               (enableMcp 时渲染)
      ├── TrChat.History
      └── TrChatMcpPanel             (enableMcp 时渲染)
```

---

## 七、导出变更

新增导出项：

```ts
// composables
export { useDefaultBubbleConfig } from './composables/useDefaultBubbleConfig'
export { useMcpManager } from './composables/useMcpManager'

// render 组件（按需导入）
export { MarkStreamRenderer } from './components/render'
export { ErrorRenderer } from './components/render'
export { EditInputRenderer } from './components/render'
export { ToolCallsRenderer, ToolCallRenderer } from './components/render'
export { AttachmentsRenderer } from './components/render'

// 新组件
export { default as TrChatMcpPanel } from './components/TrChatMcpPanel.vue'

// 新类型
export type { ModelOption, ModelProviderFactory } from './types'
```

---

## 八、实施优先级

| 优先级 | 内容 | 原因 |
|--------|------|------|
| P0 | `useDefaultBubbleConfig` + render 组件迁入 | 白盒开箱即用的基础 |
| P0 | `useChatKit.editMessage` API | EditInputRenderer 依赖 |
| P1 | `TrModelSelector` 改造 | 影响模型切换体验 |
| P1 | `useMcpManager` + `TrChatMcpPanel` 迁入 | MCP 能力进包 |
| P2 | 黑盒 `TrChat` 新增 props | 黑白盒功能对等 |

## 九、扩展：

### 上下文：
packages\chat\demo：
这个是我手动搭建的模版

packages\chat\src：
这个是预期要实现的 chat 组件搭建


这个是预期要实现的 chat 组件搭建，现在已知 demo 项目中的 白盒组件是基于某个阶段搭建的项目。
但是现在的 chat 组件模板是落后的。现在你需要帮我对比一下，分析一下 demo 中白盒插件哪部分应该抽取为模板的基本组件。
哪部分应该在 chat 中继续进行优化。比如 TrModelSelector 中的数据格式应该如何优化。


现在需要你帮我检视一下，应该如何抽取对应的组件到 chat 中，便于后期的复用。
尽量做到黑盒和白盒组件的功能效果相同，目前的白盒组件并不能做到开箱即用，自由组装，现在还需要很多配置；

### 实现路线

对，这个模式叫 Compound Component Pattern，是组件库设计的最佳实践之一。

核心思路就是：

白盒子组件（TrChat.Root、TrChat.Header、TrChat.Sender 等）是原子单元，各自职责单一
黑盒 TrChat 是这些原子单元的组装层，通过 props 控制哪些子组件渲染、怎么渲染
两者共享同一套底层实现，不存在重复代码。

这个模式的好处很明显：

白盒用户有完全的控制权，可以插入自定义逻辑
黑盒用户零配置开箱即用
维护成本低，功能只写一次，不会漂移
测试也更容易，子组件可以独立测试

TrChat.* 的命名方式也和业界保持一致。
唯一需要注意的是，黑盒里不要出现任何白盒子组件里没有的逻辑，一旦出现就说明有能力没有下沉到子组件层，后续白盒用户就无法复用了。