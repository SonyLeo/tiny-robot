---
outline: [2, 3]
---

# Chat 接入与入口

`@opentiny/tiny-robot-chat` 现在只对外强调一条官方入口梯子：

1. `TrChat`
2. `TrChat.Root + TrChat.Page`
3. `TrChat.Root + primitives`

如果你只是想先把聊天页跑起来，优先从 `TrChat` 开始。

## 什么时候看这一页

适合：

- 第一次接入 `@opentiny/tiny-robot-chat`
- 想先跑通一个完整聊天页
- 想先分清黑盒、白盒页面、细粒度白盒这三条入口

如果你更关心：

- 每个配置字段写在哪里
- sender / attachments / messages / workspace 这些功能域分别归谁

继续看：

- [Chat 配置与能力](./chat-features.md)

如果你更关心：

- 如何自己装配页面
- 如何用 `Provider`
- 如何把 message transforms、MCP、sender extensions 这类能力接到白盒路径上

继续看：

- [Chat 定制与进阶](./chat-advanced.md)

## 官方入口梯子

| 目标 | 推荐入口 | 什么时候升级 |
| :-- | :-- | :-- |
| 直接跑起完整聊天页 | `TrChat` | 默认页面结构不够用 |
| 自己创建 runtime，但保留官方页面组合 | `TrChat.Root + TrChat.Page` | 需要自己排页面结构 |
| 自己拼页面和叶子组件 | `TrChat.Root + primitives` | 需要更细粒度的 UI / runtime owner 控制 |

## `TrChat` 现在只接受什么

黑盒 `TrChat` 现在只接受两种 `config` 形态：

- target `TrChatConfig` 对象
- target `TrChatConfig` 的序列化 JSON 字符串

不再属于黑盒官方合同的有：

- 顶层 `runtime`
- 顶层 `callbacks`
- 顶层 `presetOverrides`
- `TrChat.Scaffold` / `TrChatScaffold`

如果你需要这些级别的控制，直接升级到：

- `TrChat.Root + TrChat.Page`
- `TrChat.Root + primitives`
- 或 `TrChat.Provider`

## 黑盒最小示例

<demo vue="../../demos/chat/blackbox.vue" :vueFiles="['../../demos/chat/blackbox.vue']" title="默认接入" description="使用 target TrChatConfig 直接跑起完整聊天页。" />

这一层你最常写的是：

- `request`
- `ui`
- `sender`
- `attachments`
- `history`
- `workspace`
- `messages`
- `lifecycle`

## 黑盒 `TrChat` 的最小心智模型

可以把它理解成：

- `config` 只负责稳定默认值
- `TrChat` 负责把 target `TrChatConfig` 变成官方 `Root + Page` 主路径

也就是：

`TrChat(config) -> createRuntimeFromConfig(config) -> TrChat.Root + TrChat.Page`

## 什么时候升级到 `Root + Page`

当你已经接受 target `TrChatConfig`，但还想：

- 自己决定 runtime 创建时机
- 在页面外层再包一层业务容器
- 把 `TrChat.Page` 当成官方页面组件使用

最小示例：

```vue
<script setup lang="ts">
import { TrChat, createRuntimeFromConfig } from '@opentiny/tiny-robot-chat'

const config = {
  request: {
    models: [{ id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' }],
    defaultModelId: 'gpt-4.1-mini',
    transport: {
      type: 'openai-compatible',
      endpoint: '/api/chat/completions',
    },
  },
  ui: {
    brand: { title: 'Internal Chat' },
  },
}

const { runtime, ui } = createRuntimeFromConfig(config)
</script>

<template>
  <TrChat.Root :runtime="runtime" :ui="ui">
    <TrChat.Page />
  </TrChat.Root>
</template>
```

## 什么时候升级到 `Root + primitives`

当你需要：

- 自己排 `Header / MessageList / Footer / History / Workspace`
- 在页面壳层里接自定义区域
- 把 `TrChat.Sender`、`TrChat.MessageList`、`TrMcpTrigger` 这些叶子组件单独摆放

这条路径的核心约束是：

- `Root` 提供 runtime 和 display-only `ui`
- 叶子组件优先消费 owner-aligned runtime，而不是旧的 scaffold helper surface

## 下一步看哪里

- 查配置字段：看 [Chat 配置与能力](./chat-features.md)
- 查白盒页面与 provider：看 [Chat 定制与进阶](./chat-advanced.md)
