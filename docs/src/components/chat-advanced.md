---
outline: deep
---

# Chat 进阶能力

这页只收集那些不属于“先把 `TrChat` 跑起来”的能力。

适合：

- 你已经理解 `TrChat`、`presetOverrides`、slots、`Scaffold`
- 你现在要消费更底层的公开 surface
- 或者你要直接使用 adapter / preset 工具链

不适合：

- 第一次接入 `@opentiny/tiny-robot-chat`
- 还在确认黑盒是否够用
- 还没判断是否真的需要离开默认装配链

如果你还在前面的阶段，建议先看：

- [Chat](./chat.md)
- [Chat 黑盒配置](./chat-config.md)
- [Chat Slots 与渲染定制](./chat-slots.md)
- [Chat Scaffold 与 Root](./chat-scaffold.md)

## 这页包含什么

这页主要覆盖两类能力：

1. 较少数场景才会单独消费的高级公开组件
2. 面向模板、平台层、脚手架或二次封装的 adapter / preset 工具链

当前不把以下内容视为“大多数业务页面的首选入口”：

- 一上来就直接消费 `createPresetChatProps`
- 一上来就自己拼 `presetSlices`
- 一上来就直接进入 `Root`

## 高级公开组件

### `TrChat.HistorySurface`

`TrChat.HistorySurface` 适合在更高定制页面里，单独渲染一块独立历史区域。

它和 `TrChat.History` 的区别是：

- `TrChat.History`
  - 更偏默认历史入口和默认历史装配
- `TrChat.HistorySurface`
  - 更偏“独立历史面板”

适合：

- 左侧会话列表
- 独立面板布局
- 需要把历史区从默认装配中拆出来

前提：

- 仍然建议放在 `TrChat.Root` 之下，让它消费同一套会话上下文
- 如果脱离 `TrChat.Root` 使用，需要显式传 `chatKit`

### `TrMcpTrigger`

`TrMcpTrigger` 是 chat 层提供的 MCP 入口触发器。

它内部组合了：

- 触发按钮
- 激活数量展示
- `TrChatMcpPanel`

适合：

- 放在 sender footer 工具条
- 在更高定制页面里单独暴露 MCP 入口
- 复用 chat 层默认的桌面端 / 移动端交互样式

前提：

- 需要上层已有 `mcpManager`
- 默认黑盒链在检测到 `mcpManager` 时，也会把它纳入默认装配范围

### `TrChatMcpPanel`

`TrChatMcpPanel` 用于承接聊天场景中的 MCP 面板本体能力。

适合：

- 已经有自己的 MCP 入口按钮，只想复用面板本体
- 在 header / toolbar 中提供 MCP 面板入口
- 与 `mcpManager` 配合，展示插件与工具列表

前提：

- 需要上层已有 `mcpManager`

### `TrModelSelector`

`TrModelSelector` 用于消费当前模型列表和当前模型状态。

适合：

- 放在 footer 工具条
- 放在 header 右侧扩展区
- 在更高定制页面里单独暴露模型切换能力

使用它时，通常要一起考虑：

- `config.models`
- `config.defaults.model`
- `runtime.selectedModel`
- `callbacks.onModelChange`

也就是说，它是模型切换主链的 UI 消费者，而不是另一套独立模型机制。

### `TrChatFeedback`

`TrChatFeedback` 用于在更高定制页面里单独消费消息反馈能力。

适合：

- 你已经自己写了 `TrChat.MessageList`
- 但仍希望复用默认 feedback 行为

常见放法：

- 作为 bubble `after` slot 内容
- 只对 assistant 气泡渲染

## adapter / preset 工具链

除了组件，`chat` 包还公开了配置归一化与 preset 工具链。

当前常见入口包括：

| API | 作用 |
| :-- | :-- |
| `loadChatConfig` | 读取并规范化原始配置 |
| `createChatAdapterFromConfig` | 从配置生成 adapter |
| `createPresetChatProps` | 生成 preset props |
| `createPresetChatSlices` | 生成叶子组件可消费的 preset slices |
| `createChatCliCapabilitySurface` | 给脚手架 / 平台层暴露稳定消费面 |

## 什么时候该进入工具链

建议只有在这些场景才进入工具链：

- 模板工程
- 平台层二次封装
- 内部低代码接入层
- 脚手架或代码生成
- 需要显式消费 adapter / preset 结果的中间层

如果你只是业务页面接入聊天 UI：

- 通常先停在 `TrChat`
- 结构性定制时先停在 `TrChat.Scaffold`

## 典型链路

```ts
import {
  createChatAdapterFromConfig,
  createPresetChatProps,
  createPresetChatSlices,
} from '@opentiny/tiny-robot-chat'

const adapter = createChatAdapterFromConfig(chatConfig)
const presetProps = createPresetChatProps(adapter)
const slices = createPresetChatSlices(presetProps)
```

然后你可以直接把这些 slices 投影到页面：

<demo vue="../../demos/chat/advanced-preset-slices.vue" title="adapter / preset 工具链" description="先生成 adapter、presetProps、presetSlices，再用 Root 和叶子组件完成更高层的页面装配。" />

但要再次强调：

- 这不是当前推荐给大多数业务接入者的第一站
- 这是面向更高抽象层消费者的能力

## `presetProps` 与 `presetSlices`

再强调一次它们的定位差异：

### `presetProps`

更偏抽象 preset 层，适合：

- 做进一步归并
- 做平台层消费
- 做配置映射

### `presetSlices`

更偏叶子组件消费层，适合：

- 直接 `v-bind` 到 `Header / Welcome / MessageList / Sender`
- 作为更高定制页面的默认输入

一个简单经验：

- 页面装配优先消费 `presetSlices`
- 平台层或工具层再优先考虑 `presetProps`

## 什么时候才算“进入进阶模式”

建议只有在下面这些需求出现时，再进入这页的能力范围：

- 默认历史入口不够，需要独立历史面板
- 默认 sender 工具位不够，需要单独消费模型选择器或 MCP 面板
- 你要做模板、脚手架或平台级消费
- 你要直接消费 adapter / preset 工具链

如果你还在“先把聊天页跑起来”的阶段，这页通常还不是最优先要看的内容。

## 一个实用判断标准

如果你在犹豫要不要进入这页，可以先问自己：

- 我现在是在做业务页面，还是在做上层封装？
- 我需要的是“页面定制”，还是“能力投影和工具链消费”？

如果答案偏“业务页面 + 页面定制”，通常先停在：

- `TrChat`
- slots
- `TrChat.Scaffold`

如果答案偏“上层封装 + 工具链消费”，再进入这页。

## 相关页面

- [Chat](./chat.md)
- [Chat 黑盒配置](./chat-config.md)
- [Chat Slots 与渲染定制](./chat-slots.md)
- [Chat Scaffold 与 Root](./chat-scaffold.md)
- [History 历史](./history.md)
- [Feedback 气泡反馈](./feedback.md)
