# 2026-04-23 Post-Closure Test Gate Command Freeze

## Summary

Frozen the retained Playwright gate into named package scripts so future stabilization and cleanup slices stop retyping ad-hoc file lists.

## Landed Changes

- Added named scripts in `packages/test/package.json`:
  - `test:chat:smoke`
  - `test:chat:scenario`
- Backwrote the named command contract into:
  - `packages/chat/docs/refactor/process/test-boundary-baseline.md`
  - `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`
  - `packages/chat/docs/exec-plans/active/2026-04-23-post-closure-core-flow-stabilization.md`
  - `packages/test/src/chat/README.md`

## Why This Slice Exists

The branch had already stabilized the retained Playwright file set, but the command surface was still implicit.
Freezing the gate into named scripts makes later validation and future test-retirement work less error-prone.

## Validation

- `node packages/chat/scripts/check-refactor-docs.mjs`
- `pnpm.cmd -F tiny-robot-test test:chat:smoke`
- `pnpm.cmd -F tiny-robot-test test:chat:scenario`
