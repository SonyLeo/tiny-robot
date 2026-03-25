---
outline: deep
---

# Chat

`@opentiny/tiny-robot-chat` 是 TinyRobot 的聊天场景组装层。

它负责把：

- `@opentiny/tiny-robot` 的原子 UI
- `@opentiny/tiny-robot-kit` 的消息 / 会话运行时
- 聊天场景里的模型切换、历史、反馈、附件、MCP 能力

组织成可直接落地、也可继续扩展的聊天基座。

## 核心入口

当前建议按两条主路径使用：

### 1. 黑盒入口

- `TrChat`

黑盒入口现在推荐走：

```ts
config + runtime + callbacks + presetOverrides
```

其中：

- `config` 负责声明式配置
- `runtime` 负责注入运行时对象，如 `chatKit`、`storage`、`plugins`、`mcpManager`
- `callbacks` 负责行为回调
- `presetOverrides` 负责对默认 UI 行为做轻量覆盖

### 2. 白盒入口

- `TrChat.Scaffold`
- `TrChat.Layout`
- `TrChat.Header`
- `TrChat.Welcome`
- `TrChat.MessageList`
- `TrChat.Footer`
- `TrChat.Sender`
- `TrChat.History`

白盒入口现在的定位是“黑盒的中间组装层”：

- `Scaffold` 负责准备默认值
- 叶子组件负责消费 scaffold defaults
- 使用者只在确实需要控制页面结构时才自己写 template

## 推荐接入路径

### 路径 1：直接使用 `TrChat`

适合：

- 先跑通完整聊天页
- 优先验证产品路径
- 以配置驱动为主，不希望页面内手写大量装配代码

最小使用方式通常是：

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

### 路径 2：使用 `TrChat.Scaffold`

适合：

- 已经有自己的页面结构
- 希望减少 slice props 手工透传
- 想复用默认值解析链，但保留布局控制权

典型链路是：

```text
config
  -> TrChat.Scaffold
  -> scaffold context
  -> Layout / Header / Welcome / MessageList / Sender ...
```

### 路径 3：使用 adapter / preset 工具链

适合：

- 脚手架、模板、CLI
- 需要在运行前先做配置归一化
- 需要直接消费 `presetProps / presetSlices`

典型链路是：

```text
ChatConfig
  -> createChatAdapterFromConfig()
  -> createPresetChatProps() / createPresetChatSlices()
  -> Scaffold / chat-cli / internal composition
```

## 与其他包的关系

| 层级 | 包 | 职责 |
|:--|:--|:--|
| 原子 UI 层 | `@opentiny/tiny-robot` | `Bubble`、`Sender`、`Prompts`、`History` 等基础组件 |
| 运行时层 | `@opentiny/tiny-robot-kit` | 消息流、会话管理、请求状态、工具调用等 |
| 场景组装层 | `@opentiny/tiny-robot-chat` | `TrChat`、`Scaffold`、模型选择、配置驱动入口、聊天场景默认装配 |

## 什么时候用黑盒，什么时候用白盒

优先用黑盒：

- 你需要的是“一个完整聊天页”
- 你更关心配置而不是页面拼装
- 你希望后续和模板 / CLI 对齐

改用白盒：

- 你要接入自己的页面结构
- 你要替换局部布局，而不是整套运行时
- 你只想覆写局部组件或局部区域

## 生产建议

- 推荐让前端调用你自己的 `/api/chat`，由服务端再转真实 provider
- 黑盒优先走 `config` 路径，不建议再把零散黑盒 props 堆回 `TrChat`
- 白盒优先通过 `Scaffold` 获取默认值，而不是页面里手工拼一套 slice 透传链

## 相关文档

- [Chat CLI 脚手架](./chat-cli.md)
- [Sender 消息输入框](./sender.md)
- [History 历史](./history.md)
- [Feedback 气泡反馈](./feedback.md)
- [Prompts 提示集](./prompts.md)
