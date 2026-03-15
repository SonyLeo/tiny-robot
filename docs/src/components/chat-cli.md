---
outline: deep
---

# Chat CLI

`create-tiny-robot` 是 `packages/chat-cli` 对外提供的脚手架工具。  
它的目标不是单纯“复制一个示例项目”，而是帮助你基于 `@opentiny/tiny-robot-chat` 快速生成一个可继续开发的聊天应用骨架。

如果你是第一次接触这个项目，可以先用一句话理解它：

> `@opentiny/tiny-robot-chat` 负责提供聊天套件，`create-tiny-robot` 负责把这套能力初始化成一个可以启动、可以继续改、也更适合后续模板化演进的项目。

---

## 它解决什么问题

很多人第一次做 AI 对话页时，真正耗时的不是写出一个消息列表，而是把下面这些事情串起来：

- 建一个 Vue 项目并接上聊天套件
- 配置默认模型、欢迎语、引导 prompts
- 准备一个更安全的服务端代理入口，而不是直接在浏览器里暴露 Key
- 把这些内容组织成后续还能继续维护的项目结构

`chat-cli` 的作用，就是把这些“起步阶段高频但重复”的工作先帮你做好。

它生成的不是单个组件示例，而是一个基础工程骨架，通常会包含：

- `src/App.vue`
- `src/chat.config.ts`
- `src/lib/chat.ts`
- `server/chat-proxy.example.ts`
- `.env.example`

---

## 适合谁

适合这些场景：

- 你想快速创建一个基于 TinyRobot Chat 的新项目
- 你不想一开始就手动拼 `adapter + preset + provider`
- 你希望生成结果更接近“真实工程”，而不是开发期 demo
- 你后面可能还会把这套项目结构用于团队复用或模板化生成

不适合这样理解：

- 它不是后端服务
- 它不是模型 SDK
- 它也不是把 `demo` 代码原样复制出来的工具

---

## 它和 Chat 包的关系

这个关系很重要。

- `@opentiny/tiny-robot-chat` 负责聊天能力本身
- `create-tiny-robot` 负责生成一个消费这些能力的项目

也就是说：

- Chat 包是能力层
- Chat CLI 是初始化层

建议把它们理解成“底座 + 脚手架”的关系。

---

## 当前推荐的使用方式

最常见的方式是直接创建项目：

```bash
pnpm create tiny-robot
```

也可以用非交互方式：

```bash
pnpm create tiny-robot my-chat-app --template basic --provider openai --no-install
```

当前常用参数包括：

- `--template`
- `--provider`
- `--yes`
- `--install`
- `--no-install`
- `--overwrite`
- `--cwd`

示例：

```bash
pnpm create tiny-robot my-agent-app --template basic --provider deepseek --yes --no-install
```

---

## 生成后的项目长什么样

当前基础模板会更偏“配置驱动”的结构，而不是把所有接入逻辑都塞在 `App.vue` 里。

典型结构如下：

```txt
my-chat-app/
├── src/
│   ├── App.vue
│   ├── chat.config.ts
│   └── lib/
│       └── chat.ts
├── server/
│   └── chat-proxy.example.ts
├── .env.example
└── package.json
```

你可以这样理解各文件职责：

- `App.vue`
  - 页面入口，只消费已经组装好的 `chatPreset`
- `chat.config.ts`
  - 声明默认模型、provider、品牌文案、欢迎语、prompts
- `src/lib/chat.ts`
  - 负责把配置转换成 `chat adapter` 和 `preset props`
- `server/chat-proxy.example.ts`
  - 给你一个服务端代理的参考实现

---

## 为什么默认推荐服务端代理

这是最值得新手注意的一点。

虽然很多聊天示例都会把 API Key 直接写到前端环境变量里，但正式项目不推荐这么做。  
`chat-cli` 当前默认思路是：

- 前端请求你自己的 `/api/chat`
- 由服务端代理去调用真实模型平台

这样做的好处是：

- 浏览器不直接暴露模型平台 Key
- 更容易做权限控制、限流、审计
- 更方便未来统一接多个 provider

所以你看到模板里会默认强调：

- `VITE_CHAT_API_ENDPOINT`
- `server/chat-proxy.example.ts`

而不是让你直接在浏览器里拼 `Authorization: Bearer ...`

---

## 一个最小使用示例

生成项目后，`App.vue` 通常会类似下面这种结构：

```vue
<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'
import { chatPreset } from './lib/chat'
</script>

<template>
  <TrChat v-bind="chatPreset" />
</template>
```

真正需要你改的，通常优先是 `chat.config.ts`：

```ts
export default {
  defaults: {
    model: 'gpt-4o-mini',
  },
  ui: {
    brand: {
      title: 'My Chat App',
    },
    welcome: {
      title: 'Welcome to My Chat App',
      description: 'Ask me anything.',
    },
    prompts: [
      {
        label: 'Summarize this text',
        description: 'Summarize this text',
      },
    ],
  },
}
```

如果你是小白，建议先只改这三类内容：

- 品牌标题
- 欢迎文案
- 默认 prompts

等页面确认跑通以后，再去改模型和 provider。

---

## 推荐的上手顺序

建议按下面顺序使用：

1. 先用 CLI 创建项目
2. 先不急着改 `App.vue`
3. 优先改 `chat.config.ts`
4. 再根据你的后端情况接 `/api/chat`
5. 页面跑通后，再逐步进入白盒定制或多模型支持

这样做的好处是：

- 更容易定位问题
- 不会一上来就把“脚手架问题”和“业务问题”混在一起

---

## CLI 和 Demo 的区别

这点也很容易混淆。

`packages/chat/demo` 的定位是开发阶段验证和回归，不是正式项目模板。  
而 `chat-cli` 的定位是：

- 生成新的业务项目
- 给用户一个更稳定的起点

所以如果你是使用者，优先参考：

- `create-tiny-robot`
- 生成后的模板结构
- 本文档

而不是把 `demo` 当成正式工程规范。

---

## 当前能力边界

目前 `chat-cli` 已经具备这些能力：

- 基础项目生成
- provider 默认值注入
- 项目名注入
- README 命令注入
- 非交互 flags
- 目录覆盖保护
- 基础 smoke build 验证

但它仍然不是一个“平台级生成器”，例如这些能力还属于后续增强方向：

- 多模板体系
- `add` 子命令
- `migrate` 子命令
- 更完整的交互式流程测试
- 真正的模板安装冒烟测试

如果你当前只是要快速起步，现阶段已经够用；  
如果你想把它当成大型模板平台，它还在继续演进中。

---

## 常见问题

## 我应该直接改 `App.vue` 吗？

一般不建议一开始就改。  
更推荐先改 `chat.config.ts`，因为这样更符合这个脚手架的设计目标。

## 我能不能把模型 API Key 直接放前端？

可以做 demo，但不推荐作为正式方案。  
更推荐走服务端代理。

## 为什么生成结果里还有 `server/chat-proxy.example.ts`？

因为模板默认希望你采用更安全的后端代理路径。  
这个文件是参考实现，不一定和你的服务端框架一模一样，但它能帮你更快理解推荐接法。

## 如果我后面要深度定制页面怎么办？

没问题。  
CLI 只是帮你生成起点，后续你仍然可以继续使用：

- `TrChat`
- `useChatKit`
- `createChatAdapterFromConfig`
- 白盒组合方式

---

## 一句话记忆

如果你只记住一句话，可以记这个：

> `chat-cli` 不是为了复制一个示例页面，而是为了帮你把 TinyRobot Chat 初始化成一个更适合真实项目继续开发的起点。
