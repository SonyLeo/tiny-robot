# __PROJECT_TITLE__

一个基于 Tiny Robot Chat Kit 的 Agent MCP 模板，默认包含：

- 一条配置驱动的聊天主链路
- 一个最小的 MCP 面板入口
- 本地示例 MCP plugin 列表与 mock bridge
- 前端请求你的服务端代理，服务端再请求模型提供商

## 当前模板默认配置

| 配置项 | 当前值 |
|:--|:--|
| Provider | `__DEFAULT_PROVIDER__` |
| 默认模型 | `__DEFAULT_MODEL__` |
| 服务端密钥变量 | `__PROXY_API_KEY_ENV__` |
| 服务端上游地址 | `__PROXY_ENDPOINT__` |

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

### 3. 集成服务端代理

`server/chat-proxy.example.ts` 是最小参考实现。把它移动到你的服务端运行时中，并在服务端环境变量中配置模型提供商密钥：

```env
__PROXY_API_KEY_ENV__=sk-your-key-here
```

默认上游地址由模板注入为：

```text
__PROXY_ENDPOINT__
```

### 4. 启动本地开发

```bash
__DEV_COMMAND__
```

## MCP 模板说明

这个模板在 [src/lib/chat.ts](./src/lib/chat.ts) 中做了三件事：

- 创建 `mcpManager`
- 把 `toolPlugin` 接到 `useChatKit`
- 用 `createChatCliCapabilitySurface()` 产出 `chatCapabilitySurface`

[src/App.vue](./src/App.vue) 通过 white-box 方式消费 `chatCapabilitySurface.presetSlices`，并在 Header 右侧挂了一个 MCP 面板入口。

默认的 MCP 示例数据和 mock bridge 在：

- [src/lib/mcp.ts](./src/lib/mcp.ts)

如果你要接真实 MCP bridge，优先替换这个文件里的：

- `defaultMcpServers`
- `createLocalMcpBridge()`

## 项目结构

- `src/App.vue`：white-box 聊天布局与 MCP 面板入口
- `src/chat.config.ts`：模型、Provider 和基础 UI 配置
- `src/lib/chat.ts`：适配器、MCP manager、tool plugin 和 `chatCapabilitySurface`
- `src/lib/mcp.ts`：本地 MCP 示例数据和 mock bridge
- `server/chat-proxy.example.ts`：服务端代理参考实现

## 构建

```bash
__BUILD_COMMAND__
```
