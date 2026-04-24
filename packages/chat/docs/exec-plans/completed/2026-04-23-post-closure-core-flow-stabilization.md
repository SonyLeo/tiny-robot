# Post-Closure Core-Flow Stabilization

Status: completed.

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
- `packages/chat/docs/refactor/process/test-governance-standard.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/full-cutover-closure-checklist.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`

## Current Status

- this stabilization slice is green and closed
- the retained Playwright gate is now green again through the frozen commands:
  - `pnpm.cmd -F tiny-robot-test test:chat:smoke:full`
  - `pnpm.cmd -F tiny-robot-test test:chat:scenario:full`
  - with the non-`full` commands retained as the stable fallback

## Work Parts

### Part 1: Model-Switch Request Continuity

- verify `createRuntimeFromConfig` first-send model propagation on package-local tests
- restore the official scene so model switch affects the next prompt send
- restore the official scene so model switch keeps sender submit alive

Current status:

- completed

### Part 2: Feedback And Interaction Re-Baseline

- confirm the `ChatFeedback` enablement fix on a fresh server path
- adapt stale feedback e2e assertions if the implementation is now correct but the spec is old

Current status:

- completed

### Part 3: Retained Gate Refresh

- rerun the nearest retained Playwright flows on a fresh server path
- only resume closure work when the retained gate is green again

Current status:

- completed

## Validation

Before each e2e confirmation batch:

- `pnpm.cmd -F @opentiny/tiny-robot-chat build`

Required package-local gate:

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`

Required user-path gate:

- `pnpm.cmd -F tiny-robot-test test:chat:smoke`
- `pnpm.cmd -F tiny-robot-test test:chat:scenario` when the slice touches retained feature scenes beyond the smoke set

## Progress Model

This slice is complete.

## Exit Criteria

- [x] `core-flow-stabilization-baseline.md` is fully green
- [x] retained Playwright smoke gate is green again
- [x] retained Playwright scenario gate is green again when touched scenes require it
- [x] `full-cutover-closure-checklist.md` no longer overstates the branch state
- [x] a stabilization history entry has landed
