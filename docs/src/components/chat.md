---
outline: deep
---

# Chat 快速接入

`@opentiny/tiny-robot-chat` 的主入口是 `TrChat`。

先把 `TrChat` 用起来，再按需要补功能和定制，大多数业务页面走到这一步就够了。

> 本页示例统一请求 `/api/chat/completions`。在文档站内，service worker 会接管这个请求并返回 mock 响应；接入业务时，请替换成你自己的服务端 API。

## 先从这里开始

适合：

- 第一次接入 `@opentiny/tiny-robot-chat`
- 想先用 `TrChat` 跑通一个可用聊天页
- 主要关心页面怎么用，而不是内部实现怎么组织

推荐阅读顺序：

1. 先用 `TrChat + config` 跑起来
2. 页面有轻微差异时，用 `presetOverrides`
3. 只改局部 UI 时，用插槽（slots）
4. 只有 `TrChat` 已经不够用时，再继续了解 `Scaffold` 或 `Root`

<demo vue="../../demos/chat/blackbox.vue" :vueFiles="['../../demos/chat/blackbox.vue']" title="默认接入" description="使用 TrChat 直接接入完整聊天页。" />

## 先看这 4 个入口

大多数场景里，你只需要先理解这 4 个输入项：

| 字段 | 适合放什么 | 什么时候最常用 |
| :-- | :-- | :-- |
| `config` | 模型、provider、UI、layout、features 等稳定默认值 | 场景默认值、长期保留的配置 |
| `runtime` | `chatKit`、`plugins`、`storage`、`initialMessages`、`mcpManager`、`selectedModel`、`messageTransforms` 等实例级对象 | 页面实例级依赖、运行时对象、消息改写 |
| `callbacks` | `onFinish`、`onError`、`onMessageAction`、`onModelChange` 等行为回调 | 接日志、埋点、错误处理、业务联动 |
| `presetOverrides` | `contentLayout`、`showHistory`、`showFeedback`、`placeholder`、`messageActions`、`bubbleRenderers` 等页面级覆盖 | 同一份基础配置在不同页面有轻微差异，或只想扩展某类消息行为 |

### `config`

`config` 负责声明稳定默认值。

先记住 3 条规则：

- 必填项其实只有 `models` 和 `providers`
- 第一次接入通常先配好 `models / providers / defaults / ui`
- `config.runtime` 和组件顶层 `runtime` 不是一回事；前者属于配置里的稳定默认输入，后者属于页面实例级运行时对象

第一次接入时，通常先看这几块就够了：

| 字段 | 作用 |
| :-- | :-- |
| `models` | 声明可选模型列表 |
| `providers` | 声明 provider 接口配置 |
| `defaults` | 声明默认模型与默认 system prompt |
| `ui / shell / layout / features` | 声明页面默认外观、布局和能力开关 |

如果你只是想先跑通页面，推荐先从一个“最小可运行配置”开始，而不是先记空壳结构：

```ts
const chatConfig = {
  models: [
    {
      id: 'gpt-4o-mini',
      providerId: 'openai',
      label: 'GPT-4o Mini',
    },
  ],
  providers: {
    openai: {
      type: 'openai-compatible',
      endpoint: '/api/chat/completions',
    },
  },
  defaults: {
    model: 'gpt-4o-mini',
  },
  ui: {
    brand: {
      title: 'TinyRobot Chat',
    },
    welcome: {
      title: '欢迎使用 Chat 套件',
      description: '先把最小配置跑通，再按页面需要补 layout、features 和局部定制。',
    },
  },
}
```

在这个基础上，再按需要逐步补：

- `appearance`
- `shell`
- `layout`
- `features`
- `config.runtime`

### `config` 顶层字段详解

