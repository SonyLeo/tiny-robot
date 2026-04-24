# 2026-04-23 Post-Closure E2E Support Surface Trim

## Summary

Trimmed `packages/test/src/chat` support code so the shared e2e helper surface matches the retained smoke/scenario gate instead of carrying unused historical workspace-shell branches.

## Landed Changes

- removed unused selectors from `packages/test/src/chat/selectors.ts`
- removed unused workspace-shell-only helper methods from `packages/test/src/chat/testHelper.ts`
- updated `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`

## Why This Slice Exists

The retained Playwright gate no longer exercises the old workspace-shell helper branch.
Keeping that branch alive in shared support files makes the e2e support surface look broader than the actual test contract.

This trim keeps the helper layer aligned with the currently supported smoke/scenario gate.

## Validation

- `pnpm.cmd -F tiny-robot-test build`
- `pnpm.cmd -F tiny-robot-test test:chat:smoke`
- `node packages/chat/scripts/check-refactor-docs.mjs`
