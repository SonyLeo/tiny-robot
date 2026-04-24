# Post-Closure Core-Flow Stabilization

## Goal

Recover the official-path core flows that regressed during the late post-closure cleanup and helper-retirement work.

This slice is intentionally not another retirement slice.
Its job is to restore basic package usability on the new architecture before more cleanup resumes.

## Scope

- In scope:
  - restore `TrChat` and `Root + Page` request-path stability
  - restore model-switch continuity across prompt sends and sender submits
  - confirm feedback render/interaction on a fresh server path
  - re-baseline the retained Playwright gate against the current source
- Out of scope:
  - new helper retirement
  - new public-surface narrowing
  - deeper runtime-engine replacement work

## Governing Docs

- `packages/chat/docs/refactor/process/core-flow-stabilization-baseline.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/full-cutover-closure-checklist.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`

## Current Status

- `post-closure full cutover closure` is paused until this stabilization slice is green.
- The current blocking regressions are:
  - model switch then prompt send still resolving to the old provider on the reused local scene
  - model switch then sender submit leaving the main body in welcome-state instead of creating/sending a turn
  - retained feedback and Playwright gates needing a fresh-server re-baseline after the latest source fix

## Work Parts

### Part 1: Model-Switch Request Continuity

- verify `createRuntimeFromConfig` first-send model propagation on package-local tests
- restore the official scene so model switch affects the next prompt send
- restore the official scene so model switch keeps sender submit alive

### Part 2: Feedback And Interaction Re-Baseline

- confirm the `ChatFeedback` enablement fix on a fresh server path
- adapt stale feedback e2e assertions if the implementation is now correct but the spec is old

### Part 3: Retained Gate Refresh

- rerun the nearest retained Playwright flows on a fresh server path
- only resume closure work when the retained gate is green again

## Validation

Before each e2e confirmation batch:

- `pnpm.cmd -F @opentiny/tiny-robot-chat build`

Required package-local gate:

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`

Required user-path gate:

- rerun the nearest retained Playwright specs for:
  - `model-switch`
  - `feedback`
  - any other touched core-flow scene

## Progress Model

Use these two numbers in future progress updates:

- current stabilization slice progress
- overall full-cutover closure progress

Suggested milestones:

- `0-25%`
  stabilization baseline and fresh-server gate are in place, but the broken flows are not fixed
- `25-60%`
  one of the model-switch paths is restored and the runtime evidence chain is clean
- `60-85%`
  model-switch prompt and sender flows are both restored, and feedback is re-baselined
- `85-100%`
  retained Playwright gate is green again and closure work may resume

## Exit Criteria

- [ ] `core-flow-stabilization-baseline.md` is fully green
- [ ] retained Playwright gate is green again
- [ ] `full-cutover-closure-checklist.md` no longer overstates the branch state
- [ ] a stabilization history entry has landed
