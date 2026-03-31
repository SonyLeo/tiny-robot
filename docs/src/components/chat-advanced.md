---
outline: deep
---

# Chat 进阶了解

这页是补充资料。现在的目标如果只是把 `TrChat` 用起来，可以先跳过。

这页主要收集两类少数场景才会用到的能力：

- 更高定制层会单独消费的公开组件
- 平台层和脚手架层常用的工具链能力

## 什么情况下再来看

适合：

- 你已经熟悉 `TrChat`、`presetOverrides` 和常见插槽
- 你现在要单独消费某些公开组件
- 或者你要做模板层、平台层、脚手架层封装

不适合：

- 第一次接入 `@opentiny/tiny-robot-chat`
- 还在确认 `TrChat` 本身是否已经够用
- 还没明确遇到“默认入口做不到”的问题

如果你还在前面的阶段，建议先看：

- [Chat 快速接入](./chat.md)
- [先看这 4 个入口](./chat.md#先看这-4-个入口)
- [局部定制](./chat.md#局部定制)
- [页面级覆盖](./chat.md#页面级覆盖)

## 这页主要看什么

| 能力 | 什么时候才需要看 |
| :-- | :-- |
| `TrChat.HistorySurface` | 你要把历史区单独抽出来放进自定义页面 |
| `TrModelSelector` | 你要在默认 footer 之外单独摆模型切换 |
| `TrMcpTrigger` / `TrChatMcpPanel` | 你要在更高层页面单独摆 MCP 入口或 MCP 面板 |
| 配置加工与投影能力 | 你在做模板、平台、脚手架或二次封装 |

如果你还没有明确遇到这些问题，这页的大部分内容都可以先不看。

## 高级公开组件

### `TrChat.HistorySurface`

`TrChat.HistorySurface` 适合在更高定制页面里，单独渲染一块独立历史区域。

适合：

- 左侧会话列表
- 独立面板布局
- 需要把历史区从默认页面里单独拿出来

### `TrMcpTrigger`

`TrMcpTrigger` 是 chat 层提供的 MCP 入口触发器。

适合：

- 放在 sender footer 工具条
- 在更高定制页面里单独暴露 MCP 入口
- 复用 chat 层默认的桌面端 / 移动端交互样式

### `TrChatMcpPanel`

`TrChatMcpPanel` 用于承接聊天场景中的 MCP 面板本体能力。

适合：

- 已经有自己的 MCP 入口按钮，只想复用面板本体
- 在 header / toolbar 中提供 MCP 面板入口
- 与 `mcpManager` 配合，展示插件与工具列表

### `TrModelSelector`

`TrModelSelector` 用于消费当前模型列表和当前模型状态。

适合：

- 放在 footer 工具条
- 放在 header 右侧扩展区
- 在更高定制页面里单独暴露模型切换能力

一个常见注意点：

- 如果没显示图标，先检查 `providerId` 是否命中了内置 provider 图标
- 如果你要强制指定图标，手动传 `ModelOption.icon`
- 默认是否出现 selector，也仍然取决于模型数量、默认模型配置，以及页面是否保留了默认 footer 工具位

### `TrChatFeedback`

`TrChatFeedback` 用于在更高定制页面里单独消费消息反馈能力。

适合：

- 你已经自己写了 `TrChat.MessageList`
- 但仍希望复用默认 feedback 行为

## 平台封装能力

除了组件，`chat` 包还公开了配置归一化与工具链能力。

当前常见入口包括：

| API | 作用 |
| :-- | :-- |
| `loadChatConfig` | 读取并规范化原始配置 |
| `createChatAdapterFromConfig` | 从配置生成 adapter |
| `createPresetChatProps` | 生成 preset props |
| `createPresetChatSlices` | 生成叶子组件可消费的 preset slices |
| `createChatCliCapabilitySurface` | 给脚手架 / 平台层暴露稳定消费面 |

## 什么时候才需要看工具链

建议只有在这些场景才进入工具链：

- 模板工程
- 平台层二次封装
- 内部低代码接入层
- 脚手架或代码生成
- 需要显式消费配置加工结果的中间层

如果你只是业务页面接入聊天 UI，通常先停在 `TrChat` 就够了。

## 一个典型例子

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

然后你可以把这些结果继续投影到更高层页面：

<demo vue="../../demos/chat/advanced-preset-slices.vue" :vueFiles="['../../demos/chat/advanced-preset-slices.vue', '../../demos/chat/shared.ts']" title="配置加工能力" description="先生成 adapter、presetProps、presetSlices，再把结果投影到更高层页面。" />

再次强调一次：这不是大多数业务页面的第一站，而是“确实遇到更高阶需求时”的补充资料。

## 相关页面

- [Chat 快速接入](./chat.md)
- [先看这 4 个入口](./chat.md#先看这-4-个入口)
- [局部定制](./chat.md#局部定制)
- [什么时候再看进阶内容](./chat.md#什么时候再看进阶内容)
- [History 历史](./history.md)
- [Feedback 气泡反馈](./feedback.md)
