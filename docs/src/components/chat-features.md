---
outline: [2, 3]
---

# Chat 配置与能力

这页是 `TrChat` 的配置与能力参考页。

如果你已经知道怎么把 chat 跑起来，但现在想回答下面这些问题，就该看这一页：

- 字段应该写在 `config`、顶层 `runtime`，还是 `presetOverrides`
- `models / providers / layout / shell / features` 分别负责什么
- `history / feedback / attachments / senderActions / mcp` 这些能力应该怎么配

## 什么时候看这页

适合：

- 已经能把 `TrChat` 跑起来
- 想查配置字段和能力开关
- 想区分“稳定默认值”和“页面级覆盖”

如果你还没开始接入，建议先看：

- [Chat 接入与入口](./chat.md)

如果你已经要做结构定制、运行时扩展或 MCP 接线，建议继续看：

- [Chat 定制与进阶](./chat-advanced.md)

## 先记住这 4 层

先把这 4 层分清楚，后面大多数配置判断都会简单很多：

| 层级 | 适合放什么 | 典型内容 |
| :-- | :-- | :-- |
| `config` | 稳定默认值 | `models`、`providers`、`defaults`、`ui`、`shell`、`layout`、`features` |
| 顶层 `runtime` | 页面实例对象 | `chatKit`、`plugins`、`storage`、`initialMessages`、`mcpManager`、`messageTransforms` |
| `config.integrations` | 配置驱动的少量集成默认输入 | 当前最常见是 `mcpManager` |
| `presetOverrides` | 页面级覆盖 | `contentLayout`、`showHistory`、`showFeedback`、`prompts`、`messageActions` |

一个简单记法：

- 稳定默认值放 `config`
- 页面实例对象放顶层 `runtime`
- 配置链路里的少量集成默认输入放 `config.integrations`
- 页面差异放 `presetOverrides`

## 配置总表

`TrChat` 常见配置字段可以先看这张总表：

| 字段 | 是否必填 | 主要解决什么问题 | 最常改的子项 |
| :-- | :-- | :-- | :-- |
| `models` | 是 | 当前有哪些模型可选 | `id`、`providerId`、`label`、`icon`、`disabled` |
| `providers` | 是 | 每个 provider 请求该发到哪里 | `endpoint`、`baseURL`、`headers`、`systemPrompt` |
| `defaults` | 否，但强烈推荐 | 默认模型和默认 system prompt | `model`、`systemPrompt` |
| `ui` | 否，但常用 | 品牌、欢迎区、prompts | `brand`、`welcome`、`prompts` |
| `appearance` | 否 | chat 子树的 light / dark / system 模式 | `mode` |
| `shell` | 否 | 普通 stacked 布局还是 workspace 壳层 | `variant`、`leftRegion`、`rightRegion`、`viewState` |
| `layout` | 否 | 消息区布局模式与角色 placement | `variant`、`placements`、`contentLayout` |
| `features` | 否 | 默认开启哪些 chat 能力 | `history`、`feedback`、`attachments`、`senderActions`、`welcomePrompts`、`mcp` |
| `config.integrations` | 否 | 给配置驱动链路补稳定集成默认输入 | `mcpManager` |

### `models`

`models` 解决的是“当前聊天页有哪些模型可以选”。

最小写法：

```ts
models: [
  {
    id: 'gpt-4o-mini',
    providerId: 'openai',
  },
]
```

最需要确认的两件事：

- `id` 会进入默认模型选择和请求体里的 `model`
- `providerId` 必须能在 `providers` 里找到同名 key

常见错误：

- `providerId` 指向了不存在的 provider
- `defaults.model` 指向了不存在的 `models[].id`

### `providers`

`providers` 解决的是“模型请求应该发到哪里，以及请求头和默认参数怎么带”。

最小写法：

```ts
providers: {
  openai: {
    type: 'openai-compatible',
    endpoint: '/api/chat/completions',
  },
}
```

当前最需要记住的约束：

- 当前只支持 `openai-compatible`
- `endpoint` 和 `baseURL` 至少要有一个
- 如果用了 `baseURL`，chat 包会自动拼接默认 `apiPath`

推荐接入方式：

- 前端请求自己的 `/api/chat/completions`
- 后端再代理真实 provider

### `defaults`

`defaults` 解决的是“页面启动时默认选哪个模型，以及默认 system prompt 是什么”。

常见写法：

