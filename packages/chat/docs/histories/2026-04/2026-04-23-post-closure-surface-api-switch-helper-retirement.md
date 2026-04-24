# 2026-04-23 Post-Closure Surface API Switch Helper Retirement

## Summary

Removed the unused top-level `surface-api` switch helper from the shared Playwright support surface.

## Landed Changes

- deleted the unused `switchToSurfaceApi` selector from `packages/test/src/chat/selectors.ts`
- deleted the unused `switchToSurfaceApi` helper from `packages/test/src/chat/testHelper.ts`
- updated:
  - `packages/test/src/chat/README.md`
  - `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`

## Why This Slice Exists

Retained specs that target the `surface-api` scene already route directly with `/?chatMode=surface-api`.
Keeping an unused top-level mode-switch helper would make the shared helper surface broader than the real retained gate.

## Validation

- `pnpm.cmd -F tiny-robot-test build`
- `node packages/chat/scripts/check-refactor-docs.mjs`
