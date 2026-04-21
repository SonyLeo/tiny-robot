# Page Region Contract

这个文档把 `TrChat.Page` 的组合边界、region 组成、读取边界和降级规则抽出来，方便实现和评审直接对照。

它是派生索引，不替代规范源文档。

## Sources

- `packages/chat/docs/refactor/design/api-runtime.md`
  Sections:
  `5 TrChat.Root 合同`
  `6.5E TrChat.Page slot-provider contract`
  `6.7 ChatRuntime`
  `9 primitives 读取边界`
  `10 slots 与扩展路径`
  `12 workspace 与 history contract`
- `packages/chat/docs/refactor/archive/phase-0_5-freeze-record.md`
  Sections:
  `2.7 TrChat.Page 不允许透传 whole runtime`
  `6.1 TrChat.Page 只负责组合`
  `6.3 slot props contract`
  `6.4 slot catalog`

## Composition-only Rules

`TrChat.Page` remains composition-only.

`TrChat.Page` should:

- own official page structure and default composition
- own slot anchors and slot-provider wiring
- consume resolved `ui` defaults for display
- delegate deeper custom composition to `Root + primitives`

`TrChat.Page` should not:

- become a whole-runtime relay
- expose `runtime` as a slot prop
- re-parse raw `config`
- manufacture no-op runtimes just to satisfy slot props

## Region Composition

| Region component | Default responsibility | Slots owned by the region |
| --- | --- | --- |
| `TrChatPageHeaderRegion` | header-level affordances, history/model entry points, brand-facing header structure | `header`, `header-before`, `header-after` |
| `TrChatPageBodyRegion` | welcome + message list composition | `welcome`, `message-before`, `message-list`, `message-after` |
| `TrChatPageFooterRegion` | sender area plus lightweight footer companion region | `sender-before`, `sender`, `sender-after`, `footer-extra` |
| `TrChatWorkspaceShell` | workspace shell composition and responsive side regions | `left`, `left-rail`, `right`, `mobile-left`, `mobile-right` |

## Region Read-boundary Freeze

| Region component | Allowed runtime reads |
| --- | --- |
| `TrChatPageHeaderRegion` | `conversation + history + models + workspace + ui` |
| `TrChatPageBodyRegion` | `conversation + message + ui` |
| `TrChatPageFooterRegion` | `sender + attachments + mcp + ui` |
| `TrChatWorkspaceShell` | `workspace + history + models + mcp + ui` |

Reminder:

- slot props may expose a region's minimal required modules
- that does not mean `Page` itself reads the whole runtime

## Footer Semantics

- `Footer` is currently frozen as a lightweight companion region inside the default page.
- `footer-extra` is the only footer-related slot frozen in the current minimum contract.
- a standalone `footer` replace slot remains deferred until page baseline implementation proves that contract is stable.
- Phase 1A / 1B contract tests now treat this as the default page-source rule: `TrChat.Page` may expose `footer-extra`, and `ChatDefaultRenderer` must stay a compatibility delegate rather than growing a standalone page-level `footer` slot.

## Degrade Rules

| Missing module | Expected degrade behavior |
| --- | --- |
| `workspace` | render stacked main view only; do not render `left`, `left-rail`, `right`, `mobile-left`, `mobile-right` |
| `history` | hide history affordance; slot props that would include `history` omit it |
| `models` | hide model affordance; `header-after`, `right`, `mobile-right` slot props omit `models` |
| `mcp` | hide MCP affordance; `sender-after`, `footer-extra`, `right`, `mobile-right` slot props omit `mcp` |
| `attachments` | sender still works for plain text; related slot props omit `attachments` |

## Workspace Placement Rules

- public config stays centered on `left`, `right`, and `defaultView`
- `left-rail`, `mobile-left`, and `mobile-right` are resolved placement targets inside `workspace runtime` and `TrChat.Page`
- `mobile-left` falls back to `left`
- `mobile-right` falls back to `right`
- `history runtime` owns conversation list data; `workspace runtime` owns panel visibility

## Escalation Rule

If a customization needs:

- modules outside the slot props contract
- cross-region re-layout
- direct control over message, sender, or workspace orchestration

then it should move from `TrChat.Page` slots to `TrChat.Root + primitives`.
