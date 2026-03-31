---
outline: deep
---

# Chat CLI

`create-tiny-robot` 是 TinyRobot Chat 的项目脚手架。

它的职责不是复制一个 demo 页面，而是生成一个已经接好 `@opentiny/tiny-robot-chat`、可以继续按工程方式演进的聊天项目起点。

如果你只想先跑起来，先看“快速开始”。  
如果你已经生成了项目，下一步优先看生成项目根目录下的 `README.md`，因为那里会展示这次生成结果对应的实际默认值。

---

## 它适合什么场景

`chat-cli` 主要适合这些情况：

- 你想快速生成一个可继续开发的 TinyRobot Chat 项目
- 你希望默认采用更安全的服务端代理接法
- 你希望项目结构从一开始就围绕 `chat.config.ts -> adapter -> preset -> TrChat` 这条链路组织
- 你希望后续还能继续定制页面、模型、Provider 和后端代理

可以把它理解成：

- `@opentiny/tiny-robot-chat` 是能力层
- `create-tiny-robot` 是初始化层

---

## 快速开始

### 交互式创建

按当前使用的包管理器选择一种方式即可：

```bash
npm create tiny-robot@latest
```

```bash
pnpm create tiny-robot
```

```bash
yarn create tiny-robot
```

```bash
bun create tiny-robot
```

### 非交互式创建

```bash
pnpm create tiny-robot my-chat-app --template basic --provider deepseek --yes --no-install
```

```bash
pnpm create tiny-robot my-agent --template agent-mcp --provider openai --yes --no-install
```

这个命令会：

1. 在当前目录下创建 `my-chat-app`
2. 使用 `basic` 模板
3. 选择 `deepseek` 作为默认 Provider
4. 跳过交互式提问
5. 不自动安装依赖

---

## 前置要求

- Node.js 18 及以上
- npm、pnpm、yarn 或 bun 任意一种包管理器
- 创建项目和安装依赖时需要联网

---

## 当前支持的参数

| 参数 | 说明 | 当前值或范围 |
|:--|:--|:--|
| `--template` | 指定模板 | `basic` / `agent-mcp` |
| `--provider` | 指定默认 Provider | `openai` / `deepseek` / `custom` |
| `--yes` | 使用默认值并跳过交互 | 布尔值 |
| `--install` | 创建后自动安装依赖 | 布尔值 |
| `--no-install` | 创建后不安装依赖 | 布尔值 |
| `--overwrite` | 允许覆盖已有非空目录 | 布尔值 |
| `--cwd` | 指定项目生成根目录 | 任意有效路径 |

常见示例：

```bash
pnpm create tiny-robot my-chat-app --provider openai
```

```bash
pnpm create tiny-robot my-chat-app --provider deepseek --yes
```

```bash
pnpm create tiny-robot my-chat-app --provider custom --no-install --cwd ./examples
```

---

## 生成结果里会有什么

当前默认模板更偏“配置驱动”，而不是把所有接入逻辑都直接写在 `App.vue` 中。

当前稳定模板有两类：

- `basic`
  - 默认聊天模板
  - white-box 消费 `chatCapabilitySurface.presetSlices`
- `agent-mcp`
  - 工具型 Agent / MCP 起步模板
  - 在 `basic` 的 contract consumption 路径上增加 MCP manager、tool plugin 和面板入口

## 如何选择模板

如果你只想先做一个普通聊天产品起点，优先选 `basic`。  
如果你从第一天就需要工具协作、MCP 面板或 Copilot 风格的起步结构，再选 `agent-mcp`。

可以直接按下面判断：

| 模板 | 更适合什么场景 | 生成后优先改什么 |
|:--|:--|:--|
| `basic` | 通用聊天、业务接入、先把主链路跑通 | `src/chat.config.ts`、`server/chat-proxy.example.ts` |
| `agent-mcp` | 工具型 Agent、Copilot、MCP 插件协作 | `src/chat.config.ts`、`src/lib/mcp.ts`、`server/chat-proxy.example.ts` |

补充判断：

- `basic` 是默认起步模板
- `agent-mcp` 是 MCP starter，不是完整 agent 平台
- 如果你还不确定自己要不要 MCP，先从 `basic` 开始通常更稳

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

各文件职责：

- `src/App.vue`
  - 页面入口，消费 `chatCapabilitySurface.presetSlices`
- `src/chat.config.ts`
  - 声明默认模型、Provider 和基础 UI 配置
- `src/lib/chat.ts`
  - 把 `chat.config.ts` 转成 `adapter` 和 `chatCapabilitySurface`
- `server/chat-proxy.example.ts`
  - 服务端代理的最小参考实现
- `.env.example`
  - 前端请求地址示例

---

## `--provider` 会影响什么

`--provider` 不只是一个交互选项，它会直接影响生成项目里的默认配置。

主要影响面包括：

- `src/chat.config.ts`
  - 默认模型
  - 默认 Provider 配置
- `server/chat-proxy.example.ts`
  - 服务端环境变量名
  - 默认上游地址
- 生成项目的 `README.md`
  - 当前生成结果对应的快速开始说明
  - 当前 Provider 对应的默认值

可以先这样理解：

