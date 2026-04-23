# Review D Spec Detail

## Purpose

`Review D` is the final development-phase closure review for this refactor track.

It should answer two distinct questions:

1. did Phase 2 really establish blackbox `TrChat` on the new main path
2. did Phase 3 and Phase 4 close enough parity and hardening work to treat the refactor as operationally complete

This review is not for reopening early architecture decisions unless a newly discovered implementation drift clearly breaks a frozen contract.

## Assumed Prior Decisions

This packet assumes the following are already accepted:

- `TrChat`, `TrChat.Root`, and `TrChat.Page` remain the official user mental model
- `Page` remains composition-only
- `createRuntimeFromConfig(config)` remains the canonical bridge entry
- Phase 1A and 1B contracts were already accepted in Reviews A and B
- Review C already accepted the narrow Phase 2 kickoff baseline

## What Review D Must Decide

### Decision 1: Phase 2 Exit

Review whether blackbox `TrChat` now has a stable owner-aligned default path.

This should be judged by:

- admitted target-shaped and legacy subsets in `blackboxEntry.ts`
- explicit fallback classification for legacy-only shapes
- blackbox integration proof for the new main path

### Decision 2: Phase 3 Parity Exit

Review whether parity is now carried by owner-aligned runtime, page, and primitive contracts instead of hidden relay assumptions.

This should be judged by:

- sender / attachments parity proof
- message actions / feedback / renderer parity proof
- workspace mobile, history / model / workspace linkage, and MCP proof

### Decision 3: Phase 4 Closure Readiness

Review whether the remaining work is true closure work rather than hidden unfinished implementation.

This should be judged by:

- whether validation is green
- whether docs and review materials reflect the landed contracts
- whether remaining helper/examples/doc gaps are bounded and explicit

## Hard Gates

Any of these should block closure:

1. blackbox `TrChat` still depends on silent mixed old/new entry logic that is not explicitly classified
2. a major Phase 3 parity slice still depends on unstated scaffold relay rather than owner-aligned runtime/page input
3. package-level validation is red without an explicit bounded exception
4. current docs and review packet content materially disagree with the landed implementation

## Bounded Follow-Ups

These may remain as `pass with follow-ups` items if explicitly recorded:

- final docs/examples/helper polish
- future legacy-path deletion
- deferred publishing semantics such as standalone page-level `footer` replace-slot behavior

## Evidence Bundle

### Phase 2 Evidence

- `packages/chat/src/runtime/config/blackboxEntry.ts`
- `packages/chat/tests/runtime/blackbox-entry.test.mjs`
- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-2-blackbox-trchat-cutover-baseline.md`
- `packages/chat/docs/histories/2026-04/2026-04-21-phase-2-old-chat-config-shell-view-state-classification.md`

### Phase 3 Evidence

- `packages/chat/tests/runtime/root-runtime.test.mjs`
- `packages/chat/tests/runtime/message-actions.test.mjs`
- `packages/chat/tests/integration/root-page-mounted.test.mjs`
- `packages/chat/docs/exec-plans/completed/2026-04-22-phase-3a-sender-attachments-parity-hardening.md`
- `packages/chat/docs/exec-plans/completed/2026-04-22-phase-3b-history-model-mcp-parity-baseline.md`

### Phase 4 Evidence

- `packages/chat/docs/exec-plans/completed/2026-04-22-phase-4-hardening-review-d-baseline.md`
- `packages/chat/docs/exec-plans/active/2026-04-22-phase-4-review-d-closure.md`
- `packages/chat/docs/histories/2026-04/2026-04-22-phase-4-hardening-review-d-kickoff.md`
- `packages/chat/docs/histories/2026-04/2026-04-22-phase-4-official-demo-helper-closure.md`
- `packages/chat/README.md`
- `packages/chat/demo/src/components/BlackboxDemo.vue`
- `packages/chat/demo/src/components/WhiteboxDemo.vue`
- `packages/chat/demo/src/components/GranularWorkspaceDemo.vue`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/design/execution.md`

## Current Drift Summary

### Closed In The Current Slice

- package-level `type-check` is green again
- sibling `tiny-robot-svgs` export/type drift is fixed at the owner package
- Review D evidence preparation has started from an explicit packet rather than ad hoc narrative recap
- official package README and demo routes are aligned with the frozen entry ladder and no longer default to helper-heavy compatibility examples

### Still Open But Bounded

- final legacy cleanup is deferred beyond closure review

## Recommended Decision Frame

The owner should ask reviewers to explicitly return:

1. `Phase 2`: `pass / pass with follow-ups / blocked`
2. `Phase 3/4 closure`: `pass / pass with follow-ups / blocked`
3. `Overall closure`: `closure-ready / closure-ready-with-follow-ups / not-ready`

If a reviewer chooses `pass with follow-ups`, they should also state whether those follow-ups are bounded enough to allow closure now.
