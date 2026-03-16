# __PROJECT_TITLE__

一个由 Tiny Robot Chat Kit 驱动的生产级 AI 聊天应用。

## 项目概览

这是一个基于 Tiny Robot Chat Kit 的 AI 聊天应用脚手架，帮助开发者快速构建生产级的聊天应用。

**核心特性：**
- 🚀 开箱即用的聊天 UI 和完整交互
- 🔒 服务器代理架构，API 密钥安全
- 🔄 支持 OpenAI / DeepSeek / 自定义提供商
- 🌐 开发/生产环境无缝切换
- 📱 响应式设计，支持桌面和移动设备
- ⚡ 基于 Vite，开发体验极速

**适用场景：**
- 构建企业级 AI 助手
- 快速原型验证
- 集成 AI 功能到现有应用

## 目录

- [项目概览](#项目概览)
- [快速参考](#快速参考)
- [5 分钟快速开始](#5-分钟快速开始)
- [快速开始](#快速开始)
- [开发环境](#开发环境)
- [生产环境](#生产环境)
- [常见错误](#常见错误)
- [故障排除](#故障排除)
- [架构决策](#架构决策)
- [了解更多](#了解更多)

## 快速参考

| 场景 | 命令 | 配置文件 |
|:--|:--|:--|
| 开发环境 | `__DEV_COMMAND__` | `vite.config.ts` + `.env.local` |
| 生产构建 | `__BUILD_COMMAND__` | `.env.local` |
| 安装依赖 | `__INSTALL_COMMAND__` | `package.json` |
| 后端集成 | N/A | `server/chat-proxy.example.ts` |

## 5 分钟快速开始

### 第 1 步：创建项目

```bash
npm create tiny-robot __PROJECT_NAME__ -- --provider deepseek
cd __PROJECT_NAME__
__INSTALL_COMMAND__
```

### 第 2 步：配置后端

1. 将 `server/chat-proxy.example.ts` 集成到你的后端项目（Express / Next.js / Hono 等）
2. 在后端设置环境变量：

```bash
# 后端 .env
DEEPSEEK_API_KEY=sk-your-key-here
```

3. 启动后端服务（监听 `http://localhost:3000`）

### 第 3 步：启动前端

```bash
__DEV_COMMAND__
```

打开 [http://localhost:5173](http://localhost:5173)，开始聊天！

> 💡 **提示**：前端会自动通过 Vite 代理转发请求到后端，无需处理跨域问题。

## 快速开始

### 前置要求

- Node.js 18+
- npm、pnpm、yarn 或 bun

### 安装

```bash
__INSTALL_COMMAND__
```

### 配置

1. 从 `.env.example` 创建 `.env.local`：

```bash
cp .env.example .env.local
```

2. 在 `.env.local` 中设置前端聊天端点：

```env
VITE_CHAT_API_ENDPOINT=/api/chat
```

3. 编辑 `src/chat.config.ts` 进行自定义：

- 默认模型
- 提供商配置
- 欢迎消息和描述
- 提示卡片
- 品牌标题

### 开发

```bash
__DEV_COMMAND__
```

在浏览器中打开 [http://localhost:5173](http://localhost:5173)。

### 构建

```bash
__BUILD_COMMAND__
```

## 开发环境

开发阶段使用 **Vite 开发代理**，不需要单独启动后端服务。

```
浏览器（前端 :5173）
    ↓ /api/chat
Vite Dev Server（代理转发）
    ↓
你的后端服务（:3000）
    ↓
OpenAI / DeepSeek / 自定义提供商
```

### 工作原理

`vite.config.ts` 中已配置代理：

```typescript
proxy: {
  '/api/chat': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}
```

前端请求 `/api/chat` 时，Vite 会自动将其转发到 `http://localhost:3000/api/chat`，浏览器不会感知到跨域。

### 开发阶段操作步骤

1. 将 `server/chat-proxy.example.ts` 集成到你的本地后端（Express、Koa、Hono 等）
2. 在后端设置环境变量（如 `DEEPSEEK_API_KEY=sk-...`）
3. 启动后端服务，确保监听在 `http://localhost:3000`
4. 启动前端开发服务器：

```bash
__DEV_COMMAND__
```

如果你的后端端口不是 `3000`，修改 `vite.config.ts` 中的 `target` 即可：

```typescript
proxy: {
  '/api/chat': {
    target: 'http://localhost:YOUR_PORT',
    changeOrigin: true,
  },
}
```

---

## 生产环境

生产构建后，Vite 代理不再工作。前端直接请求 `.env.local` 中 `VITE_CHAT_API_ENDPOINT` 指定的地址。

```
浏览器（前端，静态文件）
    ↓ VITE_CHAT_API_ENDPOINT
你的生产后端（独立部署）
    ↓
OpenAI / DeepSeek / 自定义提供商
```

### 生产阶段操作步骤

1. 将 `server/chat-proxy.example.ts` 集成到你的生产后端
2. 在生产服务器上设置 API 密钥环境变量
3. 构建前端：

```bash
__BUILD_COMMAND__
```

4. 将 `dist/` 目录部署到静态托管服务（Nginx、Vercel、CDN 等）
5. 修改 `.env.local` 中的端点指向生产后端地址：

```env
VITE_CHAT_API_ENDPOINT=https://your-api.example.com/api/chat
```

> ⚠️ `VITE_CHAT_API_ENDPOINT` 是构建时变量，修改后需要重新执行 `__BUILD_COMMAND__`。

---

## server/chat-proxy.example.ts 说明

`server/` 目录下的文件是**后端代理的参考实现**，不会被 Vite 直接执行。你需要将其集成到自己的服务器运行时中。

### 为什么需要服务器代理？

- API 密钥保存在服务器上，不会暴露给浏览器
- 统一处理 CORS 问题
- 可以在代理层添加鉴权、限流、日志等逻辑

### 集成示例

**Express.js：**

```typescript
import express from 'express'
import { proxyChatRequest } from './server/chat-proxy.example'

const app = express()
app.use(express.json())

app.post('/api/chat', async (req, res) => {
  const response = await proxyChatRequest(req as unknown as Request)
  res.status(response.status)
  response.headers.forEach((value, key) => res.setHeader(key, value))
  response.body?.pipe(res)
})

app.listen(3000)
```

**Next.js App Router：**

```typescript
// app/api/chat/route.ts
import { proxyChatRequest } from '@/server/chat-proxy.example'

export async function POST(req: Request) {
  return await proxyChatRequest(req)
}
```

**Hono：**

```typescript
import { Hono } from 'hono'
import { proxyChatRequest } from './server/chat-proxy.example'

const app = new Hono()

app.post('/api/chat', async (c) => {
  return await proxyChatRequest(c.req.raw)
})

export default app
```

### 后端环境变量

在后端服务的 `.env` 文件中配置 API 密钥：

```env
# DeepSeek
DEEPSEEK_API_KEY=sk-...

# OpenAI
OPENAI_API_KEY=sk-...
```

> ⚠️ 后端的 `.env` 与前端的 `.env.local` 是两个独立的文件，分别管理各自的环境变量。

## 生成的项目结构

- `src/chat.config.ts`
  - 声明式聊天配置
- `src/lib/chat.ts`
  - 适配器和预设组装
- `src/App.vue`
  - 仅渲染 `<TrChat v-bind="chatPreset" />`
- `server/chat-proxy.example.ts`
  - 示例后端代理实现

## 配置参考

### chat.config.ts

```typescript
const chatConfig: ChatConfig = {
  models: [
    {
      id: 'deepseek-chat',
      provider: 'deepseek',
      label: 'DeepSeek Chat',
    },
  ],
  providers: {
    deepseek: {
      type: 'openai-compatible',
      endpoint: import.meta.env.VITE_CHAT_API_ENDPOINT || '/api/chat',
    },
  },
  defaults: {
    model: 'deepseek-chat',
    systemPrompt: '你是一个有帮助的助手。',
  },
  ui: {
    brand: {
      title: '__PROJECT_TITLE__',
    },
    welcome: {
      title: 'AI 助手',
      description: '今天有什么我可以帮助你的吗？',
    },
    prompts: [
      { label: '✍️ 写作', description: '帮我写...' },
      { label: '💻 编程', description: '帮我编码...' },
      { label: '📊 分析', description: '帮我分析...' },
      { label: '🌐 翻译', description: '帮我翻译...' },
    ],
  },
}
```

## 故障排除

### 开发环境：聊天请求返回 404

- 确认后端服务已启动，且监听端口与 `vite.config.ts` 中的 `target` 一致
- 检查 `.env.local` 中 `VITE_CHAT_API_ENDPOINT` 是否为 `/api/chat`（相对路径，由 Vite 代理转发）
- 如果后端不在 `localhost:3000`，修改 `vite.config.ts` 中的 `target`

### 生产环境：聊天请求失败

- 确认 `VITE_CHAT_API_ENDPOINT` 已设置为完整的生产后端地址（如 `https://your-api.example.com/api/chat`）
- 修改该变量后需要重新构建（`__BUILD_COMMAND__`）
- 确认生产后端已正确部署并可访问

### API 密钥错误

- 检查后端 `.env` 中的密钥变量名是否与 `server/chat-proxy.example.ts` 中的 `process.env.XXX` 一致
- 确认 API 密钥对所选提供商有效且未过期

### 样式问题

- 不要删除 `src/styles/index.css` 及其在 `main.ts` 中的导入
- 确认 `index.html` 中的内联样式未被移除

## 架构决策

### 为什么使用服务器代理架构？

1. **安全性** — API 密钥永不暴露给浏览器，只在服务端保管
2. **灵活性** — 可在代理层添加鉴权、限流、日志、缓存等逻辑
3. **可维护性** — 集中管理 API 调用逻辑，便于升级和维护
4. **成本控制** — 可实现请求去重、缓存、速率限制等成本优化

### 为什么分离开发和生产环境？

- **开发**：使用 Vite 代理，快速迭代，无需部署后端
- **生产**：前端直接请求生产后端，后端独立部署和扩展

这种分离让开发效率最高，同时保证生产环境的稳定性和可控性。

## 常见错误

### 错误：`ECONNREFUSED 127.0.0.1:3000`

**原因**：后端服务未启动或端口不匹配

**解决**：
1. 确保后端服务已启动，监听在 `http://localhost:3000`
2. 如果后端在其他端口，修改 `vite.config.ts` 中的 proxy target：

```typescript
proxy: {
  '/api/chat': {
    target: 'http://localhost:YOUR_PORT',
    changeOrigin: true,
  },
}
```

### 错误：`401 Unauthorized` 或 `403 Forbidden`

**原因**：API 密钥无效、过期或权限不足

**解决**：
1. 检查后端 `.env` 中的 API 密钥是否正确
2. 确认 API 密钥对应的提供商账户有效且有余额
3. 检查 `server/chat-proxy.example.ts` 中的环境变量名是否与 `.env` 匹配

### 错误：`CORS error` 或 `No 'Access-Control-Allow-Origin' header`

**原因**：生产环境中前端和后端跨域

**解决**：
1. 确认 `VITE_CHAT_API_ENDPOINT` 指向正确的后端地址
2. 后端需要配置 CORS 头，允许前端域名访问
3. 或使用反向代理（Nginx）统一处理

### 错误：`Cannot find module 'server/chat-proxy.example'`

**原因**：`server/` 目录下的文件是参考实现，不会被 Vite 打包

**解决**：
- `server/chat-proxy.example.ts` 只是示例，需要你手动集成到自己的后端项目中
- 不要尝试在前端代码中导入它

### 错误：样式混乱或布局错误

**原因**：缺少全局样式或样式被覆盖

**解决**：
1. 确认 `src/styles/index.css` 存在且在 `src/main.ts` 中被导入
2. 确认 `index.html` 中的内联 `<style>` 标签未被删除
3. 不要修改 `.chat-shell` 或 `:deep(.tr-chat)` 的样式（已在全局样式中处理）

## 了解更多

- [Tiny Robot 官方文档](https://github.com/opentiny/tiny-robot)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [Vite 文档](https://vitejs.dev)
- [Vue 3 文档](https://vuejs.org)

## 贡献

欢迎提交 Issue 和 Pull Request！

- **报告 Bug**：请提供复现步骤、环境信息和错误日志
- **功能建议**：描述使用场景和期望行为
- **改进文档**：帮助我们让文档更清晰

---

**需要帮助？** 查看 [常见错误](#常见错误) 章节或提交 Issue。
