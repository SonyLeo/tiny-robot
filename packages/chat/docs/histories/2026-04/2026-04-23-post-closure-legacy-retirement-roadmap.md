## [2026-04-23 23:59] | Task: post-closure legacy retirement roadmap

### Why Now

The refactor mainline and the first post-closure cleanup slices are already closed, but the remaining legacy retirement work was still spread across tracker notes, inventory tables, and one-off next-step suggestions. This task turned that into one explicit roadmap so later cleanup can proceed in a fixed order instead of rediscovering the sequence.

### Files Changed

- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
- `packages/chat/docs/SOURCE_OF_TRUTH.md`
- `packages/chat/docs/README.md`
- `packages/chat/docs/refactor/README.md`
- `packages/chat/AGENTS.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`

### Contracts Touched

- docs / process:
  - defined the end-state for “full legacy retirement”
  - fixed the ordered cleanup sequence from current post-closure state to final deletion of old usage patterns and related files

### Changes Overview

- Main implementation result:
  - no code changes; this task adds a process-level roadmap for bridge retirement, helper-surface decision, legacy test retirement, and final surface cleanup
- Main docs result:
  - the roadmap is now discoverable from the docs map, source-of-truth routing, package-level agent instructions, and alignment tracker

### Validation

- Commands:
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - passed

### Drift From Plan Or Review

- What drifted:
  - nothing significant; the roadmap is a process backwrite on top of already-closed cleanup slices
- Why:
  - the repository needed one stable place to answer “what must still happen before full legacy retirement”
- Backwrite status:
  - reflected in the new roadmap doc plus all relevant routing docs

### Known Limits

- this roadmap does not itself delete `rootBridge`, helper surfaces, or tests; it only fixes the sequence and the completion bar
- deferred standalone `footer` publishing semantics still remain out of scope

### Follow-ups

- if cleanup continues, open the next slice from the roadmap instead of from ad-hoc tracker notes
- keep the roadmap aligned with `legacy-surface-inventory.md` and `test-boundary-baseline.md` as deletion slices land