```ts
defaults: {
  model: 'gpt-4o-mini',
  systemPrompt: 'You are a helpful assistant.',
}
```

建议：

- 第一次接入时，总是写上 `defaults.model`
- 不要完全依赖“自动取第一个模型”

### `ui`

`ui` 解决的是“默认页面展示什么品牌信息、欢迎文案和 prompts”。

常见写法：

```ts
ui: {
  brand: {
    title: 'TinyRobot Chat',
  },
  welcome: {
    title: '欢迎使用 Chat 套件',
    description: '先把页面跑起来，再按需要补功能。',
  },
  prompts: [
    { label: '快速上手', description: '如何接入 TrChat？' },
  ],
}
```

它直接影响：

- 顶部标题
- 欢迎区
- 首屏 prompts

### `appearance`

`appearance` 解决的是“chat 子树用哪种主题模式渲染”。

最常用写法：

```ts
appearance: {
  mode: 'light',
}
```

常见场景：

- 业务页把 chat 固定成浅色或深色
- 文档页做局部主题切换

### `shell`

`shell` 解决的是“chat 是普通堆叠布局，还是 workspace 壳层布局”。

最常见写法：

```ts
shell: {
  variant: 'workspace',
  leftRegion: {
    enabled: true,
    defaultOpen: true,
    collapseMode: 'rail',
  },
  rightRegion: {
    enabled: true,
    defaultOpen: false,
    collapseMode: 'hidden',
  },
}
```

最常见子项：

- `variant`
- `leftRegion`
- `rightRegion`
- `viewState`

如果你只是想替换 workspace 左右面板内容，通常不需要离开 `TrChat`，直接看进阶页里的 workspace slots 即可。

### `layout`

`layout` 解决的是“消息区应该怎么排，以及 assistant/user 的默认 placement 怎么放”。

常见写法：

```ts
layout: {
  variant: 'bubble',
  contentLayout: 'centered',
  placements: {
    assistant: 'start',
    user: 'end',
  },
}
```

最常见子项：

- `variant`
- `contentLayout`
- `placements`

如果你只是想切内容宽度，通常只需要先改 `contentLayout`。

### `features`

`features` 解决的是“默认打开哪些 chat 能力”。

它更像稳定默认能力层，不直接决定页面结构细节。

常见写法：

```ts
features: {
  history: true,
  feedback: true,
  attachments: true,
  senderActions: {
    enabled: true,
    wordCount: true,
  },
}
```

当前支持的主要能力：

- `history`
- `feedback`
- `attachments`
- `senderActions`
- `welcomePrompts`
- `mcp`

### `config.integrations`

`config.integrations` 是 **写在 config 里的集成默认输入**，而组件顶层的 `runtime` 是 **页面实例级运行时对象**。

当前常见用途比较少，主要是：

- 在 config 驱动链路里提供稳定的 `mcpManager`

第一次接入时，你可以先这样理解：

- 知道它存在
- 大多数情况下先不用它

## 综合能力示例

先用一个综合 playground 看能力切换，再回头查字段和边界：

<demo vue="../../demos/chat/features-playground.vue" :vueFiles="['../../demos/chat/features-playground.vue']" title="能力综合示例" description="在同一个页面里切换主题、history、feedback、senderActions 和 welcomePrompts，观察 config.features 与 presetOverrides 的配合方式。" />

## 常见能力怎么配

### `history`

控制默认历史入口与默认历史区域。

最常用写法：

- 稳定默认值：`config.features.history`
- 页面级覆盖：`presetOverrides.showHistory`
- 更高定制才考虑：`presetOverrides.historyProps`

一个重要现状：

- 当前实现里，如果你没有显式关闭，history 入口默认仍然会出现
- 明确关闭时，请显式写 `config.features.history = false` 或 `presetOverrides.showHistory = false`

继续阅读：

- [History 历史](./history.md)

### `feedback`

控制默认 assistant / user 消息反馈。

最常用写法：

- 稳定默认值：`config.features.feedback`
- 页面级覆盖：`presetOverrides.showFeedback`

继续阅读：

- [Feedback 气泡反馈](./feedback.md)

### `attachments`

控制聊天场景中的附件上传入口与附件列表。

最常用写法：

- 稳定默认值：`config.features.attachments`
- 页面级覆盖：`presetOverrides.attachmentsFeature`

当前边界：

- 默认 `attachments` 解决的是“上传入口 + 列表展示”
- 它不等于“附件会自动进入模型请求”

继续阅读：

