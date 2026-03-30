---
outline: deep
---

# Chat

`@opentiny/tiny-robot-chat` 是 TinyRobot 的聊天场景装配层。

> 本页中的案例 demo 统一使用本地 mock 数据驱动，方便在文档站直接渲染，不会直接请求真实 API。

它负责把：

- `@opentiny/tiny-robot` 的原子 UI
- `@opentiny/tiny-robot-kit` 的消息与会话运行时
- 聊天场景里的模型切换、历史、反馈、附件、MCP、workspace shell 等能力

收敛成一套可以直接落地、也可以继续定制的聊天主链。

和 `Bubble`、`Sender`、`History` 这类单组件不同，`chat` 更像一个场景包：

- 你可以直接用 `TrChat` 跑起完整聊天页
- 也可以在需要更高定制时进入 `TrChat.Scaffold`
- 只有在你明确要接管运行时和根注入层时，再进入 `TrChat.Root`

## 这页解决什么问题

如果你第一次接触 `@opentiny/tiny-robot-chat`，建议先看这页。

这页主要回答：

- `tiny-robot`、`tiny-robot-kit`、`tiny-robot-chat` 的边界是什么
- 当前主推的接入方式是什么
- 黑盒入口里的 `config / runtime / callbacks / presetOverrides` 各负责什么
- 什么时候应该用 slots，什么时候才应该进入 `Scaffold` 或 `Root`

## 包关系

| 层级 | 包 | 职责 |
| :-- | :-- | :-- |
| 原子 UI 层 | `@opentiny/tiny-robot` | `Bubble`、`Sender`、`Prompts`、`History` 等基础组件 |
| 运行时层 | `@opentiny/tiny-robot-kit` | 消息流、会话管理、请求状态、工具调用等 |
| 场景装配层 | `@opentiny/tiny-robot-chat` | `TrChat`、`TrChat.Scaffold`、默认聊天装配、模型切换、聊天级 feature 和 layout |

可以简单理解为：

- `tiny-robot` 解决“长什么样”
- `tiny-robot-kit` 解决“消息怎么跑”
- `tiny-robot-chat` 解决“如何把它们拼成一个可用聊天页”

## 当前主链

当前推荐从这条链理解 `TrChat`：

```text
TrChat
  -> TrChat.Scaffold
    -> createChatAdapterFromConfig()
    -> createPresetChatProps()
    -> createPresetChatSlices()
    -> TrChat.Root
    -> ChatDefaultRenderer
```

这意味着：

- `TrChat` 仍然是最推荐的默认入口
- `Scaffold` 是黑盒默认装配链的显式展开层
- `Root` 是更底层的上下文提供层，不是默认入口

## 推荐接入顺序

当前推荐按这个顺序演进：

1. 先用 `TrChat + config`
2. 不够时先补 `presetOverrides`
3. 局部定制优先用 slots
4. 页面结构明显超出默认装配时再进入 `TrChat.Scaffold`
5. 只有在你需要直接掌控 `chatKit`、`responseProvider` 或 root 注入层时，才进入 `TrChat.Root`

这是当前最符合产品策略和实现现状的使用路径：

- 主推黑盒写法
- 高度自定义时再推荐白盒写法

## 先怎么选

| 诉求 | 推荐入口 | 原因 |
| :-- | :-- | :-- |
| 先把聊天页跑起来 | `TrChat` | 默认能力最完整，配置驱动成本最低 |
| 黑盒基础上改默认文案、布局模式、局部行为 | `TrChat + presetOverrides` | 不改变页面结构，维护成本最低 |
| 只改 header/footer/welcome/message list 的局部区域 | `TrChat + slots` | 保留默认运行时和默认装配链 |
| 需要自己控制页面结构，但仍想复用默认解析链 | `TrChat.Scaffold` | 保留 `config -> adapter -> preset` 主链 |
| 需要自己掌控 `chatKit` 或 `responseProvider` | `TrChat.Root` | 直接进入根注入层 |

一个简单经验：

- 不确定时，先用 `TrChat`
- 只改局部时，先试 `presetOverrides` 和 slots
- 只有结构性定制时，才进入 `Scaffold`
- 只有运行时层也要接管时，才进入 `Root`

## 路径 1：直接使用 `TrChat`

这是当前主推的接入方式。

黑盒入口的正式形态是：

```ts
config + runtime + callbacks + presetOverrides
```

其中：

- `config` 负责声明式配置
- `runtime` 负责注入页面运行时对象
- `callbacks` 负责行为回调
- `presetOverrides` 负责对默认装配做页面级轻量覆盖

最小示例已经拆到独立 demo 文件中，避免在 Markdown 页面里直接内联 Vue 组件：

<demo vue="../../demos/chat/blackbox.vue" title="黑盒接入" description="使用 TrChat 直接接入完整聊天页。" />

## 路径 2：保留黑盒，但先试 `presetOverrides` 和 slots

