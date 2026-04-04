---
outline: [2, 3]
---

# Chat 接入与入口

`@opentiny/tiny-robot-chat` 的主入口是 `TrChat`。

这页只解决 3 件事：

- 先把一个完整聊天页跑起来
- 先分清 `config / runtime / callbacks / presetOverrides`
- 先判断自己下一步应该看配置页，还是进阶页

> 本页示例统一请求 `/api/chat/completions`。在文档站内，service worker 会接管这个请求并返回 mock 响应；接入业务时，请替换成你自己的服务端 API。

## 什么时候看这页

适合：

- 第一次接入 `@opentiny/tiny-robot-chat`
- 想先用默认页面跑通一个可用聊天页
- 还在判断 `TrChat` 本身够不够用

如果你现在更关心：

- 配置字段和能力开关写在哪里
  - 去看 [Chat 配置与能力](./chat-features.md)
- 如何定制结构、扩展运行时、接 MCP
  - 去看 [Chat 定制与进阶](./chat-advanced.md)

## 先看这 3 条路径

| 你要做什么 | 推荐入口 | 什么时候升级 |
| :-- | :-- | :-- |
| 跑通一个完整聊天页 | `TrChat` | 默认结构不够用再看进阶页 |
| 只做页面轻量差异 | `presetOverrides` | 覆盖不够再用 `slots` |
| 默认结构不够用 | `TrChat.Scaffold` / `TrChat.Provider` | 需要自己接管运行时或页面装配时再进入 |

一个简单判断顺序：

1. 先用 `TrChat`
2. 再用 `presetOverrides`
3. 再用 `slots`
4. 最后再考虑 `Scaffold` 或 `Provider`

## 开始前先确认 3 个前提

如果你是第一次在业务项目里接入 `@opentiny/tiny-robot-chat`，建议先把下面 3 件事补齐，再去复制最小示例。

### 1. 先安装运行这个最小示例需要的依赖

`@opentiny/tiny-robot-chat` 不是一个完全独立的单包入口。按当前包定义和 demo 工程的真实依赖，最少需要先安装：

- `vue`
- `@opentiny/tiny-robot`
- `@opentiny/tiny-robot-chat`
- `@opentiny/tiny-robot-kit`
- `markstream-vue`

::: code-group

```bash [pnpm]
pnpm add vue @opentiny/tiny-robot @opentiny/tiny-robot-chat @opentiny/tiny-robot-kit markstream-vue
```

```bash [yarn]
yarn add vue @opentiny/tiny-robot @opentiny/tiny-robot-chat @opentiny/tiny-robot-kit markstream-vue
```

```bash [npm]
npm install vue @opentiny/tiny-robot @opentiny/tiny-robot-chat @opentiny/tiny-robot-kit markstream-vue
```

:::

如果你只安装 `@opentiny/tiny-robot-chat`，照着下面的最小示例直接复制，通常并不能完整跑起来。

### 2. 在入口文件引入基础样式

至少先在 `main.ts` / `main.js` 里引入 TinyRobot 的基础样式：

```ts
import { createApp } from 'vue'
import App from './App.vue'
import '@opentiny/tiny-robot/dist/style.css'

createApp(App).mount('#app')
```

`chat` 包自己的样式会跟随包入口进入构建链，但 `@opentiny/tiny-robot` 的基础样式仍然需要你显式引入。

### 3. 准备一个真实可请求的接口

本页所有最小示例都把 provider endpoint 写成 `/api/chat/completions`。

- 在文档站里，这个请求会被 service worker mock 掉，所以示例可以直接演示
- 在你自己的项目里，这个地址需要由你自己的服务端 API 来实现

如果你还没有服务端接口，最小示例可以先看 UI 是否正确渲染，但不能指望它在业务项目里直接返回真实对话结果。

## 最小可运行示例

