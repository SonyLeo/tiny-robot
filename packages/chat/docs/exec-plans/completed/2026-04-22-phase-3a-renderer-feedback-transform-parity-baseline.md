# Phase 3A Renderer Feedback Transform Parity Baseline

## Goal

Continue `Phase 3A` after the landed sender and message-action slices by closing the next highest-value renderer, feedback, and transform parity gaps.

## Scope

- In scope:
  - harden renderer, feedback, and transform behavior on runtime-owned message paths
  - prove that default extension surfaces do not silently depend on scaffold-only relay when runtime-owned config is available
  - keep `messageId / messageIds` authoritative across feedback and transform hooks
- Out of scope:
  - workspace or MCP parity
  - helper-public-surface cleanup
  - broad legacy bridge removal

## Frozen Inputs

- Review / phase gate:
  - Reviews A, B, and C are all accepted and Phase 2 is closed
- Contract freeze:
  - sender `voice / wordCount` parity now lands through `config.sender.* -> sender runtime.defaults`
  - message-action fallback now lands through `runtime.message.getActions(messageId)` plus runtime `actionMode`
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
  - keep renderer, feedback, and transform behavior in runtime-owned message paths
  - avoid reopening scaffold-only relay as the default owner path
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - renderer or feedback parity claims are made only through prop relay, not runtime-owned behavior
  - Mitigation:
    - add source and runtime proof alongside any visible renderer or feedback change
- Risk:
  - transform parity reintroduces unstable positional semantics
  - Mitigation:
    - keep `messageId / messageIds` authoritative and avoid index-only hooks

## Exit Criteria

- [x] the next renderer, feedback, or transform parity slice lands with targeted proof
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
  - source contract tests plus runtime or integration proof for the chosen renderer, feedback, or transform slice

## Decision Log

- 2026-04-22:
  - after sender and message-action parity slices landed, the next active Phase 3A work should move into renderer, feedback, and transform parity
  - feedback parity landed by moving feedback enablement fallback into the nearest extension UI instead of depending on page-input relay
  - formal-path transform proof was backwritten as part of the same slice because runtime tests already proved `createRuntimeFromConfig(config.messages.transforms)` on the Root send path

## Drift Backwrite

- What changed from the original slice:
  - this slice closed on feedback runtime-enablement fallback plus transform proof backwrite before renderer parity
- Which source docs need follow-up:
  - completed in `alignment-tracker.md`
  - completed in `design/api-runtime.md`
  - `design/execution.md` not needed for this bounded slice
- `packages/chat/docs/exec-plans/completed/2026-04-22-phase-3a-renderer-feedback-transform-parity-baseline.md`
- `packages/chat/docs/exec-plans/active/2026-04-22-phase-3a-renderer-runtime-owner-fallback.md`

### Contracts Touched

- message extension UI:
  feedback enablement can now fall back to runtime-owned `message runtime.config.feedback` at the nearest extension UI instead of assuming page-input relay
- message extension proof:
  the formal Root send path now has a recorded `messages.transforms` proof through `createRuntimeFromConfig(config)`
- docs:
  Phase 3A tracker state, runtime ownership notes, and the promoted implementation lesson are backwritten

### Changes Overview

- Main implementation result:
  - `ChatFeedback` now resolves feedback enablement through a shared runtime-aware helper
  - `ChatDefaultBodyRegion` now treats runtime-owned feedback enablement as the fallback owner path when `messageListInput.showFeedback` is absent
  - runtime tests now cover the feedback-enablement helper explicitly
- Main docs result:
  - `api-runtime.md` and `alignment-tracker.md` now record feedback runtime fallback plus formal-path transform proof
  - the Phase 3A active slice was closed and replaced with a renderer-focused follow-up slice
  - `K-018` was promoted into the playbook

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all commands passed
  - runtime suite still prints the existing `localStorage is not defined` warning from `packages/kit/dist`, but the suite passes

### Drift From Plan Or Review

- What drifted:
  - the broad renderer/feedback/transform slice closed first on feedback runtime fallback plus transform proof backwrite before renderer parity
- Why:
  - feedback owner-path drift was the narrowest remaining extension bug, and formal-path transform proof already existed in runtime tests but had not been folded back into the active docs
- Backwrite status:
  - completed

### Known Limits

- This slice does not yet close renderer parity.
- The mounted integration proof for feedback enablement remains indirect; the strongest proof for this slice is source plus runtime validation.

### Follow-ups

- Continue Phase 3A with runtime-owned renderer fallback.
- Keep later message-extension work reading runtime-owned config before reopening page-input or scaffold relay.