很多“想改一点默认 UI”的需求，并不需要直接进入白盒。

通常先试这两类手段：

- `presetOverrides`
  - 适合改 `contentLayout`、`placeholder`、`showHistory`、`showFeedback`、`messageListVariant`
- slots
  - 适合改 `header-extra`、`footer-extra`、`welcome`、`sender`、`message-list`

这条路径的特点是：

- 保留默认运行时
- 保留默认装配链
- 只替换局部渲染

继续阅读：

- [Chat 黑盒配置](./chat-config.md)
- [Chat Slots 与渲染定制](./chat-slots.md)

## 路径 3：使用 `TrChat.Scaffold`

适合：

- 你要保留默认解析链，但自己控制页面结构
- 你已经超出 slots 能力范围
- 你不想在页面里手工重建 `config -> adapter -> preset` 这条链

典型链路：

```text
config
  -> TrChat.Scaffold
  -> adapter
  -> presetProps
  -> presetSlices
  -> TrChat.Root
  -> 你自己的页面结构
```

`TrChat.Scaffold` 会帮你做：

- `config -> adapter`
- `adapter -> presetProps`
- `presetProps -> presetSlices`
- 默认 `chatKit` 初始化
- 当前模型与运行时 provider 切换

它的 default slot 当前会暴露：

- `chatKit`
- `adapter`
- `presetProps`
- `presetSlices`
- `currentModel`
- `selectModel`

这条路径适合做“高度定制但仍复用主链”的页面。

## 路径 4：使用 `TrChat.Root`

`TrChat.Root` 不是完整页面，它只负责提供上下文。

它适合：

- 你已经有自己的 `chatKit`
- 或者你要直接传 `responseProvider`
- 或者你要完全接管叶子组件拼装

这已经属于更底层的白盒组合。

<demo vue="../../demos/chat/whitebox.vue" title="白盒接入" description="使用 Root 和叶子组件手工装配聊天页。" />

## 黑盒入口里的四层概念

### `config`

`config` 是黑盒入口的静态配置层。

它适合放：

- 模型与 provider 声明
- 默认模型
- 外观、文案、欢迎区
- shell / layout 默认值
- feature 开关

继续阅读：[Chat 黑盒配置](./chat-config.md)

### `runtime`

`runtime` 是页面运行时注入层。

它适合放：

- `chatKit`
- `plugins`
- `storage`
- `initialMessages`
- `mcpManager`
- `selectedModel`

### `callbacks`

`callbacks` 是行为回调层。

当前常用的有：

- `onFinish`
- `onError`
- `onMessageAction`
- `onModelChange`

### `presetOverrides`

`presetOverrides` 是默认装配结果之上的轻量覆盖层。

它适合放：

- `shell`
- `contentLayout`
- `placeholder`
- `messageListVariant`
- `showHistory`
- `showFeedback`
- `roleConfigs`
- `senderProps`
- `bubbleListProps`

它的定位不是“重新定义整套聊天场景”，而是对默认装配做边界清晰的页面级覆盖。

## 当前公开 surface

常见公开入口包括：

- `TrChat`
- `TrChat.Scaffold`
- `TrChat.Root`
- `TrChat.Layout`
- `TrChat.Header`
- `TrChat.Welcome`
- `TrChat.MessageList`
- `TrChat.Footer`
- `TrChat.Sender`
- `TrChat.Attachments`
- `TrChat.History`
- `TrChat.HistorySurface`
- `TrMcpTrigger`
- `TrModelSelector`
- `TrChatMcpPanel`
- `TrChatFeedback`
- `createChatAdapterFromConfig`
- `createPresetChatProps`
- `createPresetChatSlices`

但需要注意：

- “公开可导出”不等于“默认推荐入口”
- 当前默认推荐仍然是 `TrChat`

## 建议阅读顺序

如果你是第一次接入，建议按这个顺序看：

1. 这页：先理解主链、入口分层和推荐路径
2. [Chat 黑盒配置](./chat-config.md)：先把 `TrChat` 跑起来
3. [Chat Slots 与渲染定制](./chat-slots.md)：先做局部定制
4. [Chat Scaffold 与 Root](./chat-scaffold.md)：再做结构性定制
5. [Chat Features](./chat-features.md)：打开附件、历史、反馈、MCP 等能力
6. [Chat 进阶能力](./chat-advanced.md)：最后再看更底层 surface 和工具链

## 生产建议

- 推荐让前端请求你自己的 `/api/chat`，由服务端再代理真实 provider
- 黑盒优先走 `config` 路径，不建议一开始就把页面拆成白盒
- 局部定制优先试 `presetOverrides` 和 slots
- 模型切换优先把 `config.models`、`config.defaults.model`、`runtime.selectedModel`、`callbacks.onModelChange` 作为一组一起考虑
- 如果你要做 workspace 布局，不代表必须进入白盒；优先先看黑盒里的 `shell`、`layout` 和 slots 能否满足
