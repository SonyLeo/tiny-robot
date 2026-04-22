# Phase 3A Sender And Attachments Parity Hardening

## Goal

Close the remaining Phase 3A sender-plus-attachments parity gap by proving that the default owner path no longer depends on feature-first fallback for attachment affordances and sender-side attachment handoff.

## Scope

- In scope:
  - harden sender plus attachments parity on the default owner path
  - keep runtime-owned `sender.defaults` and attachment handoff authoritative
  - add targeted parity proof for sender and attachments interaction on the mounted owner path
- Out of scope:
  - workspace or MCP parity
  - broad legacy bridge removal
  - Review D packet work

## Frozen Inputs

- Review / phase gate:
  - Reviews A, B, and C are accepted and Phase 2 is closed
- Landed Phase 3A inputs:
  - sender `voice / wordCount` parity lands through `sender runtime.defaults`
  - runtime-owned message action, feedback, renderer, and transform proofs are all closed
- Required source docs:
  - `packages/chat/docs/refactor/design/api-runtime.md`
  - `packages/chat/docs/refactor/design/execution.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`

## Relevant Source Docs

- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/components/core/*`
  - `packages/chat/src/components/attachments/*`
  - `packages/chat/src/runtime/config/*`
  - `packages/chat/tests/runtime/*`
  - `packages/chat/tests/integration/*`
- Intended ownership:
  - keep sender and attachments behavior runtime-owned on the default owner path
  - avoid reopening `senderActionsFeature` as the effective owner for attachment affordances
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - sender parity looks complete while attachment affordances still depend on feature-first fallback
  - Mitigation:
    - add mounted proof that exercises sender and attachments together on the runtime-owned path
- Risk:
  - attachment handoff remains covered only by older Root bridge tests and not by current Phase 3A parity coverage
  - Mitigation:
    - add direct parity proof and backwrite it into current Phase 3A docs

## Exit Criteria

- [x] sender plus attachments parity lands with targeted proof
- [x] docs stay aligned
- [x] drift is recorded

## Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Contract evidence:
  - runtime and mounted parity proof for sender plus attachments ownership

## Decision Log

- 2026-04-22:
  - after renderer parity closed, sender plus attachments remained the last obvious Phase 3A hardening gap
  - `ChatSender` and `ChatAttachments` now read runtime-owned upload config, list config, and pending attachments before compatibility feature context, and a mounted proof verifies this path without attachment feature injection

## Drift Backwrite

- What changed from the original slice:
  - the strongest mounted proof ended up as direct `ChatSender + ChatAttachments` rendering with only `CHAT_RUNTIME_KEY`, instead of relying on `Root + Page` where attachment feature context is still projected by the bridge
- Which source docs need follow-up:
  - none
