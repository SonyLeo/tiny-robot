# Config Bridge Matrix

这个表把 `createRuntimeFromConfig(config)` 当前阶段的字段级 bridge subset 抽出来，方便直接判断哪些字段已经是官方 on-ramp 的承诺。

它是派生索引，不替代规范源文档。

## Sources

- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/src/runtime/config/createRuntimeFromConfig.ts`

## Root On-ramp Rules

- `createRuntimeFromConfig(config)` 是从黑盒 config 到 `{ runtime, ui }` 的唯一官方桥接入口。
- 返回值只包含 `{ runtime, ui, dispose }`。
- `dispose()` 用于停止内部 effectScope，防止内存泄漏。

## Current Bridge Matrix

| Config field | Target owner / output | Bridge status | Notes |
| --- | --- | --- | --- |
| `request.transport` | `conversation runtime` factory input | `supported` | required for baseline send path |
| `request.systemPrompt` | `conversation runtime` factory input | `supported` | baseline conversation configuration |
| `request.defaultModelId` | `models runtime` + default send model injection | `supported` | seeds model selector and sender fallback |
| `request.models` | `models runtime` | `supported` | powers model selector |
| `conversation.initialMessages` | `conversation runtime` seed input | `supported` | eagerly materialize active conversation on first load |
| `conversation.persistence` | active-conversation hydrate / restore | `supported` | current active conversation restore only |
| `ui.brand` | resolved `ui` | `supported` | display-only |
| `ui.welcome` | resolved `ui` | `supported` | display-only |
| `ui.appearance` | resolved `ui` | `supported` | display-only |
| `ui.contentLayout` | resolved `ui` | `supported` | display-only |
| `ui.labels` | resolved `ui` | `supported` | i18n copy overrides; resolved once by Root |
| `sender.*` | `sender runtime` | `supported` | runtime-owned sender defaults: `placeholder / mode / maxLength / wordCount / voice` |
| `attachments.*` | `attachments runtime` + sender handoff | `supported` | supports `prepare -> addPendingAttachments` path |
| `messages.actions` | `message runtime` extension path | `supported` | custom action definitions; static or context-driven |
| `messages.actionMode` | `message runtime` extension path | `supported` | `append` or `replace` mode |
| `messages.renderers` | `message runtime` extension path | `supported` | custom content/box renderer chains |
| `messages.feedback` | `message runtime` extension path | `supported` | feedback enablement |
| `messages.transforms` | `message runtime` extension pipeline | `supported` | `onChunk` and `onFinish` transform hooks |
| `lifecycle.beforeSend` | conversation/message bridge hook | `supported` | can rewrite or cancel outbound text |
| `lifecycle.afterReceive` | conversation/message bridge hook | `supported` | called after assistant message completes |
| `lifecycle.error` | conversation/message bridge hook | `supported` | called on request failure |
| `history.*` | `history runtime` + workspace defaults | `supported` | history drawer / workspace baseline |
| `workspace.*` | `workspace runtime` | `supported` | drives page shell and responsive shell state |
| `mcp.*` | `mcp runtime` | `deferred` | enters after MCP-capable baseline |
| `lifecycle.modelChange` | models bridge hook | `deferred` | waits for explicit model-change hook contract |
| `lifecycle.conversationChange` | history bridge hook | `deferred` | waits for explicit conversation-change hook contract |

## Reading Guide

- `supported` — 字段已是当前官方 bridge 承诺，有实现和测试保护。
- `deferred` — owner 已冻结，但 bridge 输出尚未进入当前 contract。
