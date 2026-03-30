---
outline: deep
---

# Chat 黑盒配置

这页聚焦 `TrChat` 的黑盒入口 contract。

> 本页里的 demo 全部接入本地 mock responseProvider，用来演示配置层行为；生产接入时再替换成你自己的服务端代理接口。

如果你的目标是：

- 用最少代码跑起完整聊天页
- 让模型、provider、欢迎区、workspace shell、layout、features 都由配置驱动
- 在不拆开默认页面结构的前提下做少量行为和 UI 覆盖

那么你主要会接触这四层：

```ts
config + runtime + callbacks + presetOverrides
```

## `TrChat` 的正式入口

`TrChat` 当前公开 props 很少，但边界很明确：

| 字段 | 作用 | 适合放什么 |
| :-- | :-- | :-- |
| `config` | 静态配置层 | 模型、provider、UI、shell、layout、features |
| `runtime` | 运行时注入层 | `chatKit`、`plugins`、`storage`、`initialMessages`、`mcpManager`、`selectedModel` |
| `callbacks` | 行为回调层 | `onFinish`、`onError`、`onMessageAction`、`onModelChange` |
| `presetOverrides` | 默认装配覆盖层 | `shell`、`contentLayout`、`placeholder`、`showHistory`、`showFeedback`、局部渲染覆盖 |

## 最小配置

最小可用配置通常只需要模型和 provider，对应示例已经拆到独立 demo 文件：

<demo vue="../../demos/chat/minimal.vue" title="最小配置" description="使用最少的 config 字段接入 TrChat，并通过本地 mock runtime 保持示例可交互。" />

## `config`：静态配置层

### 顶层结构

`ChatConfig` 当前主要围绕这些顶层字段组织：

```ts
const chatConfig = {
  models: [],
  providers: {},
  defaults: {},
  appearance: {},
  shell: {},
  ui: {},
  layout: {},
  features: {},
  runtime: {},
}
```

### `models`

用于声明可选模型列表。

当前常用字段：

- `id`
- `providerId`
- `label`
- `disabled`

示例：

```ts
models: [
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', providerId: 'openai' },
  { id: 'deepseek-chat', label: 'DeepSeek Chat', providerId: 'deepseek' },
]
```

注意：

- 当前正式字段是 `providerId`
- 不再建议在文档或示例里继续使用旧的 `provider`

### `providers`

当前黑盒配置主要面向 `openai-compatible` provider。

常用字段：

- `type`
- `endpoint`
- `baseURL`
- `apiPath`
- `headers`
- `credentials`
- `systemPrompt`
- `temperature`
- `maxTokens`

最常见的做法是让前端请求你自己的 `/api/chat`，由服务端代理真实 provider。

### `defaults`

当前常用字段：

- `model`
- `systemPrompt`

其中：

- `defaults.model` 用来指定默认模型
- `defaults.systemPrompt` 会作为默认 provider 请求体里的 system message

### `appearance`

用于声明场景外观。

当前常用字段：

- `mode: 'light' | 'dark' | 'system'`

### `shell`

用于声明页面级 shell 结构。

这是当前黑盒里很重要的一层，不需要进入白盒才能使用。

常用字段：

- `variant: 'stacked' | 'workspace'`
- `leftRegion`
- `rightRegion`
- `viewState`

适合放：

- workspace 布局开关
- 左右区域宽度
- 左右区域默认开关
- 区域折叠模式

### `ui`

用于声明默认文案与欢迎区内容。

常见结构：

```ts
ui: {
  brand: {
    title: 'TinyRobot Chat',
  },
  welcome: {
    title: '欢迎使用 Chat',
    description: '几行代码即可获得完整对话 UI',
  },
  prompts: [
    { label: '解释 React hooks', description: '解释 React hooks' },
  ],
}
```

适合放：

- 品牌标题
- 欢迎区标题与描述
- 默认 prompts

### `layout`

用于声明聊天内容区的默认展示方式。

当前常用字段：

- `variant`
- `placements`
- `contentLayout`

可选 `variant`：

- `bubble`
- `docs`
- `workspace`

`placements` 允许分别覆盖：

- `assistant`
- `user`

`contentLayout` 用于声明聊天内容区域是：

- `centered`
- `wide`

示例：

```ts
layout: {
  variant: 'docs',
  contentLayout: 'centered',
  placements: {
    assistant: 'start',
    user: 'end',
  },
}
```

推荐用法：

- `centered`：默认阅读型布局
- `wide`：默认宽布局，内容区尽量占满当前聊天容器

### `features`

用于打开聊天场景的内建能力。

当前建议优先关注：

- `attachments`
- `senderActions`
- `welcomePrompts`
- `history`
- `feedback`
- `mcp`

完整能力矩阵见：[Chat Features](./chat-features.md)

### `config.runtime`

`config.runtime` 适合放那些虽然属于运行时，但仍可以被静态声明并进入配置归一化链的字段。

当前最典型的是：

- `mcpManager`

如果对象需要在页面 setup 中动态创建，优先通过 `TrChat.runtime` 传入，而不是继续塞进 `config.runtime`。

## 当前模型切换主链

当前实际链路是：

```text
config.models
  + config.defaults.model
  + runtime.selectedModel
  + callbacks.onModelChange
```

建议这样理解：

- `config.models`：声明有哪些模型可选
- `config.defaults.model`：声明默认选择谁
- `runtime.selectedModel`：在页面实例层指定初始选中模型
- `callbacks.onModelChange`：监听模型切换行为

当前不建议再把这些旧说法当成主链口径：

- `presetOverrides.defaultModel`
- `providerFactories`

## `runtime`：运行时注入层

