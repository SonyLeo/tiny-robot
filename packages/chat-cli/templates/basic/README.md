# __PROJECT_TITLE__

A minimal chat application powered by Tiny Robot Chat Kit.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
__INSTALL_COMMAND__
```

### Configuration

1. Create `.env.local` from `.env.example`.

2. Set your frontend chat endpoint:

```env
VITE_CHAT_API_ENDPOINT=/api/chat
```

3. Edit `src/chat.config.ts` to adjust:

- default model
- provider id
- welcome copy
- prompt cards
- brand title

### Development

```bash
__DEV_COMMAND__
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
__BUILD_COMMAND__
```

## Security

⚠️ **Important**: This template defaults to a server-proxy architecture.

Keep the real provider API key on the server. The browser should only call the
endpoint defined by `VITE_CHAT_API_ENDPOINT`.

You can use `server/chat-proxy.example.ts` as a starting point for your backend
route.

Typical setup:

1. Implement `/api/chat` in your own server runtime
2. Store the real provider API key in server-side environment variables
3. Forward the request to OpenAI / DeepSeek / your OpenAI-compatible backend
4. Stream the provider response back to the browser

## About the Generated Structure

- `src/chat.config.ts`
  - Your declarative chat configuration
- `src/lib/chat.ts`
  - Adapter + preset assembly
- `src/App.vue`
  - Only renders `<TrChat v-bind="chatPreset" />`
- `server/chat-proxy.example.ts`
  - Example backend proxy implementation

## Learn More

- [Tiny Robot Documentation](https://github.com/opentiny/tiny-robot)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [DeepSeek API Docs](https://platform.deepseek.com/docs)