<demo vue="../../demos/chat/blackbox.vue" :vueFiles="['../../demos/chat/blackbox.vue']" title="默认接入" description="使用 TrChat 直接接入完整聊天页。" />

第一次接入时，先把这 4 块配好就够了：

- `models`
- `providers`
- `defaults`
- `ui`

剩余配置建议去看 [Chat 配置与能力](./chat-features.md)。

## TrChat 的 4 个输入项

大多数场景里，你只需要先理解这 4 个输入项：

| 字段 | 参考类型 | 适合放什么 | 什么时候最常用 |
| :-- | :-- | :-- | :-- |
| `config` | `ChatConfig`，也可以传 JSON 字符串配置 | 模型、provider、UI、layout、features 等稳定默认值 | 场景默认值、长期保留的配置 |
| `runtime` | `TrChatRuntimeInput` | `chatKit`、`plugins`、`storage`、`initialMessages`、`mcpManager`、`selectedModel`、`messageTransforms` 等实例级对象 | 页面实例级依赖、运行时对象、消息改写 |
| `callbacks` | `ChatScaffoldCallbacks` | `onBeforeSend`、`onFinish`、`onError`、`onMessageAction`、`onModelChange` 等行为回调 | 日志、埋点、错误处理、业务联动 |
| `presetOverrides` | `TrChatPresetOverrides` | `contentLayout`、`showHistory`、`showFeedback`、`placeholder`、`messageActions`、`bubbleRenderers` 等页面级覆盖 | 同一份基础配置在不同页面有轻微差异 |

### `config`

`config` 负责稳定默认值。

优先放这里的通常是：

- 模型列表
- provider 配置
- 默认模型
- 品牌、欢迎区、layout、features

如果你只是想查字段细节，直接看 [Chat 配置与能力](./chat-features.md)。

### `runtime`

`runtime` 负责页面实例级对象。

最常见的内容包括：

- `chatKit`
- `plugins`
- `storage`
- `initialMessages`
- `mcpManager`
- `selectedModel`
- `messageTransforms`

一个简单记法：

- 稳定默认值放 `config`
- 页面实例对象放 `runtime`

### `callbacks`

`callbacks` 负责把 chat 行为接回你的业务。

最常见的回调包括：

- `onBeforeSend`
- `onFinish`
- `onError`
- `onMessageAction`
- `onModelChange`

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

一条实用规则：

- 场景默认值写进 `config`
- 页面临时差异优先写进 `presetOverrides`

### 常用 `presetOverrides` 速查

`presetOverrides` 是最容易越用越多的入口，源码里当前主要覆盖面如下：

| 字段 | 作用 | 最常见场景 |
| :-- | :-- | :-- |
| `appearance` | 覆盖 chat 子树主题模式 | 某个页面强制浅色或深色 |
| `shell` | 覆盖 workspace 外壳配置 | 当前页临时切到 workspace 或调整左右栏状态 |
| `brand` / `welcome` / `prompts` | 覆盖 header 品牌、欢迎区、提示词 | 同一份 config 在不同页面换文案 |
| `attachmentsFeature` / `senderActionsFeature` | 覆盖附件与发送区动作 | 当前页只开附件、只开字数统计等 |
| `messages` | 覆盖内置文案 copy | 本地化、业务术语替换 |
| `placeholder` / `maxLength` / `senderMode` | 覆盖发送区基础输入行为 | 单行/多行、占位文案、长度限制 |
| `autoScroll` / `messageListVariant` / `contentLayout` | 覆盖消息区布局与滚动行为 | docs / workspace / 宽版内容区切换 |
| `showHistory` / `showFeedback` / `show` | 覆盖历史入口、反馈区、整体显示状态 | 某页临时关闭某个默认能力 |
| `messageActions` / `messageActionsMode` / `onMessageAction` | 扩展消息级操作 | 保存案例、跳转工单、替换默认操作 |
| `bubbleRenderers` | 注册内容命中或气泡级 renderer | 特定消息卡片、结构化内容渲染 |
| `roleConfigs` / `groupStrategy` | 调整 BubbleList 分组和角色表现 | 强化 user / assistant 的版式差异 |
| `senderProps` / `bubbleListProps` / `historyProps` | 透传更底层组件 props | 局部调优基础组件，不想整体改结构 |
| `attachmentsManager` / `mcpManager` | 页面级接管附件或 MCP manager | 已有实例对象，想复用到当前页 |
| `onModelChange` | 页面级模型切换回调 | 页面内状态联动、埋点 |

