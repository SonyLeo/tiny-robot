---
outline: [2, 3]
---

# Chat 定制与进阶

这一页讲的是：当黑盒 `TrChat` 已经不够用时，应该如何升级到白盒路径。

当前推荐的升级顺序只有这三层：

1. `TrChat`
2. `TrChat.Root + TrChat.Page`
3. `TrChat.Root + primitives`

`TrChat.Scaffold` 已经不再是官方入口故事的一部分。

## 什么时候看这一页

适合：

- 你已经接受 target `TrChatConfig`
- 你想自己决定页面结构
- 你要接 `Provider`
- 你要扩 `messages.actions / renderers / transforms`
- 你要在白盒路径接 MCP、sender extensions、历史或 workspace 组合

## 升级顺序

| 目标 | 推荐入口 | 说明 |
| :-- | :-- | :-- |
| 自己创建 runtime，但还想复用官方页面 | `TrChat.Root + TrChat.Page` | 最稳的白盒页面路径 |
| 自己摆 `Header / MessageList / Footer / History / Workspace` | `TrChat.Root + primitives` | 页面结构完全由你掌控 |
| 想自己控制 `responseProvider` 或 provider 级对象 | `TrChat.Provider` | 叶子级白盒装配入口 |

## `Root + Page`

当你已经接受 target config，但不想把 runtime 创建藏在黑盒里时，优先用这条路径。

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

这条路径最适合：

- 业务外层还要再包一层
- 你要显式控制 runtime 创建与传递
- 你仍然想保留官方页面 owner path

## `Root + primitives`

当你需要真正自己排页面时，用这条路径。

```vue
<template>
  <TrChat.Root :runtime="runtime" :ui="ui">
    <TrChat.Layout :appearance="ui.appearance" :content-layout="ui.contentLayout">
      <TrChat.Header :title="ui.brand?.title" />
      <TrChat.Welcome
        v-if="runtime.conversation.messages.value.length === 0"
        :compatibility-relay="false"
        :title="ui.welcome?.title"
        :description="ui.welcome?.description"
        :prompts="ui.welcome?.prompts"
        @prompt-click="runtime.conversation.send({ text: $event })"
      />
      <TrChat.MessageList v-else :compatibility-relay="false" />
      <TrChat.Footer>
        <TrChat.Sender />
      </TrChat.Footer>
    </TrChat.Layout>
  </TrChat.Root>
</template>
```

这条路径最适合：

- 你要自己接 workspace slots
- 你要自定义 footer、header、history 的组合
- 你要在叶子组件层使用 `TrChat.Sender`、`TrChat.MessageList`、`TrMcpTrigger`

## `TrChat.Provider`

当你要自己控制 provider 级对象，但又不想直接掉到更底层内部装配时，用 `TrChat.Provider`。

当前保留的正式用法只有一种：

### 传 `responseProvider`

```vue
<TrChat.Provider :response-provider="responseProvider">
  <TrChat.Layout>
    <TrChat.MessageList auto-scroll />
    <TrChat.Footer>
      <TrChat.Sender />
    </TrChat.Footer>
  </TrChat.Layout>
</TrChat.Provider>
```

`Provider` 现在仍然是正式 helper surface，但它是白盒入口，不是黑盒 `TrChat` 的补充参数。
直接传 `chatKit` 已经不再属于支持中的 package story。

## message actions / renderers / transforms 现在写在哪里

这些扩展已经不再属于旧的 `presetOverrides` 或顶层 `runtime` 黑盒合同。

现在推荐：

- `messages.actions`
- `messages.actionMode`
- `messages.renderers`
- `messages.feedback`
- `messages.transforms`

也就是先把扩展写进 target `TrChatConfig`，再决定它走：

- 黑盒 `TrChat`
- `Root + Page`
- 或 `Root + primitives`

## MCP 现在怎么接

MCP 不再是黑盒 `TrChat` 的顶层 helper 参数。

现在推荐：

- `TrChat.Provider` 上显式传 `mcpManager`
- 或 `TrChat.Root` runtime 里带 `mcp`

如果你只是要在 sender footer 里放触发器，最常见是：

```vue
<TrChat.Provider :response-provider="responseProvider" :mcp-manager="mcpManager">
  <TrChat.Layout>
    <TrChat.MessageList auto-scroll />
    <TrChat.Footer>
      <TrChat.Sender>
        <template #footer>
          <TrMcpTrigger />
        </template>
      </TrChat.Sender>
    </TrChat.Footer>
  </TrChat.Layout>
</TrChat.Provider>
```

## sender extensions 现在怎么接

`TrChat.Sender` 的 `extensions` 属于叶子级 whitebox 能力，不是黑盒 `TrChat` 配置的一部分。

也就是说：

- 想用 suggestion / mention / 自定义 sender extension
- 直接走 `Root + primitives` 或 `Provider`
- 不要再把它当成黑盒 `TrChat` 的一层隐藏 passthrough

## 兼容/比较 helper 现在处于什么位置

下面这些 helper 仍然公开，但它们不再是默认文档主线：

- `useMcpManager`
- `useChatAttachments`

现在更准确的理解是：

- 这些是白盒或 owner-domain helper
- 不是 `TrChat` 黑盒入口的默认配套参数

补一句边界：

- `createChatAdapterFromConfig`、`createPresetChatProps`、`createPresetChatSlices` 已经退休，不再属于支持中的 package story
- 旧的 `useChatKit` 对外 helper 心智也已经退休；后续更推荐迁到 `createRuntimeFromConfig(config)`、`TrChat.Root + TrChat.Page` 或 `TrChat.Root + primitives`

## 下一步看哪里

- 查黑盒入口与官方梯子：看 [Chat 接入与入口](./chat.md)
- 查 target `TrChatConfig` 字段：看 [Chat 配置与能力](./chat-features.md)