`runtime` 适合放不能仅靠静态配置描述的对象。

当前支持：

| 字段 | 说明 |
| :-- | :-- |
| `chatKit` | 直接复用现成聊天运行时 |
| `plugins` | 注入消息插件 |
| `storage` | 注入会话存储策略 |
| `initialMessages` | 注入初始消息 |
| `mcpManager` | 注入 MCP manager |
| `selectedModel` | 指定当前页面实例的初始选中模型 |

示例：

<demo vue="../../demos/chat/runtime.vue" title="runtime 注入" description="通过 runtime 注入 chatKit，并用 runtime.selectedModel 指定页面实例的初始模型。" />

### `config.runtime` vs `TrChat.runtime`

这两个名字很像，但不是同一层。

| 层级 | 入口 | 当前更适合放什么 |
| :-- | :-- | :-- |
| 配置层 | `ChatConfig.runtime` | 能被静态声明并进入配置归一化链的运行时字段，当前最典型的是 `mcpManager` |
| 组件实例层 | `TrChat.runtime` | 页面 setup 中动态创建的运行时对象，例如 `chatKit`、`plugins`、`storage`、`initialMessages`、`selectedModel` |

可以简单理解为：

- `ChatConfig.runtime` 属于配置文件的一部分
- `TrChat.runtime` 属于具体页面实例的运行时注入层

## `callbacks`：行为回调层

当前支持：

| 字段 | 触发时机 |
| :-- | :-- |
| `onFinish` | assistant 消息完成时 |
| `onError` | 请求或 provider 报错时 |
| `onMessageAction` | 消息操作被点击时 |
| `onModelChange` | 模型切换时 |

示例：

<demo vue="../../demos/chat/callbacks.vue" title="callbacks 行为回调" description="发送消息和切换模型后，会把 onFinish 与 onModelChange 的结果记录到页面日志中。" />

## `presetOverrides`：默认装配覆盖层

这层不是重新定义整套 `TrChat`，而是对默认 preset 做页面级轻量覆盖。

### 常见 UI 覆盖

| 字段 | 作用 |
| :-- | :-- |
| `appearance` | 覆盖颜色模式 |
| `shell` | 覆盖页面 shell 布局 |
| `brand` | 覆盖品牌标题 |
| `welcome` | 覆盖欢迎区 |
| `prompts` | 覆盖欢迎 prompts |
| `messages` | 覆盖内置文案 |

### 常见交互覆盖

| 字段 | 作用 |
| :-- | :-- |
| `placeholder` | 覆盖发送框占位文案 |
| `maxLength` | 覆盖最大输入长度 |
| `senderMode` | 控制单行 / 多行输入 |
| `autoScroll` | 覆盖消息列表自动滚动 |

### 常见场景覆盖

| 字段 | 作用 |
| :-- | :-- |
| `messageListVariant` | 覆盖消息列表变体 |
| `contentLayout` | 覆盖内容区域布局模式 |
| `showHistory` | 开关历史入口与默认历史装配 |
| `showFeedback` | 开关默认反馈装配 |
| `show` | 控制整套 chat 是否显示 |

### 常见渲染覆盖

| 字段 | 作用 |
| :-- | :-- |
| `roleConfigs` | 覆盖 assistant / user 的气泡展示配置 |
| `groupStrategy` | 覆盖消息分组策略 |
| `senderProps` | 透传到底层 `TrChat.Sender` |
| `bubbleListProps` | 透传到底层 `TrChat.MessageList` |
| `historyProps` | 透传默认历史区域相关 props |

### 常见 feature / runtime 覆盖

| 字段 | 作用 |
| :-- | :-- |
| `mcpManager` | 覆盖或注入 MCP manager |
| `attachmentsManager` | 注入附件 manager |
| `attachmentsFeature` | 覆盖附件 feature preset |
| `senderActionsFeature` | 覆盖 sender actions feature preset |
| `onMessageAction` | 覆盖消息操作回调 |
| `onModelChange` | 覆盖模型切换回调 |

`presetOverrides.contentLayout` 更适合页面级、响应式的布局切换。

例如：

<demo vue="../../demos/chat/preset-overrides.vue" title="presetOverrides 覆盖" description="在不改基础 config 的前提下，按页面需要覆盖 contentLayout、history、feedback 和 sender actions。" />

简单规则：

- `config.layout.contentLayout`：声明场景默认布局
- `presetOverrides.contentLayout`：做页面级、交互级或响应式覆盖

## 历史能力的默认行为

当前默认装配里：

- 如果你没有显式配置 `features.history`
- 历史入口和默认历史装配仍会默认开启

如果你要关闭它，显式设置以下任一方式即可：

- `config.features.history = false`
- `presetOverrides.showHistory = false`

## 推荐的覆盖顺序

建议按下面顺序思考：

1. 先用 `config` 声明稳定默认值
2. 再用 `runtime` 注入页面实例级运行时对象
3. 用 `callbacks` 接行为
4. 最后用 `presetOverrides` 做页面级轻量覆盖

只有当你发现“默认页面结构本身不合适”时，再进入：

- [Chat Slots 与渲染定制](./chat-slots.md)
- [Chat Scaffold 与 Root](./chat-scaffold.md)

## 推荐接入习惯

- 先把 `TrChat` 跑通，再决定是否真的需要进入更底层 surface
- 局部定制优先试 `presetOverrides` 和 slots，而不是一上来拆成白盒
- 如果你要做 workspace 布局，优先先看 `config.shell` / `presetOverrides.shell`
- 如果你的模型切换不生效，优先检查：
  - `config.models`
  - `config.defaults.model`
  - `runtime.selectedModel`
  - `callbacks.onModelChange`