| CLI 输入 | 生成项目中的默认模型 | 服务端密钥变量示例 | 上游地址示例 |
|:--|:--|:--|:--|
| `openai` | `gpt-4o-mini` | `OPENAI_API_KEY` | `https://api.openai.com/v1/chat/completions` |
| `deepseek` | `deepseek-chat` | `DEEPSEEK_API_KEY` | `https://api.deepseek.com/v1/chat/completions` |
| `custom` | `custom-model` | `CUSTOM_API_KEY` | 由你自己的兼容网关决定 |

需要特别说明的是：

- `--provider custom` 表示“生成一个面向 OpenAI-compatible 后端的默认配置”
- 在生成出的 `src/chat.config.ts` 里，它会落成 `openai-compatible` 类型的 Provider 配置，而不是字面上的 `custom` Provider ID

所以如果你后面读到模板代码里出现的是 `openai-compatible`，这是符合当前生成逻辑的，不是多出了一层额外概念。

---

## 创建完成后先做什么

推荐顺序：

1. 进入生成出来的项目目录
2. 打开项目根目录 `README.md`
3. 确认当前 Provider 的默认模型、服务端环境变量和上游地址
4. 按 `README.md` 把 `.env.example` 复制为 `.env.local`
5. 按你的后端框架接入 `server/chat-proxy.example.ts`
6. 页面跑通后，再去改 `src/chat.config.ts`

如果你是通过 `--provider deepseek` 或 `--provider custom` 创建的项目，不建议只凭记忆去改配置。  
先看生成项目 `README.md` 里已经注入好的实际默认值，会更稳。

---

## 为什么默认推荐服务端代理

当前推荐路径是：

- 前端请求你自己的 `/api/chat`
- 由服务端代理去请求真实模型平台

这样做的好处是：

- 浏览器不直接暴露 Provider API Key
- 更容易做权限控制、限流、日志和审计
- 更容易在后续接入多个模型提供商或企业内部网关

这也意味着：

- `VITE_*` 变量只应该放前端可见配置
- 真正的 API Key 应保留在服务端环境变量中
- 如果你切换了 Provider，通常要同时检查 `chat.config.ts` 和 `chat-proxy.example.ts`

---

## 一个最小入口示例

生成项目后，`App.vue` 不再只是简单绑定一套默认接入 preset，而是更明确地消费模板能力切片。典型结构会类似：

```vue
<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'
import { chatCapabilitySurface } from './lib/chat'

const slices = chatCapabilitySurface.presetSlices
</script>

<template>
  <TrChat.Root v-bind="slices.root">
    <TrChat.Layout v-bind="slices.layout">
      <TrChat.Header v-bind="slices.header" />
      <TrChat.MessageList v-bind="slices.messageList" />
      <TrChat.Footer>
        <TrChat.Sender v-bind="slices.sender" />
      </TrChat.Footer>
    </TrChat.Layout>
  </TrChat.Root>
</template>
```

真正需要你优先修改的，一般不是 `App.vue`，而是：

- `src/chat.config.ts`
- `server/chat-proxy.example.ts`

如果你是第一次上手，建议先只改这些内容：

- 品牌标题
- 欢迎文案
- 默认 prompts
- 默认模型与 Provider
- 如果是 `agent-mcp`，再改 `src/lib/mcp.ts` 里的 MCP plugin metadata 和 bridge

补充说明：

- 当前稳定模板都经过 registry、校验和构建验证
- 如果你只是使用 CLI，不需要先理解内部的模板治理字段

---

## 它和 `@opentiny/tiny-robot-chat` 的关系

这个关系很重要：

- `@opentiny/tiny-robot-chat` 负责聊天能力本身
- `create-tiny-robot` 负责生成一个消费这些能力的项目

也就是说，CLI 只是帮你搭好起点。  
如果你后面要深度定制页面，你仍然可以继续使用：

- `TrChat`
- `useChatKit`
- `createChatAdapterFromConfig`
- 手动装配方式

---

## 常见问题

### 我应该直接改 `App.vue` 吗？

通常不建议一开始就改。  
更推荐先改 `src/chat.config.ts`，因为这更符合当前模板的组织方式。

### 我能不能把模型 API Key 直接放前端？

可以做 demo，但不推荐作为正式方案。  
更推荐走服务端代理。

### 为什么生成结果里还有 `server/chat-proxy.example.ts`？

因为当前模板默认推荐更安全的后端代理路径。  
这个文件是一个最小参考实现，不要求和你的后端框架完全一致，但可以帮助你更快接入推荐链路。

### `--provider custom` 创建后，为什么代码里看到的是 `openai-compatible`？

因为 `custom` 是 CLI 层的选择项，用来表达“我要接自定义兼容后端”。  
落到生成项目代码时，当前模板会把它转换成 OpenAI-compatible 的 Provider 配置。

### `--provider deepseek` 创建后，我应该先看哪里？

先看生成项目根目录下的 `README.md`。  
本文档只说明通用规则，而项目 `README.md` 会展示这次生成结果对应的实际默认值，例如：

- 默认 Provider
- 默认模型
- 服务端环境变量名
- 代理上游地址

---

## 相关文档

- [Chat 快速接入](./chat.md)

如果你想了解聊天能力本身怎么组织，看 `Chat` 文档；如果你要初始化一个项目并开始开发，优先从这里开始。

---

## 一句话记忆

如果只记住一句话，可以记这个：

> `chat-cli` 的目标不是复制一个示例页面，而是生成一个已经接好 TinyRobot Chat、适合继续工程化开发的项目起点。
