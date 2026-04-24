## [2026-04-23 23:20] | Task: post-closure test governance standard

### Why Now

After the late post-closure regressions, the branch needs a lasting test design standard before more unit/e2e cleanup, helper retirement, or directory reshaping starts again.

### Files Changed

- `packages/chat/docs/refactor/process/test-governance-standard.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/README.md`
- `packages/chat/docs/SOURCE_OF_TRUTH.md`
- `packages/chat/docs/refactor/README.md`
- `packages/chat/docs/exec-plans/active/2026-04-23-post-closure-core-flow-stabilization.md`
- `packages/chat/AGENTS.md`
- `packages/test/src/chat/README.md`

### Contracts Touched

- docs / process:
  lasting unit/e2e design standard, smoke-vs-scenario split, selector/helper/scene rules, and keep/adapt/retire policy

### Changes Overview

- Main implementation result:
  Added `test-governance-standard.md` as the stable design standard for chat package tests and chat e2e.
- Main docs result:
  Routed the new standard into docs maps, source-of-truth guidance, tracker next actions, the active stabilization slice, and the chat e2e README.

### Validation

- Commands:
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - passed

### Drift From Plan Or Review

- What drifted:
  - no implementation drift; this task intentionally documented the standard before another test-retirement batch starts
- Why:
  - current cleanup work needs one stable rule source before more keep/adapt/retire decisions are made
- Backwrite status:
  - completed in the process docs and routing files listed above

### Known Limits

- This task does not yet classify every test file; `test-boundary-baseline.md` still holds the current working inventory.
- No runtime or e2e implementation files changed in this slice.

### Follow-ups

- Audit `packages/chat/tests` and `packages/test/src/chat` against `test-governance-standard.md`.
- Freeze smoke gate and scenario gate command sets from that audit before resuming another broad legacy-retirement batch.
