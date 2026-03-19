# __PROJECT_TITLE__

一个基于 Tiny Robot Chat Kit 的聊天应用骨架，默认采用“前端只请求你的服务端代理，服务端再请求模型提供商”的接入方式。

适合这些场景：

- 快速启动一个可定制的 AI 助手界面
- 在现有业务后端中接入聊天能力
- 以安全的服务端代理方式对接 OpenAI、DeepSeek 或兼容 OpenAI API 的服务

## 当前模板默认配置

这个 README 会跟随你创建项目时选择的 Provider 一起生成。当前项目默认配置如下：

| 配置项 | 当前值 |
|:--|:--|
| Provider | `__DEFAULT_PROVIDER__` |
| 默认模型 | `__DEFAULT_MODEL__` |
| 服务端密钥变量 | `__PROXY_API_KEY_ENV__` |
| 服务端上游地址 | `__PROXY_ENDPOINT__` |

如果你是通过 DeepSeek 相关命令生成的项目，这里会直接显示为：

- Provider: `deepseek`
- 默认模型: `deepseek-chat`
- 服务端密钥变量: `DEEPSEEK_API_KEY`
- 上游地址: `https://api.deepseek.com/v1/chat/completions`

如果你后续改成 OpenAI 或你自己的兼容网关，需要同时修改：

- [src/chat.config.ts](./src/chat.config.ts) 中的 `models` 和 `providers`
- [server/chat-proxy.example.ts](./server/chat-proxy.example.ts) 中的上游地址和认证变量

## 快速开始

### 1. 安装依赖

```bash
__INSTALL_COMMAND__
```

### 2. 配置前端请求地址

将 `.env.example` 复制为 `.env.local`，并确认它包含：

```env
VITE_CHAT_API_ENDPOINT=/api/chat
```

`VITE_CHAT_API_ENDPOINT` 只用于告诉前端“请求哪个聊天接口”，它会被打进浏览器端代码中。

不要把 API Key、Access Token 或任何秘密信息放进 `VITE_*` 变量。

### 3. 集成服务端代理

`server/chat-proxy.example.ts` 是一个最小参考实现。把它移动到你的服务端运行时中，并在服务端环境变量中配置模型提供商密钥：

```env
__PROXY_API_KEY_ENV__=sk-your-key-here
```

默认上游地址由模板注入为：

```text
__PROXY_ENDPOINT__
```

如果你使用自己的网关或兼容 OpenAI API 的服务，请同步修改该代理文件中的上游地址、认证头和必要的请求参数。

常见 Provider 对应关系：

| Provider | 典型模型 | 服务端环境变量 | 上游地址 |
|:--|:--|:--|:--|
| OpenAI | `gpt-4o-mini` | `OPENAI_API_KEY` | `https://api.openai.com/v1/chat/completions` |
| DeepSeek | `deepseek-chat` | `DEEPSEEK_API_KEY` | `https://api.deepseek.com/v1/chat/completions` |
| 自定义兼容服务 | `custom-model` | `CUSTOM_API_KEY` | 由你自己的网关决定 |

如果当前项目是用 DeepSeek 模板生成的，最少需要保证：

```env
DEEPSEEK_API_KEY=sk-your-key-here
```

并且 [server/chat-proxy.example.ts](./server/chat-proxy.example.ts) 里的上游地址保持为：

```ts
https://api.deepseek.com/v1/chat/completions
```

### 4. 启动本地开发

1. 启动你的后端服务，并确保它监听在 `http://localhost:3000`
2. 启动前端开发服务器：

```bash
__DEV_COMMAND__
```

3. 打开 `http://localhost:5173`

如果你的后端端口不是 `3000`，修改 [vite.config.ts](./vite.config.ts) 中的代理目标。

## 开发与生产的请求链路

| 环境 | 前端请求地址 | 实际转发路径 |
|:--|:--|:--|
| 开发环境 | `/api/chat` | 浏览器 -> Vite 代理 -> 你的后端 -> 模型提供商 |
| 生产环境 | `VITE_CHAT_API_ENDPOINT` | 浏览器 -> 你的生产后端 -> 模型提供商 |

需要注意：

- `server.proxy` 只在 Vite 开发服务器中生效
- 生产构建后的静态文件不会自动带上开发代理
- 前端始终只应请求你的服务端代理，而不是直接请求模型厂商地址

## 服务端接入参考

### Next.js App Router

```ts
// app/api/chat/route.ts
import { proxyChatRequest } from '@/server/chat-proxy.example'

export async function POST(req: Request) {
  return proxyChatRequest(req)
}
```

### Hono

```ts
import { Hono } from 'hono'
import { proxyChatRequest } from './server/chat-proxy.example'

const app = new Hono()

app.post('/api/chat', (c) => {
  return proxyChatRequest(c.req.raw)
})

export default app
```

### Express / Koa

`proxyChatRequest()` 接收的是标准 Fetch API `Request`，返回的是标准 `Response`。  
如果你使用 Express 或 Koa，需要先做一层对象适配，再把返回的 Web Stream 转成 Node.js 可消费的流。

如果你不希望自己处理这层适配，最简单的做法是在对应框架的路由里直接复用 `fetch('__PROXY_ENDPOINT__', ...)` 的核心逻辑，而不是直接复制类型转换示例。

