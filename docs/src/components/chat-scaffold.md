---
outline: deep
---

# Chat Scaffold 与 Root

这页聚焦 `TrChat.Scaffold`、`TrChat.Root` 和更高定制级别的组合方式。

在当前推荐路径里：

- `TrChat` 是默认入口
- slots 是局部定制的第一优先级
- `TrChat.Scaffold` 是结构性定制入口
- `TrChat.Root` 是更底层的根注入入口

也就是说，只有当你已经确认黑盒 + `presetOverrides` + slots 不够用时，才应该进入这页。

## 什么时候用 `Scaffold`，什么时候用 `Root`

| 入口 | 适合场景 | 你会得到什么 |
| :-- | :-- | :-- |
| `TrChat.Scaffold` | 想保留默认解析链，但自己控制页面结构 | `adapter`、`presetProps`、`presetSlices`、默认 `chatKit`、模型切换能力 |
| `TrChat.Root` | 已经有自己的 `chatKit`，或要直接传 `responseProvider` | 根上下文注入层，不绑定默认页面结构 |

可以简单理解为：

- `Scaffold` 是“默认主链的结构性展开层”
- `Root` 是“更底层的上下文根节点”

当前推荐顺序仍然是：

`TrChat -> slots -> TrChat.Scaffold -> TrChat.Root`

## `TrChat.Scaffold`

### 它的定位

`TrChat.Scaffold` 的目标不是让你放弃默认主链，而是把默认主链显式展开给你消费。

当前推荐在这些场景进入 `Scaffold`：

- 你要重排 header / body / footer 的整体结构
- 你要自己控制 welcome / message list / footer 的组合方式
- 你要在模板里同时接入 `presetSlices`、当前模型、`chatKit`
- 你已经超出 slots 能力范围，但还不想自己重建整条解析链

### 它做了什么

`TrChat.Scaffold` 会自动完成这条链路：

```text
config
  -> createChatAdapterFromConfig()
  -> createPresetChatProps()
  -> createPresetChatSlices()
  -> 默认 chatKit / 模型切换 / context provide
```

也就是说：

- 它保留了黑盒默认值的解析能力
- 但把页面结构控制权交还给你

### `Scaffold` props

`TrChat.Scaffold` 和 `TrChat` 基本同构，常用输入仍然是：

- `config`
- `runtime`
- `callbacks`
- `presetOverrides`

不同点在于：

- `TrChat` 会直接渲染默认页面
- `TrChat.Scaffold` 会把解析结果通过 default slot 暴露出来

### default slot 会拿到什么

`TrChat.Scaffold` 当前会暴露：

| 字段 | 说明 |
| :-- | :-- |
| `chatKit` | 当前聊天运行时 |
| `adapter` | 由 `config` 解析出的 adapter |
| `presetProps` | 当前解析后的 preset props |
| `presetSlices` | 当前解析后的 preset slices |
| `currentModel` | 当前模型 ref |
| `selectModel` | 选中模型的方法 |

这意味着你可以在模板里：

- 读当前模型
- 手工切换模型
- 根据 `presetSlices` 装配叶子组件
- 根据 `chatKit.messages.value.length` 决定 welcome / message list 切换

### 一个典型的 `Scaffold` 示例

<demo vue="../../demos/chat/scaffold-layout.vue" title="Scaffold 自定义布局" description="保留 config -> adapter -> preset 主链，同时接管 banner、header、welcome 和 footer 的页面结构。" />

## `presetProps` 与 `presetSlices`

这两个概念很容易混淆。

### `presetProps`

更偏“抽象 preset 层”，适合：

- 做进一步归并
- 做平台层或中间层消费
- 做配置映射

### `presetSlices`

更偏“叶子组件消费层”，适合：

- 直接 `v-bind` 到 `Header / Welcome / MessageList / Sender`
- 作为 `Scaffold` 页面里的默认 props 来源

一个简单经验：

- 页面装配优先消费 `presetSlices`
- 只有做更上层封装时，才优先考虑 `presetProps`

## `TrChat.Root`

### 它的定位

`TrChat.Root` 不是完整页面，它只是上下文提供层。

它负责给后代组件注入：

- `chatKit`
- 消息文案
- history UI 状态
- attachments feature / manager
- sender actions feature
- `mcpManager`
- shell 相关 UI 状态

它适合：

- 你已经有自己的 `chatKit`
- 你要直接使用 `responseProvider`
- 你要完全接管叶子组件拼装

### 两种接入方式

`TrChat.Root` 当前有两种互斥模式。

#### 方式 1：直接传 `chatKit`

适合：

- 你已经在页面里自己调用了 `useChatKit`
- 你要和业务逻辑共享同一个聊天运行时

<demo vue="../../demos/chat/root-chat-kit.vue" title="Root + chatKit" description="直接把现成 chatKit 注入 Root，并完全自己决定 Header / MessageList / Sender 的装配方式。" />

#### 方式 2：直接传 `responseProvider`

适合：

- 你想进入白盒组合
- 但不想自己先创建 `chatKit`

<demo vue="../../demos/chat/root-response-provider.vue" title="Root + responseProvider" description="不提前创建 chatKit，直接把 responseProvider 和初始消息交给 Root。" />

这两种方式是互斥的，不建议同时传。

## 白盒组合的最小链路

最小白盒链路通常是：

```text
TrChat.Root
  -> TrChat.Layout
  -> TrChat.Header
  -> TrChat.Welcome / TrChat.MessageList
  -> TrChat.Footer
  -> TrChat.Sender
```

如果你要继续补能力，也通常会一起考虑：

- `TrChat.Attachments`
- `TrChat.History`
- `TrChat.HistorySurface`
- `TrMcpTrigger`
- `TrModelSelector`
- `TrChatFeedback`
- `TrChatMcpPanel`

## 什么时候该停在 `Scaffold`

大多数“高度自定义”需求，其实停在 `Scaffold` 就够了。

建议停在 `Scaffold` 的情况：

- 你主要是在改页面结构
- 你仍想复用默认 feature 装配
- 你仍想让 `config` 成为主要输入
- 你不想自己维护 `chatKit.updateResponseProvider()` 之类的细节

只有在这些情况才继续往下走：

- 你已经有现成业务运行时
- 你要自己管理 `chatKit`
- 你要绕开默认 `Scaffold` 初始化链

## 关于叶子组件 contract 的边界

需要特别注意：

- `presetSlices.*` 是默认装配结果的一部分
- 但不是所有 slice 字段都应该被理解成对应叶子组件的正式稳定 props

例如 `TrChat.Header`：

- 当前稳定公开 props 仍应以叶子组件自身类型为准
- 不应简单把 header slice 里的所有字段都视为 `TrChat.Header` 的正式 contract

换句话说：

- 写页面时可以消费 `presetSlices.header`
- 写叶子组件 API 文档时，仍应优先以稳定公开类型为准

## 推荐的升级路径

如果你正在从黑盒往更高定制演进，建议按这个顺序来：

1. 先保留 `TrChat`
2. 局部定制时先试 `presetOverrides` 和 slots
3. 需要改结构时进入 `TrChat.Scaffold`
4. 只有在你明确需要掌控 root 注入层时，再直接切到 `TrChat.Root`

这条路径可以最大程度减少：

- 手工维护默认值解析链的成本
- 黑盒和白盒之间的概念跳跃
- 后续随着主链演进而产生的维护负担

## 相关页面

- [Chat](./chat.md)
- [Chat 黑盒配置](./chat-config.md)
- [Chat Slots 与渲染定制](./chat-slots.md)
- [Chat 进阶能力](./chat-advanced.md)