| 字段 | 是否必填 | 主要解决什么问题 | 最常改的子项 | 第一次接入是否必须理解 |
| :-- | :-- | :-- | :-- | :-- |
| `models` | 是 | 告诉 chat 当前有哪些模型可选 | `id`、`providerId`、`label`、`disabled` | 是 |
| `providers` | 是 | 告诉 chat 每个 provider 该往哪里发请求 | `endpoint`、`baseURL`、`headers`、`systemPrompt` | 是 |
| `defaults` | 否，但强烈推荐 | 指定默认模型和默认 system prompt | `model`、`systemPrompt` | 是 |
| `appearance` | 否 | 指定 chat 的外观模式 | `mode` | 否 |
| `shell` | 否 | 指定是否启用 workspace 壳层，以及左右区域行为 | `variant`、`leftRegion`、`rightRegion`、`viewState` | 否 |
| `ui` | 否，但常用 | 指定品牌、欢迎区和 prompts | `brand`、`welcome`、`prompts` | 是 |
| `layout` | 否 | 指定消息区布局模式和角色 placement | `variant`、`placements`、`contentLayout` | 否 |
| `features` | 否 | 打开/关闭 history、feedback、attachments、senderActions 等默认能力 | `history`、`feedback`、`attachments`、`senderActions`、`welcomePrompts`、`mcp` | 先知道有这层即可 |
| `config.runtime` | 否 | 给 config 驱动链路补稳定运行时默认输入 | 当前常见是 `mcpManager` | 否 |

### `models`

`models` 解决的是“这个聊天页有哪些模型可以选”。

最小写法：

```ts
models: [
  {
    id: 'gpt-4o-mini',
    providerId: 'openai',
  },
]
```

你最需要搞清楚的只有两件事：

- `id` 是模型值，会进入默认模型选择和请求体里的 `model`
- `providerId` 必须能在 `providers` 里找到同名 key

常见补充项：

- `label`
  - 给模型选择器展示友好文案
- `disabled`
  - 让模型保留在列表里，但不能被选中

常见错误：

- `providerId` 写了一个 `providers` 里不存在的 key
- `defaults.model` 指向了一个不存在的 `models[].id`

### `providers`

`providers` 解决的是“模型请求应该发到哪里，以及请求头/默认 systemPrompt 怎么带”。

最小写法：

```ts
providers: {
  openai: {
    type: 'openai-compatible',
    endpoint: '/api/chat/completions',
  },
}
```

当前最需要记住的约束是：

- 当前只支持 `openai-compatible`
- `endpoint` 和 `baseURL` 至少要有一个
- 如果用了 `baseURL`，chat 包会自动拼接默认 `apiPath`

常见补充项：

- `headers`
  - 透传鉴权头或自定义 header
- `systemPrompt`
  - provider 级 system prompt
- `temperature`
  - 默认采样参数
- `maxTokens`
  - 默认输出 token 上限

推荐接入方式：

- 前端请求自己的 `/api/chat/completions`
- 后端再代理真实 provider

### `defaults`

`defaults` 解决的是“页面启动时应该默认选哪个模型，以及默认 system prompt 是什么”。

常见写法：

```ts
defaults: {
  model: 'gpt-4o-mini',
  systemPrompt: 'You are a helpful assistant.',
}
```

它的边界是：

- `model`
  - 必须命中 `models[].id`
- `systemPrompt`
  - 是配置级默认值；provider 自己如果也写了 `systemPrompt`，会优先用 provider 级配置

第一次接入时，推荐总是把 `defaults.model` 写上，不要完全依赖“取第一个模型”。

### `appearance`

`appearance` 解决的是“chat 子树当前用 light / dark / system 哪种模式渲染”。

当前最常用的是：

```ts
appearance: {
  mode: 'light',
}
```

适合：

- 业务页想把 chat 固定成浅色或深色
- 文档页里想做局部主题切换

如果你现在只是跑通一个聊天页，这块通常可以先不配。

### `shell`

`shell` 解决的是“这个 chat 是普通堆叠布局，还是 workspace 壳层布局”。

当前最常见的开法是：

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

你可以把它理解成页面外壳配置：

- `variant`
  - `stacked` 或 `workspace`
- `leftRegion / rightRegion`
  - 左右区域是否启用、默认开合、折叠方式、宽度
- `viewState`
  - 页面视图状态相关配置

如果你只想替换 workspace 左右面板内容，继续直接使用 `TrChat`，配合 `left / right / mobile-left / mobile-right` 这些 slot 就够了，不一定要先自己重组整页。

### `ui`

`ui` 解决的是“默认页面应该展示什么品牌信息、欢迎文案和 prompts”。

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

