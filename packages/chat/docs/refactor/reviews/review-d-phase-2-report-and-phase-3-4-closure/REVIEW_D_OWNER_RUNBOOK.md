# Review D Owner Runbook

## How To Use This Packet

This file is for the owner or meeting host, not for broad circulation.

`Review D` should do two things:

1. report whether Phase 2 actually established the blackbox `TrChat` default path
2. decide whether the remaining Phase 3/4 hardening is sufficient to declare the refactor closed

This review should not reopen the already-signed-off direction from Reviews A, B, or C unless a new implementation drift clearly breaks a frozen contract.

## Current Readiness

Before the meeting, anchor everyone on the same current state:

- `Phase 1A`, `Phase 1B`, `Phase 2`, `Phase 3A`, and `Phase 3B` are all closed in the tracker
- package-level validation is green again after fixing sibling `tiny-robot-svgs` export/type drift at the owner package
- the remaining active work is Phase 4 closeout: official docs/examples/helper guidance is now aligned, and the open step is to record the final closure decision in Review D

## Meeting Goal

By the end of the review, capture these outputs:

1. `Phase 2`: `pass / pass with follow-ups / blocked`
2. `Phase 3/4 closure`: `pass / pass with follow-ups / blocked`
3. overall refactor closure decision:
   - `closure-ready`
   - `closure-ready-with-follow-ups`
   - `not-ready`

If the decision is `pass with follow-ups`, explicitly record whether those follow-ups are bounded and can proceed after closure, or whether they are actually blocking and should be recorded as `blocked`.

## What This Review Covers

- whether blackbox `TrChat` now uses the new main path as the default owner-aligned entry
- whether `TrChat`, `Root + Page`, and `Root + primitives` are aligned enough to count as one coherent package surface
- whether Phase 3 parity work is sufficiently proven
- whether Phase 4 hardening has removed or explicitly bounded the remaining validation and documentation drift

## What This Review Does Not Reopen

- the `TrChat / Root / Page` mental model itself
- whether `Page` should remain composition-only
- early phase contract questions already signed off in Reviews A through C
- deferred publishing questions such as standalone page-level `footer` replace-slot semantics

## Recommended Flow

### 1. Open With The Current State

Frame the room with one sentence:

> The question is no longer whether the new architecture is correct in principle; the question is whether the blackbox default path, parity evidence, and hardening closure are now strong enough to call the refactor operationally complete.

### 2. Report The Phase 2 Result

Walk through:

1. what blackbox `TrChat` now accepts on the new main path
2. what legacy shapes remain explicit fallback
3. what tests prove the new path, instead of only describing it

### 3. Report The Phase 3 Result

Walk through:

1. sender and message-extension parity proof
2. workspace mobile parity proof
3. history / model / workspace / MCP mounted owner-path proof

### 4. Report The Phase 4 Result So Far

Walk through:

1. validation drift that was closed
2. docs/examples/helper closure that landed
3. whether any remaining hardening item can still break the frozen owner-path contracts

### 5. Take Final Decisions

Ask the room to answer these five questions:

1. Is the blackbox `TrChat` main path now established strongly enough to count as a closed Phase 2 result?
2. Are the remaining legacy fallbacks explicit and bounded, rather than silently mixed into the main path?
3. Is Phase 3 parity evidence strong enough at the nearest owner regions and primitives?
4. Is the remaining Phase 4 work closure-shaped hardening, rather than hidden parity debt?
5. Is the package now ready to move from refactor execution into final closure?

## Evidence Index

Use these artifacts directly in the meeting:

1. `packages/chat/tests/runtime/blackbox-entry.test.mjs`
2. `packages/chat/tests/contracts/public-surface.test.mjs`
3. `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
4. `packages/chat/tests/integration/root-page-mounted.test.mjs`
5. `packages/chat/docs/exec-plans/completed/2026-04-21-phase-2-blackbox-trchat-cutover-baseline.md`
6. `packages/chat/docs/exec-plans/completed/2026-04-22-phase-3a-sender-attachments-parity-hardening.md`
7. `packages/chat/docs/exec-plans/completed/2026-04-22-phase-3b-history-model-mcp-parity-baseline.md`
8. `packages/chat/docs/exec-plans/completed/2026-04-22-phase-4-hardening-review-d-baseline.md`
9. `packages/chat/docs/exec-plans/active/2026-04-22-phase-4-review-d-closure.md`
10. `packages/chat/docs/histories/2026-04/2026-04-22-phase-4-hardening-review-d-kickoff.md`
11. `packages/chat/docs/histories/2026-04/2026-04-22-phase-4-official-demo-helper-closure.md`
12. `packages/chat/README.md`
13. `packages/chat/docs/refactor/process/alignment-tracker.md`

## Current Drift Summary

### No Current Hard-Gate Drift

- blackbox `TrChat` main-path classification is implemented and evidenced
- Phase 3A and 3B parity slices are both closed with mounted proof
- package-level `type-check` is green again after the sibling `tiny-robot-svgs` export fix
- official package guidance and demo routes now all teach the same `TrChat -> Root + Page -> Root + primitives` entry ladder

### Current Bounded Follow-Ups

- final legacy-path deletion remains a later cleanup step, not part of Review D's closure gate
- standalone page-level `footer` replace-slot publishing semantics remain deferred

## Recording Template

### Decision

- `Phase 2`:
- `Phase 3/4 closure`:
- `Overall closure`:

### Follow-Ups

- hardening:
- docs/examples:
- helper/public surface:
- deferred items:
