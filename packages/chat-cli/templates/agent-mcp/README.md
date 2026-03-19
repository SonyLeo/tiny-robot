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

## 这个模板是什么 / 不是什么

这个模板是什么：

- 一个 tool-enabled starter
- 一个 MCP integration starter
- 一个 white-box 消费 `chatCapabilitySurface.presetSlices` 的样例模板

这个模板不是什么：

- 不是完整 agent runtime
- 不是 workflow 引擎
- 不是生产级 MCP orchestration 方案
- 不是 skills marketplace

换句话说，它的目标不是替你做完整平台，而是把最小 MCP 接缝先搭好。

## 前 10 分钟建议

建议按这个顺序看和改：

1. [src/chat.config.ts](./src/chat.config.ts)
   - 调整模型、Provider、welcome 和 prompts
2. [src/lib/mcp.ts](./src/lib/mcp.ts)
   - 替换默认的 MCP plugin metadata
   - 把 `createLocalMcpBridge()` 换成你的真实 bridge
3. [server/chat-proxy.example.ts](./server/chat-proxy.example.ts)
   - 接入你的真实后端代理
4. 最后再看 [src/App.vue](./src/App.vue)
   - 这里主要是 white-box 布局和 MCP 面板入口

## 哪些文件以后最可能被替换

最先会被应用层替换的通常是：

- [src/lib/mcp.ts](./src/lib/mcp.ts)
  - 这里是默认 MCP plugin 列表和 mock bridge
- [src/lib/chat.ts](./src/lib/chat.ts)
  - 这里是 `mcpManager`、`toolPlugin` 和 `chatCapabilitySurface` 的 starter wiring

相对更稳定、可以先不急着改的是：

- [src/App.vue](./src/App.vue)
  - 它主要示范如何消费 slices 和挂 MCP 面板入口

## 从 starter 到真实应用的建议路径

建议按这个演进顺序走：

1. 先让 mock MCP bridge 跑通
2. 再替换成真实的 MCP/tool bridge
3. 再接入你的业务 tools 或 services
4. 最后才考虑更完整的 agent runtime、workflow 或 skill registry

也就是说，这个模板优先帮你解决的是：

- 最小的 MCP UI 接缝
- 最小的 tool bridge 接缝

而不是一次性解决完整 agent 平台建设。

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
