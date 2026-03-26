---
outline: deep
---

# Chat 进阶能力

这页收集 `@opentiny/tiny-robot-chat` 中那些不属于“最小黑盒接入”，但已经稳定公开导出的能力。

适合：

- 你已经把 `TrChat` 或 `Scaffold` 跑通
- 现在想补高级能力
- 或者你需要直接消费 adapter / preset 工具链

## 高级公开组件

### `TrChat.HistorySurface`

`TrChat.HistorySurface` 适合在白盒页面里单独渲染一块历史区域。

它和 `TrChat.History` 的区别是：

- `TrChat.History` 更偏默认抽屉场景
- `TrChat.HistorySurface` 更偏“独立历史面板”

适合：

- 左侧会话列表
- 独立面板布局
- 需要把历史区从默认抽屉里拆出来

前提：

- 仍然建议放在 `TrChat.Root` 之下，让它消费同一套会话上下文

### `TrMcpTrigger`

`TrMcpTrigger` 是 chat 层提供的 MCP 面板触发器，内部同时组合了触发按钮、激活数量和 `TrChatMcpPanel`。

它适合：

- 放在 sender footer 工具条
- 在白盒页面里单独暴露 MCP 入口
- 复用 chat 层默认的桌面端 / 移动端触发样式

前提：

- 需要上层已有 `mcpManager`
- 默认 renderer 在检测到 `mcpManager` 时，会自动把它放进 sender footer
- 桌面端默认显示“图标 + 文案 + 激活数字”
- 移动端默认只显示“图标 + 激活数字”

### `TrChatMcpPanel`

`TrChatMcpPanel` 用于承接聊天场景中的 MCP 面板本体能力。

适合：

- 已有自己的 MCP 入口按钮，只想复用面板本体
- 在 header / toolbar 中提供 MCP 面板入口
- 与 `mcpManager` 配合，展示插件与工具列表

前提：

- 需要上层已有 `mcpManager`
- 可以来自 `runtime.mcpManager`
- 也可以来自 `presetOverrides.mcpManager`

### `TrModelSelector`

`TrModelSelector` 用于消费当前模型列表和 provider 工厂。

它适合：

- 放在 footer 工具条
- 放在 header 的右侧扩展区
- 单独暴露模型切换能力

使用它时，通常要一起考虑：

- `models`
- `defaultModel`
- `providerFactories`
- `onModelChange`

### `TrChatFeedback`

`TrChatFeedback` 用于白盒页面里单独消费消息反馈能力。

适合：

- 你已经自己写了 `TrChat.MessageList`
- 但仍希望复用默认 feedback 行为

常见放法：

- 作为 `after` slot 内容
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
| `createChatCliCapabilitySurface` | 给脚手架 / CLI 暴露稳定消费面 |

这条链适合：

- 白盒页面
- 模板工程
- CLI
- 内部平台层

### 典型链路

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

然后你就可以：

```vue
<TrChat.Root v-bind="slices.root">
  <TrChat.Layout v-bind="{ ...slices.layout, ...slices.appearance }">
    <TrChat.Header v-bind="slices.header" />
    <TrChat.MessageList v-bind="slices.messageList" />
    <TrChat.Footer>
      <TrChat.Sender v-bind="slices.sender" />
    </TrChat.Footer>
  </TrChat.Layout>
</TrChat.Root>
```

## `presetProps` 与 `presetSlices`

再次强调它们的定位差异：

### `presetProps`

更偏抽象 preset 层，适合：

- 做进一步归并
- 做平台层消费
- 做配置映射

### `presetSlices`

更偏叶子组件消费层，适合：

- 直接 `v-bind` 到 `Header / Welcome / MessageList / Sender`
- 作为白盒页面的默认输入

## 什么时候进入“进阶模式”

建议你只有在下面这些需求出现时，再进入这页的能力范围：

- 默认抽屉历史不够，需要独立历史面板
- 默认 sender 工具条不够，需要单独放模型选择器
- 要做 MCP 面板
- 要做脚手架、模板或平台化消费

如果你还在“先把聊天页跑起来”的阶段，优先看：

- [Chat](./chat.md)
- [Chat 黑盒配置](./chat-config.md)
- [Chat Scaffold 与 Root](./chat-scaffold.md)

## 相关页面

- [Chat Features](./chat-features.md)
- [History 历史](./history.md)
- [Feedback 气泡反馈](./feedback.md)
- [McpServerPicker 插件选择器](./mcp-server-picker.md)
