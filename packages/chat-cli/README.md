# create-tiny-robot

Scaffolding tool for creating Tiny Robot Chat Kit projects.

## Quick Start

```bash
npm create tiny-robot@latest
```

Or with a specific project name:

```bash
npm create tiny-robot@latest my-chat-app
```

## Features

- 🚀 Interactive CLI with guided setup
- 📦 Pre-configured Vue 3 + TypeScript template
- 🔌 Support for multiple API providers (OpenAI, DeepSeek)
- 🎨 Built-in styling with Tiny Robot components
- 📝 Environment configuration template
- 🔒 Security best practices documentation

## Usage

The CLI will guide you through:

1. **Project Name** - Name for your new project
2. **Template Selection** - Choose from available templates (currently: basic)
3. **API Provider** - Select OpenAI or DeepSeek
4. **Installation** - Auto-install dependencies (optional)

## Templates

### Basic

A minimal chat application with:
- Vue 3 Composition API
- TypeScript support
- Vite for fast development
- Tiny Robot Chat Kit integration
- Environment configuration

## Environment Setup

After creating a project, configure your API credentials:

```bash
cd my-chat-app
cp .env.example .env.local
# Edit .env.local with your API key
npm run dev
```

## Security

⚠️ **Important**: Never commit `.env.local` to version control. The generated `.gitignore` already excludes it.

For production, use a backend proxy to avoid exposing API keys in the browser. See the generated project's README for details.

## License

MIT
