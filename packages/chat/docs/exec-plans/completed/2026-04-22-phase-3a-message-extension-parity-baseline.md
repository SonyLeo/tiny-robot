# Phase 3A Message Extension Parity Baseline

## Goal

Continue `Phase 3A` after the landed sender `voice / wordCount` slice by closing the highest-value remaining message-extension parity gaps.

## Scope

- In scope:
  - harden `messageActions`, `feedback`, `renderers`, and `transforms` on runtime-owned message paths
  - keep `messageId / messageIds` authoritative across all extension entry points
  - add targeted proof that default and extension renderer or action chains do not silently fall back to scaffold-owned behavior
- Out of scope:
  - workspace or MCP parity
  - helper-public-surface cleanup
  - broad legacy bridge removal

## Frozen Inputs

- Review / phase gate:
  - Reviews A, B, and C are all accepted and Phase 2 is closed
- Contract freeze:
  - blackbox `TrChat` now has a closed entry matrix for target `TrChatConfig` plus the admitted legacy subsets
  - sender `voice / wordCount` parity now lands through `config.sender.* -> sender runtime.defaults`
  - `messageId / messageIds` remains the only stable message action key
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
  - `packages/chat/src/runtime/chat-kit/*`
  - `packages/chat/src/runtime/config/*`
  - `packages/chat/src/components/feedback/*`
  - `packages/chat/src/components/renderers/*`
  - `packages/chat/src/components/core/*`
  - `packages/chat/tests/runtime/*`
  - `packages/chat/tests/contracts/*`
  - `packages/chat/tests/integration/*`
- Intended ownership:
  - keep message extension behavior in runtime-owned message paths
  - do not reintroduce positional targeting or scaffold-only extension ownership
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - message extension parity reopens scaffold-owned action or renderer semantics
  - Mitigation:
    - keep runtime config and `messageId`-based tests authoritative
- Risk:
  - transforms or feedback patches land only in UI wrappers and not in runtime-owned behavior
  - Mitigation:
    - add runtime proof alongside any visible component change

## Exit Criteria

- [x] the next Phase 3A message-extension slice lands with targeted proof
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
  - source contract tests plus runtime or integration proof for the chosen message-extension slice

## Decision Log

- 2026-04-22:
  - after sender `voice / wordCount` parity landed, the next highest-value `Phase 3A` work should move into runtime-owned message extension parity
  - the first message-extension parity slice should land on runtime-owned message action fallback before broader renderer or transform work

## Drift Backwrite

- What changed from the original slice:
  - the first message-extension parity slice landed on runtime-owned action fallback before renderer or transform parity
- Which source docs need follow-up:
  - `alignment-tracker.md`
  - `design/api-runtime.md`
  - `design/execution.md`
