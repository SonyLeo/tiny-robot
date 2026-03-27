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
- 📦 Multiple Vue 3 + TypeScript starter templates
- 🔌 Support for multiple API providers (OpenAI, DeepSeek)
- 🎨 Built-in styling with Tiny Robot components
- 📝 Environment configuration template
- 🔒 Security best practices documentation

## Usage

The CLI will guide you through:

1. **Project Name** - Name for your new project
2. **Template Selection** - Choose from the available templates (`basic`, `agent-mcp`)
3. **API Provider** - Select OpenAI or DeepSeek
4. **Installation** - Auto-install dependencies (optional)

## Templates

### Basic

A minimal chat application with:
- Vue 3 Composition API
- TypeScript support
- Vite for fast development
- Black-box `TrChat` composition
- Environment configuration

### Agent MCP

A minimal Agent / MCP starter with:
- Vue 3 Composition API
- `TrChat.Scaffold` white-box layout composition
- Built-in MCP panel entry
- Local MCP plugin metadata and mock bridge starter
- `toolPlugin` wiring through the current stable `mcp` contract

## How To Choose

| Template | Choose it when... | First files to edit |
|:--|:--|:--|
| `basic` | You want the smallest general chat starter and do not need MCP tooling on day one | `src/chat.config.ts`, `server/chat-proxy.example.ts` |
| `agent-mcp` | You want a tool-enabled starter with an MCP panel, mock bridge, and a place to evolve tool orchestration | `src/chat.config.ts`, `src/lib/mcp.ts`, `server/chat-proxy.example.ts` |

Keep the rule simple:

- start with `basic` if you only need a normal chat product shell
- choose `agent-mcp` if tool discovery, MCP plugins, or copilot-like workflows are already part of the first milestone

`agent-mcp` is a starter, not a full agent platform. It gives you:

- an MCP panel entry
- local MCP plugin metadata
- a mock bridge you can replace with your real implementation

It does not try to solve:

- marketplace or remote skill installation
- workflow orchestration
- retrieval contracts
- production MCP service management

## Template Governance

This section is for maintainers and contributors extending `packages/chat-cli`, not for end users generating a project.

Stable templates in `create-tiny-robot` are not just directories copied into `templates/`. A template is considered stable only when it satisfies the current minimum governance rules.

At minimum:

- the template must be registered in `templateRegistry.ts`
- the template must declare `requiredChatFeatures`
- the template must declare `contractUsage`
- the template must pass `prepare:templates`
- the template must pass scaffold / release / smoke verification

These rules exist to:

- keep capability dependencies explicit instead of implicit
- keep CLI help, registry metadata, and template directories aligned
- prevent new templates from bypassing the stable chat contract with handwritten page wiring

Before adding a new stable template, answer these questions:

1. Is the upstream chat contract it depends on already stable?
2. Can its `requiredChatFeatures` be written down explicitly?
3. Does it consume the contract through `blackbox-component`, `scaffold-slots`, or another justified mode?
4. Can it pass scaffold / smoke, rather than only looking reasonable in the template directory?

## Stable Template Rules

The current stable templates in `create-tiny-robot` follow these rules:

- each template must be registered in `templateRegistry.ts`
- each stable template must declare `requiredChatFeatures`
- each stable template must declare `contractUsage`
- each stable template must pass scaffold, release, and smoke verification

In practice, this means the CLI is not shipping ad hoc directories anymore. Stable templates are expected to be explicit about what chat capabilities they consume and how they consume them.

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
