---
outline: deep
---

# Chat

`@opentiny/tiny-robot-chat` 是 TinyRobot 的聊天场景基座。

它不是单一组件，也不是单纯的消息状态 hook，而是一层把聊天 UI、消息状态、模型切换、历史管理、反馈能力和配置驱动入口组织起来的 chat kit。

如果只用一句话概括它的定位：

> `@opentiny/tiny-robot` 提供原子 UI，`@opentiny/tiny-robot-kit` 提供消息与会话状态，`@opentiny/tiny-robot-chat` 负责把它们组装成可直接落地、也可继续扩展的聊天应用基座。

---

## 它解决什么问题

很多项目在进入聊天场景后，很快会遇到这些共性问题：

- 有 `Bubble`、`Sender`、`Prompts` 等基础组件，但缺少一条稳定的聊天场景主链路。
- 页面能发消息，但会话历史、模型切换、错误处理、流式状态和反馈能力会逐渐变复杂。
- 只用黑盒组件落地快，但深度定制会受限；只用底层 hook 又需要自己重复装配很多场景逻辑。
- 后续希望接入脚手架、模板生成或统一配置时，缺少稳定入口。

`@opentiny/tiny-robot-chat` 的价值就在这里：它负责把这些高频能力收拢为一个更稳定的场景层。

---

## 它不是什么

为了避免误解，可以先明确它的边界：

- 它不是大模型 SDK。
- 它不是后端代理服务。
- 它不是单纯的视觉组件集合。
- 它也不等于 demo 页面本身。

如果你需要的是模型调用、密钥管理或服务端网关，请放在服务端处理；`chat` 负责的是前端聊天场景的组装与消费。

---

## 和其他包的关系

可以把 TinyRobot 的聊天能力理解成三层：

| 层级 | 包 | 主要职责 |
|:--|:--|:--|
| 原子 UI 层 | `@opentiny/tiny-robot` | `Bubble`、`Sender`、`Prompts`、`History`、按钮、容器等基础界面能力 |
| 状态与请求层 | `@opentiny/tiny-robot-kit` | 消息流、会话管理、请求状态、工具调用状态等 |
| 场景组装层 | `@opentiny/tiny-robot-chat` | `TrChat`、白盒组合、模型选择、MCP 接入、配置驱动入口 |

因此，`chat` 的职责不是重复导出所有原子组件，而是为聊天场景提供一条稳定的组装链路。

---

## 核心能力

当前 `@opentiny/tiny-robot-chat` 主要提供三类入口：

### 1. 黑盒入口

适合先快速落地完整聊天页：

- `TrChat`

### 2. 白盒入口

适合已有页面结构，或者需要自己控制布局与插槽：

- `TrChat.Root`
- `TrChat.Layout`
- `TrChat.Header`
- `TrChat.Welcome`
- `TrChat.MessageList`
- `TrChat.Footer`
- `TrChat.Sender`
- `TrChat.History`

### 3. 组合与配置入口

适合需要复用状态能力、做配置驱动或服务 `chat-cli`：

- `useChatKit`
- `useModelSelector`
- `useMcpManager`
- `createChatAdapterFromConfig`
- `createPresetChatProps`
- `createServerProxyProvider`

---

## 适合谁使用

`chat` 特别适合下面这些场景：

- 你想先快速搭一个“可用的聊天页”，不想从零拼装消息区、输入区和历史区。
- 你已经有自己的业务页面，但希望复用聊天状态管理、模型切换和错误处理能力。
- 你希望同时支持“快速接入”和“深度定制”。
- 你准备通过统一配置、脚手架或模板生成聊天应用。

如果你只是想单独使用输入框、气泡、历史列表等原子组件，直接看对应组件文档会更合适。

---

## 推荐接入路径

### 路径 1：直接使用 `TrChat`

适合：

- 想先尽快跑通主链路
- 优先验证产品方向
- 当前不需要大幅自定义页面结构

最小使用方式通常是：

```vue
<script setup lang="ts">
import { TrChat, createServerProxyProvider } from '@opentiny/tiny-robot-chat'

const responseProvider = createServerProxyProvider({
  endpoint: '/api/chat',
})
</script>

<template>
  <TrChat :response-provider="responseProvider" />
</template>
```

### 路径 2：使用白盒组合

适合：

- 已经有自己的页面结构
- 需要自己控制 Header、Welcome、Sender、History 的组合方式
- 希望复用同一套聊天状态能力，但不想被默认布局限制

这条路径通常以 `useChatKit + TrChat.Root + TrChat.Layout + 子组件` 为核心。

### 路径 3：使用配置驱动入口

适合：

- 需要统一配置输入
- 需要多项目复用
- 计划接入 `chat-cli`、模板或脚手架

推荐链路是：

```text
ChatConfig
  -> createChatAdapterFromConfig()
  -> createPresetChatProps()
  -> TrChat
```

如果你的目标是模板生成或 CLI 集成，这通常是最推荐的正式入口。

---

## 为什么它适合作为 `chat-cli` 的基座

`chat-cli` 需要消费的不是零散组件，而是一条稳定、声明式的聊天装配链路。

`@opentiny/tiny-robot-chat` 正好承担这层职责：

- 向上承接 `ChatConfig`
- 向下产出稳定的聊天运行时输入
- 同时兼容黑盒落地和白盒扩展

这也是 `chat` 和普通聊天 demo 的关键区别：它不只是让页面“能聊起来”，而是要成为后续模板生成和能力复用的基础。

---

## 生产环境建议

### 优先使用服务端代理

推荐让前端调用你自己的 `/api/chat`，由服务端再去访问真实模型平台。

这样做的好处是：

- 浏览器不直接暴露 API Key
- 更容易做权限控制、限流和审计
- 更容易统一接入多个 provider

### 先跑通，再扩展

对大多数项目来说，建议先用黑盒跑通主链路，再根据需要切到白盒组合。

### 优先配置驱动，而不是页面内散落手写

如果项目会长期维护、会扩展到多个业务、会接入脚手架或模板，优先考虑 `ChatConfig -> Adapter -> Preset` 这条路径。

### 不要把 demo 直接当成生产实现

demo 更适合验证组件行为和交互链路，不应直接当成生产规范照搬。

---

## 相关文档

- [Chat CLI 脚手架](./chat-cli.md)
- [Sender 消息输入框](./sender.md)
- [History 历史](./history.md)
- [Feedback 气泡反馈](./feedback.md)
- [Prompts 提示集](./prompts.md)

如果你准备从项目初始化开始接入，先看 `Chat CLI`；如果你准备自行组合页面，再看对应的原子组件文档会更高效。
