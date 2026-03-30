---
outline: deep
---

# Chat Slots 与渲染定制

`TrChat` 的黑盒默认渲染器已经内建了一组稳定的 slots。

这意味着很多“只改局部，不改整套页面结构”的需求，并不需要直接改成白盒组合。  
当前推荐顺序是：

1. 先用 `TrChat + config`
2. 再试 `presetOverrides`
3. 局部定制优先用 slots
4. 只有结构不够用时，才进入 `TrChat.Scaffold`

如果你的目标只是“保留默认主链，但改掉默认页面里的某几块 UI”，这一页就是第一站。

## slots 适合解决什么问题

适合：

- 给默认 header / footer 补一个按钮或工具区
- 替换 welcome 区或 empty 状态
- 接管默认 sender UI，但保留默认运行时
- 替换默认 message list 区域
- 给气泡组补前后缀、内容底部扩展、反馈区等局部 UI

不适合：

- 完全重组页面结构
- 自己控制 `chatKit` 或 `responseProvider`
- 自己决定 `config -> adapter -> preset` 的整条装配链

这类需求更适合：

- [Chat Scaffold 与 Root](./chat-scaffold.md)

## 当前黑盒支持的 slot

### 页面级 slot

| slot | 位置 | 说明 |
| :-- | :-- | :-- |
| `header` | 顶部区域 | 完整替换默认 header |
| `header-extra` | 默认 header 内部 | 向默认 header 的右侧扩展按钮或工具 |
| `message-list` | 中间内容区 | 完整替换默认 welcome / message list 区域 |
| `welcome` | 欢迎态 | 替换默认 welcome 区域 |
| `empty` | 欢迎态兜底 | 当没有 `welcome` 且没有默认 welcome slice 时渲染 |
| `sender` | 底部输入区 | 完整替换默认 sender 区域 |
| `footer-extra` | 默认 footer 内部 | 向默认 footer 顶部插入额外内容 |

### Bubble passthrough slots

默认 message list 还会把一组 bubble slots 透传到底层 `BubbleList`。

当前稳定支持：

- `prefix`
- `suffix`
- `after`
- `content-footer`

它们适合：

- `prefix`：在气泡组前补标识
- `suffix`：在气泡组后补标识
- `after`：在气泡内容外部追加扩展 UI
- `content-footer`：在气泡内容底部追加扩展 UI

## 推荐定制顺序

建议按这个顺序尝试：

1. 先试 `header-extra` / `footer-extra`
2. 再试 `welcome` / `empty`
3. 再试 bubble slots
4. 如果还不够，再用 `sender` 或 `message-list`
5. 只有当默认页面结构本身已经不适合时，再进入 `Scaffold`

这样可以尽量保留默认装配链和默认运行时，维护成本最低。

## `header-extra` 与 `footer-extra`

这是最推荐优先使用的两个扩展点。

- `header-extra`
  - 适合放快捷入口、模型切换按钮、MCP 面板开关
- `footer-extra`
  - 适合放说明文案、工具条、状态条

示例：

<demo vue="../../demos/chat/slots-header-footer.vue" title="header-extra / footer-extra" description="在不改默认页面结构的前提下，给 header 和 footer 增补工具位与提示信息。" />

如果你只是想给默认页面补几个工具位，通常到这里就够了。

## `welcome` 与 `empty`

这两个 slot 适合处理“没有消息时页面怎么展示”。

- `welcome`
  - 当你已经有自己的欢迎区设计，但仍想保留默认消息发送和默认 message list
- `empty`
  - 当你只想在默认 welcome 不存在时给一个兜底展示

示例：

<demo vue="../../demos/chat/slots-welcome.vue" title="welcome slot" description="用 welcome slot 替换欢迎态，同时保留默认发送区和默认消息链。" />

## `sender` slot

`sender` slot 会收到：

| 字段 | 说明 |
| :-- | :-- |
| `send` | 发送消息的方法 |
| `abort` | 中止当前请求的方法 |
| `status` | 当前请求状态 |
| `last-error` | 最近一次错误 |
| `retry` | 重试方法 |

这意味着你可以：

- 保留黑盒运行时
- 但完全接管底部输入 UI

示例：

<demo vue="../../demos/chat/slots-sender.vue" title="sender slot" description="保留黑盒运行时，只接管底部输入区的具体 UI 和交互。" />

什么时候适合用它：

- 默认 `TrChat.Sender` 的视觉或结构已经不适合你的页面
- 但你还不想进入 `Scaffold`

## `message-list` slot

`message-list` slot 会收到：

| 字段 | 说明 |
| :-- | :-- |
| `messages` | 当前消息列表 |

要特别注意：

- 只要你提供了 `message-list` slot，默认 welcome / message list 渲染链就不会再参与
- 这意味着欢迎态切换也要由你自己处理

示例：

<demo vue="../../demos/chat/slots-message-list.vue" title="message-list slot" description="接管中间消息区域，并在自定义区域里消费当前消息列表。" />

什么时候适合用它：

- 你要接管中间内容区
- 但 header / footer / 运行时仍想保留黑盒默认链路

## Bubble slots

这组 slots 适合做“消息级补充”，而不是重做 message list。

常见用法：

- 在 assistant 气泡后面补反馈区
- 给一组消息补自定义来源标识
- 在消息内容底部补工具状态或标签

### slot props

这些 slots 来自底层消息分组语义，常见会收到：

| 字段 | 说明 |
| :-- | :-- |
| `messages` | 当前分组内的消息集合 |
| `role` | 当前分组角色 |
| `messageIndexes` | 当前分组对应的原始消息索引 |

示例：

<demo vue="../../demos/chat/slots-bubble.vue" title="Bubble passthrough slots" description="给 assistant 消息分组追加 after 和 content-footer 区域，而不是重做整套 message list。" />

## 什么时候该改 slots，什么时候该进 `Scaffold`

优先继续用 slots：

- 你只想改局部 UI
- 你仍接受默认页面结构
- 你不想自己管理 `chatKit`
- 你不想自己处理 `config -> adapter -> preset` 解析链

改用 `TrChat.Scaffold`：

- 你要重排 header / body / footer 的整体结构
- 你要自己决定 welcome / message list / footer 的组合方式
- 你已经发现同时接管多个大区域，slots 已经开始相互耦合

改用 `TrChat.Root`：

- 你要自己管理 `chatKit`
- 或者你要直接传 `responseProvider`
- 或者你要完全接管根注入层

一个实用判断标准：

- “我要改一块 UI” -> 先看 slots
- “我要改页面结构” -> 再看 `Scaffold`
- “我要改运行时根层” -> 再看 `Root`

## 与 `presetOverrides` 的分工

可以把它们简单理解为：

- `presetOverrides`
  - 改默认装配结果
  - 适合配置级覆盖
- slots
  - 改默认渲染位置里的具体内容
  - 适合页面模板级覆盖

例如：

- 想把内容区域从 `centered` 切到 `wide`
  - 优先 `presetOverrides.contentLayout`
- 想给默认 header 右侧加一个按钮
  - 优先 `header-extra`
- 想把默认 sender 区换成自己的 UI
  - 优先 `sender`

## 相关页面

- [Chat](./chat.md)
- [Chat 黑盒配置](./chat-config.md)
- [Chat Scaffold 与 Root](./chat-scaffold.md)
