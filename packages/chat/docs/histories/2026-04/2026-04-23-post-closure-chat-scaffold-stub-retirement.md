# 2026-04-23 Post-Closure Chat Scaffold Stub Retirement

## Summary

Removed the last unused scaffold-era package-test stub: `packages/chat/tests/_stubs/chat-scaffold.mjs`.

## Landed Changes

- deleted:
  - `packages/chat/tests/_stubs/chat-scaffold.mjs`
- updated:
  - `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`

## Why This Slice Exists

The stub only existed to support older scaffold-fallback proof.
After the scaffold fallback and scaffold helper surface retired, no surviving package-local test still imported it.

Keeping the file around would make the support inventory look less settled than it really is.

## Validation

- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
- `node packages/chat/scripts/check-refactor-docs.mjs`
