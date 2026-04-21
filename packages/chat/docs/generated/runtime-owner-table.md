# Runtime Owner Table

这个表把 `packages/chat` 重构中的 runtime owner 与 source-of-truth 规则抽出来，方便实现、评审和测试直接引用。

它是派生索引，不替代规范源文档。

## Sources

- `packages/chat/ARCHITECTURE_REFACTOR_API_RUNTIME.md`
  Sections:
  `6.6 ChatRuntimeInput`
  `6.7 ChatRuntime`
  `8 source of truth 规则`
  `9 primitives 读取边界`
  `12 workspace 与 history contract`
- `packages/chat/ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md`
  Sections:
  `2.4 runtime source of truth`
  `6 Page、primitives 与 slot 边界`

## Owner Map

| Domain | Owner runtime | Single source of truth | Primary writes | Primary readers | Notes |
| --- | --- | --- | --- | --- | --- |
| Active conversation messages | `conversation runtime` | Current conversation message list | send / abort / retry / regenerate / transport normalization | `MessageList`, `Header`, message/page slots | turn-level streaming and failure state stay here |
| Conversation turn status | `conversation runtime` | Current conversation aggregate state | transport + conversation actions | `Header`, `MessageList`, page body logic | do not split this back into page glue |
| Draft text | `sender runtime` | current draft input | sender input + send clear policy | `Sender`, `Footer`, sender slots | source of truth before submit |
| Pending attachments before submit | `sender runtime` | pending attachments queue | sender add/remove/clear | `Sender`, `Attachments`, sender/footer slots | attachments prepare capability is separate |
| Attachment prepare / preview / upload capability | `attachments runtime` | attachment capability layer | upload/prepare hooks only | `Sender`, `Attachments`, sender/footer slots | cannot directly mutate sender-owned pending attachments |
| Message-level edit / error / capability view state | `message runtime` | per-message transient view state | edit lifecycle + derived state updates | `Message`, `MessageList`, message slots | actions locate by `messageId`, not index |
| Conversation list and active conversation selection | `history runtime` | history data + management state | create/switch/delete/rename/manage | `History`, `Header`, workspace-left slots | history visibility is not owned here |
| Current model selection | `models runtime` | current model id + model list | select model | `Header`, `ModelSelector`, right/mobile-right slots | default model injection can be bridged earlier than full models runtime |
| Workspace shell state | `workspace runtime` | variant, panels, history visibility, mobile state | panel toggles + responsive host measurement | `Page`, `WorkspaceShell`, workspace slots | remains chat-local in current phase |
| MCP panel / tool bridge | `mcp runtime` | tool list + panel visibility + call bridge | panel open/close/toggle + tool calls | `Footer`, `McpPanel`, right/mobile-right slots | tool outputs must write back through `conversation runtime` |
| Display defaults and copy | resolved `ui` input, not a runtime module | resolved display-only defaults | `Root` resolves once | `Page`, primitives, slots | must not replace runtime source of truth |

## Critical Boundaries

### Sender vs attachments

- `sender runtime` owns pending attachments before submit.
- `attachments runtime` owns prepare/upload/preview style capabilities.
- handoff must stay explicit and traceable; no shared mutable object should blur ownership.

### History vs workspace

- `history runtime` owns conversation data and management state.
- `workspace runtime` owns panel open/close and layout state.
- mobile history auto-close after switching is a `Page / WorkspaceShell` UI strategy, not an owner transfer.

### Models injection

- when a send path omits `ChatSendInput.modelId`, bridge logic may inject the current default model.
- that does not mean Phase 1A already owns a full `models runtime`.

### MCP write boundary

- `mcp runtime` owns panel/tool bridge behavior.
- any tool-call result that becomes chat messages must be written through `conversation runtime`.

## Reader Boundary Reminder

Owner != reader.

Some page regions and slot props may receive a runtime module they need to render, but that does not move ownership away from the runtime listed above.
