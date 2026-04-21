# Slot Catalog

这个表把当前冻结的 page/workspace slot contract 抽出来，方便 Review、实现和测试直接引用。

它是派生索引，不替代规范源文档。

## Sources

- `packages/chat/docs/refactor/design/api-runtime.md`
  Sections:
  `6.5D minimum slot catalog`
  `6.5E TrChat.Page slot-provider contract`
  `10 slots 与扩展路径`
- `packages/chat/docs/refactor/archive/phase-0_5-freeze-record.md`
  Sections:
  `6.3 slot props contract`
  `6.4 slot catalog`
- `packages/chat/docs/refactor/process/review-scheme.md`
  Sections:
  `Review A`
  `Review B`

## Slot Catalog Freeze Notes

- page 区域使用无前缀直白命名，不并行维护 `page-*` 双体系。
- slot props 只暴露最小命名模块，不暴露 whole runtime。
- 超出 slot props contract 的定制，应升级到 `Root + primitives`。
- `Footer` 当前只冻结为轻量 companion region。
- Phase 0.5 只冻结 `footer-extra` augment slot，不冻结 `footer` replace slot。

## Page Replace Slots

| Slot | Layer | Kind | Purpose | Minimum slot props | Current freeze status |
| --- | --- | --- | --- | --- | --- |
| `header` | page | replace | replace the full default header region | `ui`, `workspace`, `history`, `models`, `conversation` | frozen |
| `welcome` | page | replace | replace the default welcome region | `ui`, `conversation` | frozen |
| `message-list` | page | replace | replace the default message list region | `ui`, `conversation`, `message` | frozen |
| `sender` | page | replace | replace the default sender region | `ui`, `sender`, `attachments`, `mcp` | frozen |

## Page Augment Slots

| Slot | Layer | Kind | Purpose | Minimum slot props | Current freeze status |
| --- | --- | --- | --- | --- | --- |
| `header-before` | page | augment | inject before the default header block | `ui`, `workspace` | frozen |
| `header-after` | page | augment | inject after the default header block | `ui`, `workspace`, `models` | frozen |
| `message-before` | page | augment | inject before the default message region | `ui`, `conversation` | frozen |
| `message-after` | page | augment | inject after the default message region | `ui`, `conversation` | frozen |
| `sender-before` | page | augment | inject before the default sender region | `ui`, `sender`, `attachments` | frozen |
| `sender-after` | page | augment | inject after the default sender region | `ui`, `sender`, `attachments`, `mcp` | frozen |
| `footer-extra` | page | augment | inject extra footer companion content | `ui`, `sender`, `attachments`, `mcp` | frozen in Phase 0.5 |

## Workspace Slots

| Slot | Layer | Kind | Purpose | Minimum slot props | Current freeze status |
| --- | --- | --- | --- | --- | --- |
| `left` | workspace shell | replace | replace the desktop left panel | `ui`, `workspace`, `history` | frozen |
| `left-rail` | workspace shell | replace | replace the desktop left rail | `ui`, `workspace`, `history` | frozen |
| `right` | workspace shell | replace | replace the desktop right panel | `ui`, `workspace`, `models`, `mcp` | frozen |
| `mobile-left` | workspace shell | replace | replace the mobile left sheet | `ui`, `workspace`, `history` | frozen |
| `mobile-right` | workspace shell | replace | replace the mobile right sheet | `ui`, `workspace`, `models`, `mcp` | frozen |

## Precedence And Escalation Rules

### Precedence

1. replace slot disables the default structure for that region.
2. augment slot does not disable the default structure.
3. if a replace slot still needs default capability, it must consume it explicitly through slot props.
4. `mobile-left` falls back to `left` when not separately provided.
5. `mobile-right` falls back to `right` when not separately provided.
6. page slots belong to `TrChat.Page`; primitives do not mirror these page slot names.

### Escalation

Use a slot when:

- 你只改某个默认区域的局部 UI
- 所需数据已经在该 slot props contract 内
- 你仍接受官方页面结构和生命周期

Upgrade to `Root + primitives` when:

- 需要跨多个区域重排结构
- 需要消费不在该 slot props contract 内的 runtime 模块
- 需要自己决定消息链路、发送链路或 workspace 联动

## Deferred Items

这些内容当前不是最小冻结集的一部分：

- standalone `footer` replace slot
- 完整 slot parity 的最终细粒度命名
- 超出当前 phase 的 slot consumption 扩展面
