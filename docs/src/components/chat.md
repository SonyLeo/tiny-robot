---
outline: deep
---

# Chat 快速接入

`@opentiny/tiny-robot-chat` 的主入口是 `TrChat`。

先把 `TrChat` 用起来，再按需要补功能和定制，大多数业务页面走到这一步就够了。

> 本页示例统一使用本地 mock 数据驱动，方便在文档站直接渲染，不会直接请求真实 API。

## 先从这里开始

适合：

- 第一次接入 `@opentiny/tiny-robot-chat`
- 想先用 `TrChat` 跑通一个可用聊天页
- 主要关心页面怎么用，而不是内部实现怎么组织

推荐阅读顺序：

1. 先用 `TrChat + config` 跑起来
2. 页面有轻微差异时，用 `presetOverrides`
3. 只改局部 UI 时，用插槽（slots）
4. 只有默认入口做不到时，再继续了解 `Scaffold` 或 `Root`

<demo vue="../../demos/chat/blackbox.vue" :vueFiles="['../../demos/chat/blackbox.vue', '../../demos/chat/shared.ts']" title="默认接入" description="使用 TrChat 直接接入完整聊天页。" />

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

第一次接入时，通常先看这几块就够了：

| 字段 | 作用 |
| :-- | :-- |
| `models` | 声明可选模型列表 |
| `providers` | 声明 provider 接口配置 |
| `defaults` | 声明默认模型与默认 system prompt |
| `ui / shell / layout / features` | 声明页面默认外观、布局和能力开关 |

常见的顶层结构大致是：

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

<demo vue="../../demos/chat/preset-overrides.vue" :vueFiles="['../../demos/chat/preset-overrides.vue', '../../demos/chat/shared.ts']" title="页面级覆盖" description="在不改基础 config 的前提下，按页面需要覆盖 contentLayout、history、feedback 和发送区扩展动作。" />

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
| `left / left-rail / right` | 在 workspace 模式下替换左侧面板、左侧 rail、右侧面板 |
| `mobile-left / mobile-right` | 在 workspace 模式下替换移动端左 drawer 和右 sheet |
| `prefix / suffix / after / content-footer` | 给 bubble 分组补前后缀、反馈区、状态区 |

推荐顺序：

1. 先试 `presetOverrides`
2. 再试 `header-extra` / `footer-extra` / `welcome`
3. 如果已经切到 workspace shell，再试 `left / right / mobile-left / mobile-right`
4. 真要替换输入区或消息区时，再用 `sender` / `message-list`
5. 只有默认页面结构本身已经不合适时，再继续看进阶入口

<demo vue="../../demos/chat/slots-header-footer.vue" :vueFiles="['../../demos/chat/slots-header-footer.vue', '../../demos/chat/shared.ts']" title="局部定制" description="在不改默认页面结构的前提下，给 header 和 footer 增补工具位与提示信息。" />

### Workspace 面板级定制

当 `shell.variant = 'workspace'` 时，`TrChat` 黑盒入口也支持直接替换 workspace 左右面板内容。

可用 slot 包括：

- `left`
- `left-rail`
- `right`
- `mobile-left`
- `mobile-right`

推荐理解方式：

- 黑盒 `TrChat` 负责默认聊天主区和运行时
- 你只需要通过这些 slot 替换整块面板内容
- 如果只是替换面板内容，不需要为了这件事进入 `Scaffold` 或 `Root`

当前 fallback 规则：

- `mobile-left` 未提供时，优先复用 `left`
- `mobile-right` 未提供时，优先复用 `right`
- 如果桌面和移动端都没提供，对应区域就回退默认 sidebar / right panel

<demo vue="../../demos/chat/workspace-panel-slots.vue" :vueFiles="['../../demos/chat/workspace-panel-slots.vue', '../../demos/chat/shared.ts']" title="Workspace 面板替换" description="继续使用 TrChat 黑盒写法，只替换 workspace 左右面板内容。" />

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

它更像“结构定制入口”，不是第一次接入时的默认入口。

<demo vue="../../demos/chat/scaffold-layout.vue" :vueFiles="['../../demos/chat/scaffold-layout.vue', '../../demos/chat/shared.ts']" title="重排页面结构" description="当默认页面结构不够用时，可以用 Scaffold 接管整体排布。" />

### `TrChat.Root`

`TrChat.Root` 适合“你已经明确要自己装配页面，并且愿意手动管理更底层输入”的场景。

<demo vue="../../demos/chat/whitebox.vue" :vueFiles="['../../demos/chat/whitebox.vue', '../../demos/chat/shared.ts']" title="手动组合页面" description="使用 Root 和叶子组件手动组合聊天页。" />

## 生产建议

- 推荐让前端请求你自己的 `/api/chat`，由服务端再代理真实 provider
- 默认接入优先保留在 `TrChat` 这一层
- 如果你要做 workspace 布局，优先先看 `shell`、`layout` 和插槽是否已经够用
- 如果你只想替换 workspace 左右面板内容，优先继续留在黑盒 `TrChat`
- 如果页面里完全没看到模型选择器，先检查模型数量、`defaults.model` 和 footer 是否被替换掉了

## 继续阅读

- [Chat 功能配置](./chat-features.md)
- [Chat 进阶了解](./chat-advanced.md)
- [Chat CLI 脚手架](./chat-cli.md)