- [Attachments 附件卡片](./attachments.md)
- [Sender 消息输入框](./sender.md)

### `senderActions`

控制默认发送区里那些“不属于消息正文”的扩展动作。

最常用写法：

- 稳定默认值：`config.features.senderActions`
- 页面级覆盖：`presetOverrides.senderActionsFeature`

继续阅读：

- [Sender 消息输入框](./sender.md)

### `welcomePrompts`

控制欢迎态里的 prompts。

最常用写法：

- 稳定默认值：`config.features.welcomePrompts`
- 页面级覆盖：`presetOverrides.prompts`

如果你只是想改欢迎区的渲染本身，继续用 `welcome` slot 就够了。

继续阅读：

- [Prompts 提示集](./prompts.md)
- [Chat 定制与进阶](./chat-advanced.md)

### `mcp`

控制 MCP manager 是否进入聊天场景，以及默认 MCP 能力是否开启。

先记一句话：

- 默认不用专门写 `config.features.mcp`
- 需要 MCP：传 `mcpManager`
- 明确不要 MCP：写 `config.features.mcp = false`

再看细一点：

- 顶层 `runtime.mcpManager` 决定当前页面有没有可用的 MCP 运行时
- `presetOverrides.mcpManager` 可以做页面级覆盖
- `config.features.mcp = false` 是更高优先级的显式关闭开关

继续阅读：

- [McpServerPicker 插件选择器](./mcp-server-picker.md)
- [Chat 定制与进阶](./chat-advanced.md)

## 优先级矩阵

当同一个能力同时出现在多个入口时，推荐按下面这张表理解：

| 层级 | 主要职责 | 典型场景 |
| :-- | :-- | :-- |
| `config` | 稳定默认值 | 多个页面长期共用同一份 chat 基础配置 |
| 顶层 `runtime` | 页面实例对象 | 当前页面的 `chatKit`、`plugins`、`storage`、`mcpManager` |
| `config.integrations` | 配置链路里的少量集成默认输入 | 在配置驱动链路里补充 `mcpManager` |
| `presetOverrides` | 页面级覆盖 | 同一份基础配置在不同页面有轻微差异 |
| `slots` | 结构和渲染替换 | 默认页面结构已经不够用 |

一条实用规则：

- 能放进 `config` 的，先不要放到 `presetOverrides`
- 能靠 `presetOverrides` 解决的，先不要拆结构

## 容易混淆的边界

### `config.integrations` vs 顶层 `runtime`

区别很明确：

- `config.integrations`
  - 配置链路里的稳定集成默认输入
- 顶层 `runtime`
  - 当前页面实例级对象

大多数场景下，优先理解和使用的是组件顶层这个：

```vue
<TrChat :config="chatConfig" :runtime="runtime" />
```

### `features` vs `presetOverrides`

推荐记法：

- `features`
  - 负责稳定默认能力
- `presetOverrides`
  - 负责当前页面差异

比如：

```ts
const chatConfig = {
  features: {
    feedback: true,
  },
}

const presetOverrides = {
  showFeedback: false,
}
```

这表示：

- 整体场景默认有 feedback
- 当前这个页面临时关掉

### `shell` vs `layout`

可以这样理解：

- `shell`
  - 解决页面外壳
  - 决定 stacked 还是 workspace
- `layout`
  - 解决消息主区排布
  - 决定内容宽度、角色 placement、消息列表变体

### 哪些能力不属于 `features`

下面这些能力经常会和 feature 一起被提到，但它们不属于 `config.features`：

- `messageActions`
- `bubbleRenderers`
- `messageTransforms`
- `chatKit.runtime`

这些能力都应该继续去看：

- [Chat 定制与进阶](./chat-advanced.md)

## 常见错误

最常见的几个问题：

- `providerId` 写了一个 `providers` 里不存在的 key
- `defaults.model` 指向了一个不存在的 `models[].id`
- 页面里完全没看到模型选择器
  - 先检查模型数量
  - 再检查 `defaults.model`
  - 再检查 footer 是否被替换掉了
- 以为 `attachments` 开启后附件会自动入模
  - 当前默认只负责上传入口和列表展示
- 写了 `config.features.mcp = false`，但又期待 `runtime.mcpManager` 生效
  - 显式关闭时，默认 MCP 能力不会接入

## 继续阅读

- [Chat 接入与入口](./chat.md)
- [Chat 定制与进阶](./chat-advanced.md)
