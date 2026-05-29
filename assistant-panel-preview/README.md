# assistant-panel-preview

TinyRobot assistant panel starter built with Vue 3 + Vite.

## Features

- Floating launcher button
- Right-side assistant panel with fullscreen toggle
- Built-in multi-model streaming chat
- Conversation persistence via `useConversation`
- Light/dark mode toggle
- MCP plugin market, install, enable/disable, and tool calling

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Fill your provider keys:

```env
VITE_ALIYUN_DASHSCOPE_KEY=your_dashscope_key
VITE_DEEPSEEK_API_KEY=your_deepseek_key
```

The template ships with built-in model presets:

- `aliyun`: `Qwen Flash`, `Qwen Plus`, `Qwen Max`
- `deepseek`: `DeepSeek Chat`, `DeepSeek Reasoner`

Users only need to fill keys, then switch models in the sender footer.

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
pnpm preview
```

## MCP

The template ships with one sample MCP market entry:

- `model-context-protocol-mcp`: proxied to `https://modelcontextprotocol.io/mcp`

Add more servers in `src/config/mcp.ts`.