这块通常是第一次接入时最值得先配的部分，因为它直接决定：

- 顶部标题
- 空状态欢迎区
- 首屏 prompts

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

当前最常见的几个子项：

- `variant`
  - `bubble` / `docs` / `workspace`
- `contentLayout`
  - `centered` / `wide`
- `placements`
  - assistant/user 的 placement

如果你只是想切内容宽度，通常只需要改 `contentLayout`。

### `features`

`features` 解决的是“默认打开哪些 chat 能力”。

它更偏“能力开关层”，不直接决定页面细节。

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

当前支持的主要能力包括：

- `history`
- `feedback`
- `attachments`
- `senderActions`
- `welcomePrompts`
- `mcp`

这块的详细说明已经拆到：

- [Chat 功能配置](./chat-features.md)

在 `chat.md` 这里，你只需要先记住一条规则：

- 稳定默认能力写进 `config.features`
- 页面级临时差异优先写进 `presetOverrides`

### `config.runtime`

这里最容易混淆，所以单独说。

`config.runtime` 是 **写在 config 里的运行时默认输入**，而组件顶层的 `runtime` 是 **页面实例级运行时对象**。

当前大多数接入场景里，优先理解和使用的是组件顶层这个：

```vue
<TrChat :config="chatConfig" :runtime="runtime" />
```

而不是：

```ts
const chatConfig = {
  runtime: {},
}
```

当前 `config.runtime` 常见用途比较少，主要是：

- 在 config 驱动链路里提供稳定的 `mcpManager`

所以第一次接入时，你可以把它理解成：

- 先知道它存在
- 但绝大多数情况下先不用它

### 一张图记住 `config` 和顶层 `runtime`

```text
TrChat
  config
    -> 稳定默认值
    -> 模型 / provider / UI / layout / features
    -> 少量 config 驱动 runtime 默认输入

  runtime
    -> 页面实例级对象
    -> chatKit / plugins / storage / initialMessages / selectedModel / messageTransforms / mcpManager
```

如果你只是先跑通页面，通常先把 `models / providers / defaults / ui` 配好就够了。

### `runtime`

`runtime` 负责页面实例级对象。

常见内容包括：

- `chatKit`
- `plugins`
- `storage`
- `initialMessages`
- `mcpManager`
- `selectedModel`
- `messageTransforms`

简单记忆：

- 稳定默认值放 `config`
- 页面实例级对象放 `runtime`
- 如果你要在运行时改写模型结果，也优先从 `runtime` 接入

### `callbacks`

`callbacks` 负责行为回调。

常见用途包括：

- 接 `onFinish`
- 接 `onError`
- 接 `onMessageAction`
- 接 `onModelChange`

如果你需要日志、埋点或业务联动，这一层再接进来就够了。

### `presetOverrides`

`presetOverrides` 用来做页面级轻量覆盖。

常见覆盖包括：

- `contentLayout`
- `showHistory`
- `showFeedback`
- `placeholder`
- `senderActionsFeature`
- `messageActions`
- `bubbleRenderers`

<demo vue="../../demos/chat/preset-overrides.vue" :vueFiles="['../../demos/chat/preset-overrides.vue']" title="页面级覆盖" description="在不改基础 config 的前提下，按页面需要覆盖 contentLayout、history、feedback 和发送区扩展动作。" />

一个简单经验：

- `config` 负责场景默认值
- `presetOverrides` 负责页面级、交互级、响应式覆盖
- 如果你只是想扩消息下方动作或替换某类消息渲染，也优先先看 `presetOverrides`

## 局部定制

很多“想改一点默认 UI”的需求，并不需要离开 `TrChat`。

先试这两类手段：

- `presetOverrides`
  - 适合改布局模式、占位文案、默认开关、局部交互
- 插槽（slots）
  - 适合替换 header、welcome、sender、message list 里的具体内容

默认入口当前最常用的插槽包括：

| slot | 适合做什么 |
| :-- | :-- |
| `header-extra` | 给默认 header 右侧补按钮或工具位 |
| `footer-extra` | 给默认 footer 顶部补说明或状态条 |
| `welcome` | 替换欢迎区 |
| `sender` | 接管底部输入区 UI，但保留默认运行时 |
| `message-list` | 接管中间消息区 |
| `left / left-rail / right` | 在 workspace 模式下替换左右面板内容 |
| `mobile-left / mobile-right` | 在 workspace 模式下替换移动端 drawer / sheet |
| `prefix / suffix / after / content-footer` | 给 bubble 分组补前后缀、反馈区、状态区 |

