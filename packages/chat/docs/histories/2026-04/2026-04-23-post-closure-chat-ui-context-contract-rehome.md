# 2026-04-23 Post-Closure Chat UI Context Contract Rehome

## Summary

Moved the old `packages/chat/tests/ui/chat-ui-context.test.mjs` sentinel into the `contracts` layer and promoted it into the package-local hard gate.

## Landed Changes

- moved:
  - `packages/chat/tests/ui/chat-ui-context.test.mjs`
  - to `packages/chat/tests/contracts/chat-ui-context.test.mjs`
- updated process docs so the test is no longer tracked as a dangling `adapt` item:
  - `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`
  - `packages/chat/docs/refactor/process/test-boundary-baseline.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`

## Why This Slice Exists

The test still protects a real supported boundary:

- `createChatUiContext` responsive-host detection
- mobile shell switching on a narrow workspace host
- reactive shell syncing that preserves manual region state on unrelated updates

Those behaviors are part of the official workspace path, so the test should live with the contract layer instead of remaining in an orphan `ui/` bucket.

## Validation

- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/scripts/check-refactor-docs.mjs`
