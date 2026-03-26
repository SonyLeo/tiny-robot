---
outline: deep
---

# Chat Scaffold 与 Root

这页聚焦 `TrChat.Scaffold`、`TrChat.Root` 和白盒组合。

如果你已经知道：

- `TrChat` 能跑起来
- 但你不想完全接受默认页面结构
- 同时也不想从零手工重建模型、provider、preset 装配链

那么这里就是下一步。

## 什么时候用 `Scaffold`，什么时候用 `Root`

| 入口 | 适合场景 | 你会得到什么 |
| :-- | :-- | :-- |
| `TrChat.Scaffold` | 想保留默认解析链，但自己控制页面结构 | `adapter`、`presetProps`、`presetSlices`、默认 chatKit、模型切换能力 |
| `TrChat.Root` | 已经有自己的 chatKit 或只想手工装配叶子组件 | 上下文注入层，不绑定默认页面结构 |

可以简单理解为：

- `Scaffold` 是“黑盒的中间装配层”
- `Root` 是“白盒组合的上下文根节点”

## `TrChat.Scaffold`

### 它做了什么

`TrChat.Scaffold` 会自动完成这条链路：

```text
config
  -> createChatAdapterFromConfig()
  -> createPresetChatProps()
  -> createPresetChatSlices()
  -> 默认 chatKit / 模型切换 / context provide
```

也就是说，它帮你保留了黑盒默认值的解析能力，但把页面结构控制权还给了你。

### 它适合什么场景

- 你想自己写 `Layout / Header / Welcome / MessageList / Footer`
- 你想插自己的按钮、工具条或侧栏
- 你想局部覆盖默认渲染，但不想自己重写 `config -> preset` 的整条链

### `Scaffold` props

`TrChat.Scaffold` 和 `TrChat` 基本同构，常用输入仍然是：

- `config`
- `runtime`
- `callbacks`
- `presetOverrides`

不同点在于：`Scaffold` 会把解析结果通过 default slot 暴露出来。

### default slot 会拿到什么

`TrChat.Scaffold` 的 default slot 当前会拿到：

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
- 根据 `presetSlices` 去装配叶子组件
- 用 `chatKit.messages.value.length` 决定欢迎区和消息区切换

### 一个典型的 `Scaffold` 示例

```vue
<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'

const chatConfig = {
  models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
  providers: {
    openai: {
      type: 'openai-compatible',
      endpoint: '/api/chat',
    },
  },
  ui: {
    brand: {
      title: 'Chat Scaffold',
    },
    welcome: {
      title: '欢迎使用 Scaffold',
      description: '保留默认解析链，同时自己控制布局。',
    },
  },
}
</script>

<template>
  <TrChat.Scaffold :config="chatConfig" v-slot="{ chatKit, presetSlices }">
    <TrChat.Layout>
      <TrChat.Header v-bind="presetSlices.header" />

      <TrChat.Welcome
        v-if="chatKit.messages.value.length === 0 && presetSlices.welcome"
        v-bind="presetSlices.welcome"
        @prompt-click="chatKit.sendMessage($event)"
      />

      <TrChat.MessageList v-else v-bind="presetSlices.messageList" />

      <TrChat.Footer>
        <TrChat.Sender v-bind="presetSlices.sender" />
      </TrChat.Footer>
    </TrChat.Layout>
  </TrChat.Scaffold>
</template>
```

## `TrChat.Root`

### 它的定位

`TrChat.Root` 不是完整页面，它是上下文提供层。

它负责把这些能力注入给后代组件：

- `chatKit`
- 历史抽屉状态
- 文案覆盖
- 附件 feature / manager
- sender actions feature
- `mcpManager`

### 两种接入方式

`TrChat.Root` 有两种互斥模式。

#### 方式 1：直接传 `chatKit`

适合：

- 你已经在页面里自己调用了 `useChatKit`
- 你要和业务逻辑共享 chatKit

```vue
<script setup lang="ts">
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'

const chat = useChatKit({
  responseProvider: async function* () {
    // ...
  },
})
</script>

<template>
  <TrChat.Root :chat-kit="chat">
    <TrChat.Layout>
      <TrChat.Header title="白盒模式" />
      <TrChat.MessageList auto-scroll />
      <TrChat.Footer>
        <TrChat.Sender placeholder="请输入..." />
      </TrChat.Footer>
    </TrChat.Layout>
  </TrChat.Root>
</template>
```

#### 方式 2：直接传 `responseProvider`

适合：

- 你想用白盒组合
- 但不想自己先创建 `chatKit`

```vue
<template>
  <TrChat.Root :response-provider="responseProvider">
    <TrChat.Layout>
      <TrChat.Header title="Root Provider 模式" />
      <TrChat.MessageList auto-scroll />
      <TrChat.Footer>
        <TrChat.Sender />
      </TrChat.Footer>
    </TrChat.Layout>
  </TrChat.Root>
</template>
```

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
  -> TrChat.History
```

如果你要使用这些能力，也建议一起考虑：

- `TrChat.Attachments`
- `TrMcpTrigger`
- `TrModelSelector`
- `TrChatMcpPanel`
- `TrChat.HistorySurface`

## `presetProps` 和 `presetSlices` 的区别

这两个概念容易混淆。

### `presetProps`

更偏“抽象 preset 层”，适合：

- 再次计算
- 做统一能力面消费
- 给工具链或中间层使用

### `presetSlices`

更偏“叶子组件消费层”，适合：

- 直接 `v-bind` 到 `Header / Welcome / MessageList / Sender`
- 作为白盒页面的默认 props 来源

一个简单经验：

- 页面装配时优先消费 `presetSlices`
- 平台层、模板层、二次封装时再考虑直接消费 `presetProps`

## 关于 `TrChat.Header` 的 contract 边界

当前文档把 `TrChat.Header` 作为白盒叶子组件来使用，但这里需要特别区分：

- 从稳定公开类型看，`TrChatHeaderProps` 当前主要暴露的是 `showHistory`、`showNewChat` 和 `title`
- 一些全屏 / 关闭相关行为虽然在当前实现里存在，并且会通过 scaffold header slice 参与默认装配，但它们暂时不应被当作 `TrChat.Header` 的正式 props contract 来文档化

因此：

- 如果你是在消费 `presetSlices.header`，可以把它理解成默认装配结果的一部分
- 但如果你是在写叶子组件 API 文档，不建议把全屏 / 关闭这类字段直接写成 `TrChat.Header` 的稳定公开 props，除非对应的导出类型先补齐

换句话说，当前应优先把这类能力当成“场景装配层行为”，而不是“Header 单组件 contract”。

## 推荐的白盒演进路径

如果你正在从黑盒往白盒演进，建议按这个顺序来：

1. 先保留 `TrChat`
2. 需要改结构时改用 `TrChat.Scaffold`
3. 只有在你明确需要自己掌控 `chatKit` 或 `Root` 注入层时，再直接切到 `TrChat.Root`

这样可以减少你手工维护默认值解析链的成本。

## 相关页面

- [Chat 黑盒配置](./chat-config.md)
- [Chat Slots 与渲染定制](./chat-slots.md)
- [Chat Features](./chat-features.md)
- [Chat 进阶能力](./chat-advanced.md)