推荐顺序：

1. 先试 `presetOverrides`
2. 再试 `header-extra` / `footer-extra` / `welcome`
3. 如果已经切到 workspace shell，再试 `left / right / mobile-left / mobile-right`
4. 真要替换输入区或消息区时，再用 `sender` / `message-list`
5. 只有默认页面结构本身已经不合适时，再继续看进阶入口

<demo vue="../../demos/chat/slots-header-footer.vue" :vueFiles="['../../demos/chat/slots-header-footer.vue']" title="局部定制" description="在不改默认页面结构的前提下，给 header 和 footer 增补工具位与提示信息。" />

### Workspace 面板级定制

当 `shell.variant = 'workspace'` 时，`TrChat` 也支持直接替换 workspace 左右面板内容。

可用 slot 包括：

- `left`
- `left-rail`
- `right`
- `mobile-left`
- `mobile-right`

推荐理解方式：

- `TrChat` 仍然负责默认聊天主区和运行时
- 你只需要通过这些 slot 替换整块面板内容
- 如果只是替换面板内容，不需要为了这件事进入 `Scaffold` 或 `Root`

当前 fallback 规则：

- `mobile-left` 未提供时，优先复用 `left`
- `mobile-right` 未提供时，优先复用 `right`
- 如果桌面和移动端都没提供，对应区域就回退默认 sidebar / right panel

<demo vue="../../demos/chat/workspace-panel-slots.vue" :vueFiles="['../../demos/chat/workspace-panel-slots.vue']" title="Workspace 面板替换" description="继续使用 TrChat，只替换 workspace 左右面板内容。" />

## 页面级覆盖

如果基础配置是稳定的，但某个页面只是想切布局、文案或能力开关，优先用 `presetOverrides`，不要先拆页面结构。

最常见的场景就是：

- 基础场景都复用同一份 `config`
- 某些页面只是在 `history`、`feedback`、`contentLayout` 上有差异
- 页面不想为这些小差异单独维护一份新配置

## 什么时候再看进阶内容

只有在下面这些场景里，才建议继续往下看：

- 默认页面结构已经不够用
- 你已经知道 `TrChat` 能跑起来，但想继续扩展消息下方动作
- 你想替换某一类消息的默认渲染
- 你想在运行时改写最终消息结果
- 你要自己决定 Header / Welcome / MessageList / Footer 的整体排布
- 你已经有自己的 `chatKit`，或者要直接控制更底层输入

### `TrChat.Scaffold`

`TrChat.Scaffold` 适合“页面结构要改，但仍然希望继续沿用默认配置能力”的场景。

可以把它理解成“开始自己安排页面结构，但还想继续复用默认配置能力”的那一步。

<demo vue="../../demos/chat/scaffold-layout.vue" :vueFiles="['../../demos/chat/scaffold-layout.vue']" title="重排页面结构" description="当默认页面结构不够用时，可以用 Scaffold 接管整体排布。" />

### `TrChat.Root`

`TrChat.Root` 适合“你已经明确要自己装配页面，并且愿意手动管理更底层输入”的场景。

<demo vue="../../demos/chat/whitebox.vue" :vueFiles="['../../demos/chat/whitebox.vue']" title="手动组合页面" description="使用 Root 和叶子组件手动组合聊天页。" />

## 生产建议

- 推荐让前端请求你自己的 `/api/chat`，由服务端再代理真实 provider
- 默认接入优先保留在 `TrChat` 这一层
- 如果你要做 workspace 布局，优先先看 `shell`、`layout` 和插槽是否已经够用
- 如果你只想替换 workspace 左右面板内容，优先继续直接使用 `TrChat`
- 如果页面里完全没看到模型选择器，先检查模型数量、`defaults.model` 和 footer 是否被替换掉了

## 继续阅读

- [Chat 功能配置](./chat-features.md)
- [Chat 进阶了解](./chat-advanced.md)
