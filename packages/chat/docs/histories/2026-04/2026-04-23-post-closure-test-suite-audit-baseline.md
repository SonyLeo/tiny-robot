## [2026-04-23 23:40] | Task: post-closure test suite audit baseline

### Why Now

After fixing the regressed core flows and landing the long-lived test governance standard, the branch still needed a file-level inventory before more test retirement, helper retirement, or directory cleanup begins.

### Files Changed

- `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/README.md`
- `packages/chat/docs/SOURCE_OF_TRUTH.md`
- `packages/chat/docs/refactor/README.md`
- `packages/chat/AGENTS.md`
- `packages/test/src/chat/README.md`

### Contracts Touched

- docs / process:
  file-level test inventory for package tests, e2e specs, scene fixtures, and helpers

### Changes Overview

- Main implementation result:
  Added `test-suite-audit-baseline.md` as the current file-level audit inventory for `packages/chat/tests` and `packages/test/src/chat`.
- Main docs result:
  Routed the audit file into process, source-of-truth, tracker, package docs, and chat e2e suite guidance.

### Validation

- Commands:
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - passed

### Drift From Plan Or Review

- What drifted:
  - no implementation drift; this was a documentation-only inventory slice
- Why:
  - the branch needs a working audit inventory before freezing smoke/scenario command sets or retiring more tests
- Backwrite status:
  - completed in the files listed above

### Known Limits

- This audit does not yet freeze the final smoke/scenario command scripts.
- It also does not yet move or rename any files.

### Follow-ups

- Freeze one named smoke gate command from the audited smoke set.
- Freeze one named scenario gate command from the audited scenario set.
- Decide the fate of `packages/chat/tests/ui/chat-ui-context.test.mjs`.
