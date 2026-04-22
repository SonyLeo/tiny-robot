# Config Bridge Matrix

这个表把 `createRuntimeFromConfig(config)` 当前阶段的字段级 bridge subset 抽出来，方便直接判断：

- 哪些字段已经是官方 on-ramp 的承诺
- 哪些字段只是顺序或 owner 已冻结，但 bridge 仍延后
- 哪些字段要等 Phase 1B 或之后

它是派生索引，不替代规范源文档。

## Sources

- `packages/chat/docs/refactor/design/api-runtime.md`
  Sections:
  `3.3 官方桥接 helper`
  `4.3 各功能域职责`
  `4.7 config 与 Root 的边界`
- `packages/chat/docs/refactor/design/execution.md`
  Section:
  `Phase 1A bridge subset`
- `packages/chat/docs/refactor/archive/phase-0_5-freeze-record.md`
  Sections:
  `2.6 createRuntimeFromConfig(config) 是唯一官方桥接入口`
  `5.7 Phase 1A 字段级 bridge subset`

## Root On-ramp Rules

- `createRuntimeFromConfig(config)` is the canonical bridge from blackbox config to `{ runtime, ui }`.
- it must return only `{ runtime, ui }`.
- it may only promise the subset frozen for the current phase.
- deferred fields can already have owner semantics frozen without becoming bridge output yet.

## Current Bridge Matrix

| Config field | Target owner / output | Current bridge status | Current output | Notes | Next expected phase |
| --- | --- | --- | --- | --- | --- |
| `request.transport` | `conversation runtime` factory input | `supported` | transport input | required for baseline send path | Phase 1A |
| `request.systemPrompt` | `conversation runtime` factory input | `supported` | system prompt input | baseline conversation configuration | Phase 1A |
| `request.defaultModelId` | `models runtime` + default send model injection | `supported` | `models.currentModelId` + `ChatSendInput.modelId` default injection | seeds the Phase 1B model baseline and sender fallback path | Phase 1B |
| `request.models` | `models runtime` | `supported` | `models runtime` | powers the Phase 1B model selector baseline | Phase 1B |
| `conversation.initialMessages` | `conversation runtime` seed input | `supported` | seed messages | minimum first-screen baseline; eagerly materialize the active conversation when no restore exists, and do not duplicate the seed on first send | Phase 1A |
| `conversation.persistence` | active-conversation hydrate / restore | `supported` | conversation hydrate input | only current active conversation restore; not history runtime | Phase 1A |
| `ui.brand` | resolved `ui` | `supported` | `ui` | display-only | Phase 1A |
| `ui.welcome` | resolved `ui` | `supported` | `ui` | display-only | Phase 1A |
| `ui.appearance` | resolved `ui` | `supported` | `ui` | display-only | Phase 1A |
| `ui.contentLayout` | resolved `ui` | `supported` | `ui` | display-only | Phase 1A |
| `ui.copy` | resolved `ui` | `supported` | `ui` | resolved once by `Root`; not by `Page` or slots | Phase 1A |
| `sender.*` | `sender runtime` | `supported` | sender runtime defaults | draft/send/placeholder baseline only | Phase 1A |
| `attachments.*` | `attachments runtime` + sender handoff | `supported` | attachments runtime + sender defaults | supports `prepare -> addPendingAttachments` path only | Phase 1A |
| `messages.actions` | `message runtime` extension path | `supported` | message runtime config | minimum action chain | Phase 1A |
| `messages.renderers` | `message runtime` extension path | `supported` | message runtime config | minimum renderer chain | Phase 1A |
| `messages.feedback` | `message runtime` extension path | `supported` | message runtime config | minimum feedback chain | Phase 1A |
| `messages.transforms` | `message runtime` extension pipeline | `deferred` | none | owner frozen; bridge support delayed | later message parity phase |
| `lifecycle.beforeSend` | conversation/message bridge hook | `supported` | bridge hook | explicit Phase 1A commitment | Phase 1A |
| `lifecycle.error` | conversation/message bridge hook | `supported` | bridge hook | explicit Phase 1A commitment | Phase 1A |
| `lifecycle.afterReceive` | conversation/message bridge hook | `supported` | bridge hook | supported once the Phase 2 blackbox path started normalizing lifecycle-compatible `callbacks.onFinish` into the target lifecycle owner path | Phase 2 |
| `lifecycle.modelChange` | models bridge hook | `deferred` | none | waits for models baseline | Phase 1B or later |
| `lifecycle.conversationChange` | history bridge hook | `deferred` | none | waits for history baseline | Phase 1B or later |
| `history.*` | `history runtime` + workspace defaults | `supported` | `history runtime` | powers the Phase 1B history drawer / workspace baseline | Phase 1B |
| `workspace.*` | `workspace runtime` | `supported` | `workspace runtime` | drives the Phase 1B page shell baseline and responsive shell state | Phase 1B |
| `mcp.*` | `mcp runtime` | `deferred` | none | enters after MCP-capable baseline | Phase 1B or later |

## Reading Guide

- `supported` means the field is part of the current official bridge promise.
- `fixed-default-only` means a narrow default behavior is bridged, but the full runtime module is not yet promised.
- `deferred` means the owner and order may already be frozen, but the bridge output is not yet part of the current phase contract.
