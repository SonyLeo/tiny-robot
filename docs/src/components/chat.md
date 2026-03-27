---
outline: deep
---

# Chat

`@opentiny/tiny-robot-chat` 是 TinyRobot 的聊天场景装配层。

它负责把：

- `@opentiny/tiny-robot` 的原子 UI
- `@opentiny/tiny-robot-kit` 的消息 / 会话运行时
- 聊天场景里的模型切换、历史、反馈、附件、MCP 等能力

组织成一个可直接落地、也可继续扩展的聊天基座。

和 `Bubble`、`Sender`、`History` 这类单组件不同，`chat` 更像一个“场景包”：

- 你可以直接用 `TrChat` 跑起完整聊天页
- 也可以用 `TrChat.Scaffold`、`TrChat.Root` 和一组叶子组件做白盒装配
- 还可以直接消费 adapter / preset 工具链，把它接进脚手架、模板或内部平台

## 这页解决什么问题

如果你第一次接触 `@opentiny/tiny-robot-chat`，建议先看这页。

这页会帮你回答：

- 这个包和 `tiny-robot`、`tiny-robot-kit` 的边界是什么
- 应该优先用 `TrChat`、`TrChat.Scaffold` 还是 `TrChat.Root`
- 黑盒入口里的 `config / runtime / callbacks / presetOverrides` 分别负责什么
- 后续要看哪个子页继续深入

如果你已经知道自己要补哪一块，可以直接跳到：

- [Chat 黑盒配置](./chat-config.md)
- [Chat Scaffold 与 Root](./chat-scaffold.md)
- [Chat Slots 与渲染定制](./chat-slots.md)
- [Chat Features](./chat-features.md)
- [Chat 进阶能力](./chat-advanced.md)

## 包关系

| 层级 | 包 | 职责 |
| :-- | :-- | :-- |
| 原子 UI 层 | `@opentiny/tiny-robot` | `Bubble`、`Sender`、`Prompts`、`History` 等基础组件 |
| 运行时层 | `@opentiny/tiny-robot-kit` | 消息流、会话管理、请求状态、工具调用等 |
| 场景装配层 | `@opentiny/tiny-robot-chat` | `TrChat`、`TrChat.Scaffold`、模型切换、配置驱动入口、聊天场景默认装配 |

可以简单理解为：

- `tiny-robot` 解决“长什么样”
- `tiny-robot-kit` 解决“消息怎么跑”
- `tiny-robot-chat` 解决“如何把它们拼成一个可用聊天页”

## 三条推荐接入路径

### 路径 1：直接使用 `TrChat`

适合：

- 先跑通完整聊天页
- 优先验证产品路径
- 以配置驱动为主，不希望页面内手写大量装配代码

当前黑盒入口的正式形态是：

```ts
config + runtime + callbacks + presetOverrides
```

其中：

- `config` 负责声明式配置
- `runtime` 负责注入运行时对象，例如 `chatKit`、`plugins`、`storage`、`mcpManager`
- `callbacks` 负责行为回调
- `presetOverrides` 负责对默认 UI 和默认行为做轻量覆盖，例如 `contentLayout`

最小示例：

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
  defaults: {
    model: 'gpt-4o-mini',
  },
}
</script>

<template>
  <TrChat :config="chatConfig" />
</template>
```

<demo vue="../../demos/chat/blackbox.vue" title="黑盒接入" description="使用 TrChat 直接接入完整聊天页。" />

### 路径 2：使用 `TrChat.Scaffold`

适合：

- 你已经有自己的页面结构
- 你想复用默认解析链，但不想手工把一堆 slice props 一层层透传
- 你要改布局、插槽和局部渲染，但不想自己重建模型 / provider / preset 的装配过程

典型链路：

```text
config
  -> TrChat.Scaffold
  -> scaffold context
  -> Layout / Header / Welcome / MessageList / Sender ...
```

`TrChat.Scaffold` 会帮你做：

- `config -> adapter`
- `adapter -> presetProps`
- `presetProps -> presetSlices`
- 默认 `chatKit` 初始化
- 当前模型与 provider 切换

它的 default slot 会暴露：

- `chatKit`
- `adapter`
- `presetProps`
- `presetSlices`
- `currentModel`
- `selectModel`

这条路径适合做“半黑盒、半白盒”的页面。

### 路径 3：使用 `TrChat.Root` / adapter / preset 工具链

适合：

- 脚手架、模板、CLI
- 内部平台或低代码接入层
- 需要在运行前先做配置归一化
- 需要直接消费 `presetProps / presetSlices`

典型链路：

```text
ChatConfig
  -> createChatAdapterFromConfig()
  -> createPresetChatProps() / createPresetChatSlices()
  -> TrChat.Root / TrChat.Layout / TrChat.Header / ...
