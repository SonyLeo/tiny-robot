# AGENTS.md

Package-level instructions for coding agents working in `packages/chat`.

## Scope

This file applies to `packages/chat/**`.

## Package Role

`@opentiny/tiny-robot-chat` is the high-level chat UX package in this monorepo.

It provides three official entry surfaces:

1. `TrChat` — blackbox config entry, pass a `TrChatConfig` directly
2. `TrChat.Root + TrChat.Page` — whitebox page path, user owns runtime creation
3. `TrChat.Root + primitives` — granular whitebox path, user composes the page

`TrChat.Provider` is a bounded advanced helper for teams that want package-owned UI and runtime but their own transport layer.

## Key References

Before working on this package, read:

- `packages/chat/README.md` — official entry surfaces, helper boundary, demo route map
- `packages/chat/docs/refactor/design/overview.md` — design mental model and boundaries
- `packages/chat/docs/refactor/design/api-runtime.md` — public contract, runtime ownership, slot and message-model rules
- `packages/chat/docs/refactor/design/ui-runtime-transport-layering.md` — three-layer product model (UI / orchestration runtime / transport)

When the task involves tests:

- `packages/chat/docs/refactor/process/test-governance-standard.md` — unit/e2e design standard
- `packages/chat/docs/refactor/process/test-boundary-baseline.md` — test classification and gate commands
- `packages/chat/docs/refactor/process/test-suite-audit-baseline.md` — file-level test audit
- `packages/chat/docs/refactor/process/test-gap-backlog.md` — missing coverage backlog

For implementation lessons from the refactor:

- `packages/chat/docs/refactor/PLAYBOOK.md` — promoted recurring guidance

For quick lookup tables:

- `packages/chat/docs/generated/slot-catalog.md` — page and workspace slot contract
- `packages/chat/docs/generated/config-bridge-matrix.md` — config field bridge status
- `packages/chat/docs/generated/runtime-owner-table.md` — runtime module ownership
- `packages/chat/docs/generated/page-region-contract.md` — page region read boundaries

## Validation Commands

- `pnpm -F @opentiny/tiny-robot-chat type-check`
- `pnpm -F @opentiny/tiny-robot-chat test`
- `pnpm -F @opentiny/tiny-robot-chat build`

## Working Rules

- Put logic in the lowest reusable layer that matches its responsibility.
- Prefer runtime-owned behavior over scaffold or relay patterns.
- Use `messageId` for all message-level actions; do not introduce `messageIndex`-based semantics.
- If a code change makes a doc stale, update the doc in the same task.
- Generated docs under `docs/generated/` are derived artifacts — update them only when their source changes.