## 生产部署

推荐把生产地址放到 `.env.production` 或部署平台的构建环境变量中，而不是反复改写 `.env.local`。

例如：

```env
VITE_CHAT_API_ENDPOINT=https://your-api.example.com/api/chat
```

然后执行：

```bash
__BUILD_COMMAND__
```

部署时请确认：

1. 前端静态资源已部署到 `dist/`
2. 后端代理已部署到可访问地址
3. 服务端环境变量 `__PROXY_API_KEY_ENV__` 已正确配置
4. 如果修改了 `VITE_CHAT_API_ENDPOINT`，你已经重新构建前端

## 项目结构

- `src/App.vue`：应用入口，通过 `TrChat.Root / Layout / Header / MessageList / Sender / History` 组合消费模板能力切片
- `src/chat.config.ts`：模型、Provider 和 UI 文案配置
- `src/lib/chat.ts`：聊天适配器与 `chatCapabilitySurface` 组装
- `src/styles/index.css`：全局基础样式
- `server/chat-proxy.example.ts`：服务端代理参考实现

## 前 10 分钟建议

如果你刚生成了这个模板，建议按这个顺序改：

1. [src/chat.config.ts](./src/chat.config.ts)
   - 改品牌标题
   - 改 welcome 文案
   - 改默认 prompts
   - 改模型与 Provider
2. [server/chat-proxy.example.ts](./server/chat-proxy.example.ts)
   - 接入你的真实后端
   - 改上游地址与认证逻辑
3. 页面跑通后，再看 [src/App.vue](./src/App.vue)
   - 这里只负责消费 `chatCapabilitySurface.presetSlices`
   - 不是最推荐的一开始就修改的文件

## 为什么这个模板默认使用 white-box

这个模板没有直接写成：

```vue
<TrChat v-bind="chatPreset" />
```

而是显式消费 `chatCapabilitySurface.presetSlices`。这样做不是为了增加复杂度，而是为了把当前稳定的 chat contract 更明确地示范出来：

- `root / layout / header / welcome / messageList / sender / history / modelSelector`

对模板使用者的好处是：

- 你能更清楚看到每一段 UI 从哪份 contract 结果来
- 后续做业务定制时，不必重新手工推导默认值
- 这个模板更适合作为 white-box chat 结构的起步样例

如果你只想做最小业务定制，仍然优先改：

- [src/chat.config.ts](./src/chat.config.ts)
- [server/chat-proxy.example.ts](./server/chat-proxy.example.ts)

而不是先重写 [src/App.vue](./src/App.vue)。

## 自定义入口

你通常会先从这两个文件开始：

- [src/chat.config.ts](./src/chat.config.ts)
- [server/chat-proxy.example.ts](./server/chat-proxy.example.ts)

常见自定义项包括：

- 默认模型和可选模型列表
- 聊天接口地址
- 品牌标题、欢迎文案、提示卡片
- 服务端认证、限流、日志和错误处理

如果你后续要继续往更高层的场景配置走，例如：

- 应用层 preset
- skill pack
- tool-enabled assistant

可以把 [src/lib/chat.ts](./src/lib/chat.ts) 看作接入这些能力的下一层入口，而不是一开始就重写页面结构。

如果你要从 DeepSeek 切到 OpenAI，至少需要同步检查：

1. [src/chat.config.ts](./src/chat.config.ts) 中的 `model.id`
2. [src/chat.config.ts](./src/chat.config.ts) 中的 `provider`
3. [server/chat-proxy.example.ts](./server/chat-proxy.example.ts) 中的上游 URL
4. 服务端环境变量名是否从 `DEEPSEEK_API_KEY` 改为 `OPENAI_API_KEY`

## 常见问题

### 开发环境返回 404 或 `ECONNREFUSED`

- 确认后端服务已经启动
- 确认后端监听地址与 [vite.config.ts](./vite.config.ts) 中的 `target` 一致
- 确认 `.env.local` 里的 `VITE_CHAT_API_ENDPOINT` 仍然是 `/api/chat`

### 生产环境仍然请求本地地址

- 检查是否仍在使用开发环境的 `.env.local`
- 把生产地址放进 `.env.production` 或部署平台的构建环境变量
- 修改后重新执行 `__BUILD_COMMAND__`

### 返回 401 / 403

- 检查服务端环境变量 `__PROXY_API_KEY_ENV__` 是否存在且有效
- 检查代理文件中的上游地址和认证方式是否与当前提供商一致

### 出现 CORS 错误

- 确认前端请求的是你的后端代理，而不是模型提供商地址
- 在后端或反向代理层显式配置允许访问的前端域名

## 安全建议

这个模板默认只解决“最小可用代理”问题。用于真实生产环境时，建议至少在服务端补上：

- 调用方鉴权
- 请求速率限制
- 请求超时和取消
- 上游错误日志
- 模型白名单和参数校验

## 了解更多

- [Tiny Robot 官方文档](https://github.com/opentiny/tiny-robot)
- [Vite Env and Mode](https://vite.dev/guide/env-and-mode.html)
- [Vite Server Proxy](https://vite.dev/config/server-options.html#server-proxy)
- [OpenAI API Key Safety Best Practices](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)