```

`TrChat.Root` 本身只负责提供上下文，不负责渲染完整页面。它适合作为白盒组合的根节点。

<demo vue="../../demos/chat/whitebox.vue" title="白盒接入" description="使用 Root 和叶子组件手工装配聊天页。" />

## 怎么选

| 诉求 | 推荐入口 | 原因 |
| :-- | :-- | :-- |
| 先把聊天页跑起来 | `TrChat` | 配置驱动，默认能力最完整 |
| 要保留默认解析链，但自己控制页面结构 | `TrChat.Scaffold` | 复用默认值解析，又保留模板控制权 |
| 要完全手工装配，或已经有自己的运行时 | `TrChat.Root` | 只提供上下文，不绑定默认页面结构 |
| 要给模板、脚手架、CLI、平台层消费 | adapter / preset 工具链 | 可以直接消费 `adapter / presetProps / presetSlices` |

一个简单经验：

- 不确定时，先用 `TrChat`
- 只想改布局和局部渲染时，优先试 `TrChat.Scaffold`
- 只有当你明确需要自己掌控上下文和叶子组件拼装时，再直接用 `TrChat.Root`

## 核心概念

### `config`

`config` 是黑盒入口的“静态配置层”。

它主要负责：

- 模型与 provider 声明
- UI 默认值
- layout 默认值
- feature 开关与 feature 配置
- runtime 里能被静态声明的部分

继续阅读：[Chat 黑盒配置](./chat-config.md)

### `runtime`

`runtime` 是黑盒入口的“运行时注入层”。

它适合放：

- `chatKit`
- `plugins`
- `storage`
- `initialMessages`
- `mcpManager`
- `selectedModel`

适合那些不能仅靠静态 `config` 描述的对象。

### `callbacks`

`callbacks` 是黑盒入口的“行为回调层”。

当前常用的有：

- `onFinish`
- `onError`
- `onMessageAction`
- `onModelChange`

### `presetOverrides`

`presetOverrides` 是默认装配结果之上的“轻量覆盖层”。

它适合放：

- `placeholder`
- `maxLength`
- `senderMode`
- `messageListVariant`
- `contentLayout`
- `showHistory`
- `showFeedback`
- `roleConfigs`
- `providerFactories`

它不应该被理解成“重新定义整套场景”，而是对默认 preset 做有边界的覆盖。

一个常见用法是：

- 用 `config.layout.contentLayout` 声明场景默认采用 `centered` 还是 `wide`
- 用 `presetOverrides.contentLayout` 在页面里根据用户切换、断点或容器模式做响应式覆盖

### `presetProps / presetSlices`

这两个概念主要出现在 `Scaffold`、白盒组合和工具链消费里。

- `presetProps` 更偏抽象配置层
- `presetSlices` 更偏叶子组件消费层

如果你要消费 adapter / preset 工具链，建议先看：

- [Chat Scaffold 与 Root](./chat-scaffold.md)
- [Chat 进阶能力](./chat-advanced.md)

## 当前公开 surface

当前 `@opentiny/tiny-robot-chat` 不只导出 `TrChat`。

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
- `TrChat.History`
- `TrChat.HistorySurface`
- `TrMcpTrigger`
- `TrModelSelector`
- `TrChatMcpPanel`
- `TrChatFeedback`
- `createChatAdapterFromConfig`
- `createPresetChatProps`
- `createPresetChatSlices`

这也是为什么 `chat.md` 更适合作为总览页，而不是单个组件 API 页。

## 建议阅读顺序

如果你是第一次接入，建议按这个顺序看：

1. 这页：理解入口分层和接入路径
2. [Chat 黑盒配置](./chat-config.md)：把 `TrChat` 跑起来
3. [Chat Scaffold 与 Root](./chat-scaffold.md)：理解白盒组合
4. [Chat Slots 与渲染定制](./chat-slots.md)：按页面需求做局部替换
5. [Chat Features](./chat-features.md)：把附件、历史、反馈、MCP 等能力打开
6. [Chat 进阶能力](./chat-advanced.md)：消费高级 surface 与工具链

如果你已经在用相关组件，可以继续看：

- [Sender 消息输入框](./sender.md)
- [History 历史](./history.md)
- [Feedback 气泡反馈](./feedback.md)
- [Prompts 提示集](./prompts.md)
- [Chat CLI 脚手架](./chat-cli.md)

## 生产建议

- 推荐让前端调用你自己的 `/api/chat`，由服务端再代理真实 provider
- 黑盒优先走 `config` 路径，不建议把散装黑盒 props 重新堆回 `TrChat`
- 白盒优先通过 `Scaffold` 获取默认值，而不是在页面里手工拼一整套 slice 透传链
- 如果要做模型切换，优先把 `models / providerFactories / defaultModel` 作为一组一起考虑
- 如果要做模板、CLI 或内部平台，优先使用 adapter / preset 工具链，而不是从页面组件反推配置
