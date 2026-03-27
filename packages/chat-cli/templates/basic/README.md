# __PROJECT_TITLE__

一个基于 Tiny Robot Chat Kit 的通用聊天 starter，默认采用：

- `TrChat` 黑盒接入
- 前端请求你的服务端代理
- 服务端再请求模型提供商

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

## 项目结构

- `src/App.vue`：应用入口，通过 `<TrChat />` 做黑盒接入
- `src/chat.config.ts`：模型、Provider 和 UI 文案配置
- `src/lib/chat.ts`：运行时注入入口，默认提供本地存储
- `src/styles/index.css`：全局基础样式
- `server/chat-proxy.example.ts`：服务端代理参考实现

## 前 10 分钟建议

建议先按这个顺序改：

1. [src/chat.config.ts](./src/chat.config.ts)
   - 改品牌标题
   - 改 welcome 文案
   - 改默认 prompts
   - 改模型与 Provider
2. [server/chat-proxy.example.ts](./server/chat-proxy.example.ts)
   - 接入你的真实后端
   - 改上游地址与认证逻辑
3. 页面跑通后，再看 [src/App.vue](./src/App.vue)
   - 这里只负责挂载 `TrChat`
   - 一般不需要一开始就重写页面结构
   - 它不是最推荐的一开始就修改的文件

## 为什么这个模板默认使用黑盒 TrChat

这个模板优先解决的是：

- 快速跑通一个聊天应用
- 把主要配置收敛在 `chat.config.ts`
- 不让新用户一上来就暴露在 `Root / Layout / Header / slices` 这类底层概念上

如果你后续需要：

- 自定义布局
- 自定义 header / footer 工具位
- 更复杂的页面结构控制

再考虑逐步演进到：

- `TrChat.Scaffold`
- 更底层的白盒组合

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

## 构建

```bash
__BUILD_COMMAND__
```