## 常用 slots 一览

很多“只改一点默认 UI”的需求，其实不需要离开 `TrChat`。

### 通用区域 slots

| slot | 作用 | 当前是否有 scoped props |
| :-- | :-- | :-- |
| `header` | 完全替换默认 header 区 | 无 |
| `header-extra` | 给默认 header 右侧补按钮或工具位 | 无 |
| `welcome` | 替换欢迎区 | 无 |
| `empty` | 在没有 `welcome` slice 时提供空态内容 | 无 |
| `message-list` | 接管整个中间消息区 | 有：`{ messages }` |
| `sender` | 接管底部输入区 UI，但保留默认运行时 | 有：`{ send, abort, status, lastError, retry }` |
| `footer-extra` | 给默认 footer 顶部补说明或状态条 | 无 |

### Workspace 区域 slots

| slot | 作用 | 什么时候用 |
| :-- | :-- | :-- |
| `left` | 替换 workspace 左侧面板内容 | 想自定义左栏主体内容 |
| `left-rail` | 替换左侧 rail 内容 | 左栏折叠态需要自定义快捷入口 |
| `right` | 替换 workspace 右侧面板内容 | 放预览、上下文、工具结果等 |
| `mobile-left` | 替换移动端左侧 drawer / sheet | 移动端左栏和桌面端结构不同 |
| `mobile-right` | 替换移动端右侧 drawer / sheet | 移动端右栏和桌面端结构不同 |

### Bubble 扩展 slots

源码里当前固定的 bubble 扩展 slot 名称是：

- `prefix`
- `suffix`
- `after`
- `content-footer`

这些 slot 都会挂到默认 `ChatMessageList` 的 bubble 渲染链上，适合补：

- 气泡前后的标识和状态
- 自定义消息操作区
- 反馈区之外的额外说明
- 结构化内容底部附加信息

推荐顺序：

1. 先试 `presetOverrides`
2. 再试 `header-extra` / `footer-extra` / `welcome`
3. 已经切到 workspace shell 时，再试 `left / right / mobile-left / mobile-right`
4. 默认结构真的不够用时，再看 [Chat 定制与进阶](./chat-advanced.md)

## 页面级覆盖优先于拆结构

如果基础配置是稳定的，但某个页面只是想切布局、文案或能力开关，优先用 `presetOverrides`，不要先拆页面结构。

典型场景：

- 基础场景复用同一份 `config`
- 某些页面只在主题、`history`、`feedback`、`contentLayout` 或发送区细节上有差异
- 页面不想为这些小差异单独维护一份新配置

<demo vue="../../demos/chat/preset-overrides.vue" :vueFiles="['../../demos/chat/preset-overrides.vue']" title="页面级覆盖" description="在不改基础 config 的前提下，切换“基础页 / 覆盖页”两种页面身份，观察 presetOverrides 如何承接当前页的轻量差异。" />

## 接下来该看哪一页

如果你现在要查：

- 配置字段
- `features`
- `config.integrations`
- `shell` 和 `layout`
- 能力开关和优先级

请继续看：

- [Chat 配置与能力](./chat-features.md)

如果你现在要做：

- workspace 左右面板替换
- `Scaffold` / `Provider`
- `messageActions`
- `bubbleRenderers`
- `messageTransforms`
- MCP 接入

请继续看：

- [Chat 定制与进阶](./chat-advanced.md)
