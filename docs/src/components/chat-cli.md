---
outline: deep
---

# Chat CLI

`create-tiny-robot` 是 TinyRobot Chat 的项目脚手架。  
它负责把 `@opentiny/tiny-robot-chat` 初始化成一个可以启动、可以继续开发、也更接近真实工程结构的聊天应用骨架。

如果你只想先跑起来，先看下面的“快速开始”。  
如果你已经创建完项目，下一步优先看生成项目根目录下的 `README.md`。

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

这个命令会：

1. 在当前目录下创建 `my-chat-app`
2. 使用 `basic` 模板
3. 选择 `deepseek` 作为默认 provider
4. 跳过交互式提问
5. 不自动安装依赖

---

## 前置要求

- Node.js 18 及以上
- npm、pnpm、yarn 或 bun 任意一种包管理器
- 创建项目和安装依赖时需要联网

---

## 常用参数

| 参数 | 说明 | 当前值或范围 |
|:--|:--|:--|
| `--template` | 指定模板 | 当前仅支持 `basic` |
| `--provider` | 指定默认模型提供商 | `openai` / `deepseek` / `custom` |
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

## Provider 会影响什么

`--provider` 不只是一个命令行选项，它会直接影响生成项目里的默认配置。

主要影响面包括：

- `src/chat.config.ts`
  - 默认 `model.id`
  - 默认 `provider`
- `server/chat-proxy.example.ts`
  - 上游请求地址
  - 服务端环境变量名
- 生成项目的 `README.md`
  - 当前 provider 对应的快速开始说明
  - 当前 provider 对应的默认配置说明

可以先这样理解：

| Provider | 默认模型示例 | 服务端密钥变量示例 | 上游地址示例 |
|:--|:--|:--|:--|
| `openai` | `gpt-4o-mini` | `OPENAI_API_KEY` | `https://api.openai.com/v1/chat/completions` |
| `deepseek` | `deepseek-chat` | `DEEPSEEK_API_KEY` | `https://api.deepseek.com/v1/chat/completions` |
| `custom` | `custom-model` | `CUSTOM_API_KEY` | 由你自己的兼容网关决定 |

如果你只是想知道这个 CLI 支持哪些 provider、provider 会影响哪些文件，看本文档就够了。  
如果你想知道“我刚刚生成的这个项目现在到底该填哪个 Key、默认模型是什么、代理请求打到哪里”，请以生成项目根目录下的 `README.md` 为准。

---

## 创建完成后先做什么

推荐顺序：

1. 进入生成出来的项目目录
2. 打开项目根目录 `README.md`
3. 确认当前 provider 的默认模型、服务端环境变量和上游地址
4. 按 `README.md` 把 `.env.example` 复制为 `.env.local`
5. 按你的后端框架接入 `server/chat-proxy.example.ts`
6. 页面跑通后，再去改 `src/chat.config.ts`

如果你是通过 `--provider deepseek` 创建的项目，不要只凭记忆去改配置。  
先看生成项目 `README.md` 里已经注入好的 provider 说明，效率更高，也更不容易配错。

---

## 生成后的项目结构

当前基础模板更偏“配置驱动”，而不是把所有接入逻辑都塞在 `App.vue` 里。

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

各文件职责如下：

- `src/App.vue`
  - 页面入口，只消费已经组装好的 `chatPreset`
- `src/chat.config.ts`
  - 声明默认模型、provider、品牌文案、欢迎语、prompts
- `src/lib/chat.ts`
  - 把配置转换成 `chat adapter` 和 `preset props`
- `server/chat-proxy.example.ts`
  - 服务端代理的最小参考实现
- `.env.example`
  - 前端请求地址示例

---

## 为什么默认推荐服务端代理

这是使用 `chat-cli` 时最值得注意的一点。

默认推荐路径是：

- 前端请求你自己的 `/api/chat`
- 由服务端代理去请求真实模型平台

这样做的好处是：

- 浏览器不直接暴露 provider API Key
- 更容易做权限控制、限流、日志和审计
- 更方便未来统一接多个 provider

这也意味着：

- `VITE_*` 变量只应该放前端可见配置
- 真正的 provider API Key 应该保留在服务端环境变量中
- 如果你切换了 provider，通常要同时检查 `chat.config.ts` 和 `chat-proxy.example.ts`

---

## 一个最小示例

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

真正需要你优先修改的，通常是 `src/chat.config.ts`。

如果你是第一次上手，建议先只改这些内容：

- 品牌标题
- 欢迎文案
- 默认 prompts

等页面确认跑通以后，再去改模型和 provider。

---

## 它和 Chat 包的关系

这个关系很重要：

- `@opentiny/tiny-robot-chat` 负责聊天能力本身
- `create-tiny-robot` 负责生成一个消费这些能力的项目

也就是说：

- Chat 包是能力层
- Chat CLI 是初始化层

可以把它们理解成“底座 + 脚手架”的关系。

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

如果你当前只是要快速起步，现阶段已经够用。  
如果你想把它当成大型模板平台，它还在继续演进中。

---

## 常见问题

### 我应该直接改 `App.vue` 吗？

一般不建议一开始就改。  
更推荐先改 `src/chat.config.ts`，因为这样更符合这个脚手架的设计目标。

### 我能不能把模型 API Key 直接放前端？

可以做 demo，但不推荐作为正式方案。  
更推荐走服务端代理。

### 为什么生成结果里还有 `server/chat-proxy.example.ts`？

因为模板默认希望你采用更安全的后端代理路径。  
这个文件是参考实现，不一定和你的服务端框架一模一样，但它能帮你更快理解推荐接法。

### `--provider deepseek` 创建后，我应该先看哪里？

先看生成项目根目录下的 `README.md`。  
因为本文档只说明通用规则，而项目 `README.md` 会展示这次生成结果对应的实际默认值，例如：

- 默认 provider
- 默认模型
- 服务端环境变量名
- 代理上游地址

### 如果我后面要深度定制页面怎么办？

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
