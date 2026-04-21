# Current Shipping Surface Vs Target Refactor Surface

This branch keeps a strict split between:

- current shipping behavior anchors
- target refactor contracts

They answer different questions and should not be updated in the same way.

## Current Shipping Behavior

In this implementation branch, current shipping behavior is anchored by:

- current code under `packages/chat/src` when it exists
- contract tests under `packages/chat/tests`
- demos under `packages/chat/demo`

Use these when the question is about current behavior or parity anchors.

## Target Refactor Contracts

Target refactor contracts live in:

- `TrChat`
- `TrChat.Root`
- `TrChat.Page`
- `packages/chat/docs/refactor/design/overview.md`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`

Use these when the question is about next-surface architecture, contract freeze, or current implementation direction.

## Fast Rule

- fixing or confirming current behavior:
  start from code, tests, and demo anchors
- changing target contract:
  start from refactor design docs
- changing phase or milestone readiness:
  start from `refactor/design/execution.md`
- recording review progress or conclusions:
  start from `refactor/process/alignment-tracker.md`
- preparing a meeting:
  start from `refactor/reviews/`

## One-Line Summary

Current behavior is proved by code and tests.
Target behavior is defined by refactor source docs.
