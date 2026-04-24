# 2026-04-23 Post-Closure Zero-Call Helper Retirement

## Summary

Removed a small batch of zero-call convenience assertions from the shared chat Playwright helper surface.

## Landed Changes

- removed unused selectors from `packages/test/src/chat/selectors.ts`
- removed unused helper assertions from `packages/test/src/chat/testHelper.ts`
- updated:
  - `packages/test/src/chat/README.md`
  - `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`

## Why This Slice Exists

These helper methods were no longer called by any retained smoke/scenario spec.
Keeping them around would make the shared support surface broader than the real gate and make later cleanup harder to reason about.

## Validation

- `pnpm.cmd -F tiny-robot-test build`
- `node packages/chat/scripts/check-refactor-docs.mjs`
