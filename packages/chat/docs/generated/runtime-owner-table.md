# Runtime Owner Table

这个表把 `packages/chat` 中的 runtime owner 与 source-of-truth 规则抽出来，方便实现、评审和测试直接引用。

它是派生索引，不替代规范源文档。

## Sources

- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/src/runtime/config/createRuntimeFromConfig.ts`
- `packages/chat/src/types/runtime.ts`

## Owner Map

| Domain | Owner runtime | Single source of truth | Primary writes | Primary readers | Notes |
| --- | --- | --- | --- | --- | --- |
| Active conversation messages | `conversation runtime` | current conversation message list | send / abort / retry / regenerate / transport normalization | `MessageList`, `Header`, message/page slots | turn-level streaming and failure state stay here |
| Conversation turn status | `conversation runtime` | current conversation aggregate status | transport + conversation actions | `Header`, `MessageList`, page body logic | `ready / submitted / streaming / error` |
| Draft text | `sender runtime` | current draft input | sender input + send clear policy | `Sender`, `Footer`, sender slots | source of truth before submit |
| Pending attachments before submit | `sender runtime` | pending attachments queue | sender add/remove/clear | `Sender`, `Attachments`, sender/footer slots | attachments prepare capability is separate |
| Attachment prepare / preview / upload capability | `attachments runtime` | attachment capability layer | upload/prepare hooks only | `Sender`, `Attachments`, sender/footer slots | cannot directly mutate sender-owned pending attachments |
| Message-level edit / error / capability view state | `message runtime` | per-message transient view state | edit lifecycle + derived state updates | `Message`, `MessageList`, message slots | actions locate by `messageId`, not index |
| Message action definitions and mode | `message runtime` | `config.actions` + `config.actionMode` | set at runtime creation | `ChatFeedback`, message slots | `append` or `replace` mode |
| Message renderer config | `message runtime` | `config.renderers` | set at runtime creation | `ChatLayout`, `ChatMessageList` | content/box renderer chains |
| Message transform pipeline | `message runtime` | `config.transforms` | set at runtime creation | conversation engine | `onChunk` and `onFinish` hooks |
| Conversation list and active conversation selection | `history runtime` | history data + management state | create/switch/delete/rename/manage | `History`, `Header`, workspace-left slots | history visibility is not owned here |
| Current model selection | `models runtime` | current model id + model list | select model | `Header`, `ModelSelector`, right/mobile-right slots | `selectModel()` triggers provider update |
| Workspace shell state | `workspace runtime` | variant, panels, history visibility, mobile state | panel toggles + responsive host measurement | `Page`, `WorkspaceShell`, workspace slots | remains chat-local |
| MCP panel / tool bridge | `mcp runtime` | tool list + panel visibility + call bridge | panel open/close/toggle + tool calls | `Footer`, `McpPanel`, right/mobile-right slots | tool outputs write back through `conversation runtime` |
| Display defaults and copy | resolved `ui` input | resolved display-only defaults | `Root` resolves once | `Page`, primitives, slots | must not replace runtime source of truth |

## Critical Boundaries

### Sender vs attachments

- `sender runtime` owns pending attachments before submit.
- `attachments runtime` owns prepare/upload/preview capabilities.
- handoff must stay explicit: `attachments.prepareFiles()` → `sender.addPendingAttachments()`.

### History vs workspace

- `history runtime` owns conversation data and management state.
- `workspace runtime` owns panel open/close and layout state.
- mobile history auto-close after switching is a `Page / WorkspaceShell` UI strategy, not an owner transfer.

### MCP write boundary

- `mcp runtime` owns panel/tool bridge behavior.
- any tool-call result that becomes chat messages must be written through `conversation runtime`.

### dispose()

- `createRuntimeFromConfig()` returns a `dispose()` method.
- calling `dispose()` stops the internal `effectScope`, cleaning up all watchers and computed values.
- `useTrChatConfigRuntimeResolution` calls `dispose()` on the old runtime when config meaningfully changes.

## Reader Boundary Reminder

Owner ≠ reader. Page regions and slot props may receive a runtime module they need to render, but that does not move ownership away from the runtime listed above.
